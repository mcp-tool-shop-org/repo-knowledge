/**
 * STUDY-RK-022: dedicated suite for src/audit/controls.ts.
 *
 * audit-import and mcp-server only call seedControls as setup. This file
 * asserts catalog sizes, unique ids, seed return + row count, and
 * getApplicableControls (null / matching / malformed JSON — F-AG-012).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb } from '../src/db/init.js';
import {
  DOMAINS,
  CONTROLS,
  seedControls,
  getApplicableControls,
} from '../src/audit/controls.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-audit-controls-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('canonical control catalog', () => {
  it('has 19 domains and 80 controls with unique ids', () => {
    expect(DOMAINS.length).toBe(19);
    expect(CONTROLS.length).toBe(80);

    const ids = CONTROLS.map((c) => c.id);
    expect(new Set(ids).size).toBe(CONTROLS.length);
    expect(new Set(ids).size).toBe(80);
  });
});

describe('seedControls', () => {
  it('returns CONTROLS.length and writes that many audit_controls rows', () => {
    const db = getDb();
    const seeded = seedControls(db);

    expect(seeded).toBe(CONTROLS.length);
    expect(seeded).toBe(80);

    const row = db.prepare('SELECT COUNT(*) AS n FROM audit_controls').get() as { n: number };
    expect(row.n).toBe(seeded);
    expect(row.n).toBe(80);
  });

  it('is idempotent: a second seed still reports 80 rows', () => {
    const db = getDb();
    expect(seedControls(db)).toBe(80);
    expect(seedControls(db)).toBe(80);
    const row = db.prepare('SELECT COUNT(*) AS n FROM audit_controls').get() as { n: number };
    expect(row.n).toBe(80);
  });
});

describe('getApplicableControls', () => {
  it('treats null applicable_to as applicable to all', () => {
    const db = getDb();
    seedControls(db);

    // Canonical CONTROLS omit applicable_to, so seed writes NULL.
    const nullCount = (
      db.prepare('SELECT COUNT(*) AS n FROM audit_controls WHERE applicable_to IS NULL').get() as { n: number }
    ).n;
    expect(nullCount).toBe(80);

    const applicable = getApplicableControls(db, 'cli');
    expect(applicable).toHaveLength(80);
    expect(applicable.map((c) => c.id)).toEqual(
      db.prepare('SELECT id FROM audit_controls ORDER BY id').all().map((r) => (r as { id: string }).id),
    );
  });

  it('includes a control whose applicable_to JSON array matches appShape', () => {
    const db = getDb();
    seedControls(db);

    db.prepare(`UPDATE audit_controls SET applicable_to = ? WHERE id = 'INV-001'`).run(
      JSON.stringify(['cli', 'library']),
    );

    const forCli = getApplicableControls(db, 'cli');
    const forWeb = getApplicableControls(db, 'web');

    expect(forCli.some((c) => c.id === 'INV-001')).toBe(true);
    expect(forCli).toHaveLength(80);
    expect(forWeb.some((c) => c.id === 'INV-001')).toBe(false);
    expect(forWeb).toHaveLength(79);
  });

  it('treats malformed applicable_to JSON as applicable to all (F-AG-012)', () => {
    const db = getDb();
    seedControls(db);

    db.prepare(`UPDATE audit_controls SET applicable_to = ? WHERE id = 'SCR-002'`).run(
      '{not-valid-json',
    );

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const applicable = getApplicableControls(db, 'desktop');
      expect(applicable.some((c) => c.id === 'SCR-002')).toBe(true);
      expect(applicable).toHaveLength(80);
    } finally {
      spy.mockRestore();
    }
  });

  it('treats applicable_to that is valid JSON but not an array as all (F-AG-012)', () => {
    const db = getDb();
    seedControls(db);

    db.prepare(`UPDATE audit_controls SET applicable_to = ? WHERE id = 'QUA-001'`).run(
      JSON.stringify({ shape: 'cli' }),
    );

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const applicable = getApplicableControls(db, 'cli');
      expect(applicable.some((c) => c.id === 'QUA-001')).toBe(true);
      expect(applicable).toHaveLength(80);
    } finally {
      spy.mockRestore();
    }
  });
});
