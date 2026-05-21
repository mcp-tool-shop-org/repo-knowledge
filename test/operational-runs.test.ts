/**
 * F-TS-FT4: operational hygiene DB helpers (FT-4).
 *
 * Exercises insertDbHealthRun / listDbHealthRuns / getLatestDbHealthRun
 * and insertSyncRun / completeSyncRun / listSyncRuns. The tables are
 * FK-independent from repos so the seeded state is just the rows
 * themselves.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  insertDbHealthRun, listDbHealthRuns, getLatestDbHealthRun,
  insertSyncRun, completeSyncRun, listSyncRuns,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-op-runs-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('insertDbHealthRun + listDbHealthRuns', () => {
  it('inserts a row and returns a positive id', () => {
    const id = insertDbHealthRun({
      repo_count: 5,
      fts_entry_count: 12,
      orphan_path_count: 0,
      broken_relationship_count: 0,
      null_local_path_active_count: 0,
      stale_local_path_count: 0,
      exit_code: 0,
    });
    expect(id).toBeGreaterThan(0);
  });

  it('listDbHealthRuns returns inserted rows newest first', () => {
    const id1 = insertDbHealthRun({ exit_code: 0 });
    const id2 = insertDbHealthRun({ exit_code: 1 });
    const id3 = insertDbHealthRun({ exit_code: 0 });

    const rows = listDbHealthRuns(10);
    expect(rows.length).toBe(3);
    // Newest first by (run_at DESC, id DESC). Since the runs happen
    // within the same datetime('now') second, the id-DESC tie-break
    // sorts insertion-newest first.
    expect(rows[0].id).toBe(id3);
    expect(rows[1].id).toBe(id2);
    expect(rows[2].id).toBe(id1);
  });

  it('respects the limit argument', () => {
    for (let i = 0; i < 5; i++) {
      insertDbHealthRun({ exit_code: 0 });
    }
    const rows = listDbHealthRuns(3);
    expect(rows.length).toBe(3);
  });

  it('persists every count field and the exit_code', () => {
    insertDbHealthRun({
      repo_count: 42,
      fts_entry_count: 100,
      orphan_path_count: 3,
      broken_relationship_count: 2,
      null_local_path_active_count: 1,
      stale_local_path_count: 4,
      exit_code: 1,
    });
    const rows = listDbHealthRuns(1);
    expect(rows.length).toBe(1);
    expect(rows[0].repo_count).toBe(42);
    expect(rows[0].fts_entry_count).toBe(100);
    expect(rows[0].orphan_path_count).toBe(3);
    expect(rows[0].broken_relationship_count).toBe(2);
    expect(rows[0].null_local_path_active_count).toBe(1);
    expect(rows[0].stale_local_path_count).toBe(4);
    expect(rows[0].exit_code).toBe(1);
  });

  it('accepts undefined for optional count fields (stored as NULL)', () => {
    insertDbHealthRun({ exit_code: 0 });
    const rows = listDbHealthRuns(1);
    expect(rows[0].repo_count).toBeNull();
    expect(rows[0].orphan_path_count).toBeNull();
  });

  it('getLatestDbHealthRun returns the most recent row or null when empty', () => {
    expect(getLatestDbHealthRun()).toBeNull();
    insertDbHealthRun({ exit_code: 0, repo_count: 1 });
    const latest = getLatestDbHealthRun();
    expect(latest).not.toBeNull();
    expect(latest!.repo_count).toBe(1);
    // After a second insert the newest wins.
    insertDbHealthRun({ exit_code: 0, repo_count: 2 });
    expect(getLatestDbHealthRun()!.repo_count).toBe(2);
  });
});

describe('insertSyncRun + completeSyncRun + listSyncRuns', () => {
  it('insertSyncRun returns a positive id and lays down zero-count in-progress row', () => {
    const id = insertSyncRun({
      owners_json: JSON.stringify(['mcp-tool-shop']),
      dirs_scanned_json: JSON.stringify(['E:/AI']),
    });
    expect(id).toBeGreaterThan(0);

    const rows = listSyncRuns(1);
    expect(rows.length).toBe(1);
    expect(rows[0].id).toBe(id);
    expect(rows[0].finished_at).toBeNull();
    expect(rows[0].repos_added).toBe(0);
    expect(rows[0].repos_updated).toBe(0);
    expect(rows[0].repos_skipped).toBe(0);
    // exit_code defaults to 0 even pre-completion.
    expect(rows[0].exit_code).toBe(0);
    expect(rows[0].owners_json).toBe(JSON.stringify(['mcp-tool-shop']));
    expect(rows[0].dirs_scanned_json).toBe(JSON.stringify(['E:/AI']));
  });

  it('completeSyncRun populates finished_at + counts + exit_code', () => {
    const id = insertSyncRun({});
    completeSyncRun(id, {
      repos_added: 5,
      repos_updated: 12,
      repos_skipped: 3,
      exit_code: 0,
    });
    const row = listSyncRuns(1)[0];
    expect(row.finished_at).not.toBeNull();
    expect(row.repos_added).toBe(5);
    expect(row.repos_updated).toBe(12);
    expect(row.repos_skipped).toBe(3);
    expect(row.exit_code).toBe(0);
    expect(row.errors_json).toBeNull();
  });

  it('completeSyncRun on error path records errors_json + exit_code=1', () => {
    const id = insertSyncRun({});
    completeSyncRun(id, {
      errors_json: JSON.stringify({ message: 'ENOENT', stack: 'fake stack' }),
      exit_code: 1,
    });
    const row = listSyncRuns(1)[0];
    expect(row.exit_code).toBe(1);
    expect(row.errors_json).not.toBeNull();
    const parsed = JSON.parse(row.errors_json!) as { message: string };
    expect(parsed.message).toBe('ENOENT');
  });

  it('listSyncRuns returns rows newest-first', () => {
    const id1 = insertSyncRun({});
    const id2 = insertSyncRun({});
    const id3 = insertSyncRun({});
    const rows = listSyncRuns(10);
    expect(rows.length).toBe(3);
    expect(rows[0].id).toBe(id3);
    expect(rows[1].id).toBe(id2);
    expect(rows[2].id).toBe(id1);
  });

  it('respects the limit argument', () => {
    for (let i = 0; i < 4; i++) {
      insertSyncRun({});
    }
    expect(listSyncRuns(2).length).toBe(2);
  });

  it('helpers are FK-independent — work with zero repos in the database', () => {
    // No repos exist at all. The whole point of the audit tables is to
    // survive an empty portfolio.
    const repoCount = (getDb().prepare('SELECT COUNT(*) AS c FROM repos').get() as { c: number }).c;
    expect(repoCount).toBe(0);

    const fsckId = insertDbHealthRun({ exit_code: 0 });
    const syncId = insertSyncRun({});
    expect(fsckId).toBeGreaterThan(0);
    expect(syncId).toBeGreaterThan(0);
    completeSyncRun(syncId, { exit_code: 0 });
    expect(listDbHealthRuns(10).length).toBe(1);
    expect(listSyncRuns(10).length).toBe(1);
  });
});
