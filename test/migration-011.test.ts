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
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, upsertRepo, addRelationship } from '../src/db/init.js';

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
    expect(v).toBe('11');
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
    expect(v).toBe('11');
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
