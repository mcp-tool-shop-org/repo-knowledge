/**
 * F-TS-FT4: fsck integrity checker (FT-4).
 *
 * Seeds a temp DB with deliberately-broken state and asserts each
 * check function finds it.
 *
 * Pattern: most checks operate on the v10 head, which has FK
 * enforcement via PRAGMA foreign_keys=ON. To plant an "orphan row" we
 * temporarily flip foreign_keys=OFF, insert the orphan, then flip back
 * on — mirrors the real "legacy data pre-dating FK enforcement" case
 * that motivates checkOrphanRows.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// PH-AHG-009: a partial mock of node:fs that keeps every real export but
// lets a test make existsSync THROW for one sentinel path (simulating an
// EACCES / unmounted-drive failure). All other fs calls — and existsSync on
// every non-sentinel path — pass straight through to the real module.
//
// The sentinel literal is inlined inside the factory (vi.mock is hoisted
// above module-level consts, so the factory must not close over them).
const THROW_PATH = '__rk_existsSync_throws__';
vi.mock('node:fs', async (importOriginal) => {
  const real = await importOriginal<typeof import('node:fs')>();
  const sentinel = '__rk_existsSync_throws__';
  return {
    ...real,
    existsSync: (p: import('node:fs').PathLike) => {
      if (typeof p === 'string' && p.includes(sentinel)) {
        throw new Error('EACCES: permission denied (simulated)');
      }
      return real.existsSync(p);
    },
  };
});
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertNote, upsertDoc,
  listDbHealthRuns,
} from '../src/db/init.js';
import { runFsck } from '../src/health/fsck.js';
import { rebuildIndex } from '../src/search/fts.js';

let tmpDir: string;
let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-fsck-'));
  openDb(join(tmpDir, 'test.db'));
  // PH-AHG-010: runFsck now logs the full seven-check summary to stderr
  // (diagnostic channel). Silence it so the suite output stays clean.
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errSpy.mockRestore();
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('runFsck — clean baseline', () => {
  it('a fresh DB with no repos reports zero on every check', () => {
    const report = runFsck();
    expect(report.checks.orphan_rows.count).toBe(0);
    expect(report.checks.broken_relationships.count).toBe(0);
    expect(report.checks.null_local_path_active.count).toBe(0);
    expect(report.checks.stale_local_path.count).toBe(0);
    expect(report.checks.fts_row_count_mismatch.count).toBe(0);
    expect(report.checks.invalid_lifecycle_status.count).toBe(0);
    expect(report.checks.incomplete_sync_runs.count).toBe(0);
    expect(report.exit_code).toBe(0);
  });

  it('writes a db_health_runs audit row on every invocation', () => {
    const before = listDbHealthRuns(10).length;
    runFsck();
    const after = listDbHealthRuns(10).length;
    expect(after).toBe(before + 1);
  });

  it('--strict still exits 0 when all checks are clean', () => {
    const report = runFsck({ strict: true });
    expect(report.exit_code).toBe(0);
  });
});

describe('runFsck — checkOrphanRows', () => {
  it('detects rows in child tables whose repo_id is missing from repos', () => {
    const db = getDb();
    // Temporarily disable FK to plant the orphan. PRAGMA is per-
    // connection; we restore on the same connection right after.
    db.pragma('foreign_keys = OFF');
    db.prepare(
      "INSERT INTO repo_notes (repo_id, note_type, title, content, source) VALUES (?, ?, ?, ?, ?)"
    ).run(99999, 'general', 'orphan', 'no parent repo', 'manual');
    db.pragma('foreign_keys = ON');

    const report = runFsck();
    expect(report.checks.orphan_rows.count).toBeGreaterThan(0);
    expect(report.checks.orphan_rows.samples.length).toBeGreaterThan(0);
    expect(report.checks.orphan_rows.samples[0]).toMatch(/repo_notes/);
    expect(report.checks.orphan_rows.samples[0]).toMatch(/99999/);
  });
});

describe('runFsck — checkBrokenRelationships', () => {
  it('detects relationships whose from_repo_id or to_repo_id is missing', () => {
    const db = getDb();
    const realId = upsertRepo({ owner: 'o', name: 'r' });
    // Plant a relationship whose to_repo_id doesn't exist. Disable FK
    // so the broken row gets in (FK would normally reject).
    db.pragma('foreign_keys = OFF');
    db.prepare(
      "INSERT INTO repo_relationships (from_repo_id, relation_type, to_repo_id, note) VALUES (?, ?, ?, ?)"
    ).run(realId, 'depends_on', 88888, null);
    db.pragma('foreign_keys = ON');

    const report = runFsck();
    expect(report.checks.broken_relationships.count).toBe(1);
    expect(report.checks.broken_relationships.samples[0]).toMatch(/depends_on/);
    expect(report.checks.broken_relationships.samples[0]).toMatch(/88888/);
  });
});

describe('runFsck — checkNullLocalPathActive', () => {
  it('detects active repos with NULL local_path', () => {
    // upsertRepo defaults lifecycle_status to 'active' via the migration-006
    // ADD COLUMN default. We don't pass local_path, so it stays NULL.
    upsertRepo({ owner: 'o', name: 'no-path' });

    const report = runFsck();
    expect(report.checks.null_local_path_active.count).toBe(1);
    expect(report.checks.null_local_path_active.samples[0]).toBe('o/no-path');
  });

  it('does not flag archived repos with NULL local_path', () => {
    upsertRepo({ owner: 'o', name: 'archived-no-path' });
    const db = getDb();
    db.prepare(
      "UPDATE repos SET lifecycle_status = 'archived' WHERE owner = ? AND name = ?"
    ).run('o', 'archived-no-path');

    const report = runFsck();
    expect(report.checks.null_local_path_active.count).toBe(0);
  });
});

describe('runFsck — checkStaleLocalPath', () => {
  it('flags repos whose local_path is not present on disk', () => {
    // Use a path we know does NOT exist on the rig.
    upsertRepo({
      owner: 'o',
      name: 'ghost',
      local_path: join(tmpDir, 'definitely-not-a-dir', 'no-here-either'),
    });

    const report = runFsck();
    expect(report.checks.stale_local_path.count).toBe(1);
    expect(report.checks.stale_local_path.samples[0]).toMatch(/o\/ghost/);
  });

  it('does not flag a repo whose local_path actually exists', () => {
    const realDir = join(tmpDir, 'real-dir');
    mkdirSync(realDir);
    upsertRepo({ owner: 'o', name: 'real', local_path: realDir });

    const report = runFsck();
    expect(report.checks.stale_local_path.count).toBe(0);
  });

  // PH-AHG-009: existsSync can throw (EACCES, unmounted drive). One bad
  // path must degrade to skipped-with-note, NOT abort the whole check.
  it('degrades gracefully when existsSync throws on one path (PH-AHG-009)', () => {
    // A genuinely-missing path (counts as stale) plus a path whose
    // existsSync throws (the mock above). The whole check must still
    // complete and runFsck must not propagate the throw.
    upsertRepo({
      owner: 'o',
      name: 'ghost',
      local_path: join(tmpDir, 'definitely-not-a-dir'),
    });
    upsertRepo({
      owner: 'o',
      name: 'unreadable',
      local_path: join(tmpDir, THROW_PATH, 'locked'),
    });

    let report!: ReturnType<typeof runFsck>;
    // The throwing path must not crash the run.
    expect(() => { report = runFsck(); }).not.toThrow();
    // The genuinely-missing path is still counted as stale; the throwing
    // path is skipped (not counted as stale, not crashing the check).
    expect(report.checks.stale_local_path.count).toBe(1);
    // The skipped path is surfaced with its note so the operator sees it.
    expect(
      report.checks.stale_local_path.samples.some(s => s.includes('skipped')),
    ).toBe(true);
  });
});

describe('runFsck — checkFtsRowCountMismatch', () => {
  it('reports zero when FTS matches the source row count', () => {
    upsertRepo({ owner: 'o', name: 'a', description: 'an indexable description' });
    // Touch the FTS index via rebuildIndex. We expect the count to
    // match the source.
    rebuildIndex();
    const report = runFsck();
    expect(report.checks.fts_row_count_mismatch.count).toBe(0);
  });

  // hg-A-003: rebuildIndex INNER JOINs repo_docs/repo_notes against repos,
  // so orphan docs/notes (repo_id with no parent) are NEVER indexed. The
  // expected-count formula must mirror that join — otherwise an orphan doc
  // inflates `expected` past `fts` and fires a spurious mismatch WARN.
  it('does not report a spurious FTS mismatch for an orphan doc (hg-A-003)', () => {
    const id = upsertRepo({ owner: 'o', name: 'a', description: 'an indexable description' });
    // A legit doc on a real repo — part of the indexable corpus.
    upsertDoc(id, 'README.md', 'readme', 'README', 'doc body', 'sum-1');
    // Sync FTS to exactly the legit sources.
    rebuildIndex();

    // Plant an ORPHAN doc: repo_id points at no repo. FK off to bypass
    // enforcement, mirroring legacy pre-FK data. rebuildIndex's INNER
    // JOIN excludes it, so it is NOT in repo_search.
    const db = getDb();
    db.pragma('foreign_keys = OFF');
    db.prepare(`
      INSERT INTO repo_docs (repo_id, path, doc_type, title, content, checksum)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(91919, 'orphan.md', 'readme', 'orphan', 'orphan body', 'sum-orphan');
    db.pragma('foreign_keys = ON');

    const report = runFsck();
    // The orphan is counted by checkOrphanRows (correct) but must NOT
    // perturb the FTS expected-count — both sides exclude it.
    expect(report.checks.orphan_rows.count).toBeGreaterThan(0);
    expect(report.checks.fts_row_count_mismatch.count).toBe(0);
  });

  it('reports a non-zero diff when FTS is out of sync with sources', () => {
    const id = upsertRepo({ owner: 'o', name: 'b', description: 'first' });
    // Add a note. The triggers (migration-005) keep FTS in sync, but
    // if we add a doc with content WITHOUT running triggers (raw
    // INSERT bypassing helpers), we mimic a desynced index.
    upsertNote(id, 'general', 'a note', 'body of the note', 'manual');
    // Now manually DELETE all FTS rows to force a mismatch.
    getDb().prepare('DELETE FROM repo_search').run();

    const report = runFsck();
    expect(report.checks.fts_row_count_mismatch.count).toBeGreaterThan(0);
    expect(report.checks.fts_row_count_mismatch.samples.length).toBeGreaterThan(0);
  });
});

describe('runFsck — checkInvalidLifecycleStatus', () => {
  it('flags repos with lifecycle_status outside the enum', () => {
    upsertRepo({ owner: 'o', name: 'bad-status' });
    const db = getDb();
    db.prepare(
      "UPDATE repos SET lifecycle_status = 'wat' WHERE owner = ? AND name = ?"
    ).run('o', 'bad-status');

    const report = runFsck();
    expect(report.checks.invalid_lifecycle_status.count).toBe(1);
    expect(report.checks.invalid_lifecycle_status.samples[0]).toMatch(/o\/bad-status/);
    expect(report.checks.invalid_lifecycle_status.samples[0]).toMatch(/wat/);
  });

  it('does not flag any value in the canonical enum', () => {
    upsertRepo({ owner: 'o', name: 'active-default' });
    const db = getDb();
    db.prepare("UPDATE repos SET lifecycle_status = 'deprecated' WHERE name = ?").run('active-default');
    const report = runFsck();
    expect(report.checks.invalid_lifecycle_status.count).toBe(0);
  });
});

describe('runFsck — checkIncompleteSyncRuns', () => {
  it('flags sync_runs with NULL finished_at older than 24h', () => {
    // Plant a sync_runs row dated more than a day ago, no finished_at.
    const db = getDb();
    db.prepare(`
      INSERT INTO sync_runs (started_at, exit_code)
      VALUES (datetime('now', '-2 days'), 0)
    `).run();

    const report = runFsck();
    expect(report.checks.incomplete_sync_runs.count).toBe(1);
  });

  it('does NOT flag in-progress sync_runs less than 24h old', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO sync_runs (started_at, exit_code)
      VALUES (datetime('now', '-1 hour'), 0)
    `).run();

    const report = runFsck();
    expect(report.checks.incomplete_sync_runs.count).toBe(0);
  });

  it('does NOT flag completed sync_runs no matter how old', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO sync_runs (started_at, finished_at, exit_code)
      VALUES (datetime('now', '-3 days'), datetime('now', '-3 days'), 0)
    `).run();

    const report = runFsck();
    expect(report.checks.incomplete_sync_runs.count).toBe(0);
  });
});

describe('runFsck — exit_code semantics', () => {
  it('--strict flips exit_code to 1 on any non-zero check', () => {
    upsertRepo({ owner: 'o', name: 'null-path' });
    // null_local_path_active should be 1 now.
    const strict = runFsck({ strict: true });
    expect(strict.exit_code).toBe(1);

    // Without --strict, exit_code stays 0 even with warnings.
    const lax = runFsck({ strict: false });
    expect(lax.exit_code).toBe(0);
  });

  it('writes the chosen exit_code into the db_health_runs row', () => {
    upsertRepo({ owner: 'o', name: 'null-path' });
    runFsck({ strict: true });
    const rows = listDbHealthRuns(1);
    expect(rows[0].exit_code).toBe(1);
  });
});
