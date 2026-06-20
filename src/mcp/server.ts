#!/usr/bin/env node
/**
 * repo-knowledge MCP server
 *
 * Exposes the knowledge catalog to Claude and other MCP clients.
 *
 * Tools:
 *   get_repo          — Full knowledge dump for a repo
 *   find_repos        — Filter repos by status/category/language/framework/shape
 *   search_repos      — Full-text search across docs, notes, and metadata
 *   related_repos     — Repos related to a given repo
 *   repos_by_stack    — Repos matching a tech stack query
 *   repos_needing_work— Repos that need audit, are stale, or have warnings
 *   repo_summary      — Compact summary of a repo
 *   add_repo_note     — Add a knowledge note to a repo
 *   add_relationship  — Record a relationship between repos
 *   knowledge_stats   — Database statistics
 *   sync_repos        — Trigger a full sync
 *
 * Build-health (DB-only reads — no network refresh in the MCP variants):
 *   health_feed       — change-since-last-sync feed (buildFeed)
 *   health_doctor     — single-repo deep-dive (buildRepoDoctor)
 *   health_portfolio  — portfolio health rollup (buildHealthTable)
 *
 * Operational hygiene:
 *   db_fsck           — DB-integrity checker (runFsck; WRITES a db_health_runs row)
 *   repo_diff         — per-repo DB-entry change history (getRepoDiff)
 *   ops_runs          — recent fsck / sync run rows (listDbHealthRuns / listSyncRuns)
 *
 * Lifecycle + publish + dogfood/audit:
 *   archive_repo      — flip lifecycle_status=archived (archiveRepoBySlug)
 *   delete_repo       — hard-delete a repo + cascade (deleteRepoBySlug; confirm-gated)
 *   repo_versions     — published versions per channel (listPublishedVersions)
 *   suggest_dogfood   — dogfood intelligence by repo OR surface
 *   audit_failing     — repos with failing controls in a domain
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createRequire } from 'node:module';
import { z } from 'zod';
import {
  openDb, closeDb, getDb, getRepo, findRepos, getRelated,
  getAllRepos, getStats, upsertNote,
  addRelationship as addRel,
  archiveRepoBySlug, deleteRepoBySlug,
  listPublishedVersions,
  listDbHealthRuns, listSyncRuns,
} from '../db/init.js';
import type { RepoFilters } from '../db/init.js';
import { searchRepos } from '../search/fts.js';
import { fullSync } from '../sync/index.js';
import { syncDogfood } from '../sync/dogfood.js';
import { suggestByRepo, suggestBySurface } from '../sync/dogfood-suggest.js';
import { seedControls, DOMAINS } from '../audit/controls.js';
import type { Domain } from '../audit/controls.js';
import { importAuditInline } from '../audit/import.js';
import {
  getLatestAudit, getAuditPosture, getPortfolioPosture,
  findByAuditStatus, getOpenFindings,
} from '../audit/queries.js';
// MCP-001 / MCP-002: pure, side-effect-free build-health builders + the two
// operational-hygiene reports. These are the SAME functions the CLU `rk health`
// / `rk fsck` / `rk diff` surfaces wrap — we reuse them verbatim. runFsck is the
// one exception: it WRITES a db_health_runs audit row (a named side effect,
// documented in the db_fsck tool description below).
import {
  buildFeed,
  buildRepoDoctor,
  buildHealthTable,
  runFsck,
  getRepoDiff,
} from '../health/index.js';
import { resolveConfig } from '../config.js';
// F-BE-022 / F-BE-011 / F-BE-021 / mcp-PH-004: shared enum tuples — single
// source of truth lives in src/index.ts; this import keeps server.ts's Zod
// enums from drifting from the CLI + DB CHECK constraints.
import { NOTE_TYPES, RELATION_TYPES, REPO_STATUSES } from '../index.js';

// Resolve config at startup. RK_DB_PATH is an explicit DB-path override —
// it wins over rk.config.json + defaults so MCP hosts and tests can point the
// server at an isolated database without writing a config file. This is the
// supported isolation mechanism (test/mcp-server.test.ts relies on it).
const config = resolveConfig(
  process.env.RK_DB_PATH ? { dbPath: process.env.RK_DB_PATH } : undefined,
);

// F-BE-013: read version dynamically from package.json so server.getServerInfo()
// stays in sync with releases instead of drifting against a hardcoded literal.
const require = createRequire(import.meta.url);
const { version: pkgVersion } = require('../../package.json') as { version: string };

const server = new McpServer({
  name: 'repo-knowledge',
  version: pkgVersion,
  description: 'Repo knowledge system — structured catalog with full-text search',
});

// Initialize DB
openDb(config.dbPath);

// mcp-PH-002: handler-boundary observability. The MCP SDK catches a throwing
// handler and returns it to the CLIENT only, so an operator running this stdio
// server has ZERO server-side signal of a failing call. We wrap server.tool so
// every handler logs tool name + a REDACTED arg summary on entry and any thrown
// error — all on STDERR (console.error), which is safe on StdioServerTransport
// (STDOUT is the JSON-RPC frame channel). The wrapper is cheap (key list + a
// truncated string preview), never logs full payloads or secret-ish values, and
// re-throws so the SDK's own error-to-client path is untouched.
function redactArgs(args: unknown): string {
  if (args == null || typeof args !== 'object') return '{}';
  const out: string[] = [];
  for (const [k, v] of Object.entries(args as Record<string, unknown>)) {
    let preview: string;
    if (typeof v === 'string') {
      // Truncate to a short preview — never log full note/doc bodies.
      preview = v.length > 40 ? `"${v.slice(0, 40)}…"` : `"${v}"`;
    } else if (typeof v === 'number' || typeof v === 'boolean' || v == null) {
      preview = String(v);
    } else {
      // Arrays / nested objects: log shape, not content.
      preview = Array.isArray(v) ? `[${v.length}]` : '{…}';
    }
    out.push(`${k}=${preview}`);
  }
  return `{${out.join(', ')}}`;
}

const rawTool = server.tool.bind(server);
// Override server.tool so the handler (always the last argument) is wrapped
// with entry + error logging. Signature is preserved verbatim for callers.
server.tool = ((...regArgs: unknown[]) => {
  const name = typeof regArgs[0] === 'string' ? regArgs[0] : '<unknown>';
  const handlerIdx = regArgs.length - 1;
  const handler = regArgs[handlerIdx];
  if (typeof handler === 'function') {
    const orig = handler as (...a: unknown[]) => unknown;
    regArgs[handlerIdx] = async (...callArgs: unknown[]) => {
      console.error(`[mcp] tool=${name} args=${redactArgs(callArgs[0])}`);
      try {
        return await orig(...callArgs);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(`[mcp] tool=${name} ERROR: ${message}`);
        throw e;
      }
    };
  }
  return (rawTool as (...a: unknown[]) => unknown)(...regArgs);
}) as typeof server.tool;

// Cast DOMAINS for z.enum (requires [string, ...string[]] tuple)
const DOMAINS_TUPLE = DOMAINS as [Domain, ...Domain[]];

// ─── get_repo ────────────────────────────────────────────────────────────────
server.tool(
  'get_repo',
  'Get full knowledge dump for a repo. Includes tech, notes, facts, releases, relationships.',
  { slug: z.string().describe('Repo slug (owner/name) or partial name') },
  async ({ slug }) => {
    let repo: Record<string, any> | null = getRepo(slug);
    if (!repo) {
      // Try partial match
      const all = getAllRepos();
      const match = all.find(
        (r: Record<string, any>) => r.slug.includes(slug) || r.slug.endsWith('/' + slug),
      );
      if (match) repo = getRepo(match.slug);
    }

    if (!repo) {
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }

    // Parse JSON fields for cleaner output
    if (repo.tech?.frameworks && typeof repo.tech.frameworks === 'string') {
      try { repo.tech.frameworks = JSON.parse(repo.tech.frameworks); } catch { /* ignore */ }
    }
    if (repo.tech?.platform_targets && typeof repo.tech.platform_targets === 'string') {
      try { repo.tech.platform_targets = JSON.parse(repo.tech.platform_targets); } catch { /* ignore */ }
    }
    if (repo.tech?.languages && typeof repo.tech.languages === 'string') {
      try { repo.tech.languages = JSON.parse(repo.tech.languages); } catch { /* ignore */ }
    }

    // Strip full doc content from response (too large for MCP)
    const docs = (repo.docs || []).map((d: Record<string, any>) => ({
      path: d.path,
      doc_type: d.doc_type,
      title: d.title,
      summary: d.summary,
      last_indexed_at: d.last_indexed_at,
    }));

    // mcp-A-005: absolute on-disk paths (local_path, forge_vault_path) are
    // host-local provenance — they only make sense on the rig that synced the
    // repo. Move them out of the top-level spread and into a clearly-labelled
    // `host_local` block so an MCP client (LLM) does not mistake them for
    // portable, shareable URLs.
    const { local_path, forge_vault_path, ...rest } = repo as Record<string, any>;
    const host_local =
      local_path != null || forge_vault_path != null
        ? { local_path: local_path ?? null, forge_vault_path: forge_vault_path ?? null }
        : undefined;

    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ ...rest, host_local, docs }, null, 2) }],
    };
  },
);

// ─── find_repos ──────────────────────────────────────────────────────────────
server.tool(
  'find_repos',
  'Filter repos by owner, status, category, language, framework, or app shape.',
  {
    owner: z.string().optional().describe('GitHub owner'),
    // mcp-PH-004: status values come from the shared REPO_STATUSES tuple
    // (mirrors the repos.status DB CHECK) instead of a hand-duplicated enum.
    status: z.enum(REPO_STATUSES as unknown as [string, ...string[]]).optional(),
    category: z.string().optional().describe('product | tool | library | experiment | blueprint | marketing'),
    language: z.string().optional().describe('Primary language'),
    framework: z.string().optional().describe('Framework name'),
    app_shape: z.string().optional().describe('cli | desktop | web | library | mcp-server | api | game'),
  },
  async (filters) => {
    const repos = findRepos(filters as RepoFilters);
    const summary = repos.map((r: Record<string, any>) => ({
      slug: r.slug,
      description: r.description,
      status: r.status,
      category: r.category,
      language: r.primary_language,
      shape: r.app_shape,
    }));
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ count: repos.length, repos: summary }, null, 2) }],
    };
  },
);

// ─── search_repos ────────────────────────────────────────────────────────────
server.tool(
  'search_repos',
  'Full-text search across all indexed content: docs, notes, repo descriptions. Use this when you remember a concept but not the repo name.',
  {
    query: z.string().describe('Search query (natural language or keywords)'),
    // mcp-PH-005: constrain limit to a sane integer range. A bare z.number()
    // let a negative limit through to slice(0, negative) (misbehaves) and an
    // unbounded one invite huge scans. searchRepos also clamps defensively for
    // non-MCP callers.
    limit: z.number().int().min(1).max(100).optional().default(10).describe('Max results (1–100)'),
  },
  async ({ query, limit }) => {
    const results = searchRepos(query, { limit });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ query, count: results.length, results }, null, 2) }],
    };
  },
);

// ─── related_repos ───────────────────────────────────────────────────────────
server.tool(
  'related_repos',
  'Show repos related to a given repo (dependencies, companions, successors, etc).',
  { slug: z.string().describe('Repo slug or partial name') },
  async ({ slug }) => {
    const repoId = resolveId(slug);
    if (!repoId) {
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }
    const related = getRelated(repoId);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ slug, relationships: related }, null, 2) }],
    };
  },
);

// ─── repos_by_stack ──────────────────────────────────────────────────────────
server.tool(
  'repos_by_stack',
  'Find repos using a specific tech stack combination. Example: "tauri react" or "python mcp".',
  {
    stack: z.string().min(1).describe('Space-separated tech terms to match'),
    // mcp-PH-007: cap the result set. This does a full-table scan + JS filter;
    // an unbounded response can flood an MCP context window. Default 100.
    limit: z.number().int().min(1).max(100).optional().default(100).describe('Max repos to return (1–100)'),
  },
  async ({ stack, limit }) => {
    // mcp-A-007: split + filter empties. Without filter(Boolean) an empty or
    // whitespace-only stack yields a [''] term, and haystack.includes('') is
    // always true, so `terms.every(...)` matched EVERY repo. Short-circuit on
    // no real terms so an empty query returns guidance, not the whole catalog.
    const terms = stack.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ stack, count: 0, repos: [], hint: 'Provide one or more tech terms, e.g. "tauri react" or "python mcp".' }, null, 2),
        }],
      };
    }
    const db = getDb();

    const allRepos = db.prepare(`
      SELECT r.id, r.slug, r.description, r.status,
             t.primary_language, t.frameworks, t.runtime, t.app_shape, t.package_manager
      FROM repos r
      LEFT JOIN repo_tech t ON t.repo_id = r.id
    `).all() as Record<string, any>[];

    const allMatches = allRepos.filter((r) => {
      const haystack = [
        r.primary_language, r.frameworks, r.runtime, r.app_shape, r.package_manager,
      ].filter(Boolean).join(' ').toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });

    // mcp-PH-007: cap the returned rows. `count` reports the true total so the
    // caller can see when results were truncated.
    const matches = allMatches.slice(0, limit);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ stack, count: allMatches.length, returned: matches.length, repos: matches.map((r) => ({
          slug: r.slug, description: r.description, status: r.status,
          language: r.primary_language, shape: r.app_shape,
          frameworks: tryParse(r.frameworks),
        })) }, null, 2),
      }],
    };
  },
);

// ─── repos_needing_work ──────────────────────────────────────────────────────
server.tool(
  'repos_needing_work',
  'Find repos that need attention: unaudited, stale, have warnings, or need next steps.',
  {
    type: z.enum(['stale', 'unaudited', 'warnings', 'next_steps', 'all']).optional().default('all')
      .describe('What kind of work to look for'),
    // mcp-PH-007: cap each category. These are full-table scans; an unbounded
    // response can flood an MCP context window. Applied as a SQL LIMIT per
    // category (so 'all' returns up to `limit` rows of EACH). Default 100.
    limit: z.number().int().min(1).max(100).optional().default(100).describe('Max rows per category (1–100)'),
  },
  async ({ type, limit }) => {
    const db = getDb();
    const results: Record<string, any[]> = {};

    if (type === 'all' || type === 'stale') {
      // Repos not pushed to in 60+ days
      results.stale = db.prepare(`
        SELECT slug, pushed_at, status FROM repos
        WHERE pushed_at < datetime('now', '-60 days') AND status = 'active'
        ORDER BY pushed_at ASC
        LIMIT ?
      `).all(limit) as Record<string, any>[];
    }

    if (type === 'all' || type === 'unaudited') {
      // Repos with no audit records
      results.unaudited = db.prepare(`
        SELECT r.slug, r.status FROM repos r
        WHERE NOT EXISTS (SELECT 1 FROM repo_audits a WHERE a.repo_id = r.id)
        AND r.status != 'archived'
        ORDER BY r.slug
        LIMIT ?
      `).all(limit) as Record<string, any>[];
    }

    if (type === 'all' || type === 'warnings') {
      results.warnings = db.prepare(`
        SELECT r.slug, n.title, n.content FROM repo_notes n
        JOIN repos r ON r.id = n.repo_id
        WHERE n.note_type IN ('warning', 'drift_risk', 'pain_point')
        ORDER BY n.updated_at DESC
        LIMIT ?
      `).all(limit) as Record<string, any>[];
    }

    if (type === 'all' || type === 'next_steps') {
      results.next_steps = db.prepare(`
        SELECT r.slug, n.title, n.content FROM repo_notes n
        JOIN repos r ON r.id = n.repo_id
        WHERE n.note_type = 'next_step'
        ORDER BY n.updated_at DESC
        LIMIT ?
      `).all(limit) as Record<string, any>[];
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }],
    };
  },
);

// ─── repo_summary ────────────────────────────────────────────────────────────
server.tool(
  'repo_summary',
  'Compact one-paragraph summary of a repo: what it is, what stack, what state, what is next.',
  { slug: z.string().describe('Repo slug or partial name') },
  async ({ slug }) => {
    let repo: Record<string, any> | null = getRepo(slug);
    if (!repo) {
      const all = getAllRepos();
      const match = all.find(
        (r: Record<string, any>) => r.slug.includes(slug) || r.slug.endsWith('/' + slug),
      );
      if (match) repo = getRepo(match.slug);
    }
    if (!repo) {
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }

    // mcp-A-001: frameworks is a JSON-encoded TEXT column. Use the guarded
    // tryParse (same helper get_repo relies on) so a malformed value defaults
    // to [] instead of throwing out of the whole repo_summary handler.
    const fwsRaw = repo.tech?.frameworks;
    const fwsParsed = Array.isArray(fwsRaw) ? fwsRaw : tryParse(fwsRaw);
    const fws: string[] = Array.isArray(fwsParsed) ? (fwsParsed as string[]) : [];
    const nextStep = repo.notes?.find((n: Record<string, any>) => n.note_type === 'next_step');
    const thesis = repo.notes?.find((n: Record<string, any>) => n.note_type === 'thesis');
    const warnings = repo.notes?.filter(
      (n: Record<string, any>) => n.note_type === 'warning' || n.note_type === 'drift_risk',
    ) || [];
    const latestRelease = repo.releases?.[0];

    const parts: string[] = [];
    parts.push(`**${repo.slug}** — ${repo.description || 'no description'}`);
    if (thesis) parts.push(`Thesis: ${thesis.content}`);
    parts.push(`Stack: ${repo.tech?.primary_language || '?'} ${fws.length ? '+ ' + fws.join(', ') : ''} (${repo.tech?.app_shape || '?'})`);
    parts.push(`Status: ${repo.status}${repo.stage ? ' / ' + repo.stage : ''}`);
    if (latestRelease) parts.push(`Latest release: ${latestRelease.tag} (${latestRelease.published_at || 'n/a'})`);
    if (nextStep) parts.push(`Next: ${nextStep.content}`);
    if (warnings.length) parts.push(`Warnings: ${warnings.map((w: Record<string, any>) => w.content).join('; ')}`);

    return {
      content: [{ type: 'text' as const, text: parts.join('\n') }],
    };
  },
);

// ─── add_repo_note ───────────────────────────────────────────────────────────
server.tool(
  'add_repo_note',
  'Add a knowledge note to a repo. Use for thesis, architecture, warnings, next steps, etc.',
  {
    slug: z.string().describe('Repo slug or partial name'),
    // F-BE-022: pull from shared tuple in ../index.js so DB CHECK constraint,
    // CLI --type validator, and MCP Zod enum stay in lockstep.
    note_type: z.enum(NOTE_TYPES as unknown as [string, ...string[]]),
    title: z.string().optional().describe('Short note title'),
    content: z.string().describe('Note content'),
  },
  async ({ slug, note_type, title, content }) => {
    const ref = resolveRepoRef(slug);
    if (!ref) {
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    // mcp-A-006: no rebuildIndex() needed. Migration-005's repo_notes
    // INSERT/UPDATE triggers (applied on every openDb) maintain repo_search
    // incrementally, so the note is searchable the instant upsertNote returns.
    // A full-corpus rebuild here was O(corpus) work to index one row — see
    // F-DB-013, which proves notes are searchable without a manual rebuild.
    upsertNote(ref.id, note_type, title || note_type, content);
    return {
      // Echo the CANONICAL slug, not the caller's fragment (provenance-on-
      // display): an LLM must see which repo the note actually landed on.
      content: [{ type: 'text' as const, text: `Note added to ${ref.canonical} [${note_type}]: ${title || note_type}` }],
    };
  },
);

// ─── add_relationship ────────────────────────────────────────────────────────
server.tool(
  'add_relationship',
  'Record a relationship between two repos.',
  {
    from_slug: z.string().describe('Source repo slug'),
    // F-BE-021: shared tuple from ../index.js — see note_type above.
    relation_type: z.enum(RELATION_TYPES as unknown as [string, ...string[]]),
    to_slug: z.string().describe('Target repo slug'),
    note: z.string().optional().describe('Optional context about the relationship'),
  },
  async ({ from_slug, relation_type, to_slug, note }) => {
    const fromRef = resolveRepoRef(from_slug);
    if (!fromRef) return { content: [{ type: 'text' as const, text: notFoundMessage(from_slug) }] };
    if ('ambiguous' in fromRef) return { content: [{ type: 'text' as const, text: ambiguousMessage(from_slug, fromRef.ambiguous) }] };
    const toRef = resolveRepoRef(to_slug);
    if (!toRef) return { content: [{ type: 'text' as const, text: notFoundMessage(to_slug) }] };
    if ('ambiguous' in toRef) return { content: [{ type: 'text' as const, text: ambiguousMessage(to_slug, toRef.ambiguous) }] };

    addRel(fromRef.id, relation_type, toRef.id, note);
    return {
      // Echo canonical slugs, not the caller's fragments (provenance-on-display).
      content: [{ type: 'text' as const, text: `Relationship added: ${fromRef.canonical} ${relation_type} ${toRef.canonical}` }],
    };
  },
);

// ─── knowledge_stats ─────────────────────────────────────────────────────────
server.tool(
  'knowledge_stats',
  'Show database statistics: counts of repos, notes, docs, facts, releases, relationships.',
  {},
  async () => {
    const stats = getStats();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(stats, null, 2) }],
    };
  },
);

// ─── sync_repos ──────────────────────────────────────────────────────────────
server.tool(
  'sync_repos',
  'Trigger a full sync: GitHub metadata + local repo scan + FTS reindex.',
  {
    owners: z.string().optional().default('')
      .describe('Comma-separated GitHub owners'),
    local_dirs: z.string().optional().default('.')
      .describe('Comma-separated local directories to scan'),
    include_releases: z.boolean().optional().default(false)
      .describe('Also sync releases (slower)'),
  },
  async ({ owners, local_dirs, include_releases }) => {
    const syncOwners = owners ? owners.split(',').filter(Boolean) : config.owners;
    const syncDirs = local_dirs && local_dirs !== '.' ? local_dirs.split(',') : config.localDirs;

    const result = await fullSync({
      owners: syncOwners,
      localDirs: syncDirs,
      includeReleases: include_releases,
    });
    // mcp-PH-003: surface the partial-sync signals fullSync already collects.
    // Returning only result.stats hid github.errors / local.errors and the
    // vanished list — a PARTIAL sync looked clean to the calling LLM, which is
    // actively misleading. Include counts (+ the vanished slug list) so the
    // client can see a degraded sync and act (e.g. re-run --prune-vanished).
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          stats: result.stats,
          github_errors: result.github.errors.length,
          local_errors: result.local.errors.length,
          vanished: result.github.vanished,
        }, null, 2),
      }],
    };
  },
);

// ─── sync_dogfood ────────────────────────────────────────────────────────────
server.tool(
  'sync_dogfood',
  'Sync dogfood evidence from dogfood-lab/testing-os into repo_facts. One-way read — testing-os remains write authority.',
  {
    local_path: z.string().optional()
      .describe('Local testing-os checkout path. If omitted, fetches from GitHub raw URL.'),
  },
  async ({ local_path }) => {
    const result = await syncDogfood({
      localPath: local_path || undefined,
    });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── audit_posture ───────────────────────────────────────────────────────────
server.tool(
  'audit_posture',
  'Get audit posture for a repo: last audit date, status, open findings by severity, failed domains, pass rate.',
  { slug: z.string().describe('Repo slug or partial name') },
  async ({ slug }) => {
    const repoId = resolveId(slug);
    if (!repoId) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    const posture = getAuditPosture(repoId);
    if (!posture) return { content: [{ type: 'text' as const, text: `${slug}: not yet audited` }] };
    return { content: [{ type: 'text' as const, text: JSON.stringify({ slug, ...posture }, null, 2) }] };
  },
);

// ─── audit_portfolio ─────────────────────────────────────────────────────────
server.tool(
  'audit_portfolio',
  'Portfolio-wide audit posture: all repos with their latest audit status, grouped by posture (critical/needs_attention/healthy/unaudited).',
  {},
  async () => {
    const portfolio = getPortfolioPosture();
    const audited = portfolio.filter((r) => r.overall_posture);
    const unaudited = portfolio.filter((r) => !r.overall_posture);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          audited_count: audited.length,
          unaudited_count: unaudited.length,
          by_posture: {
            critical: audited.filter((r) => r.overall_posture === 'critical'),
            needs_attention: audited.filter((r) => r.overall_posture === 'needs_attention'),
            healthy: audited.filter((r) => r.overall_posture === 'healthy'),
          },
          unaudited: unaudited.map((r) => r.slug),
        }, null, 2),
      }],
    };
  },
);

// ─── audit_findings ──────────────────────────────────────────────────────────
server.tool(
  'audit_findings',
  'List open audit findings across the portfolio. Filter by severity or domain.',
  {
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
    domain: z.enum(DOMAINS_TUPLE).optional(),
    // mcp-PH-005: same int/min/max constraint as search_repos so a negative or
    // oversized limit can't reach getOpenFindings' slice/LIMIT.
    limit: z.number().int().min(1).max(100).optional().default(30),
  },
  async (filters) => {
    const findings = getOpenFindings(filters);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ count: findings.length, findings: findings.map((f) => ({
          slug: (f as any).slug, severity: f.severity, domain: f.domain,
          title: f.title, remediation: f.remediation, status: f.status,
        })) }, null, 2),
      }],
    };
  },
);

// ─── audit_detail ────────────────────────────────────────────────────────────
server.tool(
  'audit_detail',
  'Get the full latest audit for a repo: all control results, findings, metrics, and artifacts.',
  { slug: z.string().describe('Repo slug or partial name') },
  async ({ slug }) => {
    const repoId = resolveId(slug);
    if (!repoId) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    const audit = getLatestAudit(repoId);
    if (!audit) return { content: [{ type: 'text' as const, text: `${slug}: not yet audited` }] };

    // Strip large fields for MCP response
    const response = {
      run: {
        id: audit.id, slug: (audit as any).slug, overall_status: audit.overall_status,
        overall_posture: audit.overall_posture, scope_level: audit.scope_level,
        started_at: audit.started_at, commit_sha: audit.commit_sha,
        summary: audit.summary, blocking_release: !!audit.blocking_release,
      },
      controls: (audit.controls || []).map((c) => ({
        id: c.control_id, domain: c.domain, title: (c as any).control_title,
        result: c.result, notes: c.notes, measured_value: c.measured_value,
      })),
      findings: (audit.findings || []).map((f) => ({
        severity: f.severity, domain: f.domain, title: f.title,
        status: f.status, location: f.location, remediation: f.remediation,
      })),
      metrics: audit.metrics,
    };

    return { content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }] };
  },
);

// ─── audit_submit ────────────────────────────────────────────────────────────
server.tool(
  'audit_submit',
  'Submit audit results for a repo. This is the primary ingestion tool for Claude auditors. Accepts the full audit payload: run metadata, control results, findings, and metrics.',
  {
    run: z.object({
      slug: z.string(),
      commit_sha: z.string().optional(),
      branch: z.string().optional(),
      auditor: z.string().optional().default('claude'),
      scope_level: z.enum(['core', 'full', 'deep']).optional().default('core'),
      overall_status: z.enum(['pass', 'pass_with_findings', 'fail', 'incomplete']),
      overall_posture: z.enum(['healthy', 'needs_attention', 'critical', 'unknown']),
      domains_checked: z.array(z.string()).optional(),
      summary: z.string().optional(),
      blocking_release: z.boolean().optional().default(false),
      started_at: z.string().optional(),
      completed_at: z.string().optional(),
    }),
    controls: z.array(z.object({
      control_id: z.string(),
      result: z.enum(['pass', 'fail', 'warn', 'not_applicable', 'not_run', 'error']),
      notes: z.string().optional(),
      tool_source: z.string().optional(),
      measured_value: z.string().optional(),
    })).optional(),
    findings: z.array(z.object({
      domain: z.string(),
      control_id: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      confidence: z.enum(['high', 'medium', 'low']).optional().default('high'),
      status: z.enum(['open', 'in_progress', 'fixed', 'accepted_risk', 'false_positive', 'mitigated']).optional().default('open'),
      location: z.string().optional(),
      tool_source: z.string().optional(),
      remediation: z.string().optional(),
      cve_id: z.string().optional(),
      cvss_score: z.number().optional(),
    })).optional(),
    metrics: z.object({
      critical_count: z.number().optional().default(0),
      high_count: z.number().optional().default(0),
      medium_count: z.number().optional().default(0),
      low_count: z.number().optional().default(0),
      info_count: z.number().optional().default(0),
      coverage_percent: z.number().optional(),
      test_count: z.number().optional(),
      outdated_dependencies: z.number().optional(),
      vulnerable_dependencies: z.number().optional(),
      secrets_found: z.number().optional().default(0),
      sbom_present: z.boolean().optional().default(false),
      backup_plan_present: z.boolean().optional().default(false),
      license_issues: z.number().optional().default(0),
      controls_passed: z.number().optional().default(0),
      controls_failed: z.number().optional().default(0),
      controls_warned: z.number().optional().default(0),
      controls_skipped: z.number().optional().default(0),
      controls_total: z.number().optional().default(0),
      pass_rate: z.number().optional(),
    }).optional(),
  },
  async ({ run, controls, findings, metrics }) => {
    try {
      const result = importAuditInline({ run, controls, findings, metrics });
      return {
        content: [{
          type: 'text' as const,
          text: `Audit submitted for ${run.slug}: run #${result.runId}, ${result.controls} controls, ${result.findings} findings`,
        }],
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      return { content: [{ type: 'text' as const, text: `Audit submission failed: ${message}` }] };
    }
  },
);

// ─── audit_controls_list ─────────────────────────────────────────────────────
server.tool(
  'audit_controls_list',
  'List all canonical audit controls, optionally filtered by domain. Use this to know what control IDs to reference when submitting audit results.',
  {
    domain: z.enum(DOMAINS_TUPLE).optional().describe('Filter to a specific domain'),
  },
  async ({ domain }) => {
    const db = getDb();
    let controls: Record<string, any>[];
    if (domain) {
      controls = db.prepare('SELECT * FROM audit_controls WHERE domain = ? ORDER BY id').all(domain) as Record<string, any>[];
    } else {
      controls = db.prepare('SELECT * FROM audit_controls ORDER BY domain, id').all() as Record<string, any>[];
    }

    if (!controls.length) {
      // Auto-seed if empty
      seedControls(db);
      controls = db.prepare('SELECT * FROM audit_controls ORDER BY domain, id').all() as Record<string, any>[];
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          count: controls.length,
          controls: controls.map((c) => ({
            id: c.id, domain: c.domain, title: c.title,
            severity: c.severity, automated: !!c.automated, tool_hint: c.tool_hint,
          })),
        }, null, 2),
      }],
    };
  },
);

// ─── audit_unaudited ─────────────────────────────────────────────────────────
server.tool(
  'audit_unaudited',
  'List repos that have no audit runs yet.',
  {},
  async () => {
    const repos = findByAuditStatus({ unaudited: true });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ count: repos.length, repos: repos.map((r: Record<string, any>) => ({
          slug: r.slug, language: r.primary_language, shape: r.app_shape, status: r.status,
        })) }, null, 2),
      }],
    };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD-HEALTH TOOLS (MCP-001) — DB-only reads, no network refresh
// ═══════════════════════════════════════════════════════════════════════════════

// ─── health_feed ─────────────────────────────────────────────────────────────
server.tool(
  'health_feed',
  'Build-health change feed across the whole portfolio: audit deltas, newly-unpinned actions, broken CI streaks, toolchain drift. DB-only read (no registry/network refresh) — reflects state as of the last `rk sync`.',
  {},
  async () => {
    const events = buildFeed();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ count: events.length, events }, null, 2) }],
    };
  },
);

// ─── health_doctor ───────────────────────────────────────────────────────────
server.tool(
  'health_doctor',
  'Single-repo build-health deep dive: CI, declared/observed toolchain + drift, dep-audit (with CVE IDs) and history, workflow actions + permissions. DB-only read (no network refresh).',
  { slug: z.string().describe('Repo slug or partial name') },
  async ({ slug }) => {
    // Resolve the partial through the shared resolver so an ambiguous or
    // unknown fragment doesn't silently target the wrong repo — then call
    // buildRepoDoctor with the CANONICAL slug (it does an exact slug lookup).
    const ref = resolveRepoRef(slug);
    if (!ref) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    const report = buildRepoDoctor(ref.canonical);
    if (!report) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    return { content: [{ type: 'text' as const, text: JSON.stringify(report, null, 2) }] };
  },
);

// ─── health_portfolio ────────────────────────────────────────────────────────
server.tool(
  'health_portfolio',
  'Portfolio health rollup — one row per repo with CI / dep / action-pin health grades + toolchain-drift flag and inline detail. DB-only read (no network refresh).',
  {},
  async () => {
    const rows = buildHealthTable();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ count: rows.length, rows }, null, 2) }],
    };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATIONAL HYGIENE TOOLS (MCP-002)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── db_fsck ─────────────────────────────────────────────────────────────────
server.tool(
  'db_fsck',
  // SIDE EFFECT (named): every invocation WRITES one db_health_runs audit row.
  // This is intentional (an operator wants a historical integrity trail "for
  // free") but it is NOT a pure read — flagged here so an LLM client knows
  // calling this tool mutates the DB.
  'Run the DB-integrity checker: orphan rows, broken relationships, missing local paths, FTS row-count mismatch, invalid lifecycle status, incomplete sync runs. SIDE EFFECT: writes one db_health_runs audit row per call (the run_id is returned). Pass strict=true to make any dirty check yield exit_code=1 (CI gate).',
  {
    strict: z.boolean().optional().default(false)
      .describe('When true, any non-zero check count yields exit_code=1 (default: informational, exit_code always 0)'),
  },
  async ({ strict }) => {
    const report = runFsck({ strict });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(report, null, 2) }],
    };
  },
);

// ─── repo_diff ───────────────────────────────────────────────────────────────
server.tool(
  'repo_diff',
  'Per-repo DB-entry change history within a time window: notes added, audit runs, dep-audit severity deltas, published versions. Default window is the last 7 days. DB-only read.',
  {
    slug: z.string().describe('Repo slug or partial name'),
    since: z.string().optional()
      .describe('Lower bound (inclusive), e.g. "2026-06-01" or an ISO timestamp. Defaults to 7 days before `until`.'),
    until: z.string().optional()
      .describe('Upper bound (inclusive), e.g. "2026-06-20". Defaults to now. A date-only value covers the whole day.'),
  },
  async ({ slug, since, until }) => {
    // Resolve through the shared resolver so an ambiguous fragment is rejected
    // here (not mis-targeted), then hand getRepoDiff the CANONICAL slug — it
    // does its own exact slug→id lookup.
    const ref = resolveRepoRef(slug);
    if (!ref) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    const report = getRepoDiff(ref.canonical, { since, until });
    if (!report) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    return { content: [{ type: 'text' as const, text: JSON.stringify(report, null, 2) }] };
  },
);

// ─── ops_runs ────────────────────────────────────────────────────────────────
server.tool(
  'ops_runs',
  'List recent operational run rows: db_health_runs (fsck) and/or sync_runs. Read-only audit trail. Use kind to scope to one table.',
  {
    kind: z.enum(['fsck', 'sync', 'all']).optional().default('all')
      .describe('Which run trail to return (default: all)'),
    limit: z.number().int().min(1).max(100).optional().default(20)
      .describe('Max rows per trail (1–100)'),
  },
  async ({ kind, limit }) => {
    const out: Record<string, unknown> = {};
    if (kind === 'all' || kind === 'fsck') out.fsck_runs = listDbHealthRuns(limit);
    if (kind === 'all' || kind === 'sync') out.sync_runs = listSyncRuns(limit);
    return { content: [{ type: 'text' as const, text: JSON.stringify(out, null, 2) }] };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE MUTATION TOOLS (MCP-004)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── archive_repo ────────────────────────────────────────────────────────────
server.tool(
  'archive_repo',
  'Mark a repo archived (lifecycle_status=archived, deprecated_at=now). Preserves all notes/findings — this is the reversible alternative to delete_repo. If reason is given it is recorded as a warning note. Re-archiving is idempotent (re-confirms deprecated_at).',
  {
    slug: z.string().describe('Repo slug or partial name'),
    reason: z.string().optional().describe('Reason for archiving (recorded as a warning note)'),
  },
  async ({ slug, reason }) => {
    const ref = resolveRepoRef(slug);
    if (!ref) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    const result = archiveRepoBySlug(ref.canonical, { reason });
    if (!result.archived) {
      // Defensive: ref resolved above but the UPDATE affected 0 rows.
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }
    // archiveRepoBySlug IGNORES its reason opt (it only flips status), so the
    // rationale note is written HERE, not delegated — mirrors the CLI `archive`.
    if (reason) {
      upsertNote(ref.id, 'warning', 'Archived', `Archived: ${reason}`);
    }
    return {
      // Echo the CANONICAL slug (provenance-on-display), not the fragment.
      content: [{ type: 'text' as const, text: `Archived: ${ref.canonical}${reason ? ` (reason recorded)` : ''}` }],
    };
  },
);

// ─── delete_repo ─────────────────────────────────────────────────────────────
server.tool(
  'delete_repo',
  'HARD-DELETE a repo and all related rows (notes, facts, docs, relationships, audit runs — FK cascade). IRREVERSIBLE. There is no interactive prompt over MCP, so `confirm` MUST be literally true to proceed; any other value refuses. Prefer archive_repo when you only want to mark a repo dead.',
  {
    slug: z.string().describe('Repo slug or partial name'),
    confirm: z.boolean().describe('Must be literally true to proceed — the explicit gate for this irreversible action'),
  },
  async ({ slug, confirm }) => {
    // Guarded boolean: no interactive confirm() is possible over MCP, so an
    // explicit confirm===true arg is the only gate. Refuse before resolving.
    if (confirm !== true) {
      return {
        content: [{
          type: 'text' as const,
          text: `Refused: delete_repo is irreversible and requires confirm=true. Re-call with { "slug": "${slug}", "confirm": true } to proceed, or use archive_repo to mark the repo dead without deleting it.`,
        }],
      };
    }
    const ref = resolveRepoRef(slug);
    if (!ref) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    const result = deleteRepoBySlug(ref.canonical);
    if (!result.deleted) {
      return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    }
    return {
      content: [{
        type: 'text' as const,
        // Echo the canonical slug + the cascade blast radius.
        text: JSON.stringify({ deleted: true, slug: ref.canonical, cascaded_rows: result.cascaded_rows }, null, 2),
      }],
    };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISH-VERSIONS TOOL (MCP-005)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── repo_versions ───────────────────────────────────────────────────────────
server.tool(
  'repo_versions',
  'List published versions recorded for a repo, grouped per channel (npm / pypi / github-release). READ-ONLY — unlike `rk versions --refresh`, the MCP variant does NOT hit registries; it reports the rows already in the DB as of the last sync.',
  {
    slug: z.string().describe('Repo slug or partial name'),
    channel: z.string().optional().describe('Filter to one channel (e.g. npm, pypi, github-release)'),
  },
  async ({ slug, channel }) => {
    const ref = resolveRepoRef(slug);
    if (!ref) return { content: [{ type: 'text' as const, text: notFoundMessage(slug) }] };
    if ('ambiguous' in ref) {
      return { content: [{ type: 'text' as const, text: ambiguousMessage(slug, ref.ambiguous) }] };
    }
    const rows = listPublishedVersions(ref.id);
    const filtered = channel ? rows.filter((r) => r.channel === channel) : rows;
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ slug: ref.canonical, channel: channel ?? null, count: filtered.length, versions: filtered }, null, 2),
      }],
    };
  },
);

// ═══════════════════════════════════════════════════════════════════════════════
// DOGFOOD + AUDIT-DRILL TOOLS (MCP-006)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── suggest_dogfood ─────────────────────────────────────────────────────────
server.tool(
  'suggest_dogfood',
  'Get dogfood intelligence suggestions (findings, patterns, recommendations, doctrine) for a repo OR a product surface. Specify EXACTLY ONE of repo / surface.',
  {
    repo: z.string().optional().describe('Repo slug (e.g. mcp-tool-shop-org/shipcheck)'),
    surface: z.string().optional().describe('Product surface (e.g. cli, mcp-server, desktop)'),
  },
  async ({ repo, surface }) => {
    // Mirror the CLI `suggest-dogfood` mutual-exclusion guard: the handler
    // routes to exactly one branch, so both-set or neither-set is a caller
    // mistake we surface rather than silently pick a branch.
    if (repo && surface) {
      return { content: [{ type: 'text' as const, text: 'Error: specify only one of repo or surface, not both.' }] };
    }
    if (!repo && !surface) {
      return { content: [{ type: 'text' as const, text: 'Error: specify repo <slug> or surface <surface>.' }] };
    }
    const result = repo ? suggestByRepo(repo) : suggestBySurface(surface!);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ for: repo ?? surface, ...result }, null, 2) }],
    };
  },
);

// ─── audit_failing ───────────────────────────────────────────────────────────
server.tool(
  'audit_failing',
  'List repos whose LATEST audit has failing controls in a given domain. Returns each failing control id + title + notes per repo.',
  {
    domain: z.enum(DOMAINS_TUPLE).describe('Audit domain to filter failing controls by'),
  },
  async ({ domain }) => {
    const rows = findByAuditStatus({ domain_failing: domain });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ domain, count: rows.length, failing: rows }, null, 2) }],
    };
  },
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// F-BE-humanization: friendly "repo not found" text that gives the calling
// LLM an actionable next step. The MCP client (LLM) sees this verbatim and
// can chain to find_repos or sync_repos automatically instead of giving up.
function notFoundMessage(slug: string): string {
  return `Repo "${slug}" not found. Use find_repos (with no filters to list all) to see indexed repos, or sync_repos to fetch new ones from configured owners.`;
}

// A partial slug that matches more than one repo is ambiguous — surface the
// candidates so the calling LLM disambiguates instead of mutating an
// arbitrary repo silently.
function ambiguousMessage(slug: string, candidates: string[]): string {
  return `Ambiguous slug "${slug}" matches ${candidates.length} repos: ${candidates.join(', ')}. Pass the full slug to disambiguate.`;
}

// Escape LIKE metacharacters so a slug containing % or _ is matched literally
// rather than as a wildcard (a repo named e.g. `repo_knowledge` must not let
// the `_` match any character). Pairs with `ESCAPE '\'` on the LIKE clause —
// same treatment as sync/dogfood-suggest.ts.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

type RepoRef = { id: number; canonical: string } | { ambiguous: string[] } | null;

/**
 * Resolve a repo reference by slug for the MCP tools. Exact slug wins;
 * otherwise an ORDERED, LIKE-escaped partial match.
 *
 * The previous resolver did an UNORDERED, UNLIMITED `LIKE %slug%` and returned
 * an arbitrary first row, so an ambiguous fragment (e.g. "shipcheck" matching
 * both org/shipcheck and org/shipcheck-plugin) silently resolved to whichever
 * row SQLite scanned first — a silent mis-target for the MUTATING add_repo_note
 * and add_relationship tools, corrupting knowledge-DB provenance with no error.
 * We now distinguish unique / ambiguous / not-found so the mutating tools can
 * refuse-and-disambiguate and echo the canonical slug (sibling of cli-A-001).
 */
function resolveRepoRef(slug: string): RepoRef {
  const db = getDb();
  const exact = db.prepare('SELECT id, slug FROM repos WHERE slug = ?').get(slug) as { id: number; slug: string } | undefined;
  if (exact) return { id: exact.id, canonical: exact.slug };
  const matches = db.prepare(
    "SELECT id, slug FROM repos WHERE slug LIKE ? ESCAPE '\\' OR name = ? ORDER BY slug"
  ).all(`%${escapeLike(slug)}%`, slug) as { id: number; slug: string }[];
  if (matches.length === 0) return null;
  if (matches.length > 1) return { ambiguous: matches.map((m) => m.slug) };
  return { id: matches[0].id, canonical: matches[0].slug };
}

// Thin wrapper for the read-only tools: an ambiguous partial resolves to null
// (handled as not-found / be-more-specific) rather than an arbitrary row, so
// no read silently targets the wrong repo either.
function resolveId(slug: string): number | null {
  const ref = resolveRepoRef(slug);
  return ref && 'id' in ref ? ref.id : null;
}

function tryParse(json: string | null | undefined): unknown {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return json; }
}

// ─── Start ───────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('repo-knowledge MCP server running on stdio');

  // F-BE-009: graceful shutdown on SIGINT/SIGTERM. Without these handlers,
  // SIGTERM (sent by host process supervisors and IDE MCP integrations on
  // restart) leaves the SQLite WAL/-shm files locked, requiring manual
  // cleanup. shutdown() is best-effort and exits 0 — non-zero would signal
  // an abnormal termination the supervisor might retry.
  const shutdown = (signal: NodeJS.Signals): void => {
    process.stderr.write(`repo-knowledge MCP server received ${signal}, shutting down\n`);
    try { closeDb(); } catch { /* idempotent best-effort */ }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e: unknown) => {
  console.error('Fatal:', e);
  process.exit(1);
});
