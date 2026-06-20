/**
 * src/health/fsck.ts — operational integrity checker (FT-4).
 *
 * `runFsck()` composes seven DB-integrity checks and writes one
 * db_health_runs row per invocation. Each check returns
 * { count, samples, description } so the CLI renderer can show counts
 * plus a small evidence sample without dumping every row.
 *
 * Checks:
 *   1. orphanRows                — child rows whose repo_id doesn't
 *                                  exist in repos (FK should make this
 *                                  impossible with foreign_keys=ON, but
 *                                  legacy data may pre-date enforcement).
 *   2. brokenRelationships       — repo_relationships with from_repo_id
 *                                  or to_repo_id missing from repos.
 *   3. nullLocalPathActive       — repos with lifecycle_status='active'
 *                                  AND local_path IS NULL — likely a
 *                                  sync gap (per F-DB-007 Stage A).
 *   4. staleLocalPath            — repos with local_path set but the
 *                                  filesystem path doesn't exist on the
 *                                  current rig. Informational
 *                                  (repo_local_paths is the
 *                                  multi-rig authority).
 *   5. ftsRowCountMismatch       — sum(repos with content + docs +
 *                                  notes) vs COUNT(repo_search). Picks
 *                                  up cases where FTS triggers missed
 *                                  an event.
 *   6. invalidLifecycleStatus    — repos with lifecycle_status not in
 *                                  the application-layer enum
 *                                  (LIFECYCLE_STATUSES).
 *   7. incompleteSyncRuns        — sync_runs with NULL finished_at
 *                                  older than 24h — sync crashed
 *                                  without completing the row.
 *
 * The composed result writes a db_health_runs audit row before
 * returning, so the operator gets a historical trail "for free."
 */
import { existsSync } from 'node:fs';
import {
  getDb,
  insertDbHealthRun,
  LIFECYCLE_STATUSES,
} from '../db/init.js';

export interface FsckCheck {
  count: number;
  samples: string[];
  description: string;
}

export interface FsckReport {
  run_at: string;
  schema_version: string;
  repo_count: number;
  fts_entry_count: number;
  checks: {
    orphan_rows: FsckCheck;
    broken_relationships: FsckCheck;
    null_local_path_active: FsckCheck;
    stale_local_path: FsckCheck;
    fts_row_count_mismatch: FsckCheck;
    invalid_lifecycle_status: FsckCheck;
    incomplete_sync_runs: FsckCheck;
  };
  exit_code: number;
  run_id: number;
}

// Maximum sample lines per check — enough for a renderer to show a
// handful of representative offenders without flooding the screen on a
// large portfolio. The renderer further truncates if needed; this is
// the upstream cap.
const MAX_SAMPLES = 5;

// Tables that carry repo_id as a FK to repos.id. Each entry's table_name
// is checked for orphans (rows with repo_id NOT IN (SELECT id FROM repos)).
//
// Limited to tables that exist post-migration ladder; tables that haven't
// been created in a v1-fixture-style minimal DB are detected at runtime
// via sqlite_master and skipped (rather than failing the check).
const REPO_CHILD_TABLES = [
  'repo_facts',
  'repo_docs',
  'repo_notes',
  'repo_audits',
  'repo_releases',
  'repo_tech',
  'repo_topics',
  'repo_local_paths',
  'audit_runs',
  'audit_findings',
  'audit_exceptions',
  'repo_published_versions',
  'repo_dep_audit_state',
  'repo_dep_audit_history',
  'repo_workflow_actions',
  'repo_workflow_permissions',
  'repo_observed_toolchain',
] as const;

function tableExists(table: string): boolean {
  const db = getDb();
  const row = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
  ).get(table) as { name: string } | undefined;
  return !!row;
}

function checkOrphanRows(): FsckCheck {
  const db = getDb();
  let total = 0;
  const samples: string[] = [];
  for (const table of REPO_CHILD_TABLES) {
    if (!tableExists(table)) continue;
    const row = db.prepare(`
      SELECT COUNT(*) AS c FROM ${table}
       WHERE repo_id IS NOT NULL
         AND repo_id NOT IN (SELECT id FROM repos)
    `).get() as { c: number };
    if (row.c > 0) {
      total += row.c;
      if (samples.length < MAX_SAMPLES) {
        // Surface a handful of offender ids for the renderer.
        const ids = (db.prepare(`
          SELECT repo_id FROM ${table}
           WHERE repo_id IS NOT NULL
             AND repo_id NOT IN (SELECT id FROM repos)
           LIMIT ?
        `).all(MAX_SAMPLES - samples.length) as { repo_id: number }[])
          .map(r => `${table}(repo_id=${r.repo_id})`);
        samples.push(...ids);
      }
    }
  }
  return {
    count: total,
    samples,
    description: 'rows in child tables whose repo_id does not exist in repos (likely pre-FK-enforcement data)',
  };
}

function checkBrokenRelationships(): FsckCheck {
  if (!tableExists('repo_relationships')) {
    return { count: 0, samples: [], description: 'repo_relationships table not present' };
  }
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, from_repo_id, to_repo_id, relation_type
      FROM repo_relationships
     WHERE from_repo_id IS NULL
        OR to_repo_id   IS NULL
        OR from_repo_id NOT IN (SELECT id FROM repos)
        OR to_repo_id   NOT IN (SELECT id FROM repos)
  `).all() as { id: number; from_repo_id: number | null; to_repo_id: number | null; relation_type: string }[];

  return {
    count: rows.length,
    samples: rows.slice(0, MAX_SAMPLES).map(
      r => `rel #${r.id} ${r.from_repo_id ?? 'null'} --${r.relation_type}--> ${r.to_repo_id ?? 'null'}`
    ),
    description: 'repo_relationships rows whose from_repo_id or to_repo_id is missing from repos',
  };
}

function checkNullLocalPathActive(): FsckCheck {
  // Pre-migration-006 schemas might not have lifecycle_status — but the
  // migration ladder is unconditional in openDb, so by the time fsck
  // runs the column exists. Still defensive: probe the column list.
  const db = getDb();
  const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'lifecycle_status')) {
    return { count: 0, samples: [], description: 'repos.lifecycle_status column not present' };
  }
  const rows = db.prepare(`
    SELECT slug FROM repos
     WHERE lifecycle_status = 'active'
       AND local_path IS NULL
     ORDER BY slug
  `).all() as { slug: string }[];
  return {
    count: rows.length,
    samples: rows.slice(0, MAX_SAMPLES).map(r => r.slug),
    description: 'active repos with no local_path — likely a sync gap (try `rk sync --local <root>` or `rk archive <slug>`)',
  };
}

function checkStaleLocalPath(): FsckCheck {
  const db = getDb();
  const rows = db.prepare(`
    SELECT slug, local_path FROM repos
     WHERE local_path IS NOT NULL
       AND local_path != ''
     ORDER BY slug
  `).all() as { slug: string; local_path: string }[];

  const stale: { slug: string; local_path: string }[] = [];
  const skipped: { slug: string; local_path: string }[] = [];
  for (const r of rows) {
    // PH-AHG-009: existsSync can throw (EACCES on a permission-locked path,
    // an unmounted/offline drive, a malformed path on some platforms). One
    // bad path must not abort the whole check — degrade that path to
    // "skipped-with-note" and keep going so the rest of fsck completes.
    try {
      if (!existsSync(r.local_path)) {
        stale.push(r);
      }
    } catch {
      skipped.push(r);
    }
  }
  const samples = stale.slice(0, MAX_SAMPLES).map(r => `${r.slug} → ${r.local_path}`);
  // Surface a couple of unreadable paths too, clearly labelled, if room.
  for (const r of skipped) {
    if (samples.length >= MAX_SAMPLES) break;
    samples.push(`${r.slug} → ${r.local_path} (skipped: path not readable)`);
  }
  return {
    count: stale.length,
    samples,
    description: 'repos.local_path is set but the path is missing on the current rig (informational; repo_local_paths is the multi-rig authority — try `rk verify-local`)',
  };
}

function checkFtsRowCountMismatch(): FsckCheck {
  if (!tableExists('repo_search')) {
    return { count: 0, samples: [], description: 'repo_search FTS virtual table not present' };
  }
  const db = getDb();
  const fts = (db.prepare('SELECT COUNT(*) AS c FROM repo_search').get() as { c: number }).c;
  // The FTS index mirrors three sources (per src/search/fts.ts
  // rebuildIndex): repos with description/purpose, repo_docs with
  // content, repo_notes. We must compute the SAME sum or the check
  // false-positives.
  //
  // hg-A-003: rebuildIndex INNER JOINs repo_docs / repo_notes against
  // repos, so an orphan doc/note (repo_id with no parent repo) is NOT
  // indexed. Counting those orphans here produced a spurious FTS
  // mismatch WARN. Mirror rebuildIndex exactly: INNER JOIN repos for
  // docs + notes. (The repos predicate already matches
  // [description, purpose].filter(Boolean) — non-empty either field.)
  const repoSources = (db.prepare(`
    SELECT COUNT(*) AS c FROM repos
     WHERE (description IS NOT NULL AND description != '')
        OR (purpose IS NOT NULL AND purpose != '')
  `).get() as { c: number }).c;
  const docSources = tableExists('repo_docs')
    ? (db.prepare(`
        SELECT COUNT(*) AS c
          FROM repo_docs d
          JOIN repos r ON r.id = d.repo_id
         WHERE d.content IS NOT NULL
      `).get() as { c: number }).c
    : 0;
  const noteSources = tableExists('repo_notes')
    ? (db.prepare(`
        SELECT COUNT(*) AS c
          FROM repo_notes n
          JOIN repos r ON r.id = n.repo_id
      `).get() as { c: number }).c
    : 0;
  const expected = repoSources + docSources + noteSources;
  const diff = Math.abs(fts - expected);
  return {
    count: diff,
    samples: diff > 0 ? [`fts=${fts} expected=${expected} (repos=${repoSources} docs=${docSources} notes=${noteSources})`] : [],
    description: 'repo_search FTS row count differs from the sum of indexable sources (run `rk reindex`)',
  };
}

function checkInvalidLifecycleStatus(): FsckCheck {
  const db = getDb();
  const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
  if (!cols.some(c => c.name === 'lifecycle_status')) {
    return { count: 0, samples: [], description: 'repos.lifecycle_status column not present' };
  }
  // Build a parameterized NOT IN list of the valid enum values.
  const placeholders = LIFECYCLE_STATUSES.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT slug, lifecycle_status FROM repos
     WHERE lifecycle_status IS NOT NULL
       AND lifecycle_status NOT IN (${placeholders})
     ORDER BY slug
  `).all(...LIFECYCLE_STATUSES) as { slug: string; lifecycle_status: string }[];

  return {
    count: rows.length,
    samples: rows.slice(0, MAX_SAMPLES).map(r => `${r.slug} (lifecycle_status='${r.lifecycle_status}')`),
    description: `repos.lifecycle_status outside the closed enum (${LIFECYCLE_STATUSES.join(', ')})`,
  };
}

function checkIncompleteSyncRuns(): FsckCheck {
  if (!tableExists('sync_runs')) {
    return { count: 0, samples: [], description: 'sync_runs table not present' };
  }
  const db = getDb();
  // 24h ago threshold — anything still NULL finished_at past that is
  // stale (the sync crashed without completing the row). SQLite
  // datetime('now', '-1 day') gives the comparison string.
  const rows = db.prepare(`
    SELECT id, started_at FROM sync_runs
     WHERE finished_at IS NULL
       AND started_at < datetime('now', '-1 day')
     ORDER BY started_at ASC
  `).all() as { id: number; started_at: string }[];

  return {
    count: rows.length,
    samples: rows.slice(0, MAX_SAMPLES).map(r => `sync_runs #${r.id} started_at=${r.started_at}`),
    description: 'sync_runs rows with NULL finished_at older than 24h — `rk sync` crashed without recording completion',
  };
}

export interface FsckOptions {
  /**
   * When true, any non-zero check count yields exit_code=1. When false
   * (default), exit_code is always 0 — fsck is informational by
   * default, strict mode is opt-in (e.g. for CI gates).
   */
  strict?: boolean;
}

/**
 * Run all integrity checks and record a db_health_runs row.
 *
 * Returns the composed FsckReport so the caller (CLI / MCP) can render.
 * The recorded run id is included as `run_id` so the renderer can show
 * "wrote db_health_runs row #N."
 */
export function runFsck(opts: FsckOptions = {}): FsckReport {
  const db = getDb();
  const strict = !!opts.strict;

  const repoCount = (db.prepare('SELECT COUNT(*) AS c FROM repos').get() as { c: number }).c;
  const ftsCount = tableExists('repo_search')
    ? (db.prepare('SELECT COUNT(*) AS c FROM repo_search').get() as { c: number }).c
    : 0;

  const checks = {
    orphan_rows: checkOrphanRows(),
    broken_relationships: checkBrokenRelationships(),
    null_local_path_active: checkNullLocalPathActive(),
    stale_local_path: checkStaleLocalPath(),
    fts_row_count_mismatch: checkFtsRowCountMismatch(),
    invalid_lifecycle_status: checkInvalidLifecycleStatus(),
    incomplete_sync_runs: checkIncompleteSyncRuns(),
  };

  const anyDirty =
    checks.orphan_rows.count > 0 ||
    checks.broken_relationships.count > 0 ||
    checks.null_local_path_active.count > 0 ||
    checks.stale_local_path.count > 0 ||
    checks.fts_row_count_mismatch.count > 0 ||
    checks.invalid_lifecycle_status.count > 0 ||
    checks.incomplete_sync_runs.count > 0;
  const exit_code = strict && anyDirty ? 1 : 0;

  const run_at = (db.prepare("SELECT datetime('now') AS now").get() as { now: string }).now;
  const schema_version = (db.prepare(
    "SELECT value FROM meta WHERE key = 'schema_version'"
  ).get() as { value: string } | undefined)?.value ?? 'unknown';

  // Persist the audit-trail row.
  //
  // PH-AHG-010: the db_health_runs schema persists only a FOUR-check SUBSET
  // (orphan_rows, broken_relationships, null_local_path_active,
  // stale_local_path). The other three checks — fts_row_count_mismatch,
  // invalid_lifecycle_status, incomplete_sync_runs — contribute to exit_code
  // but are NOT columns in this table, so the persisted trail under-reports.
  // A schema migration to add the missing columns is deliberately deferred
  // (it touches init.ts, owned by another agent this wave). Until then, the
  // full seven-check summary is logged to STDERR below so a run's complete
  // result is always recoverable from logs even though the row is a subset.
  //
  // orphan_path_count maps to orphan_rows for naming brevity; the other three
  // persisted columns mirror the check names 1:1.
  const run_id = insertDbHealthRun({
    run_at,
    repo_count: repoCount,
    fts_entry_count: ftsCount,
    orphan_path_count: checks.orphan_rows.count,
    broken_relationship_count: checks.broken_relationships.count,
    null_local_path_active_count: checks.null_local_path_active.count,
    stale_local_path_count: checks.stale_local_path.count,
    exit_code,
  });

  // PH-AHG-010: log the FULL seven-check summary to stderr (diagnostic
  // channel — keeps stdout clean for the CLI/MCP result + --json payload).
  // This makes the three non-persisted checks recoverable from logs.
  console.error(
    `[fsck] run #${run_id} (schema v${schema_version}, exit_code=${exit_code}) — ` +
    `orphan_rows=${checks.orphan_rows.count} ` +
    `broken_relationships=${checks.broken_relationships.count} ` +
    `null_local_path_active=${checks.null_local_path_active.count} ` +
    `stale_local_path=${checks.stale_local_path.count} ` +
    `fts_row_count_mismatch=${checks.fts_row_count_mismatch.count} ` +
    `invalid_lifecycle_status=${checks.invalid_lifecycle_status.count} ` +
    `incomplete_sync_runs=${checks.incomplete_sync_runs.count} ` +
    `(persisted trail captures the first four only)`
  );

  return {
    run_at,
    schema_version,
    repo_count: repoCount,
    fts_entry_count: ftsCount,
    checks,
    exit_code,
    run_id,
  };
}

/**
 * Pretty-text renderer for FsckReport. Two-space indented, sigils for
 * clean (OK) vs dirty (WARN) per check. Lifted into the module so the
 * MCP server can call it too (currently only used by `rk fsck`).
 */
export function renderFsckText(report: FsckReport): string {
  const lines: string[] = [];
  lines.push(
    `DB integrity check (run #${report.run_id}, schema v${report.schema_version}):`
  );

  const fmt = (label: string, check: FsckCheck): void => {
    const sigil = check.count === 0 ? 'OK ' : 'WARN';
    lines.push(`  [${sigil}] ${label}: ${check.count}`);
    if (check.count > 0) {
      lines.push(`         ${check.description}`);
      for (const s of check.samples) {
        lines.push(`         - ${s}`);
      }
    }
  };

  fmt('orphan_rows', report.checks.orphan_rows);
  fmt('broken_relationships', report.checks.broken_relationships);
  fmt('null_local_path_active', report.checks.null_local_path_active);
  fmt('stale_local_path', report.checks.stale_local_path);
  fmt('fts_row_count_mismatch', report.checks.fts_row_count_mismatch);
  fmt('invalid_lifecycle_status', report.checks.invalid_lifecycle_status);
  fmt('incomplete_sync_runs', report.checks.incomplete_sync_runs);

  lines.push('');
  lines.push(`Repos: ${report.repo_count}  |  FTS entries: ${report.fts_entry_count}`);
  lines.push(`Wrote db_health_runs row #${report.run_id} (exit_code=${report.exit_code}).`);
  return lines.join('\n');
}
