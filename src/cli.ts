#!/usr/bin/env node
/**
 * repo-knowledge CLI — rk
 *
 * Commands:
 *   init              Initialize rk.config.json + data directory + seed controls
 *   sync              Full sync (GitHub + local + FTS)
 *   scan <dir>        Scan a single local repo
 *   show <slug>       Show full repo knowledge (with audit posture)
 *   list              List all repos
 *   find <query>      Search across all indexed content
 *   related <slug>    Show related repos
 *   note <slug>       Add a note to a repo
 *   stats             Show database statistics
 *   reindex           Rebuild FTS index
 *
 * Audit commands:
 *   audit import <dir>       Import audit results from JSON contract files
 *   audit seed-controls      Seed canonical control catalog
 *   audit posture [slug]     Show audit posture (one repo or portfolio)
 *   audit findings           List open findings across portfolio
 *   audit controls           List canonical controls
 *   audit unaudited          List repos with no audit runs
 */
import { program } from 'commander';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { hostname } from 'node:os';
import {
  openDb, getDb, closeDb, getRepo, findRepos, getRelated, getAllRepos, getStats,
  upsertNote, addRelationship,
  // F-BE-FT1: lifecycle + cross-rig helpers (provided by DB agent in
  // migration-006 + init.ts extensions). CLI assumes these signatures;
  // coordinator reconciles if mismatched.
  upsertRig, listRigs,
  upsertRepoLocalPath,
  deleteRepoBySlug, archiveRepoBySlug, findStaleArchived,
  // F-BE-FT2: publish state — bindings + version registry (migration-007).
  // PUBLISHER_METHODS validates --publisher-method input before reaching
  // setRepoPackageNames (which throws on bad enum); duplicating the guard
  // at the CLI layer surfaces a friendlier exit-2 error than a raw throw.
  setRepoPackageNames, listPublishedVersions, getLatestPublishedVersion,
  PUBLISHER_METHODS, PUBLISHED_VERSION_CHANNELS,
} from './db/init.js';
import { syncPublishStateForRepo } from './sync/publish.js';
import { syncBuildHealthForRepo } from './sync/build-health.js';
import {
  buildFeed, renderFeedText,
  buildRepoDoctor, renderDoctorText,
  buildHealthTable, renderHealthTableText,
} from './health/index.js';
import { fullSync } from './sync/index.js';
import { ingestLocalRepo } from './sync/local.js';
import { rebuildIndex, searchRepos } from './search/fts.js';
import { seedControls } from './audit/controls.js';
import { importAudit } from './audit/import.js';
import { getAuditPosture, getPortfolioPosture, findByAuditStatus, getOpenFindings } from './audit/queries.js';
import { resolveConfig } from './config.js';
import { syncDogfood } from './sync/dogfood.js';
import { suggestByRepo, suggestBySurface } from './sync/dogfood-suggest.js';
import { parseWorklist } from './games/parser.js';
import { scoreGame } from './games/scorer.js';
import { renderReport, renderJSON, renderMarkdown } from './games/render.js';
// F-BE-022 / F-BE-011 / F-BE-021: shared enum tuples for note + relation
// types — single source of truth in index.ts (CLI validators + MCP Zod
// enums sync by inspection). Mirrors CHECK constraints in src/db/schema.sql.
import { NOTE_TYPES, RELATION_TYPES } from './index.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

// F-BE-014: lazy config getter so `rk --help` / `rk --version` don't crash
// when rk.config.json is malformed or missing. Command actions call config()
// to materialize the resolved config on demand.
let _configCache: ReturnType<typeof resolveConfig> | undefined;
function config(): ReturnType<typeof resolveConfig> {
  if (!_configCache) _configCache = resolveConfig();
  return _configCache;
}

// F-BE-008: parse positive integer with surface-naming error. Exits 2 with a
// helpful message if the value is non-numeric, NaN, infinite, or < 1. Used
// for --limit and similar numeric options where bad input would silently
// degrade (parseInt('foo') → NaN → undefined SQL bind → no results).
function parsePositiveInt(value: string, label: string): number {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) {
    console.error(`Invalid ${label}: ${value}`);
    console.error(`Expected a positive integer (e.g., --limit 10).`);
    process.exit(2);
  }
  return n;
}

// F-BE-007: register a single beforeExit hook so any code path that throws
// or short-circuits without explicit closeDb() still releases the WAL/-shm
// files. closeDb() is idempotent so multiple calls (action handler + this
// hook) are safe.
process.on('beforeExit', () => {
  try { closeDb(); } catch { /* idempotent best-effort */ }
});

program
  .name('rk')
  .description('Repo Knowledge System — know your repos')
  .version(version)
  // F-BE-humanization: nudge users toward --help after misuse (unknown
  // command, missing required option, etc.). Cheaper than rereading docs.
  .showHelpAfterError('(add --help for additional information)');

// ─── init ────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize rk.config.json, data directory, DB, and seed controls')
  .action((): void => {
    const configPath = join(process.cwd(), 'rk.config.json');
    const dataDir = join(process.cwd(), 'data');

    // Create rk.config.json if it doesn't exist
    if (!existsSync(configPath)) {
      const example = {
        dbPath: 'data/knowledge.db',
        owners: ['your-github-org'],
        localDirs: ['.'],
        artifactsRoot: 'data/artifacts',
      };
      writeFileSync(configPath, JSON.stringify(example, null, 2) + '\n', 'utf-8');
      console.log(`Created ${configPath}`);
    } else {
      console.log(`Already exists: ${configPath}`);
    }

    // Create data/ directory
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`Created ${dataDir}/`);
    } else {
      console.log(`Already exists: ${dataDir}/`);
    }

    // Open DB (runs migrations)
    const freshConfig = resolveConfig();
    const db = openDb(freshConfig.dbPath);
    console.log(`Database ready: ${freshConfig.dbPath}`);

    // Seed controls
    const count = seedControls(db);
    console.log(`Seeded ${count} canonical controls`);

    closeDb();
    console.log('\nDone! Edit rk.config.json to set your GitHub owners and local dirs.');
  });

// ─── sync ────────────────────────────────────────────────────────────────────
program
  .command('sync')
  .description('Full sync: GitHub orgs + local repos + FTS index')
  .option('--owners <owners>', 'Comma-separated GitHub owners', '')
  .option('--local <dirs>', 'Comma-separated local directories', '.')
  .option('--releases', 'Also sync releases (slower)', false)
  .option('--forks', 'Include forked repos', false)
  .action(async (opts: { owners: string; local: string; releases: boolean; forks: boolean }): Promise<void> => {
    openDb(config().dbPath);
    await fullSync({
      owners: opts.owners ? opts.owners.split(',') : undefined,
      localDirs: opts.local ? opts.local.split(',') : undefined,
      includeReleases: opts.releases,
      includeForks: opts.forks,
    });
    closeDb();
  });

// ─── scan ────────────────────────────────────────────────────────────────────
program
  .command('scan <path>')
  .description('Scan a single local repo directory')
  .action((path: string): void => {
    openDb(config().dbPath);
    const result = ingestLocalRepo(path);
    console.log(`Scanned: ${result.name} (${result.docs} docs indexed)`);
    rebuildIndex();
    closeDb();
  });

// ─── sync-dogfood ────────────────────────────────────────────────────────────
program
  .command('sync-dogfood')
  .description('Sync dogfood evidence from dogfood-lab/testing-os into repo_facts (one-way read)')
  .option('--local <path>', 'Local testing-os checkout path (default: fetch from GitHub)')
  .action(async (opts: { local?: string }): Promise<void> => {
    openDb(config().dbPath);
    const result = await syncDogfood({
      localPath: opts.local || undefined,
    });
    console.log(`Dogfood sync complete:`);
    console.log(`  Repos synced: ${result.repos}`);
    console.log(`  Facts upserted: ${result.facts_upserted}`);
    if (result.skipped.length > 0) {
      console.log(`  Skipped (not in DB): ${result.skipped.join(', ')}`);
    }
    if (result.intelligence) {
      const i = result.intelligence;
      console.log(`  Intelligence layer:`);
      console.log(`    Findings: ${i.findings}, Patterns: ${i.patterns}, Recommendations: ${i.recommendations}, Doctrine: ${i.doctrine}`);
      console.log(`    Facts upserted: ${i.facts_upserted}`);
    }
    closeDb();
  });

// ─── suggest-dogfood ─────────────────────────────────────────────────────────
program
  .command('suggest-dogfood')
  .description('Get dogfood intelligence suggestions for a repo or surface')
  .option('--repo <slug>', 'Repo slug (e.g., mcp-tool-shop-org/shipcheck)')
  .option('--surface <surface>', 'Product surface (e.g., cli, mcp-server, desktop)')
  .action((opts: { repo?: string; surface?: string }): void => {
    // F-BE-016: reject ambiguous invocation (both flags set) BEFORE opening
    // the DB. The action only routes to one branch, so silently picking one
    // would hide a user mistake.
    if (opts.repo && opts.surface) {
      console.error('Error: specify only one of --repo or --surface, not both.');
      console.error('Example: rk suggest-dogfood --repo mcp-tool-shop-org/shipcheck');
      console.error('   or:   rk suggest-dogfood --surface cli');
      process.exit(2);
    }
    if (!opts.repo && !opts.surface) {
      console.error('Error: specify --repo <slug> or --surface <surface>.');
      console.error('Example: rk suggest-dogfood --repo mcp-tool-shop-org/shipcheck');
      console.error('   or:   rk suggest-dogfood --surface cli');
      process.exit(2);
    }
    openDb(config().dbPath);
    const result = opts.repo ? suggestByRepo(opts.repo) : suggestBySurface(opts.surface!);

    if (result.findings.length === 0 && result.patterns.length === 0 &&
        result.recommendations.length === 0 && result.doctrine.length === 0) {
      console.log('No dogfood intelligence found. Run rk sync-dogfood --local <path> first.');
      closeDb();
      return;
    }

    console.log(`Dogfood intelligence for: ${opts.repo || opts.surface}\n`);

    if (result.findings.length > 0) {
      console.log(`Findings (${result.findings.length}):`);
      for (const f of result.findings) {
        console.log(`  ${f.finding_id} [${f.issue_kind}]`);
        console.log(`    ${f.title}`);
      }
      console.log();
    }

    if (result.patterns.length > 0) {
      console.log(`Patterns (${result.patterns.length}):`);
      for (const p of result.patterns) {
        console.log(`  ${p.pattern_id} [${p.pattern_strength}]`);
        console.log(`    ${p.title}`);
      }
      console.log();
    }

    if (result.recommendations.length > 0) {
      console.log(`Recommendations (${result.recommendations.length}):`);
      for (const r of result.recommendations) {
        console.log(`  ${r.recommendation_id} [${r.confidence}]`);
        console.log(`    ${r.title}`);
        console.log(`    Action: ${r.action_details}`);
      }
      console.log();
    }

    if (result.doctrine.length > 0) {
      console.log(`Doctrine (${result.doctrine.length}):`);
      for (const d of result.doctrine) {
        console.log(`  ${d.doctrine_id} [${d.strength}]`);
        console.log(`    ${d.statement}`);
      }
    }

    closeDb();
  });

// ─── show ────────────────────────────────────────────────────────────────────
program
  .command('show <slug>')
  .description('Show full repo knowledge (owner/name or partial name)')
  .action((slug: string): void => {
    openDb(config().dbPath);
    // Try exact match first, then partial
    let repo = getRepo(slug);
    if (!repo) {
      const all = getAllRepos();
      const match = all.find((r: Record<string, any>) => r.slug.includes(slug) || r.slug.endsWith('/' + slug));
      if (match) repo = getRepo(match.slug);
    }

    if (!repo) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      console.error(`Or:  rk find ${slug}  (to fuzzy-search content)`);
      closeDb();
      process.exit(1);
    }

    console.log('\n' + formatRepo(repo));
    closeDb();
  });

// ─── list ────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all repos')
  .option('--status <status>', 'Filter by status')
  .option('--category <category>', 'Filter by category')
  .option('--language <lang>', 'Filter by primary language')
  .option('--framework <fw>', 'Filter by framework')
  .option('--shape <shape>', 'Filter by app shape')
  .option('--owner <owner>', 'Filter by owner')
  .action((opts: Record<string, string>): void => {
    openDb(config().dbPath);
    const filters: Record<string, string> = { ...opts };
    if (filters.shape) { filters.app_shape = filters.shape; delete filters.shape; }
    const repos = findRepos(filters);

    if (!repos.length) {
      console.log('No repos found matching filters.');
      closeDb();
      return;
    }

    console.log(`\n${repos.length} repos:\n`);
    for (const r of repos) {
      const lang = r.primary_language ? ` [${r.primary_language}]` : '';
      const shape = r.app_shape ? ` (${r.app_shape})` : '';
      const status = r.status !== 'unknown' ? ` {${r.status}}` : '';
      console.log(`  ${r.slug}${lang}${shape}${status}`);
      if (r.description) console.log(`    ${r.description}`);
    }
    closeDb();
  });

// ─── find ────────────────────────────────────────────────────────────────────
program
  .command('find <query...>')
  .description('Search across all indexed content')
  .option('-n, --limit <n>', 'Max results', '10')
  .action((queryParts: string[], opts: { limit: string }): void => {
    openDb(config().dbPath);
    const query = queryParts.join(' ');
    const limit = parsePositiveInt(opts.limit, '--limit');
    const results = searchRepos(query, { limit });

    if (!results.length) {
      console.log(`No results for: ${query}`);
      closeDb();
      return;
    }

    console.log(`\nResults for "${query}":\n`);
    for (const r of results) {
      console.log(`  ${r.slug} (${r.matches.length} matches)`);
      for (const m of r.matches.slice(0, 3)) {
        const snippet = m.snippet?.replace(/\n/g, ' ').slice(0, 120) || '';
        console.log(`    [${m.source_type}] ${m.title}: ${snippet}`);
      }
    }
    closeDb();
  });

// ─── related ─────────────────────────────────────────────────────────────────
program
  .command('related <slug>')
  .description('Show repos related to a given repo')
  .action((slug: string): void => {
    openDb(config().dbPath);
    const repoId = resolveRepoId(slug);
    if (!repoId) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }

    const related = getRelated(repoId);
    if (!related.length) {
      console.log(`No relationships recorded for: ${slug}`);
      closeDb();
      return;
    }

    console.log(`\nRelationships for ${slug}:\n`);
    for (const r of related) {
      console.log(`  ${r.relation_type} → ${r.slug}`);
      if (r.description) console.log(`    ${r.description}`);
      if (r.note) console.log(`    Note: ${r.note}`);
    }
    closeDb();
  });

// ─── note ────────────────────────────────────────────────────────────────────
program
  .command('note <slug>')
  .description('Add a note to a repo')
  // F-BE-011: --type is validated against NOTE_TYPES in the action body
  // below. The underlying CHECK constraint in repo_notes would reject
  // invalid values anyway; the action-body guard surfaces a friendlier
  // error than a raw SQLITE_CONSTRAINT.
  .requiredOption(
    '-t, --type <type>',
    `Note type: ${NOTE_TYPES.join('|')}`,
  )
  .requiredOption('-c, --content <content>', 'Note content')
  .option('--title <title>', 'Optional note title')
  .action((slug: string, opts: { type: string; content: string; title?: string }): void => {
    // F-BE-011: validate the enum before opening the DB.
    if (!(NOTE_TYPES as readonly string[]).includes(opts.type)) {
      console.error(`Error: invalid note type "${opts.type}".`);
      console.error(`Allowed: ${NOTE_TYPES.join(', ')}`);
      console.error(`Example: rk note <slug> --type thesis --content "..."`);
      process.exit(2);
    }
    openDb(config().dbPath);
    const repoId = resolveRepoId(slug);
    if (!repoId) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      console.error(`Or:  rk sync  (to fetch new repos from configured owners)`);
      closeDb();
      process.exit(1);
    }

    upsertNote(repoId, opts.type, opts.title || opts.type, opts.content);
    console.log(`Note added to ${slug}`);
    rebuildIndex();
    closeDb();
  });

// ─── relate ──────────────────────────────────────────────────────────────────
program
  .command('relate <from> <type> <to>')
  .description(`Add a relationship between repos. <type>: ${RELATION_TYPES.join('|')}`)
  .option('--note <note>', 'Optional relationship note')
  .action((from: string, type: string, to: string, opts: { note?: string }): void => {
    // F-BE-021: validate <type> positional against RELATION_TYPES before
    // touching the DB — same rationale as the note --type guard.
    if (!(RELATION_TYPES as readonly string[]).includes(type)) {
      console.error(`Error: invalid relation type "${type}".`);
      console.error(`Allowed: ${RELATION_TYPES.join(', ')}`);
      console.error(`Example: rk relate from-slug depends_on to-slug`);
      process.exit(2);
    }
    openDb(config().dbPath);
    const fromId = resolveRepoId(from);
    const toId = resolveRepoId(to);
    if (!fromId) {
      console.error(`Error: repo not found: ${from}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }
    if (!toId) {
      console.error(`Error: repo not found: ${to}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }

    addRelationship(fromId, type, toId, opts.note);
    console.log(`Relationship added: ${from} ${type} ${to}`);
    closeDb();
  });

// ─── stats ───────────────────────────────────────────────────────────────────
program
  .command('stats')
  .description('Show database statistics')
  .action((): void => {
    openDb(config().dbPath);
    const stats = getStats();
    console.log('\nRepo Knowledge Stats:');
    console.log(`  Repos:         ${stats.repos}`);
    console.log(`  Notes:         ${stats.notes}`);
    console.log(`  Documents:     ${stats.docs}`);
    console.log(`  Facts:         ${stats.facts}`);
    console.log(`  Releases:      ${stats.releases}`);
    console.log(`  Relationships: ${stats.relationships}`);
    if (stats.audit_runs !== undefined) {
      console.log(`\nAudit Stats:`);
      console.log(`  Controls:      ${stats.audit_controls}`);
      console.log(`  Audit runs:    ${stats.audit_runs}`);
      console.log(`  Findings:      ${stats.audit_findings}`);
      console.log(`  Repos audited: ${stats.audited_repos} / ${stats.repos}`);
    }
    closeDb();
  });

// ─── reindex ─────────────────────────────────────────────────────────────────
program
  .command('reindex')
  .description('Rebuild the full-text search index')
  .action((): void => {
    openDb(config().dbPath);
    const count = rebuildIndex();
    console.log(`Indexed ${count} entries`);
    closeDb();
  });

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE + CROSS-RIG SUBCOMMANDS (F-BE-FT1 — Axis 3 + Axis 5 commands)
// ═══════════════════════════════════════════════════════════════════════════════

// F-BE-FT1: slug shape validator. Matches owner/name where each segment may
// contain word chars, dots, hyphens. Centralized here so all FT1 commands
// reject malformed slugs with the same friendly error before opening the DB.
const SLUG_RE = /^[\w.-]+\/[\w.-]+$/;
function validateSlug(slug: string, cmdHint: string): void {
  if (!SLUG_RE.test(slug)) {
    console.error(`Error: invalid slug "${slug}".`);
    console.error(`Expected: owner/name (e.g., mcp-tool-shop-org/repo-knowledge).`);
    console.error(`Example: rk ${cmdHint} mcp-tool-shop-org/repo-knowledge`);
    process.exit(2);
  }
}

// F-BE-FT1: resolve the active rig id with the documented precedence:
// explicit CLI flag > RK_RIG_ID env > os.hostname() > 'unknown'. Used by
// both verify-local and init-rig.
function resolveRigId(explicit?: string): string {
  if (explicit && explicit.trim()) return explicit.trim();
  const envId = process.env.RK_RIG_ID;
  if (envId && envId.trim()) return envId.trim();
  const host = hostname();
  if (host && host.trim()) return host.trim();
  return 'unknown';
}

// F-BE-FT1: prompt for explicit "yes" confirmation. Anything else aborts.
// Uses node's built-in readline/promises so we don't take a new dep. The
// caller is responsible for closing the DB on abort — confirm() returns
// false and the action exits 2.
async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`${question} (type 'yes' to confirm): `);
    return answer.trim().toLowerCase() === 'yes';
  } finally {
    rl.close();
  }
}

// ─── delete ──────────────────────────────────────────────────────────────────
// F-BE-FT1 (Axis 3): hard-delete a repo + all child rows via FK cascade.
// Replaces the hand-rolled `sqlite3 ... DELETE FROM repos ...` workflow we
// did for `npm-sovereignty` 2026-05-01.
program
  .command('delete <slug>')
  .description('Hard-delete a repo and all child rows (cascade). Irreversible.')
  .option('-y, --yes', 'Skip confirmation prompt', false)
  .action(async (slug: string, opts: { yes: boolean }): Promise<void> => {
    validateSlug(slug, 'delete');
    openDb(config().dbPath);

    // Resolve the repo first so we exit 2 cleanly on not-found before we
    // prompt the user for anything.
    const db = getDb();
    const exists = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!exists) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(2);
    }

    if (!opts.yes) {
      console.log(`About to delete ${slug} and all related rows`);
      console.log(`  (notes, facts, docs, relationships, audit runs — FK cascade)`);
      const ok = await confirm('Type yes to delete');
      if (!ok) {
        console.log('Aborted.');
        closeDb();
        process.exit(2);
      }
    }

    const result = deleteRepoBySlug(slug);
    if (!result.deleted) {
      // Race: the repo existed at the check above but was removed
      // mid-action. Treat as not-found per the same exit-2 contract.
      console.error(`Error: repo not found: ${slug}`);
      closeDb();
      process.exit(2);
    }
    console.log(`Deleted: ${slug} (${result.cascaded_rows} child rows cascaded)`);
    closeDb();
  });

// ─── archive ─────────────────────────────────────────────────────────────────
// F-BE-FT1 (Axis 3): flip lifecycle_status='archived' without deleting.
// Preserves notes/findings — the 112 NULLed-path entries from the 2026-05-01
// session should mostly land here, not in delete. Idempotent.
program
  .command('archive <slug>')
  .description('Mark a repo archived (lifecycle_status=archived). Preserves notes/findings.')
  .option('--reason <text>', 'Reason for archiving (recorded as a warning note)')
  .action((slug: string, opts: { reason?: string }): void => {
    validateSlug(slug, 'archive');
    openDb(config().dbPath);

    const db = getDb();
    const row = db.prepare(
      'SELECT id, lifecycle_status FROM repos WHERE slug = ?'
    ).get(slug) as { id: number; lifecycle_status?: string | null } | undefined;
    if (!row) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(2);
    }

    if (row.lifecycle_status === 'archived') {
      console.log(`Already archived: ${slug}`);
      closeDb();
      return;
    }

    const result = archiveRepoBySlug(slug, { reason: opts.reason });
    if (!result.archived) {
      // Defensive: row existed above but UPDATE affected 0 rows. Treat as
      // not-found per the same exit-2 contract.
      console.error(`Error: repo not found: ${slug}`);
      closeDb();
      process.exit(2);
    }

    // Re-read deprecated_at so we display the canonical timestamp the DB
    // wrote (datetime('now') in SQLite's UTC, not Node's ISO clock).
    const after = db.prepare(
      'SELECT deprecated_at FROM repos WHERE slug = ?'
    ).get(slug) as { deprecated_at: string | null } | undefined;
    const deprecatedAt = after?.deprecated_at ?? new Date().toISOString();
    console.log(`Archived: ${slug} (deprecated_at ${deprecatedAt})`);

    // F-BE-FT1: if --reason was supplied, persist it as a warning note so
    // the rationale is queryable later via `rk show <slug>`. archiveRepoBySlug
    // doesn't write notes itself — it just flips the status — so this is
    // the canonical place to record the why.
    if (opts.reason) {
      upsertNote(row.id, 'warning', 'Archived', `Archived: ${opts.reason}`);
    }
    closeDb();
  });

// ─── verify-local ────────────────────────────────────────────────────────────
// F-BE-FT1 (Axis 3 + Axis 5): per-rig local-path verification. Confirms
// every repo's local_path actually exists on this rig and updates
// repo_local_paths with a fresh timestamp. Replaces the manual
// `for r in $(rk list --json); ls $r.local_path` workflow.
program
  .command('verify-local')
  .description('Verify each repo local_path exists on the current rig')
  .option('--rig <id>', 'Rig id (default: RK_RIG_ID env or hostname)')
  .option('--strict', 'Exit non-zero if any drift detected', false)
  .action((opts: { rig?: string; strict: boolean }): void => {
    openDb(config().dbPath);
    const rigId = resolveRigId(opts.rig);

    // Confirm the rig is registered. Not strictly required for the DB
    // agent's upsertRepoLocalPath to function, but nudges the user toward
    // running init-rig once before the per-rig data starts piling up
    // against an unregistered identifier.
    let rigs: ReturnType<typeof listRigs>;
    try {
      rigs = listRigs();
    } catch {
      rigs = [];
    }
    const known = rigs.some((r) => r.rig_id === rigId);
    if (!known) {
      console.log(`Note: rig "${rigId}" is not registered.`);
      console.log(`Hint: rk init-rig --id ${rigId}  (registers this rig in the rigs table)`);
    }

    const repos = getAllReposForVerify();
    let live = 0;
    let drifted = 0;
    let skipped = 0;
    const drift: Array<{ slug: string; local_path: string }> = [];

    for (const r of repos) {
      if (!r.local_path) {
        skipped += 1;
        continue;
      }
      if (existsSync(r.local_path)) {
        live += 1;
        upsertRepoLocalPath({
          repo_id: r.id,
          rig_id: rigId,
          local_path: r.local_path,
        });
      } else {
        drifted += 1;
        drift.push({ slug: r.slug, local_path: r.local_path });
      }
    }

    console.log(
      `Verified ${repos.length} repos on rig ${rigId}: ${live} paths live, ${drifted} drifted (local_path doesn't exist), ${skipped} skipped (NULL local_path).`
    );
    if (drift.length) {
      console.log(`\nDrifted (${drift.length}):`);
      for (const d of drift) {
        console.log(`  ${d.slug}`);
        console.log(`    ${d.local_path}`);
      }
    }

    closeDb();
    if (opts.strict && drifted > 0) {
      process.exit(1);
    }
  });

// F-BE-FT1: minimal projection over repos table for verify-local. We need
// id + slug + local_path; getAllRepos() drops id and findRepos() forces a
// LEFT JOIN to repo_tech which is wasteful here. Local helper keeps the
// public API surface unchanged.
function getAllReposForVerify(): Array<{ id: number; slug: string; local_path: string | null }> {
  const db = getDb();
  return db.prepare(
    'SELECT id, slug, local_path FROM repos ORDER BY owner, name'
  ).all() as Array<{ id: number; slug: string; local_path: string | null }>;
}

// ─── init-rig ────────────────────────────────────────────────────────────────
// F-BE-FT1 (Axis 3): one-shot rig registration. Inserts/updates rigs row
// with id + hostname + primary_root + last_seen_at. Idempotent.
program
  .command('init-rig')
  .description('Register the current rig (or specified rig) in the rigs table')
  .option('--id <id>', 'Rig id (default: RK_RIG_ID env or hostname)')
  .option('--hostname <h>', 'Hostname (default: os.hostname())')
  .option('--root <path>', 'Primary workspace root (default: cwd)')
  .action((opts: { id?: string; hostname?: string; root?: string }): void => {
    openDb(config().dbPath);
    const rigId = resolveRigId(opts.id);
    const host = (opts.hostname && opts.hostname.trim()) || hostname() || 'unknown';
    const root = (opts.root && opts.root.trim()) || process.cwd();

    upsertRig({
      rig_id: rigId,
      hostname: host,
      primary_root: root,
    });

    console.log(`Registered rig: ${rigId} at ${host} (root: ${root})`);
    closeDb();
  });

// ─── prune ───────────────────────────────────────────────────────────────────
// F-BE-FT1 (Axis 3): hard-delete repos that have been archived longer than
// --days. GitHub-404 probe deliberately deferred to Feature 2 — too much
// network risk in this wave per kickoff scoping. Dry-run by default;
// --apply gated behind a single confirmation listing all candidates.
program
  .command('prune')
  .description('Hard-delete repos archived longer than --days')
  .option('--dry-run', 'Show candidates without deleting (default)', false)
  .option('--apply', 'Actually delete the archived candidates', false)
  .option('--days <n>', 'Minimum days since archive', '30')
  .action(async (opts: { dryRun: boolean; apply: boolean; days: string }): Promise<void> => {
    const days = parsePositiveInt(opts.days, '--days');
    openDb(config().dbPath);

    const candidates = findStaleArchived(days);

    if (!candidates.length) {
      console.log(`Pruning candidates (archived > ${days} days): none.`);
      closeDb();
      return;
    }

    const slugs = candidates.map((c) => String(c.slug));

    if (!opts.apply) {
      // Default mode is dry-run. Listing alone is informational; user
      // re-runs with --apply when ready.
      console.log(`Pruning candidates (archived > ${days} days): ${candidates.length} repo(s).`);
      for (const c of candidates) {
        const since = c.deprecated_at ? ` (archived ${c.deprecated_at})` : '';
        console.log(`  ${c.slug}${since}`);
      }
      console.log(`\nDry-run only. Re-run with --apply to delete.`);
      closeDb();
      return;
    }

    // --apply path: one confirmation for the whole batch.
    console.log(`Pruning ${candidates.length} repo(s) archived > ${days} days:`);
    for (const c of candidates) {
      console.log(`  ${c.slug}`);
    }
    const ok = await confirm('Type yes to delete all listed candidates');
    if (!ok) {
      console.log('Aborted.');
      closeDb();
      process.exit(2);
    }

    let totalCascaded = 0;
    let deletedCount = 0;
    for (const slug of slugs) {
      try {
        const result = deleteRepoBySlug(slug);
        if (result.deleted) {
          deletedCount += 1;
          totalCascaded += result.cascaded_rows;
        }
      } catch (e: unknown) {
        console.error(`  Failed: ${slug} — ${(e as Error).message}`);
      }
    }

    console.log(
      `Pruned ${deletedCount} repo(s), ${totalCascaded} child rows cascaded.`
    );
    closeDb();
  });

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISH-STATE SUBCOMMANDS (F-BE-FT2 — Axis 3 + Axis 5 Feature 2)
// ═══════════════════════════════════════════════════════════════════════════════

// F-BE-FT2: resolve a repo by slug for the publish-state commands. Reuses
// the same exact-then-partial resolution that show/related use, but
// returns the full repo row (not just an id) because drift + versions
// both need owner/name + bindings + local_path.
function resolveRepoRow(slug: string): Record<string, any> | null {
  const db = getDb();
  let row = db.prepare('SELECT * FROM repos WHERE slug = ?').get(slug) as Record<string, any> | undefined;
  if (row) return row;
  // Partial match — same shape as resolveRepoId's fallback
  row = db.prepare(
    'SELECT * FROM repos WHERE slug LIKE ? OR name = ? ORDER BY slug LIMIT 1'
  ).get(`%${slug}%`, slug) as Record<string, any> | undefined;
  return row ?? null;
}

// ─── versions ────────────────────────────────────────────────────────────────
// F-BE-FT2: cross-channel published-version dashboard. Reads from
// repo_published_versions; --refresh calls syncPublishStateForRepo first.
program
  .command('versions <slug>')
  .description('Show the cross-channel published-version dashboard for one repo')
  .option('--refresh', 'Sync from registries before rendering (network)', false)
  .option('--channel <name>', `Filter to one channel: ${PUBLISHED_VERSION_CHANNELS.join('|')}`)
  .action(async (slug: string, opts: { refresh: boolean; channel?: string }): Promise<void> => {
    if (opts.channel && !(PUBLISHED_VERSION_CHANNELS as readonly string[]).includes(opts.channel)) {
      console.error(`Error: invalid channel "${opts.channel}".`);
      console.error(`Allowed: ${PUBLISHED_VERSION_CHANNELS.join(', ')}`);
      process.exit(2);
    }
    openDb(config().dbPath);
    const repo = resolveRepoRow(slug);
    if (!repo) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }

    if (opts.refresh) {
      console.log(`Refreshing publish state for ${repo.slug}...`);
      const summary = await syncPublishStateForRepo(repo.id, {
        owner: repo.owner,
        name: repo.name,
        npm_package_name: repo.npm_package_name,
        pypi_package_name: repo.pypi_package_name,
      });
      console.log(`  Synced ${summary.updated} row(s)${summary.errors.length ? `, ${summary.errors.length} error(s)` : ''}`);
      if (summary.errors.length > 0) {
        for (const err of summary.errors) console.log(`    ${err}`);
      }
    }

    const rows = listPublishedVersions(repo.id);
    const filtered = opts.channel ? rows.filter(r => r.channel === opts.channel) : rows;

    if (filtered.length === 0) {
      // F-BE-humanization: when the DB is empty, point the user at the
      // remedy. The hint is intentionally specific — "use --refresh" is
      // more actionable than "no data found."
      console.log(`No published versions recorded${opts.channel ? ` on channel ${opts.channel}` : ''}.`);
      console.log(`Run with --refresh to sync from registries.`);
      closeDb();
      return;
    }

    // Group by channel for the dashboard table. Within each group sort
    // newest-first by synced_at — same order listPublishedVersions
    // returns within a channel.
    const byChannel: Record<string, typeof filtered> = {};
    for (const r of filtered) {
      if (!byChannel[r.channel]) byChannel[r.channel] = [];
      byChannel[r.channel].push(r);
    }

    console.log(`\nPublished versions for ${repo.slug}:\n`);
    for (const [channel, channelRows] of Object.entries(byChannel)) {
      console.log(`─── ${channel} (${channelRows.length}) ───`);
      for (const row of channelRows) {
        const publishedAt = row.published_at ? row.published_at.slice(0, 10) : 'unknown';
        const syncedAt = row.synced_at ? row.synced_at.slice(0, 19) : 'unknown';
        console.log(`  ${row.version}  published=${publishedAt}  synced=${syncedAt}`);
      }
      console.log('');
    }

    closeDb();
  });

// ─── drift ───────────────────────────────────────────────────────────────────
// F-BE-FT2: compare source-of-truth version (local package.json /
// pyproject.toml) against the latest registry version recorded in
// repo_published_versions. --strict turns drift into a non-zero exit
// so CI can gate on it.
program
  .command('drift <slug>')
  .description('Compare source-of-truth version (package.json / pyproject.toml) vs registry latest')
  .option('--strict', 'Exit non-zero if any drift detected', false)
  .action((slug: string, opts: { strict: boolean }): void => {
    openDb(config().dbPath);
    const repo = resolveRepoRow(slug);
    if (!repo) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }

    // We need a local checkout to read package.json / pyproject.toml.
    // If local_path is unset or missing, we can still compare bindings
    // vs registry — but the "source of truth" side is empty, so drift
    // detection is a no-op.
    const localPath: string | null = repo.local_path ?? null;

    interface DriftReport {
      channel: string;
      source: string | null;
      registry: string | null;
      drift: boolean | 'skip';
      note?: string;
    }
    const reports: DriftReport[] = [];

    // npm side
    if (repo.npm_package_name) {
      let sourceVersion: string | null = null;
      let note: string | undefined;
      if (localPath && existsSync(localPath)) {
        const pkgPath = join(localPath, 'package.json');
        if (existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version?: string };
            sourceVersion = pkg.version ?? null;
          } catch (e: unknown) {
            note = `package.json parse failed: ${(e as Error).message}`;
          }
        } else {
          note = 'package.json not found at local_path';
        }
      } else {
        note = 'local_path not set or not present on this rig';
      }

      const latest = getLatestPublishedVersion(repo.id, 'npm');
      const registryVersion = latest?.version ?? null;

      if (sourceVersion && registryVersion) {
        reports.push({
          channel: 'npm',
          source: sourceVersion,
          registry: registryVersion,
          drift: sourceVersion !== registryVersion,
        });
      } else {
        reports.push({
          channel: 'npm',
          source: sourceVersion,
          registry: registryVersion,
          drift: 'skip',
          note: note ?? (sourceVersion ? 'no registry version recorded' : 'no source version'),
        });
      }
    }

    // pypi side
    if (repo.pypi_package_name) {
      let sourceVersion: string | null = null;
      let note: string | undefined;
      if (localPath && existsSync(localPath)) {
        const pyprojectPath = join(localPath, 'pyproject.toml');
        if (existsSync(pyprojectPath)) {
          try {
            const content = readFileSync(pyprojectPath, 'utf-8');
            // F-BE-FT2: minimal pyproject [project] version extractor.
            // Avoids pulling in a full TOML parser for one field. Match
            // `version = "X.Y.Z"` inside a `[project]` table; tolerate
            // single or double quotes. If the layout is exotic we just
            // miss — drift then becomes "skip" with a note.
            const projectSection = content.match(/\[project\][^[]*/);
            if (projectSection) {
              const m = projectSection[0].match(/^\s*version\s*=\s*["']([^"']+)["']/m);
              if (m) sourceVersion = m[1];
            }
            if (!sourceVersion) {
              note = 'no [project] version found in pyproject.toml';
            }
          } catch (e: unknown) {
            note = `pyproject.toml parse failed: ${(e as Error).message}`;
          }
        } else {
          note = 'pyproject.toml not found at local_path';
        }
      } else {
        note = 'local_path not set or not present on this rig';
      }

      const latest = getLatestPublishedVersion(repo.id, 'pypi');
      const registryVersion = latest?.version ?? null;

      if (sourceVersion && registryVersion) {
        reports.push({
          channel: 'pypi',
          source: sourceVersion,
          registry: registryVersion,
          drift: sourceVersion !== registryVersion,
        });
      } else {
        reports.push({
          channel: 'pypi',
          source: sourceVersion,
          registry: registryVersion,
          drift: 'skip',
          note: note ?? (sourceVersion ? 'no registry version recorded' : 'no source version'),
        });
      }
    }

    if (reports.length === 0) {
      console.log(`No drift channels to check for ${repo.slug}.`);
      console.log(`Hint: rk bind-package ${repo.slug} --npm <name>   (binds an npm package)`);
      console.log(`   or: rk bind-package ${repo.slug} --pypi <name> (binds a PyPI package)`);
      closeDb();
      return;
    }

    let driftCount = 0;
    console.log(`\nDrift report for ${repo.slug}:\n`);
    for (const r of reports) {
      const source = r.source ?? '(none)';
      const registry = r.registry ?? '(none)';
      if (r.drift === 'skip') {
        console.log(`  ${r.channel}: source=${source} registry=${registry} [skip${r.note ? `: ${r.note}` : ''}]`);
      } else if (r.drift) {
        driftCount += 1;
        console.log(`  ${r.channel}: source=${source} registry=${registry} [drift: yes]`);
      } else {
        console.log(`  ${r.channel}: source=${source} registry=${registry} [drift: no]`);
      }
    }

    if (driftCount === 0) {
      console.log(`\nno drift across ${reports.length} channel(s).`);
    } else {
      console.log(`\ndrift detected on ${driftCount} of ${reports.length} channel(s).`);
    }

    closeDb();
    if (opts.strict && driftCount > 0) {
      process.exit(1);
    }
  });

// ─── bind-package ────────────────────────────────────────────────────────────
// F-BE-FT2: manual binding setter. Wraps setRepoPackageNames with
// publisher-method enum validation surfaced at the CLI layer (the helper
// throws on bad enum, but a CLI exit-2 with the allowed list is friendlier
// than a raw thrown error).
program
  .command('bind-package <slug>')
  .description('Bind npm / PyPI package names + publisher_method on a repo')
  .option('--npm <name>', 'npm package name (e.g. @mcptoolshop/repo-knowledge)')
  .option('--pypi <name>', 'PyPI distribution name')
  .option(
    '--publisher-method <method>',
    `Publisher method: ${PUBLISHER_METHODS.join('|')}`
  )
  .action((slug: string, opts: { npm?: string; pypi?: string; publisherMethod?: string }): void => {
    if (
      opts.publisherMethod !== undefined &&
      !(PUBLISHER_METHODS as readonly string[]).includes(opts.publisherMethod)
    ) {
      console.error(`Error: invalid publisher-method "${opts.publisherMethod}".`);
      console.error(`Allowed: ${PUBLISHER_METHODS.join(', ')}`);
      console.error(`Example: rk bind-package ${slug} --publisher-method npm_trusted`);
      process.exit(2);
    }

    if (
      opts.npm === undefined &&
      opts.pypi === undefined &&
      opts.publisherMethod === undefined
    ) {
      console.error(`Error: specify at least one of --npm, --pypi, --publisher-method.`);
      console.error(`Example: rk bind-package ${slug} --npm @scope/${slug.split('/').pop()}`);
      process.exit(2);
    }

    openDb(config().dbPath);
    const repo = resolveRepoRow(slug);
    if (!repo) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }

    try {
      const result = setRepoPackageNames(repo.slug, {
        npm: opts.npm,
        pypi: opts.pypi,
        publisher_method: opts.publisherMethod as Parameters<typeof setRepoPackageNames>[1]['publisher_method'],
      });
      if (!result.updated) {
        // Defensive: row existed above but UPDATE affected 0 rows.
        console.error(`Error: failed to update bindings for ${repo.slug}`);
        closeDb();
        process.exit(1);
      }
    } catch (e: unknown) {
      // setRepoPackageNames throws on bad enum, but we already validated.
      // Any other error here is real — surface it.
      console.error(`Error: ${(e as Error).message}`);
      closeDb();
      process.exit(1);
    }

    const parts: string[] = [];
    if (opts.npm !== undefined) parts.push(`npm=${opts.npm === null || opts.npm === '' ? '(cleared)' : opts.npm}`);
    if (opts.pypi !== undefined) parts.push(`pypi=${opts.pypi === null || opts.pypi === '' ? '(cleared)' : opts.pypi}`);
    if (opts.publisherMethod !== undefined) parts.push(`publisher_method=${opts.publisherMethod}`);
    console.log(`Bound ${repo.slug}: ${parts.join(' ')}`);
    closeDb();
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveRepoId(slug: string): number | null {
  const db = getDb();
  // Try exact slug
  let row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (row) return row.id;

  // Try partial match
  row = db.prepare('SELECT id FROM repos WHERE slug LIKE ? OR name = ?').get(`%${slug}%`, slug) as { id: number } | undefined;
  return row?.id || null;
}

function formatRepo(repo: Record<string, any>): string {
  const lines: string[] = [];
  lines.push(`═══ ${repo.slug} ═══`);
  lines.push(`URL:      ${repo.github_url || 'n/a'}`);
  lines.push(`Local:    ${repo.local_path || 'not found locally'}`);
  lines.push(`Status:   ${repo.status}  |  Stage: ${repo.stage || 'n/a'}  |  Category: ${repo.category || 'n/a'}`);
  lines.push(`Stars:    ${repo.stars}  |  Forks: ${repo.forks}  |  Issues: ${repo.open_issues}`);
  if (repo.description) lines.push(`Desc:     ${repo.description}`);
  if (repo.purpose) lines.push(`Purpose:  ${repo.purpose}`);
  if (repo.license) lines.push(`License:  ${repo.license}`);

  if (repo.tech) {
    lines.push('\n─── Tech ───');
    lines.push(`Language: ${repo.tech.primary_language || 'n/a'}`);
    if (repo.tech.frameworks) {
      const fws: string[] = typeof repo.tech.frameworks === 'string'
        ? JSON.parse(repo.tech.frameworks) : repo.tech.frameworks;
      if (fws.length) lines.push(`Frames:   ${fws.join(', ')}`);
    }
    lines.push(`Shape:    ${repo.tech.app_shape || 'n/a'}  |  Deploy: ${repo.tech.deployment_shape || 'n/a'}`);
    lines.push(`Runtime:  ${repo.tech.runtime || 'n/a'}  |  PkgMgr: ${repo.tech.package_manager || 'n/a'}`);
    if (repo.tech.platform_targets) {
      const pts: string[] = typeof repo.tech.platform_targets === 'string'
        ? JSON.parse(repo.tech.platform_targets) : repo.tech.platform_targets;
      if (pts?.length) lines.push(`Targets:  ${pts.join(', ')}`);
    }
  }

  if (repo.topics?.length) {
    lines.push(`\n─── Topics ───`);
    lines.push(`  ${repo.topics.join(', ')}`);
  }

  if (repo.notes?.length) {
    lines.push(`\n─── Notes (${repo.notes.length}) ───`);
    for (const n of repo.notes) {
      lines.push(`  [${n.note_type}] ${n.title || ''}`);
      lines.push(`    ${n.content.slice(0, 200)}`);
    }
  }

  if (repo.releases?.length) {
    lines.push(`\n─── Releases (recent) ───`);
    for (const r of repo.releases) {
      lines.push(`  ${r.tag} — ${r.title || ''} (${r.published_at || 'n/a'})`);
    }
  }

  if (repo.relationships?.length) {
    lines.push(`\n─── Relationships ───`);
    for (const r of repo.relationships) {
      lines.push(`  ${r.relation_type} → ${r.target_slug}`);
      if (r.note) lines.push(`    ${r.note}`);
    }
  }

  if (repo.facts?.length) {
    lines.push(`\n─── Facts (${repo.facts.length}) ───`);
    const byType: Record<string, Array<{ key: string }>> = {};
    for (const f of repo.facts) {
      if (!byType[f.fact_type]) byType[f.fact_type] = [];
      byType[f.fact_type].push(f);
    }
    for (const [type, facts] of Object.entries(byType)) {
      lines.push(`  ${type}: ${facts.map(f => f.key).join(', ')}`);
    }
  }

  // Audit posture
  const posture = getAuditPosture(repo.id);
  if (posture) {
    lines.push(`\n─── Audit Posture ───`);
    lines.push(`  Last audited:  ${posture.last_audited} (${posture.scope_level})`);
    lines.push(`  Commit:        ${posture.commit_sha || 'n/a'}`);
    lines.push(`  Status:        ${posture.overall_status}  |  Posture: ${posture.overall_posture}`);
    lines.push(`  Blocking:      ${posture.blocking_release ? 'YES' : 'no'}`);
    lines.push(`  Pass rate:     ${posture.pass_rate != null ? (posture.pass_rate * 100).toFixed(0) + '%' : 'n/a'} (${posture.controls_passed}/${posture.controls_total})`);
    const openStr = Object.entries(posture.open_findings).map(([s, c]) => `${s}:${c}`).join(' ');
    if (openStr) lines.push(`  Open findings: ${openStr}`);
    if (posture.failed_domains.length) lines.push(`  Failed:        ${posture.failed_domains.join(', ')}`);
    if (posture.summary) lines.push(`  Summary:       ${posture.summary}`);
  } else {
    lines.push(`\n─── Audit Posture ───`);
    lines.push(`  Not yet audited`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT SUBCOMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

const audit = program.command('audit').description('Audit evidence system');

// ─── audit seed-controls ─────────────────────────────────────────────────────
audit
  .command('seed-controls')
  .description('Seed/update the canonical control catalog')
  .action((): void => {
    openDb(config().dbPath);
    const count = seedControls(getDb());
    console.log(`Seeded ${count} canonical controls`);
    closeDb();
  });

// ─── audit import ────────────────────────────────────────────────────────────
audit
  .command('import <dir>')
  .description('Import audit results from a directory with JSON contract files')
  .action((dir: string): void => {
    openDb(config().dbPath);
    try {
      const result = importAudit(dir);
      console.log(`Imported audit run #${result.runId}:`);
      console.log(`  Controls: ${result.controls}`);
      console.log(`  Findings: ${result.findings}`);
      console.log(`  Artifacts: ${result.artifacts}`);
    } catch (e: unknown) {
      console.error(`Error: audit import failed: ${(e as Error).message}`);
      console.error(`Hint: verify <dir> contains run.json, controls.json, findings.json, metrics.json`);
      console.error(`Example: rk audit import ./audits/2026-05-20-shipcheck`);
      process.exit(1);
    }
    closeDb();
  });

// ─── audit posture ───────────────────────────────────────────────────────────
audit
  .command('posture [slug]')
  .description('Show audit posture for one repo or the full portfolio')
  .action((slug?: string): void => {
    openDb(config().dbPath);
    if (slug) {
      const repoId = resolveRepoId(slug);
      if (!repoId) {
        console.error(`Error: repo not found: ${slug}`);
        console.error(`Run: rk list  (to see all indexed repos)`);
        closeDb();
        process.exit(1);
      }
      const posture = getAuditPosture(repoId);
      if (!posture) { console.log(`${slug}: not yet audited`); closeDb(); return; }
      console.log(`\n${slug} — ${posture.overall_posture.toUpperCase()}`);
      console.log(`  Last audited: ${posture.last_audited}`);
      console.log(`  Status: ${posture.overall_status} | Pass rate: ${posture.pass_rate != null ? (posture.pass_rate * 100).toFixed(0) + '%' : 'n/a'}`);
      console.log(`  Blocking: ${posture.blocking_release ? 'YES' : 'no'}`);
      const openStr = Object.entries(posture.open_findings).map(([s, c]: [string, unknown]) => `${s}:${c}`).join(' ');
      if (openStr) console.log(`  Open findings: ${openStr}`);
      if (posture.failed_domains.length) console.log(`  Failed domains: ${posture.failed_domains.join(', ')}`);
      if (posture.summary) console.log(`  ${posture.summary}`);
    } else {
      const portfolio = getPortfolioPosture();
      const audited = portfolio.filter((r) => r.overall_posture);
      const unaudited = portfolio.filter((r) => !r.overall_posture);

      console.log(`\nPortfolio Posture (${audited.length} audited, ${unaudited.length} unaudited)\n`);

      if (audited.length) {
        const byPosture: Record<string, typeof audited> = {};
        for (const r of audited) {
          if (!byPosture[r.overall_posture!]) byPosture[r.overall_posture!] = [];
          byPosture[r.overall_posture!].push(r);
        }
        for (const [posture, repos] of Object.entries(byPosture)) {
          console.log(`  ${posture.toUpperCase()} (${repos.length}):`);
          for (const r of repos) {
            const crit = r.critical_count ? ` crit:${r.critical_count}` : '';
            const high = r.high_count ? ` high:${r.high_count}` : '';
            const rate = r.pass_rate != null ? ` ${(r.pass_rate * 100).toFixed(0)}%` : '';
            console.log(`    ${r.slug}${rate}${crit}${high}`);
          }
        }
      }
    }
    closeDb();
  });

// ─── audit findings ──────────────────────────────────────────────────────────
audit
  .command('findings')
  .description('List open findings across the portfolio')
  .option('-s, --severity <severity>', 'Filter by severity')
  .option('-d, --domain <domain>', 'Filter by domain')
  .option('-n, --limit <n>', 'Max results', '50')
  .action((opts: { severity?: string; domain?: string; limit: string }): void => {
    openDb(config().dbPath);
    const findings = getOpenFindings({
      severity: opts.severity,
      domain: opts.domain,
      limit: parsePositiveInt(opts.limit, '--limit'),
    });

    if (!findings.length) {
      console.log('No open findings matching filters.');
      closeDb();
      return;
    }

    console.log(`\n${findings.length} open findings:\n`);
    for (const f of findings) {
      const sev = (f.severity as string).toUpperCase().padEnd(8);
      console.log(`  [${sev}] ${f.slug}: ${f.title}`);
      if (f.remediation) console.log(`           Fix: ${(f.remediation as string).slice(0, 100)}`);
    }
    closeDb();
  });

// ─── audit controls ─────────────────────────────────────────────────────────
audit
  .command('controls')
  .description('List canonical controls')
  .option('-d, --domain <domain>', 'Filter by domain')
  .action((opts: { domain?: string }): void => {
    openDb(config().dbPath);
    const db = getDb();
    let controls: Array<Record<string, any>>;
    if (opts.domain) {
      controls = db.prepare('SELECT * FROM audit_controls WHERE domain = ? ORDER BY id').all(opts.domain) as Array<Record<string, any>>;
    } else {
      controls = db.prepare('SELECT * FROM audit_controls ORDER BY domain, id').all() as Array<Record<string, any>>;
    }

    if (!controls.length) {
      console.log('No controls found. Run: rk audit seed-controls');
      closeDb();
      return;
    }

    let lastDomain = '';
    for (const c of controls) {
      if (c.domain !== lastDomain) {
        console.log(`\n─── ${c.domain} ───`);
        lastDomain = c.domain;
      }
      const auto = c.automated ? ' [auto]' : '';
      console.log(`  ${c.id}  ${c.title} (${c.severity})${auto}`);
    }
    closeDb();
  });

// ─── audit unaudited ─────────────────────────────────────────────────────────
audit
  .command('unaudited')
  .description('List repos with no audit runs')
  .action((): void => {
    openDb(config().dbPath);
    const repos = findByAuditStatus({ unaudited: true });
    console.log(`\n${repos.length} unaudited repos:\n`);
    for (const r of repos) {
      const lang = r.primary_language ? ` [${r.primary_language}]` : '';
      const shape = r.app_shape ? ` (${r.app_shape})` : '';
      console.log(`  ${r.slug}${lang}${shape}`);
    }
    closeDb();
  });

// ─── audit failing ───────────────────────────────────────────────────────────
audit
  .command('failing <domain>')
  .description('List repos failing a specific audit domain')
  .action((domain: string): void => {
    openDb(config().dbPath);
    const repos = findByAuditStatus({ domain_failing: domain });
    if (!repos.length) {
      console.log(`No repos failing domain: ${domain}`);
      closeDb();
      return;
    }
    console.log(`\nRepos failing ${domain}:\n`);
    for (const r of repos) {
      console.log(`  ${r.slug}: ${r.control_id} ${r.title} — ${r.result}`);
      if (r.notes) console.log(`    ${r.notes}`);
    }
    closeDb();
  });

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD HEALTH SUBCOMMANDS (FT-3.5 — research-grounded)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Surface trichotomy per Treude & Storey 2010 (ICSE'10):
//   - feed:   change since last sync (default; per Beyer 2016 "robotic
//             response" suppression — feed silences flake-shaped events)
//   - doctor: single-repo deep-dive (decision moment per Dowding 2025)
//   - table:  portfolio rollup (JSON-first per McIlroy 1978 / jq design)
//
// Per Tidelift 2024 (62% maintainers overwhelmed by dep notifications)
// + He 2022 (11.3% Dependabot deprecation from fatigue): the default
// surface is the feed — high engagement, low noise.

const health = program
  .command('health')
  .description('Build / dep / CI health — research-grounded surfaces (feed / doctor / table)');

// `rk health` with no subcommand → feed.
health
  .command('feed', { isDefault: true })
  .description('Change feed since last sync (default surface)')
  .option('--refresh', 'Run build-health sync for every repo before rendering', false)
  .option('--rig <id>', 'Rig id for toolchain observation (default: RK_RIG_ID env or hostname)')
  .option('--json', 'Output JSON instead of text lines', false)
  .action(async (opts: { refresh: boolean; rig?: string; json: boolean }): Promise<void> => {
    openDb(config().dbPath);
    if (opts.refresh) {
      await refreshAllRepos({ rigId: resolveRigId(opts.rig) });
    }
    const events = buildFeed();
    if (opts.json) {
      console.log(JSON.stringify(events, null, 2));
    } else {
      console.log(renderFeedText(events));
    }
    closeDb();
  });

health
  .command('doctor <slug>')
  .description('Single-repo deep-dive — dep audit + CI + actions + toolchain')
  .option('--refresh', 'Re-run build-health sync for this repo before rendering', false)
  .option('--rig <id>', 'Rig id for toolchain observation')
  .option('--json', 'Output JSON instead of text', false)
  .action(async (slug: string, opts: { refresh: boolean; rig?: string; json: boolean }): Promise<void> => {
    openDb(config().dbPath);
    const repoRow = resolveRepoRow(slug);
    if (!repoRow) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }
    if (opts.refresh) {
      const summary = await syncBuildHealthForRepo(repoRow.id, {
        slug: repoRow.slug,
        owner: repoRow.owner,
        name: repoRow.name,
        local_path: repoRow.local_path,
      }, { rigId: resolveRigId(opts.rig) });
      if (summary.errors.length > 0) {
        for (const err of summary.errors) console.error(`  ${err}`);
      }
    }
    const report = buildRepoDoctor(repoRow.slug);
    if (!report) {
      console.error(`Error: doctor report could not be built for ${repoRow.slug}`);
      closeDb();
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderDoctorText(report));
    }
    closeDb();
  });

health
  .command('table')
  .description('Portfolio health table (JSON default per McIlroy 1978 / jq)')
  .option('--refresh', 'Run build-health sync for every repo before rendering', false)
  .option('--rig <id>', 'Rig id for toolchain observation')
  .option('--text', 'Pretty-text rendering instead of JSON (default: JSON)', false)
  .action(async (opts: { refresh: boolean; rig?: string; text: boolean }): Promise<void> => {
    openDb(config().dbPath);
    if (opts.refresh) {
      await refreshAllRepos({ rigId: resolveRigId(opts.rig) });
    }
    const rows = buildHealthTable();
    if (opts.text) {
      console.log(renderHealthTableText(rows));
    } else {
      // Per McIlroy 1978 / jq design — JSON is the default contract.
      console.log(JSON.stringify(rows, null, 2));
    }
    closeDb();
  });

// Helper used by --refresh paths above. Walks every repo with a
// non-null local_path and runs syncBuildHealthForRepo against it.
// Per Tidelift 2024 we never throw — errors are logged per-repo and
// the walk continues so a partial result beats a crashed portfolio.
async function refreshAllRepos(opts: { rigId?: string }): Promise<void> {
  const db = getDb();
  const repos = db.prepare(`
    SELECT id, slug, owner, name, local_path
    FROM repos
    ORDER BY slug
  `).all() as Array<{
    id: number;
    slug: string;
    owner: string | null;
    name: string | null;
    local_path: string | null;
  }>;
  for (const r of repos) {
    try {
      const summary = await syncBuildHealthForRepo(r.id, {
        slug: r.slug,
        owner: r.owner,
        name: r.name,
        local_path: r.local_path,
      }, opts);
      if (summary.errors.length > 0) {
        for (const err of summary.errors) console.error(`  ${r.slug}: ${err}`);
      }
    } catch (e: unknown) {
      console.error(`  ${r.slug}: sync threw — ${(e as Error)?.message ?? String(e)}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAMES SUBCOMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

const games = program.command('games').description('Claude Games scoring engine');

games
  .command('score <worklist>')
  .description('Score a REMEDIATION-WORKLIST.md and show leaderboard')
  .option('--json', 'Output as JSON')
  .option('--markdown', 'Output as markdown table')
  .option('--md', 'Output as markdown table (alias)')
  .action((worklistPath: string, opts: { json?: boolean; markdown?: boolean; md?: boolean }): void => {
    const fullPath = resolve(worklistPath);
    let content: string;
    try {
      content = readFileSync(fullPath, 'utf-8');
    } catch (err: unknown) {
      console.error(`Error: cannot read file ${fullPath}`);
      console.error(`  ${(err as Error).message}`);
      process.exit(1);
    }

    const rows = parseWorklist(content);
    if (rows.length === 0) {
      console.error('Error: no worklist rows found in file');
      console.error('  Expected markdown table with | Status | Slug | Findings | Pass Rate |');
      process.exit(1);
    }

    const summary = scoreGame(rows);

    if (opts.json) {
      console.log(renderJSON(summary));
    } else if (opts.markdown || opts.md) {
      console.log(renderMarkdown(summary));
    } else {
      console.log(renderReport(summary));
    }
  });

program.option('--debug', 'Show stack traces and verbose output', false);

// F-BE-FT1: parseAsync surfaces rejections from async action handlers
// (delete, prune, sync, sync-dogfood). With parse(), an unhandled
// rejection would historically log nothing and exit 0 — pre-v1.0.6 bug.
program.parseAsync().catch((e: unknown) => {
  const err = e instanceof Error ? e : new Error(String(e));
  if (program.opts().debug) {
    console.error(err);
  } else {
    console.error(`Error: ${err.message}`);
  }
  process.exit(2);
});
