/**
 * FT-5: shared RELATION_TYPES tuple + addRelationship application-layer
 * acceptance for the two new values.
 *
 * The tuple lives in src/index.ts and is the single source of truth for
 * the CLI validator + MCP Zod enum. The CHECK constraint in the DB is
 * verified separately in migration-011.test.ts; this file exercises
 * the application-layer round-trip and confirms that the tuple shape
 * is what we expect.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, upsertRepo, addRelationship, getRelated } from '../src/db/init.js';
import { RELATION_TYPES } from '../src/index.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-reltypes-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('RELATION_TYPES tuple (FT-5)', () => {
  it('includes the FT-5 additions', () => {
    expect(RELATION_TYPES).toContain('wraps');
    expect(RELATION_TYPES).toContain('collaborated_in_mission');
  });

  it('preserves all migration-001 values', () => {
    expect(RELATION_TYPES).toContain('depends_on');
    expect(RELATION_TYPES).toContain('related_to');
    expect(RELATION_TYPES).toContain('supersedes');
    expect(RELATION_TYPES).toContain('shares_domain_with');
    expect(RELATION_TYPES).toContain('shares_package_with');
    expect(RELATION_TYPES).toContain('companion_to');
  });

  it('has exactly 8 entries (6 original + 2 FT-5 additions)', () => {
    expect(RELATION_TYPES.length).toBe(8);
  });
});

describe('addRelationship accepts FT-5 vocabulary (round-trip)', () => {
  it('wraps survives a write-then-read cycle', () => {
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'wraps', b, 'mcp wraps cli');

    const related = getRelated(a);
    expect(related).toHaveLength(1);
    expect(related[0].relation_type).toBe('wraps');
    expect(related[0].slug).toBe('o/b');
    expect(related[0].note).toBe('mcp wraps cli');
  });

  it('collaborated_in_mission survives a write-then-read cycle', () => {
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'collaborated_in_mission', b, 'mission #1');

    const related = getRelated(a);
    expect(related).toHaveLength(1);
    expect(related[0].relation_type).toBe('collaborated_in_mission');
  });

  it('rejects invented relation_type via DB CHECK constraint', () => {
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    const db = getDb();
    // Direct insert to exercise the CHECK; addRelationship uses INSERT
    // OR IGNORE which would silently swallow the failure case the
    // CHECK rejects (the IGNORE applies to UNIQUE violations only —
    // CHECK violations still throw, but use direct INSERT here for
    // clarity).
    expect(() => db.prepare(
      'INSERT INTO repo_relationships (from_repo_id, relation_type, to_repo_id) VALUES (?, ?, ?)'
    ).run(a, 'invented_value', b)).toThrow();
  });

  it('addRelationship is dedup-safe for new vocabulary too', () => {
    const a = upsertRepo({ owner: 'o', name: 'a' });
    const b = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(a, 'wraps', b);
    addRelationship(a, 'wraps', b);  // second insert should be ignored

    const db = getDb();
    const count = (db.prepare(
      "SELECT COUNT(*) AS c FROM repo_relationships WHERE from_repo_id = ? AND relation_type = 'wraps' AND to_repo_id = ?"
    ).get(a, b) as { c: number }).c;
    expect(count).toBe(1);
  });
});
