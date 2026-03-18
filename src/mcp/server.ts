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
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  openDb, closeDb, getDb, getRepo, findRepos, getRelated,
  getRepoIdBySlug, getAllRepos, getStats, upsertNote,
  addRelationship as addRel,
} from '../db/init.js';
import type { RepoFilters } from '../db/init.js';
import { searchRepos, search, rebuildIndex } from '../search/fts.js';
import { fullSync } from '../sync/index.js';
import { seedControls, CONTROLS, DOMAINS } from '../audit/controls.js';
import type { Domain } from '../audit/controls.js';
import { importAuditInline } from '../audit/import.js';
import {
  getLatestAudit, getAuditPosture, getPortfolioPosture,
  findByAuditStatus, getOpenFindings,
} from '../audit/queries.js';
import { resolveConfig } from '../config.js';

// Note: zod comes bundled with @modelcontextprotocol/sdk

// Resolve config at startup
const config = resolveConfig();

const server = new McpServer({
  name: 'repo-knowledge',
  version: '1.0.0',
  description: 'Repo knowledge system — structured catalog with full-text search',
});

// Initialize DB
openDb(config.dbPath);

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
      return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
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

    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ ...repo, docs }, null, 2) }],
    };
  },
);

// ─── find_repos ──────────────────────────────────────────────────────────────
server.tool(
  'find_repos',
  'Filter repos by owner, status, category, language, framework, or app shape.',
  {
    owner: z.string().optional().describe('GitHub owner'),
    status: z.enum(['active', 'paused', 'archived', 'unknown']).optional(),
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
    limit: z.number().optional().default(10).describe('Max results'),
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
      return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
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
  { stack: z.string().describe('Space-separated tech terms to match') },
  async ({ stack }) => {
    const terms = stack.toLowerCase().split(/\s+/);
    const db = getDb();

    const allRepos = db.prepare(`
      SELECT r.id, r.slug, r.description, r.status,
             t.primary_language, t.frameworks, t.runtime, t.app_shape, t.package_manager
      FROM repos r
      LEFT JOIN repo_tech t ON t.repo_id = r.id
    `).all() as Record<string, any>[];

    const matches = allRepos.filter((r) => {
      const haystack = [
        r.primary_language, r.frameworks, r.runtime, r.app_shape, r.package_manager,
      ].filter(Boolean).join(' ').toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ stack, count: matches.length, repos: matches.map((r) => ({
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
  },
  async ({ type }) => {
    const db = getDb();
    const results: Record<string, any[]> = {};

    if (type === 'all' || type === 'stale') {
      // Repos not pushed to in 60+ days
      results.stale = db.prepare(`
        SELECT slug, pushed_at, status FROM repos
        WHERE pushed_at < datetime('now', '-60 days') AND status = 'active'
        ORDER BY pushed_at ASC
      `).all() as Record<string, any>[];
    }

    if (type === 'all' || type === 'unaudited') {
      // Repos with no audit records
      results.unaudited = db.prepare(`
        SELECT r.slug, r.status FROM repos r
        WHERE NOT EXISTS (SELECT 1 FROM repo_audits a WHERE a.repo_id = r.id)
        AND r.status != 'archived'
        ORDER BY r.slug
      `).all() as Record<string, any>[];
    }

    if (type === 'all' || type === 'warnings') {
      results.warnings = db.prepare(`
        SELECT r.slug, n.title, n.content FROM repo_notes n
        JOIN repos r ON r.id = n.repo_id
        WHERE n.note_type IN ('warning', 'drift_risk', 'pain_point')
        ORDER BY n.updated_at DESC
      `).all() as Record<string, any>[];
    }

    if (type === 'all' || type === 'next_steps') {
      results.next_steps = db.prepare(`
        SELECT r.slug, n.title, n.content FROM repo_notes n
        JOIN repos r ON r.id = n.repo_id
        WHERE n.note_type = 'next_step'
        ORDER BY n.updated_at DESC
      `).all() as Record<string, any>[];
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
      return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
    }

    const fws: string[] = repo.tech?.frameworks
      ? (typeof repo.tech.frameworks === 'string' ? JSON.parse(repo.tech.frameworks) : repo.tech.frameworks)
      : [];
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
    note_type: z.enum([
      'thesis', 'architecture', 'warning', 'next_step',
      'drift_risk', 'release_summary', 'convention',
      'pain_point', 'command', 'general',
    ]),
    title: z.string().optional().describe('Short note title'),
    content: z.string().describe('Note content'),
  },
  async ({ slug, note_type, title, content }) => {
    const repoId = resolveId(slug);
    if (!repoId) {
      return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
    }
    upsertNote(repoId, note_type, title || note_type, content);
    rebuildIndex();
    return {
      content: [{ type: 'text' as const, text: `Note added to ${slug} [${note_type}]: ${title || note_type}` }],
    };
  },
);

// ─── add_relationship ────────────────────────────────────────────────────────
server.tool(
  'add_relationship',
  'Record a relationship between two repos.',
  {
    from_slug: z.string().describe('Source repo slug'),
    relation_type: z.enum([
      'depends_on', 'related_to', 'supersedes',
      'shares_domain_with', 'shares_package_with', 'companion_to',
    ]),
    to_slug: z.string().describe('Target repo slug'),
    note: z.string().optional().describe('Optional context about the relationship'),
  },
  async ({ from_slug, relation_type, to_slug, note }) => {
    const fromId = resolveId(from_slug);
    const toId = resolveId(to_slug);
    if (!fromId) return { content: [{ type: 'text' as const, text: `Repo not found: ${from_slug}` }] };
    if (!toId) return { content: [{ type: 'text' as const, text: `Repo not found: ${to_slug}` }] };

    addRel(fromId, relation_type, toId, note);
    return {
      content: [{ type: 'text' as const, text: `Relationship added: ${from_slug} ${relation_type} ${to_slug}` }],
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
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result.stats, null, 2) }],
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
    if (!repoId) return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
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
    limit: z.number().optional().default(30),
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
    if (!repoId) return { content: [{ type: 'text' as const, text: `Repo not found: ${slug}` }] };
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveId(slug: string): number | null {
  const db = getDb();
  let row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (row) return row.id;
  row = db.prepare('SELECT id FROM repos WHERE slug LIKE ? OR name = ?').get(`%${slug}%`, slug) as { id: number } | undefined;
  return row?.id || null;
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
}

main().catch((e: unknown) => {
  console.error('Fatal:', e);
  process.exit(1);
});
