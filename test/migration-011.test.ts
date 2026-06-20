/**
 * FT-5: migration-011 cross-tool vocabulary.
 *
 * Validates that the schema v10 → v11 transition:
 *   - extends the repo_relationships.relation_type CHECK enum with the
 *     two new values ('wraps', 'collaborated_in_mission') without
 *     dropping any existing rows
 *   - preserves the unique index on (from_repo_id, relation_type, to_repo_id)
 *   - adds the repos.forge_vault_path column (default NULL)
 *   - stamps schema_version='11' and the cross_tool_vocab_added marker
 *   - is idempotent on re-open (no double-apply)
 *   - FK CASCADE on repo_relationships still works after the table
 *     recreate
 *   - throws on invented relation_type values (the CHECK still rejects
 *     out-of-enum strings)
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, upsertRepo, addRelationship, CURRENT_SCHEMA_VERSION } from '../src/db/init.js';

// ts-A-008: head version as a string for meta-row comparisons.
const HEAD = String(CURRENT_SCHEMA_VERSION);

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-mig011-'));
  dbPath = join(tmpDir, 'mig011.db');
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('migration-011 cross-tool vocabulary (FT-5)', () => {
  it('stamps schema_version=11 and the cross_tool_vocab_added marker', () => {
    openDb(dbPath);
    const db = getDb();
    const v = (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v).toBe(HEAD);
    const m = db.prepare("SELECT value FROM meta WHERE key = 'cross_tool_vocab_added'").get() as { value: string } | undefined;
    expect(m).toBeDefined();
  });

  it('extends the relation_type CHECK enum with wraps + collaborated_in_mission', () => {
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });

    // Pre-existing values still accepted
    expect(() => addRelationship(a, 'depends_on', b)).not.toThrow();

    const c = upsertRepo({ owner: 'o', name: 'c' });
    const d = upsertRepo({ owner: 'o', name: 'd' });
    // FT-5 additions accepted
    expect(() => addRelationship(c, 'wraps', d)).not.toThrow();
    const e = upsertRepo({ owner: 'o', name: 'e' });
    const f = upsertRepo({ owner: 'o', name: 'f' });
    expect(() => addRelationship(e, 'collaborated_in_mission', f)).not.toThrow();

    const db = getDb();
    const rows = db.prepare("SELECT relation_type FROM repo_relationships ORDER BY id").all() as { relation_type: string }[];
    expect(rows.map(r => r.relation_type)).toEqual([
      'depends_on', 'wraps', 'collaborated_in_mission',
    ]);
  });

  it('rejects invented relation_type values (CHECK constraint preserved)', () => {
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    const db = getDb();
    // Direct INSERT to bypass any application-layer guards; the CHECK
    // is the source of truth.
    expect(() => db.prepare(
      'INSERT INTO repo_relationships (from_repo_id, relation_type, to_repo_id) VALUES (?, ?, ?)'
    ).run(a, 'not-a-real-vocab', b)).toThrow();
  });

  it('preserves the unique constraint on (from_repo_id, relation_type, to_repo_id)', () => {
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    // First insert succeeds
    addRelationship(a, 'wraps', b);
    // Second is silently dedup'd via INSERT OR IGNORE — count must
    // still be 1, not 2.
    addRelationship(a, 'wraps', b);
    const db = getDb();
    const c = (db.prepare(
      'SELECT COUNT(*) AS c FROM repo_relationships WHERE from_repo_id = ? AND relation_type = ? AND to_repo_id = ?'
    ).get(a, 'wraps', b) as { c: number }).c;
    expect(c).toBe(1);
  });

  it('preserves rows across the table-recreate during migration', () => {
    // Open at fresh head, insert some rows, close, re-open. After a
    // re-open the migration is a no-op (marker already present), so the
    // rows must survive byte-identically.
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'depends_on', b, 'first edge');
    addRelationship(a, 'wraps', b, 'second edge');

    const db1 = getDb();
    const before = db1.prepare("SELECT from_repo_id, relation_type, to_repo_id, note FROM repo_relationships ORDER BY id").all();
    closeDb();

    openDb(dbPath);
    const db2 = getDb();
    const after = db2.prepare("SELECT from_repo_id, relation_type, to_repo_id, note FROM repo_relationships ORDER BY id").all();
    expect(after).toEqual(before);
  });

  it('adds repos.forge_vault_path column (NULL default)', () => {
    openDb(dbPath);
    const db = getDb();
    const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string; dflt_value: string | null }[];
    const colNames = cols.map(c => c.name);
    expect(colNames).toContain('forge_vault_path');
    // No default — NULL means "not a game repo" (or unset).
    const col = cols.find(c => c.name === 'forge_vault_path');
    expect(col?.dflt_value).toBeNull();
  });

  it('FK CASCADE on repo_relationships still fires after the table recreate', () => {
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'wraps', b);
    addRelationship(a, 'depends_on', b);

    const db = getDb();
    // Sanity: 2 rows before delete
    const before = (db.prepare('SELECT COUNT(*) AS c FROM repo_relationships').get() as { c: number }).c;
    expect(before).toBe(2);

    // Delete the parent repo a; FK ON DELETE CASCADE on
    // repo_relationships.from_repo_id removes both rows.
    db.prepare('DELETE FROM repos WHERE id = ?').run(a);
    const after = (db.prepare('SELECT COUNT(*) AS c FROM repo_relationships').get() as { c: number }).c;
    expect(after).toBe(0);
  });

  it('is idempotent — re-opening a v11 DB does not error or duplicate rows', () => {
    openDb(dbPath);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'wraps', b);
    closeDb();

    expect(() => openDb(dbPath)).not.toThrow();
    const db = getDb();
    const v = (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v).toBe(HEAD);
    const count = (db.prepare('SELECT COUNT(*) AS c FROM repo_relationships').get() as { c: number }).c;
    expect(count).toBe(1);
  });

  it('preserves the secondary indexes on the recreated repo_relationships table', () => {
    openDb(dbPath);
    const db = getDb();
    const indexes = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name = 'repo_relationships'"
    ).all() as { name: string }[];
    const names = indexes.map(i => i.name);
    // The two non-unique indexes from migration-001 schema.
    expect(names).toContain('idx_rel_from');
    expect(names).toContain('idx_rel_to');
    // The unique composite index.
    expect(names).toContain('idx_rel_unique');
  });
});

describe('migration-011 crash durability (db-A-001 / db-A-005-DB)', () => {
  // Reproduce the exact stranded state a PRE-FIX binary could leave: it
  // ran CREATE repo_relationships_new + INSERT…SELECT + DROP
  // repo_relationships, then DIED before the RENAME. On disk:
  //   * repo_relationships is GONE (dropped)
  //   * repo_relationships_new holds every row
  //   * schema_version is still < 11
  //   * cross_tool_vocab_added marker absent
  // The bug being pinned: the old recovery else-branch treated "no
  // repo_relationships" as a minimal-v1 fixture and SILENTLY stamped
  // schema_version=11 with the relationships gone forever. The fix must
  // either restore the table or fail loudly — never stamp 11 with the
  // data dropped.
  function buildStrandedDb(path: string): { rowsBefore: number } {
    // 1. Build a healthy v11 DB and seed two relationships.
    openDb(path);
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'depends_on', b, 'edge one');
    addRelationship(a, 'wraps', b, 'edge two');
    const rowsBefore = (getDb().prepare(
      'SELECT COUNT(*) AS c FROM repo_relationships'
    ).get() as { c: number }).c;
    closeDb();

    // 2. Hand-revert to the stranded mid-recreate state using a raw
    //    handle (not openDb, which would re-migrate).
    const raw = new Database(path);
    raw.pragma('foreign_keys = OFF');
    raw.exec('ALTER TABLE repo_relationships RENAME TO repo_relationships_new');
    raw.prepare("DELETE FROM meta WHERE key = 'cross_tool_vocab_added'").run();
    raw.prepare("UPDATE meta SET value = '10' WHERE key = 'schema_version'").run();
    raw.pragma('foreign_keys = ON');
    raw.close();
    return { rowsBefore };
  }

  it('restores the stranded repo_relationships_new instead of silently stamping 11', () => {
    const tmpDir2 = mkdtempSync(join(tmpdir(), 'rk-mig011-crash-'));
    const crashPath = join(tmpDir2, 'crash.db');
    try {
      const { rowsBefore } = buildStrandedDb(crashPath);
      expect(rowsBefore).toBe(2);

      // Re-open with the fixed binary: recovery must run.
      openDb(crashPath);
      const db = getDb();

      // repo_relationships is back…
      const hasTable = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships'"
      ).get();
      expect(hasTable).toBeDefined();

      // …with BOTH rows intact (never dropped silently)…
      const rowsAfter = (db.prepare(
        'SELECT COUNT(*) AS c FROM repo_relationships'
      ).get() as { c: number }).c;
      expect(rowsAfter).toBe(2);

      // …the stranded _new table is gone…
      const strayNew = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships_new'"
      ).get();
      expect(strayNew).toBeUndefined();

      // …and ONLY NOW is version stamped to head, with the marker set.
      const v = (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
      expect(v).toBe(HEAD);
      const marker = db.prepare("SELECT value FROM meta WHERE key = 'cross_tool_vocab_added'").get();
      expect(marker).toBeDefined();
    } finally {
      try { closeDb(); } catch { /* noop */ }
      rmSync(tmpDir2, { recursive: true, force: true });
    }
  });

  it('a corrupt DB missing repo_relationships with NO stranded _new fails loudly (never stamps 11)', () => {
    const tmpDir2 = mkdtempSync(join(tmpdir(), 'rk-mig011-corrupt-'));
    const corruptPath = join(tmpDir2, 'corrupt.db');
    try {
      // Build a healthy migrated DB (rigs table present), then drop
      // repo_relationships outright with NO replacement — the
      // unrecoverable case. This must NOT be mistaken for a minimal-v1
      // fixture and silently stamped to 11.
      openDb(corruptPath);
      closeDb();

      const raw = new Database(corruptPath);
      raw.pragma('foreign_keys = OFF');
      raw.exec('DROP TABLE repo_relationships');
      raw.prepare("DELETE FROM meta WHERE key = 'cross_tool_vocab_added'").run();
      raw.prepare("UPDATE meta SET value = '10' WHERE key = 'schema_version'").run();
      raw.pragma('foreign_keys = ON');
      raw.close();

      // Re-open: with rigs present and no recoverable _new, openDb must
      // throw rather than stamp 11 with relationships gone.
      expect(() => openDb(corruptPath)).toThrow(/repo_relationships is missing|corrupt/i);
    } finally {
      try { closeDb(); } catch { /* noop */ }
      rmSync(tmpDir2, { recursive: true, force: true });
    }
  });
});
