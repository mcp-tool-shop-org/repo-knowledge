/**
 * F-TS-007: Migration sequence regression test.
 *
 * Writes a minimal v1 schema to a temp DB and opens it via openDb().
 * Asserts that:
 *   - schema_version reaches '11' (current head — was '4' through Stage A,
 *     bumped by migration-006 in FT-1 for lifecycle + cross-rig paths,
 *     migration-007 in FT-2 for publish state, migration-008 in FT-3
 *     for build/dep/CI health, migration-009 in FT-3.5 for build-health
 *     extensions, migration-010 in FT-4 for operational hygiene run
 *     tables, and migration-011 in FT-5 for cross-tool vocabulary)
 *   - audit_runs / audit_controls / audit_findings tables exist
 *   - idx_findings_canonical (from migration 004) exists
 *   - migration-006 added repos.lifecycle_status column, rigs table,
 *     repo_local_paths table, and idx_repo_local_paths_repo index
 *   - migration-007 added repos.npm_package_name / pypi_package_name /
 *     publisher_method columns, repo_published_versions table, and the
 *     idx_published_versions_repo_channel composite index
 *   - the per-migration version bumps run in order (no skips)
 *
 * History: F-DB-001 unified version bumping so v1 → '4' after openDb. FT-1
 * extended the ladder with migration-006 (additive, bumps to '6'); FT-2
 * added migration-007 (additive, bumps to '7'); FT-3 added migration-008
 * (additive, bumps to '8'); FT-3.5 added migration-009 (additive, bumps
 * to '9'); FT-4 added migration-010 (additive, bumps to '10'); FT-5 added
 * migration-011 (CHECK-constraint extension via create-new-table pattern,
 * bumps to '11'). The FTS-trigger migration (005) is independent and
 * intentionally does NOT bump the linear version (uses its own meta
 * marker fts_triggers_added).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, CURRENT_SCHEMA_VERSION } from '../src/db/init.js';

// ts-A-008: head version as a string for meta-row comparisons.
const HEAD = String(CURRENT_SCHEMA_VERSION);

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-mig-'));
  dbPath = join(tmpDir, 'v1.db');
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

function writeMinimalV1Schema(path: string): void {
  // Create a minimal v1 DB by hand: just enough to trigger the migration
  // ladder. The shape mirrors the original v1 schema before audit tables
  // were added.
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE repos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      owner           TEXT NOT NULL,
      name            TEXT NOT NULL,
      slug            TEXT NOT NULL UNIQUE,
      github_url      TEXT,
      local_path      TEXT,
      description     TEXT,
      purpose         TEXT,
      category        TEXT,
      status          TEXT DEFAULT 'unknown',
      stage           TEXT,
      visibility      TEXT DEFAULT 'public',
      archived        INTEGER DEFAULT 0,
      default_branch  TEXT DEFAULT 'main',
      stars           INTEGER DEFAULT 0,
      forks           INTEGER DEFAULT 0,
      open_issues     INTEGER DEFAULT 0,
      license         TEXT,
      created_at      TEXT,
      updated_at      TEXT,
      pushed_at       TEXT,
      synced_at       TEXT
    );
    INSERT INTO meta(key, value) VALUES ('schema_version', '1');
  `);
  db.close();
}

describe('Migration sequence (F-TS-007)', () => {
  it('migrates v1 → v11 on first openDb', () => {
    writeMinimalV1Schema(dbPath);

    // Pre-condition: version is '1'
    {
      const probe = new Database(dbPath);
      const v = probe.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string };
      expect(v.value).toBe('1');
      probe.close();
    }

    openDb(dbPath);
    const db = getDb();

    // Post-condition: version is '11' (current head after FT-5's
    // migration-011 extended the relation_type CHECK enum + added
    // repos.forge_vault_path on top of the FT-4 head at '10').
    const v = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string };
    expect(v.value).toBe(HEAD);
  });

  it('creates audit tables on migration', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];
    const names = tables.map(t => t.name);

    expect(names).toContain('audit_runs');
    expect(names).toContain('audit_controls');
    expect(names).toContain('audit_findings');
    expect(names).toContain('audit_control_results');
    expect(names).toContain('audit_artifacts');
    expect(names).toContain('audit_metrics');
    expect(names).toContain('audit_exceptions');
  });

  it('creates the v4 idx_findings_canonical unique index', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const indexes = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name = 'idx_findings_canonical'"
    ).get() as { name: string; sql: string } | undefined;
    expect(indexes).toBeDefined();
    // Canonical finding identity: (audit_run_id, domain, title, severity)
    expect(indexes!.sql).toMatch(/audit_run_id/);
    expect(indexes!.sql).toMatch(/domain/);
    expect(indexes!.sql).toMatch(/title/);
    expect(indexes!.sql).toMatch(/severity/);
  });

  it('creates the v3 metrics v2 columns', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    // Probe columns added by migration 003
    const cols = db.prepare("PRAGMA table_info(audit_metrics)").all() as { name: string }[];
    const colNames = cols.map(c => c.name);
    expect(colNames).toContain('controls_na');
    expect(colNames).toContain('controls_not_run');
    expect(colNames).toContain('findings_open_critical');
    expect(colNames).toContain('domains_checked_count');
    expect(colNames).toContain('pass_rate');
  });

  it('is idempotent — opening an already-v11 DB does not regress', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const v1 = (getDb().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    closeDb();

    // Second open: already at head, should not re-run anything destructive
    openDb(dbPath);
    const v2 = (getDb().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v1).toBe(HEAD);
    expect(v2).toBe(HEAD);
  });

  it('opening a brand-new (no-file) DB produces head schema directly', () => {
    // No pre-existing file — openDb should detect missing repos table,
    // load schema.sql, then run migrations 002+ to bring schema_version
    // to '11' (the FT-5 head — migration-011 cross-tool vocabulary).
    const freshPath = join(tmpDir, 'fresh.db');
    openDb(freshPath);
    const v = (getDb().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v).toBe(HEAD);

    const tables = getDb().prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = 'audit_runs'"
    ).all() as { name: string }[];
    expect(tables.length).toBe(1);
  });

  it('migration-006 adds repos.lifecycle_status / deprecated_at / replaced_by_repo_id columns', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string; dflt_value: string | null }[];
    const colNames = cols.map(c => c.name);
    expect(colNames).toContain('lifecycle_status');
    expect(colNames).toContain('deprecated_at');
    expect(colNames).toContain('replaced_by_repo_id');

    // The default for lifecycle_status is 'active' per migration-006's
    // ADD COLUMN ... DEFAULT 'active'. PRAGMA returns it as a quoted literal.
    const lc = cols.find(c => c.name === 'lifecycle_status');
    expect(lc).toBeDefined();
    expect(lc!.dflt_value).toMatch(/active/);
  });

  it('migration-006 creates the rigs and repo_local_paths tables', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('rigs');
    expect(names).toContain('repo_local_paths');
  });

  it('migration-006 creates the idx_repo_local_paths_repo index', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const idx = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name = 'idx_repo_local_paths_repo'"
    ).get() as { name: string; sql: string } | undefined;
    expect(idx).toBeDefined();
    expect(idx!.sql).toMatch(/repo_local_paths/);
  });

  it('migration-006 is idempotent — re-opening v11 DB does not error', () => {
    // Bring up to v11, close, open again. No throw, version unchanged.
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    closeDb();
    expect(() => openDb(dbPath)).not.toThrow();
    const v = (getDb().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v).toBe(HEAD);
  });

  it('migration-007 adds repos.npm_package_name / pypi_package_name / publisher_method columns', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
    const colNames = cols.map(c => c.name);
    expect(colNames).toContain('npm_package_name');
    expect(colNames).toContain('pypi_package_name');
    expect(colNames).toContain('publisher_method');
  });

  it('migration-007 creates the repo_published_versions table', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('repo_published_versions');
  });

  it('migration-007 creates idx_published_versions_repo_channel composite index', () => {
    writeMinimalV1Schema(dbPath);
    openDb(dbPath);
    const db = getDb();

    const idx = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name = 'idx_published_versions_repo_channel'"
    ).get() as { name: string; sql: string } | undefined;
    expect(idx).toBeDefined();
    expect(idx!.sql).toMatch(/repo_published_versions/);
    expect(idx!.sql).toMatch(/channel/);
  });
});

describe('idempotent migration partial-apply recovery (db-A-003)', () => {
  // The bug: execMigrationIdempotent swallowed "duplicate column name" with
  // an early return that ABORTED the rest of the migration script — so a
  // migration whose first ADD COLUMN was already applied (from a prior
  // crash) would never run its CREATE TABLE / version-bump tail. That is a
  // permanent no-progress loop: every re-run hits the same duplicate
  // column, swallows it, and the new tables never appear.
  //
  // This fixture pre-applies ONE of migration-006's ADD COLUMNs
  // (lifecycle_status) on a DB sitting at version 5, leaving the rest of
  // migration-006 (the rigs + repo_local_paths tables, and the version
  // bump to 6) un-run. A correct runner must still create those tables AND
  // advance the version despite the pre-existing column.
  it('completes migration-006 even when one of its ADD COLUMNs is already applied', () => {
    // 1. Build a healthy DB and rewind it to just-before-migration-006:
    //    keep the schema but strip the v6 structures and set version to 5.
    openDb(dbPath);
    closeDb();

    const raw = new Database(dbPath);
    // Drop the v6+ tables so migration-006 has real work to do again.
    raw.exec('DROP TABLE IF EXISTS repo_local_paths');
    raw.exec('DROP TABLE IF EXISTS rigs');
    // Pre-apply ONLY the first migration-006 ADD COLUMN. (lifecycle_status
    // already exists from the full build, which is exactly the
    // "duplicate column name" trigger we are testing.) Rewind version to 5
    // so migration-006 is gated to run again.
    raw.prepare("UPDATE meta SET value = '5' WHERE key = 'schema_version'").run();
    // Sanity: the column the migration will collide on is present.
    const cols = raw.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
    expect(cols.map(c => c.name)).toContain('lifecycle_status');
    // …and the v6 tables are gone.
    const before = raw.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('rigs','repo_local_paths')"
    ).all() as { name: string }[];
    expect(before.length).toBe(0);
    raw.close();

    // 2. Re-open with the fixed runner. The duplicate-column ADD must be
    //    skipped/tolerated while the CREATE TABLE + version bump still run.
    openDb(dbPath);
    const db = getDb();

    // The new v6 tables exist…
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('rigs','repo_local_paths')"
    ).all() as { name: string }[];
    expect(tables.map(t => t.name).sort()).toEqual(['repo_local_paths', 'rigs']);

    // …and the version advanced PAST 6 (the ladder ran on through to head).
    const v = parseInt(
      (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value,
      10
    );
    expect(v).toBeGreaterThanOrEqual(6);
    expect(v).toBe(CURRENT_SCHEMA_VERSION);
  });
});
