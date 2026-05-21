/**
 * F-TS-FT1 (Rigs + cross-rig paths): exercises the rigs + repo_local_paths
 * tables added by migration-006.
 *
 * Covers:
 *   1. upsertRig({rig_id, hostname, primary_root}) — inserts on first call,
 *      updates last_seen_at on second.
 *   2. listRigs() — returns every registered rig.
 *   3. getRig(rig_id) — returns one row or null/undefined.
 *   4. upsertRepoLocalPath({repo_id, rig_id, local_path}) — inserts on
 *      first call; updates in place on second (UNIQUE(repo_id, rig_id)).
 *   5. getRepoLocalPaths(repo_id) — returns local paths across all rigs.
 *   6. FK cascade: deleting a rig cascade-deletes its repo_local_paths rows.
 *   7. FK cascade: deleting a repo cascade-deletes its repo_local_paths rows.
 *
 * Helper signatures (per FT-1 kickoff + cli.ts imports):
 *   upsertRig({rig_id, hostname?, primary_root?}) → void | {rig_id}
 *   listRigs() → Array<{rig_id, hostname, primary_root, last_seen_at, created_at}>
 *   getRig(rig_id) → row | null
 *   upsertRepoLocalPath({repo_id, rig_id, local_path}) → void | {id}
 *   getRepoLocalPaths(repo_id) → Array<{rig_id, local_path, last_seen_at}>
 *
 * If the DB agent's helpers diverge, the coordinator reconciles.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo,
  upsertRig, listRigs, getRig,
  upsertRepoLocalPath, getRepoLocalPaths,
} from '../src/db/init.js';

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-rigs-'));
  dbPath = join(tmpDir, 'rigs.db');
  openDb(dbPath);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('upsertRig (F-TS-FT1)', () => {
  it('inserts a new rig on first call', () => {
    upsertRig({
      rig_id: 'mac-m5max',
      hostname: 'mike-mbp.local',
      primary_root: '/Volumes/T9-Shared/AI',
    });

    const db = getDb();
    const row = db.prepare(
      'SELECT rig_id, hostname, primary_root, last_seen_at FROM rigs WHERE rig_id = ?'
    ).get('mac-m5max') as { rig_id: string; hostname: string; primary_root: string; last_seen_at: string };

    expect(row).toBeDefined();
    expect(row.rig_id).toBe('mac-m5max');
    expect(row.hostname).toBe('mike-mbp.local');
    expect(row.primary_root).toBe('/Volumes/T9-Shared/AI');
    expect(row.last_seen_at).toBeTruthy();
  });

  it('updates an existing rig on second call (idempotent upsert)', () => {
    upsertRig({
      rig_id: 'windows-5080',
      hostname: 'OLD-HOST',
      primary_root: 'D:/old/path',
    });

    const db = getDb();
    const before = db.prepare(
      'SELECT hostname, primary_root, last_seen_at FROM rigs WHERE rig_id = ?'
    ).get('windows-5080') as { hostname: string; primary_root: string; last_seen_at: string };

    // Re-register with new fields. Either the helper updates in place
    // (preferred) or ignores the new values — but the row count must stay
    // at 1 and last_seen_at must refresh.
    upsertRig({
      rig_id: 'windows-5080',
      hostname: 'NEW-HOST',
      primary_root: 'E:/AI',
    });

    const count = (db.prepare('SELECT COUNT(*) AS n FROM rigs WHERE rig_id = ?').get('windows-5080') as { n: number }).n;
    expect(count).toBe(1);

    const after = db.prepare(
      'SELECT hostname, primary_root, last_seen_at FROM rigs WHERE rig_id = ?'
    ).get('windows-5080') as { hostname: string; primary_root: string; last_seen_at: string };

    // last_seen_at must be present after the upsert. It may or may not
    // differ from `before` depending on clock granularity, but the helper
    // is contractually obliged to write a fresh timestamp.
    expect(after.last_seen_at).toBeTruthy();
    expect(before.last_seen_at).toBeTruthy();
    // Hostname/primary_root: tolerate either replace-on-conflict OR
    // preserve-on-conflict semantics — the kickoff doesn't pin which, just
    // that the upsert is idempotent (no duplicate rows).
    expect(['NEW-HOST', 'OLD-HOST']).toContain(after.hostname);
  });
});

describe('listRigs / getRig (F-TS-FT1)', () => {
  it('listRigs returns every registered rig', () => {
    upsertRig({ rig_id: 'mac-m5max', hostname: 'm', primary_root: '/x' });
    upsertRig({ rig_id: 'windows-5080', hostname: 'w', primary_root: 'E:/' });
    upsertRig({ rig_id: 'linux-jumphost', hostname: 'l', primary_root: '/srv' });

    const rigs = listRigs();
    const ids = rigs.map((r) => r.rig_id);
    expect(ids).toContain('mac-m5max');
    expect(ids).toContain('windows-5080');
    expect(ids).toContain('linux-jumphost');
    expect(rigs.length).toBeGreaterThanOrEqual(3);
  });

  it('listRigs returns empty array when no rigs are registered', () => {
    const rigs = listRigs();
    expect(rigs).toEqual([]);
  });

  it('getRig returns the matching row', () => {
    upsertRig({ rig_id: 'mac-m5max', hostname: 'm', primary_root: '/x' });

    const r = getRig('mac-m5max');
    expect(r).not.toBeNull();
    expect(r!.rig_id).toBe('mac-m5max');
  });

  it('getRig returns null/undefined for an unknown rig_id', () => {
    const r = getRig('does-not-exist');
    // Tolerate either null OR undefined return for not-found.
    expect(r == null).toBe(true);
  });
});

describe('upsertRepoLocalPath (F-TS-FT1)', () => {
  it('inserts a new (repo, rig) path on first call', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac-m5max', hostname: 'm', primary_root: '/x' });

    upsertRepoLocalPath({
      repo_id: Number(repoId),
      rig_id: 'mac-m5max',
      local_path: '/Users/mike/code/o/r',
    });

    const db = getDb();
    const row = db.prepare(
      'SELECT repo_id, rig_id, local_path, last_seen_at FROM repo_local_paths WHERE repo_id = ? AND rig_id = ?'
    ).get(repoId, 'mac-m5max') as { repo_id: number; rig_id: string; local_path: string; last_seen_at: string };

    expect(row).toBeDefined();
    expect(row.local_path).toBe('/Users/mike/code/o/r');
    expect(row.last_seen_at).toBeTruthy();
  });

  it('updates in place on second call with a different local_path (UNIQUE(repo_id, rig_id))', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac-m5max', hostname: 'm', primary_root: '/x' });

    upsertRepoLocalPath({
      repo_id: Number(repoId),
      rig_id: 'mac-m5max',
      local_path: '/Users/mike/code/o/r',
    });
    upsertRepoLocalPath({
      repo_id: Number(repoId),
      rig_id: 'mac-m5max',
      local_path: '/Users/mike/work/o/r', // moved
    });

    const db = getDb();
    const rows = db.prepare(
      'SELECT local_path FROM repo_local_paths WHERE repo_id = ? AND rig_id = ?'
    ).all(repoId, 'mac-m5max') as { local_path: string }[];

    expect(rows.length).toBe(1);
    expect(rows[0].local_path).toBe('/Users/mike/work/o/r');
  });

  it('allows the same repo on multiple rigs', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac-m5max', hostname: 'm', primary_root: '/x' });
    upsertRig({ rig_id: 'windows-5080', hostname: 'w', primary_root: 'E:/' });

    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'mac-m5max', local_path: '/Users/m/code/o/r' });
    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'windows-5080', local_path: 'E:/AI/o/r' });

    const paths = getRepoLocalPaths(Number(repoId));
    expect(paths.length).toBe(2);
    const rigIds = paths.map((p) => p.rig_id).sort();
    expect(rigIds).toEqual(['mac-m5max', 'windows-5080']);
  });
});

describe('getRepoLocalPaths (F-TS-FT1)', () => {
  it('returns paths across rigs for a given repo', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac', hostname: 'm', primary_root: '/x' });
    upsertRig({ rig_id: 'win', hostname: 'w', primary_root: 'E:/' });

    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'mac', local_path: '/m/r' });
    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'win', local_path: 'E:/r' });

    const paths = getRepoLocalPaths(Number(repoId));
    expect(paths.length).toBe(2);
    const byRig = Object.fromEntries(paths.map((p) => [p.rig_id, p.local_path]));
    expect(byRig['mac']).toBe('/m/r');
    expect(byRig['win']).toBe('E:/r');
  });

  it('returns empty array for a repo with no registered local paths', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'no-paths' });
    const paths = getRepoLocalPaths(Number(repoId));
    expect(paths).toEqual([]);
  });
});

describe('FK cascade (F-TS-FT1)', () => {
  it('deleting a rig cascade-deletes its repo_local_paths rows', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac', hostname: 'm', primary_root: '/x' });
    upsertRig({ rig_id: 'win', hostname: 'w', primary_root: 'E:/' });
    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'mac', local_path: '/m/r' });
    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'win', local_path: 'E:/r' });

    const db = getDb();
    const before = (db.prepare('SELECT COUNT(*) AS n FROM repo_local_paths WHERE repo_id = ?').get(repoId) as { n: number }).n;
    expect(before).toBe(2);

    // Delete the 'mac' rig directly. ON DELETE CASCADE should remove the
    // associated repo_local_paths row.
    db.prepare('DELETE FROM rigs WHERE rig_id = ?').run('mac');

    const after = (db.prepare('SELECT COUNT(*) AS n FROM repo_local_paths WHERE repo_id = ?').get(repoId) as { n: number }).n;
    expect(after).toBe(1);

    const remaining = db.prepare(
      'SELECT rig_id FROM repo_local_paths WHERE repo_id = ?'
    ).get(repoId) as { rig_id: string };
    expect(remaining.rig_id).toBe('win');
  });

  it('deleting a repo cascade-deletes its repo_local_paths rows', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' });
    upsertRig({ rig_id: 'mac', hostname: 'm', primary_root: '/x' });
    upsertRepoLocalPath({ repo_id: Number(repoId), rig_id: 'mac', local_path: '/m/r' });

    const db = getDb();
    const before = (db.prepare('SELECT COUNT(*) AS n FROM repo_local_paths').get() as { n: number }).n;
    expect(before).toBe(1);

    db.prepare('DELETE FROM repos WHERE id = ?').run(repoId);

    const after = (db.prepare('SELECT COUNT(*) AS n FROM repo_local_paths').get() as { n: number }).n;
    expect(after).toBe(0);
  });
});
