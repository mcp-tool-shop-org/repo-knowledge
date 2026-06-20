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
  deleteRepoBySlug, pruneBatch, archiveRepoBySlug, findStaleArchived,
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
  // FT-4: operational hygiene primitives
  runFsck, renderFsckText,
  getRepoDiff, renderRepoDiffText,
} from './health/index.js';
import {
  listDbHealthRuns, listSyncRuns,
} from './db/init.js';
import { fullSync } from './sync/index.js';
import { ingestLocalRepo } from './sync/local.js';
import { rebuildIndex, searchRepos } from './search/fts.js';
import { seedControls } from './audit/controls.js';
import { importAudit } from './audit/import.js';
import { getAuditPosture, getPortfolioPosture, findByAuditStatus, getOpenFindings } from './audit/queries.js';
import {
  resolveConfig,
  // FT-5: owners-in-config subcommands (atomic file write).
  listOwners, addOwner, removeOwner,
} from './config.js';
import { shouldFailStrict } from './cli-exit.js';
import { bold, red, green, colorByStatus } from './colors.js';
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

// F-BE-008 / cli-A-005: parse positive integer with surface-naming error.
// Exits 2 with a helpful message if the value is non-numeric, NaN, infinite,
// or < 1. Used for --limit and similar numeric options where bad input would
// silently degrade (parseInt('foo') → NaN → undefined SQL bind → no results).
//
// parseInt is *too* lenient: parseInt('10x') → 10, parseInt('1e2') → 1,
// parseInt('10.9') → 10. Those would silently truncate a typo into a valid
// looking limit. We require the trimmed input to be exactly the canonical
// decimal form of the parsed integer (a digits-only value) so partial parses
// are rejected, not truncated.
function parsePositiveInt(value: string, label: string): number {
  const trimmed = value.trim();
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 1 || String(n) !== trimmed) {
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
//
// F-BE-FT5: when --owners / --local are omitted, resolveConfig falls back
// to rk.config.json (file-supplied owners + localDirs). Earlier flow
// passed empty defaults through and clobbered the file values via
// `{ ...config, ...overrides }` — FT-5 fix in config.ts skips undefined
// overrides so this CLI does not need to thread defaults manually.
//
// --local-depth caps the recursive .git scan inside scanDirectory; the
// default of 4 covers the common F:/AI / E:/AI workspace tree without
// blowing through node_modules-level pathology (denylist also prunes
// build/dep dirs).
program
  .command('sync')
  .description('Full sync: GitHub orgs + local repos + FTS index')
  .option('--owners <owners>', 'Comma-separated GitHub owners (defaults to rk.config.json owners)')
  .option('--local <dirs>', 'Comma-separated local directories (defaults to rk.config.json localDirs)')
  .option('--local-depth <n>', 'Max recursion depth for --local scan (default: 4)', (v) => parsePositiveInt(v, '--local-depth'), 4)
  .option('--releases', 'Also sync releases (slower)', false)
  .option('--forks', 'Include forked repos', false)
  .option('--prune-vanished', 'Archive repos absent from the GitHub listing (default: detect + warn only). Use only with a fully-scoped token.', false)
  .action(async (opts: { owners?: string; local?: string; localDepth: number; releases: boolean; forks: boolean; pruneVanished: boolean }): Promise<void> => {
    openDb(config().dbPath);

    // cli-PH-004: when no GitHub owners resolve (config empty) AND --owners
    // was not passed, fullSync calls syncGitHub([]) — a silent no-op that
    // skips the entire GitHub half of the sync with no signal. This is the
    // exact silent-failure class sync_runs exists to kill. Warn to stderr so
    // the operator knows the GitHub leg was skipped; the local scan still
    // proceeds (so we don't abort). --owners callers opt out of the warning
    // even if they pass an empty/whitespace value — they did so deliberately.
    if (!opts.owners && config().owners.length === 0) {
      console.error(
        '[rk] Warning: no GitHub owners configured — GitHub sync skipped. ' +
        'Run rk owners add <owner> or pass --owners.'
      );
    }

    await fullSync({
      owners: opts.owners ? opts.owners.split(',') : undefined,
      localDirs: opts.local ? opts.local.split(',') : undefined,
      localDepth: opts.localDepth,
      includeReleases: opts.releases,
      includeForks: opts.forks,
      pruneVanished: opts.pruneVanished,
    });
    closeDb();
  });

// ─── owners ──────────────────────────────────────────────────────────────────
//
// F-BE-FT5 (Axis 2): manage the rk.config.json owners list in-place.
// Atomic write (write-to-tmp, then rename) prevents corruption on crash.
// `rk owners list` prints one owner per line for shell-piping.
const owners = program
  .command('owners')
  .description('Manage the rk.config.json owners list (list / add / remove)');

owners
  .command('list')
  .description('List GitHub owners currently in rk.config.json')
  .action((): void => {
    const all = listOwners();
    if (all.length === 0) {
      console.log('(no owners configured — edit rk.config.json or run `rk owners add <owner>`)');
      return;
    }
    for (const o of all) console.log(o);
  });

owners
  .command('add <owner>')
  .description('Add a GitHub owner to rk.config.json (atomic write)')
  .action((owner: string): void => {
    if (!/^[A-Za-z0-9_.-]+$/.test(owner)) {
      console.error(`Error: invalid owner "${owner}".`);
      console.error('Expected: GitHub owner / org name (A-Z, a-z, 0-9, ".", "-", "_").');
      process.exit(2);
    }
    const result = addOwner(owner);
    if (!result.added) {
      console.log(`Already present: ${owner}`);
      return;
    }
    console.log(`Added: ${owner}`);
    console.log(`Owners now: ${result.owners.join(', ')}`);
  });

owners
  .command('remove <owner>')
  .description('Remove a GitHub owner from rk.config.json (atomic write)')
  .action((owner: string): void => {
    const result = removeOwner(owner);
    if (!result.removed) {
      console.error(`Error: owner not found in rk.config.json: ${owner}`);
      console.error('Run: rk owners list  (to see configured owners)');
      process.exit(2);
    }
    console.log(`Removed: ${owner}`);
    console.log(`Owners now: ${result.owners.length === 0 ? '(none)' : result.owners.join(', ')}`);
  });

// ─── scan ────────────────────────────────────────────────────────────────────
program
  .command('scan <path>')
  .description('Scan a single local repo directory')
  .action((path: string): void => {
    // cli-PH-002: precheck the path BEFORE opening the DB so a typo'd path
    // gets a friendly remedy hint (matching the note/delete not-found pattern)
    // instead of a bare structured throw from ingestLocalRepo. Both go to
    // stderr + exit 2; this just adds the actionable hint.
    if (!existsSync(path)) {
      console.error(`Error: path not found: ${path}`);
      console.error('Hint: pass a directory that contains a .git repo');
      process.exit(2);
    }
    openDb(config().dbPath);
    const result = ingestLocalRepo(path);
    console.log(`Scanned: ${result.name} (${result.docs} docs indexed)`);
    // cli-PH-003: no rebuildIndex() — ingestLocalRepo upserts via upsertDoc /
    // upsertRepo, whose row-level INSERT/UPDATE fire migration-005's
    // trg_repo_search_docs_* + trg_repo_search_repos_* triggers, so the FTS
    // index is maintained incrementally. A full rebuild here was redundant.
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
    if (result.swarm) {
      const s = result.swarm;
      console.log(`  Swarm control-plane:`);
      console.log(`    Runs: ${s.runs}, Findings: ${s.findings} (${s.open_findings} open)`);
      console.log(`    Facts upserted: ${s.facts_upserted}`);
      if (s.skipped.length > 0) {
        console.log(`    Skipped (not in DB): ${s.skipped.join(', ')}`);
      }
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
    // cli-A-001: echo the resolved canonical slug, not the user's input, so a
    // partial match makes the real target visible.
    console.log(`Note added to ${canonicalSlug(repoId, slug)}`);
    // cli-PH-003: no rebuildIndex() — migration-005's trg_repo_search_notes_insert
    // trigger already indexes the new note incrementally (same redundancy
    // mcp-A-006 removed MCP-side). A full FTS rebuild here was wasteful.
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
    // cli-A-001: echo the resolved canonical slugs, not the user's input.
    console.log(`Relationship added: ${canonicalSlug(fromId, from)} ${type} ${canonicalSlug(toId, to)}`);
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
    if (shouldFailStrict(opts.strict, drifted)) {
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

    // cli-PH-005: resolveRigId falls back to os.hostname() with no uniqueness
    // check, so two rigs sharing a hostname (e.g. a default "DESKTOP-XXXX")
    // collapse onto one rigs row — and their per-rig repo_local_paths collide.
    // If a row already exists under this rig_id with a DIFFERENT hostname or
    // primary_root, warn to stderr (diagnostic, not the answer) so the operator
    // sets RK_RIG_ID to something unique before the path data piles up.
    const existing = listRigs().find((r) => r.rig_id === rigId);
    if (existing && ((existing.hostname && existing.hostname !== host) ||
                     (existing.primary_root && existing.primary_root !== root))) {
      console.error(
        `Warning: rig_id ${rigId} already registered with a different ` +
        `hostname; set RK_RIG_ID to a unique value to avoid path-row collisions.`
      );
    }

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
    // cli-A-003: reject the contradictory --dry-run + --apply combination
    // BEFORE opening the DB. Previously --dry-run was never read, so
    // `--apply --dry-run` silently took the destructive branch — the opposite
    // of what a user pairing the two flags expects. Mirror the suggest-dogfood
    // ambiguous-invocation guard.
    if (opts.dryRun && opts.apply) {
      console.error('Error: specify only one of --dry-run or --apply, not both.');
      console.error('Example: rk prune --days 30            (dry-run, the default)');
      console.error('   or:   rk prune --days 30 --apply    (actually delete)');
      process.exit(2);
    }
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

    // cli-A-004: the whole --apply batch is all-or-nothing. Each
    // deleteRepoBySlug runs its own (now nested → savepoint) transaction, but
    // without the outer wrapper a mid-batch throw would leave the repos
    // deleted *before* the failure permanently gone while the rest survived —
    // a partial, unrecoverable prune. Wrapping the loop in one db.transaction
    // means any throw rolls the entire batch back: nothing is deleted unless
    // everything can be.
    let summary: { deletedCount: number; totalCascaded: number };
    try {
      summary = pruneBatch(slugs);
    } catch (e: unknown) {
      // Roll-back already happened inside pruneBatch's db.transaction; report
      // and exit non-zero so the caller knows NOTHING was pruned.
      console.error(`Prune aborted — no repos deleted (transaction rolled back): ${(e as Error).message}`);
      closeDb();
      process.exit(1);
    }

    console.log(
      `Pruned ${summary.deletedCount} repo(s), ${summary.totalCascaded} child rows cascaded.`
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
  const exact = db.prepare('SELECT * FROM repos WHERE slug = ?').get(slug) as Record<string, any> | undefined;
  if (exact) return exact;
  // Partial match — ordered, LIKE-escaped, ambiguity-aware (sibling of
  // cli-A-001's resolveRepoId). bind-package and `doctor --refresh` WRITE
  // through this resolver, so the old `ORDER BY slug LIMIT 1` arbitrary-first-
  // row pick could silently mutate the wrong repo (e.g. bind an npm publish
  // identity onto org/shipcheck-plugin when the operator typed "shipcheck").
  const matches = db.prepare(
    "SELECT * FROM repos WHERE slug LIKE ? ESCAPE '\\' OR name = ? ORDER BY slug"
  ).all(`%${escapeLike(slug)}%`, slug) as Record<string, any>[];
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.error(`Error: ambiguous slug "${slug}" — matches: ${matches.map((m) => m.slug).join(', ')}`);
    console.error(`Disambiguate by passing the full slug.`);
    closeDb();
    process.exit(2);
  }
  return matches[0];
}

// ─── versions ────────────────────────────────────────────────────────────────
// F-BE-FT2: cross-channel published-version dashboard. Reads from
// repo_published_versions; --refresh calls syncPublishStateForRepo first.
program
  .command('versions <slug>')
  .description('Show the cross-channel published-version dashboard for one repo')
  .option('--refresh', 'Sync from registries before rendering (network)', false)
  // cli-PH-001: --strict turns a refresh that surfaced errors into a non-zero
  // exit (exit 2), mirroring fsck/drift so CI can gate on a clean sync. Without
  // it the refresh is informational and exit stays 0 even on per-channel errors.
  .option('--strict', 'Exit non-zero (2) if the --refresh sync surfaced any errors', false)
  .option('--channel <name>', `Filter to one channel: ${PUBLISHED_VERSION_CHANNELS.join('|')}`)
  .action(async (slug: string, opts: { refresh: boolean; strict: boolean; channel?: string }): Promise<void> => {
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

    // cli-PH-001: track refresh errors so --strict can gate the exit code
    // AFTER the dashboard (the command's primary answer) has been rendered
    // to stdout.
    let refreshErrors = 0;
    if (opts.refresh) {
      // cli-PH-001: refresh progress + per-error lines are DIAGNOSTIC, not the
      // command's answer (the dashboard below is) — route them to stderr so a
      // `rk versions --json`-style stdout pipe stays clean.
      console.error(`Refreshing publish state for ${repo.slug}...`);
      const summary = await syncPublishStateForRepo(repo.id, {
        owner: repo.owner,
        name: repo.name,
        npm_package_name: repo.npm_package_name,
        pypi_package_name: repo.pypi_package_name,
      });
      console.error(`  Synced ${summary.updated} row(s)${summary.errors.length ? `, ${summary.errors.length} error(s)` : ''}`);
      if (summary.errors.length > 0) {
        for (const err of summary.errors) console.error(`    ${err}`);
      }
      refreshErrors = summary.errors.length;
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
      // cli-PH-001: even with no rows to render, a --strict refresh that
      // surfaced errors must still gate the exit code for CI.
      if (shouldFailStrict(opts.strict, refreshErrors)) process.exit(2);
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
    // cli-PH-001: the dashboard (the answer) is already on stdout; now gate
    // the exit code on --strict so CI can fail a refresh that hit errors.
    if (shouldFailStrict(opts.strict, refreshErrors)) process.exit(2);
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
    if (shouldFailStrict(opts.strict, driftCount)) {
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

// cli-A-001: resolve a user-supplied slug to a repo id. Exact slug wins
// immediately. The partial-match fallback used to be an UNORDERED/UNLIMITED
// `LIKE %slug%` that silently returned an arbitrary first row — so an
// ambiguous fragment (e.g. "shipcheck" matching both `org/shipcheck` and
// `org/shipcheck-plugin`) would mutate whichever repo SQLite happened to
// return first. We now order by slug and, if more than one partial match
// exists, exit 2 listing the candidates rather than guessing. Callers should
// re-resolve the canonical slug from the returned id before echoing it back
// to the user (provenance-on-display).
// Escape LIKE metacharacters so a slug containing % or _ is matched literally
// rather than as a wildcard (sibling of sync-A-007/db-A-006). Pairs with
// `ESCAPE '\'` on the LIKE clause.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function resolveRepoId(slug: string): number | null {
  const db = getDb();
  // Try exact slug
  const exact = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (exact) return exact.id;

  // Try partial match — ordered, LIKE-escaped, ambiguity-aware.
  const matches = db.prepare(
    "SELECT id, slug FROM repos WHERE slug LIKE ? ESCAPE '\\' OR name = ? ORDER BY slug"
  ).all(`%${escapeLike(slug)}%`, slug) as { id: number; slug: string }[];

  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.error(`Error: ambiguous slug "${slug}" — matches: ${matches.map((m) => m.slug).join(', ')}`);
    console.error(`Disambiguate by passing the full slug.`);
    closeDb();
    process.exit(2);
  }
  return matches[0].id;
}

// cli-A-001: re-resolve the canonical slug from a repo id so success lines
// echo the resolved target, not the user's (possibly partial) input. Mirrors
// the diff command's canonical re-resolution at the `diff <slug>` handler.
function canonicalSlug(repoId: number, fallback: string): string {
  const db = getDb();
  const row = db.prepare('SELECT slug FROM repos WHERE id = ?').get(repoId) as { slug: string } | undefined;
  return row?.slug ?? fallback;
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
    lines.push(`\n${bold('─── Audit Posture ───')}`);
    lines.push(`  Last audited:  ${posture.last_audited} (${posture.scope_level})`);
    lines.push(`  Commit:        ${posture.commit_sha || 'n/a'}`);
    lines.push(`  Status:        ${colorByStatus(posture.overall_status, posture.overall_status)}  |  Posture: ${colorByStatus(posture.overall_posture, posture.overall_posture)}`);
    lines.push(`  Blocking:      ${posture.blocking_release ? red('YES') : green('no')}`);
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
  // cli-PH-001: --strict gates the exit code on a clean refresh (mirrors
  // fsck/drift) so CI can fail when any repo's build-health sync errored.
  .option('--strict', 'Exit non-zero (2) if the --refresh sync surfaced any errors', false)
  .option('--rig <id>', 'Rig id for toolchain observation (default: RK_RIG_ID env or hostname)')
  .option('--json', 'Output JSON instead of text lines', false)
  .action(async (opts: { refresh: boolean; strict: boolean; rig?: string; json: boolean }): Promise<void> => {
    openDb(config().dbPath);
    let refreshErrors = 0;
    if (opts.refresh) {
      refreshErrors = (await refreshAllRepos({ rigId: resolveRigId(opts.rig) })).errorCount;
    }
    const events = buildFeed();
    if (opts.json) {
      console.log(JSON.stringify(events, null, 2));
    } else {
      console.log(renderFeedText(events));
    }
    closeDb();
    // cli-PH-001: feed (the answer) is already on stdout; gate the exit code
    // after rendering so --strict CI runs fail on a dirty refresh.
    if (shouldFailStrict(opts.strict, refreshErrors)) process.exit(2);
  });

health
  .command('doctor <slug>')
  .description('Single-repo deep-dive — dep audit + CI + actions + toolchain')
  .option('--refresh', 'Re-run build-health sync for this repo before rendering', false)
  // cli-PH-001: --strict gates the exit code on a clean refresh (mirrors
  // fsck/drift). Per-error lines already route to stderr below.
  .option('--strict', 'Exit non-zero (2) if the --refresh sync surfaced any errors', false)
  .option('--rig <id>', 'Rig id for toolchain observation')
  .option('--json', 'Output JSON instead of text', false)
  .action(async (slug: string, opts: { refresh: boolean; strict: boolean; rig?: string; json: boolean }): Promise<void> => {
    openDb(config().dbPath);
    const repoRow = resolveRepoRow(slug);
    if (!repoRow) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }
    let refreshErrors = 0;
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
      refreshErrors = summary.errors.length;
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
    // cli-PH-001: doctor report (the answer) is already on stdout; gate exit.
    if (shouldFailStrict(opts.strict, refreshErrors)) process.exit(2);
  });

health
  .command('table')
  .description('Portfolio health table (JSON default per McIlroy 1978 / jq)')
  .option('--refresh', 'Run build-health sync for every repo before rendering', false)
  // cli-PH-001: --strict gates the exit code on a clean refresh (mirrors
  // fsck/drift). The JSON table stays the stdout answer; errors go to stderr.
  .option('--strict', 'Exit non-zero (2) if the --refresh sync surfaced any errors', false)
  .option('--rig <id>', 'Rig id for toolchain observation')
  .option('--text', 'Pretty-text rendering instead of JSON (default: JSON)', false)
  .action(async (opts: { refresh: boolean; strict: boolean; rig?: string; text: boolean }): Promise<void> => {
    openDb(config().dbPath);
    let refreshErrors = 0;
    if (opts.refresh) {
      refreshErrors = (await refreshAllRepos({ rigId: resolveRigId(opts.rig) })).errorCount;
    }
    const rows = buildHealthTable();
    if (opts.text) {
      console.log(renderHealthTableText(rows));
    } else {
      // Per McIlroy 1978 / jq design — JSON is the default contract.
      console.log(JSON.stringify(rows, null, 2));
    }
    closeDb();
    // cli-PH-001: table (the answer) is already on stdout; gate exit on --strict.
    if (shouldFailStrict(opts.strict, refreshErrors)) process.exit(2);
  });

// Helper used by --refresh paths above. Walks every repo with a
// non-null local_path and runs syncBuildHealthForRepo against it.
// Per Tidelift 2024 we never throw — errors are logged per-repo and
// the walk continues so a partial result beats a crashed portfolio.
//
// cli-PH-001: returns the aggregate error count so callers can honor a
// --strict flag (non-zero exit when the refresh surfaced errors). The
// per-repo error lines already go to stderr (diagnostic, not the answer).
async function refreshAllRepos(opts: { rigId?: string }): Promise<{ errorCount: number }> {
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
  let errorCount = 0;
  for (const r of repos) {
    try {
      const summary = await syncBuildHealthForRepo(r.id, {
        slug: r.slug,
        owner: r.owner,
        name: r.name,
        local_path: r.local_path,
      }, opts);
      if (summary.errors.length > 0) {
        errorCount += summary.errors.length;
        for (const err of summary.errors) console.error(`  ${r.slug}: ${err}`);
      }
    } catch (e: unknown) {
      errorCount += 1;
      console.error(`  ${r.slug}: sync threw — ${(e as Error)?.message ?? String(e)}`);
    }
  }
  return { errorCount };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FT-4: OPERATIONAL HYGIENE (fsck / diff / runs)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── fsck ────────────────────────────────────────────────────────────────────
//
// `rk fsck` — DB integrity checker. Runs seven independent checks and
// writes a db_health_runs audit row. --strict makes any non-zero check
// non-zero-exit (CI gates); default is informational.
program
  .command('fsck')
  .description('Run DB integrity checks (orphan rows, broken relationships, stale paths, FTS drift, etc.) and write a db_health_runs audit row')
  .option('--strict', 'Exit non-zero if any check returns count > 0', false)
  .option('--json', 'Emit FsckReport as JSON (per Stage A jq doctrine)', false)
  .action((opts: { strict: boolean; json: boolean }): void => {
    openDb(config().dbPath);
    const report = runFsck({ strict: opts.strict });
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderFsckText(report));
    }
    closeDb();
    if (report.exit_code !== 0) {
      // --strict surfaced at least one non-zero check; mirror to the
      // process exit code so CI gates can react.
      process.exit(report.exit_code);
    }
  });

// ─── diff ────────────────────────────────────────────────────────────────────
//
// `rk diff <slug>` — DB-entry change history for a single repo across a
// time window. Defaults to last 7 days; --since / --until tune the
// window. JSON-first per Stage A doctrine; pretty text is the default
// rendering.
program
  .command('diff <slug>')
  .description('Show DB-entry change history for a repo (notes added, audit runs, dep-audit snapshots, published versions) over a time window')
  .option('--since <date>', 'Lower bound on the window (YYYY-MM-DD or SQLite datetime; default: 7 days ago)')
  .option('--until <date>', 'Upper bound on the window (default: now)')
  .option('--json', 'Emit RepoDiffReport as JSON', false)
  .action((slug: string, opts: { since?: string; until?: string; json: boolean }): void => {
    openDb(config().dbPath);
    const repoId = resolveRepoId(slug);
    if (repoId === null) {
      console.error(`Error: repo not found: ${slug}`);
      console.error(`Run: rk list  (to see all indexed repos)`);
      closeDb();
      process.exit(1);
    }
    // Re-resolve canonical slug from id so partial matches surface
    // the full slug in the diff header.
    const db = getDb();
    const canonical = db.prepare('SELECT slug FROM repos WHERE id = ?').get(repoId) as { slug: string } | undefined;
    const report = getRepoDiff(canonical?.slug ?? slug, {
      since: opts.since,
      until: opts.until,
    });
    if (!report) {
      console.error(`Error: diff could not be built for ${slug}`);
      closeDb();
      process.exit(1);
    }
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderRepoDiffText(report));
    }
    closeDb();
  });

// ─── runs ────────────────────────────────────────────────────────────────────
//
// `rk runs` — list recent db_health_runs and/or sync_runs entries.
// --db-health / --sync filter to one; default shows both. --json emits
// structured output.
program
  .command('runs')
  .description('List recent operational runs (db_health_runs from `rk fsck`, sync_runs from `rk sync`)')
  .option('--db-health', 'Show only db_health_runs rows', false)
  .option('--sync', 'Show only sync_runs rows', false)
  .option('--limit <n>', 'Rows per category (default: 10)', (v) => parsePositiveInt(v, '--limit'), 10)
  .option('--json', 'Emit structured JSON', false)
  .action((opts: { dbHealth: boolean; sync: boolean; limit: number; json: boolean }): void => {
    openDb(config().dbPath);
    const showHealth = opts.dbHealth || (!opts.dbHealth && !opts.sync);
    const showSync = opts.sync || (!opts.dbHealth && !opts.sync);
    const result: { db_health_runs?: ReturnType<typeof listDbHealthRuns>; sync_runs?: ReturnType<typeof listSyncRuns> } = {};
    if (showHealth) result.db_health_runs = listDbHealthRuns(opts.limit);
    if (showSync)   result.sync_runs      = listSyncRuns(opts.limit);

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
      closeDb();
      return;
    }

    // Pretty-text rendering — one section per category.
    if (showHealth) {
      const rows = result.db_health_runs ?? [];
      console.log(`=== db_health_runs (last ${rows.length}) ===`);
      if (rows.length === 0) {
        console.log('  (no fsck runs recorded yet — try `rk fsck`)');
      } else {
        for (const r of rows) {
          const totalDirty =
            (r.orphan_path_count ?? 0) +
            (r.broken_relationship_count ?? 0) +
            (r.null_local_path_active_count ?? 0) +
            (r.stale_local_path_count ?? 0);
          const tag = totalDirty === 0 ? 'OK  ' : `${totalDirty} warnings`;
          console.log(`  #${r.id}  ${r.run_at}  exit=${r.exit_code}  ${tag}  repos=${r.repo_count ?? 'n/a'}  fts=${r.fts_entry_count ?? 'n/a'}`);
        }
      }
      console.log('');
    }

    if (showSync) {
      const rows = result.sync_runs ?? [];
      console.log(`=== sync_runs (last ${rows.length}) ===`);
      if (rows.length === 0) {
        console.log('  (no sync runs recorded yet — try `rk sync`)');
      } else {
        for (const r of rows) {
          const status = r.finished_at
            ? (r.exit_code === 0 ? 'done   ' : 'errored')
            : 'pending';
          console.log(`  #${r.id}  ${r.started_at}  ${status}  added=${r.repos_added}  updated=${r.repos_updated}  skipped=${r.repos_skipped}  exit=${r.exit_code}`);
        }
      }
      console.log('');
    }

    closeDb();
  });

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
