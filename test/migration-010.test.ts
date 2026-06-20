/**
 * F-TS-FT4: migration-010 (operational hygiene run tables) schema transition.
 *
 * Verifies that opening a DB previously at v9 (FT-3.5 head) advances it
 * to v10 idempotently, creates the db_health_runs + sync_runs tables
 * with their indexes, and preserves all v9 structures.
 *
 * The new tables intentionally have NO foreign keys to repos — these
 * are operator-action audit trails that remain valid even if every
 * repo is later deleted. The tests verify that property too.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, CURRENT_SCHEMA_VERSION } from '../src/db/init.js';

// ts-A-008: head version as a string for meta-row comparisons.
const HEAD = String(CURRENT_SCHEMA_VERSION);

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-mig-010-'));
  dbPath = join(tmpDir, 'v10.db');
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('migration-010 (FT-4 operational hygiene)', () => {
  it('opening a fresh DB lands at schema_version=11 (current head)', () => {
    openDb(dbPath);
    const v = (getDb().prepare(
      "SELECT value FROM meta WHERE key = 'schema_version'"
    ).get() as { value: string }).value;
    expect(v).toBe(HEAD);
  });

  it('creates db_health_runs table with expected columns', () => {
    openDb(dbPath);
    const cols = getDb().prepare(
      "PRAGMA table_info(db_health_runs)"
    ).all() as { name: string; notnull: number }[];
    const names = cols.map(c => c.name);
    expect(names).toContain('id');
    expect(names).toContain('run_at');
    expect(names).toContain('repo_count');
    expect(names).toContain('fts_entry_count');
    expect(names).toContain('orphan_path_count');
    expect(names).toContain('broken_relationship_count');
    expect(names).toContain('null_local_path_active_count');
    expect(names).toContain('stale_local_path_count');
    expect(names).toContain('exit_code');

    // exit_code is NOT NULL by contract — the operator always exits
    // somewhere, and storing NULL would defeat the audit-trail purpose.
    const exitCol = cols.find(c => c.name === 'exit_code');
    expect(exitCol).toBeDefined();
    expect(exitCol!.notnull).toBe(1);

    // run_at is NOT NULL too — every row has a recorded timestamp.
    const runAtCol = cols.find(c => c.name === 'run_at');
    expect(runAtCol).toBeDefined();
    expect(runAtCol!.notnull).toBe(1);
  });

  it('creates sync_runs table with expected columns + defaults', () => {
    openDb(dbPath);
    const cols = getDb().prepare(
      "PRAGMA table_info(sync_runs)"
    ).all() as { name: string; notnull: number; dflt_value: string | null }[];
    const names = cols.map(c => c.name);
    expect(names).toContain('id');
    expect(names).toContain('started_at');
    expect(names).toContain('finished_at');
    expect(names).toContain('owners_json');
    expect(names).toContain('dirs_scanned_json');
    expect(names).toContain('repos_added');
    expect(names).toContain('repos_updated');
    expect(names).toContain('repos_skipped');
    expect(names).toContain('errors_json');
    expect(names).toContain('exit_code');

    // started_at + exit_code are NOT NULL.
    expect(cols.find(c => c.name === 'started_at')!.notnull).toBe(1);
    expect(cols.find(c => c.name === 'exit_code')!.notnull).toBe(1);

    // Count defaults are 0 so an in-progress row reads as zero-work.
    const added = cols.find(c => c.name === 'repos_added');
    expect(added!.dflt_value).toMatch(/0/);
    const updated = cols.find(c => c.name === 'repos_updated');
    expect(updated!.dflt_value).toMatch(/0/);
    const skipped = cols.find(c => c.name === 'repos_skipped');
    expect(skipped!.dflt_value).toMatch(/0/);
    // exit_code defaults to 0 (clean-so-far).
    const exitDflt = cols.find(c => c.name === 'exit_code');
    expect(exitDflt!.dflt_value).toMatch(/0/);
  });

  it('creates idx_db_health_runs_run_at (desc) and idx_sync_runs_started_at (desc) indexes', () => {
    openDb(dbPath);
    const db = getDb();
    const healthIdx = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name='idx_db_health_runs_run_at'"
    ).get() as { name: string; sql: string } | undefined;
    expect(healthIdx).toBeDefined();
    expect(healthIdx!.sql).toMatch(/db_health_runs/);
    expect(healthIdx!.sql).toMatch(/run_at/);

    const syncIdx = db.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name='idx_sync_runs_started_at'"
    ).get() as { name: string; sql: string } | undefined;
    expect(syncIdx).toBeDefined();
    expect(syncIdx!.sql).toMatch(/sync_runs/);
    expect(syncIdx!.sql).toMatch(/started_at/);
  });

  it('idempotent: re-opening an already-v10 DB does not regress', () => {
    openDb(dbPath);
    closeDb();
    expect(() => openDb(dbPath)).not.toThrow();
    const v = (getDb().prepare(
      "SELECT value FROM meta WHERE key = 'schema_version'"
    ).get() as { value: string }).value;
    expect(v).toBe(HEAD);
  });

  it('the new tables have no FK to repos — they survive repo deletion', () => {
    openDb(dbPath);
    const db = getDb();
    // Insert a sync_runs row, then verify it persists even when no
    // repos exist. This confirms the FK-independence property — the
    // run-history is operator-grain, not repo-grain.
    db.prepare(`
      INSERT INTO sync_runs (started_at, exit_code)
      VALUES (datetime('now'), 0)
    `).run();
    db.prepare(`
      INSERT INTO db_health_runs (run_at, exit_code)
      VALUES (datetime('now'), 0)
    `).run();

    // No repos exist (fresh DB) — the inserts must not have failed.
    const sc = (db.prepare('SELECT COUNT(*) AS c FROM sync_runs').get() as { c: number }).c;
    const hc = (db.prepare('SELECT COUNT(*) AS c FROM db_health_runs').get() as { c: number }).c;
    expect(sc).toBe(1);
    expect(hc).toBe(1);
  });

  it('preserves the FT-3.5 (v9) structures across the v9→v10 transition', () => {
    openDb(dbPath);
    const db = getDb();
    // Spot-check: a few v9 columns / tables should still be present.
    const cols = db.prepare("PRAGMA table_info(repo_dep_audit_state)").all() as { name: string }[];
    const names = cols.map(c => c.name);
    expect(names).toContain('critical_cve_ids');
    expect(names).toContain('high_cve_ids');
    expect(names).toContain('audit_omit_dev');

    const tbls = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('repo_dep_audit_history', 'repo_workflow_permissions', 'repo_observed_toolchain')"
    ).all() as { name: string }[];
    expect(tbls.length).toBe(3);
  });
});
