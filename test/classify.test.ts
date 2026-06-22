/**
 * setRepoClassification — the curated status/stage/category setter behind the
 * `rk classify` command. Pins the contract: enum validation, partial updates,
 * explicit clears, unknown-slug handling.
 *
 * status/stage/category are NOT populated by sync or scan; this setter is the
 * only supported writer, so its behaviour is load-bearing for `list --status`
 * / `list --category` filtering and the `show` header.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo,
  setRepoClassification,
  REPO_STATUSES,
  REPO_CATEGORIES,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-classify-'));
  openDb(join(tmpDir, 'classify.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

function read(slug: string) {
  return getDb()
    .prepare('SELECT status, stage, category FROM repos WHERE slug = ?')
    .get(slug) as { status: string; stage: string | null; category: string | null };
}

describe('setRepoClassification', () => {
  it('sets status, stage, and category together', () => {
    upsertRepo({ owner: 'dogfood-lab', name: 'ai-crucible' });
    const res = setRepoClassification('dogfood-lab/ai-crucible', {
      status: 'active',
      stage: 'shipped',
      category: 'tool',
    });
    expect(res.updated).toBe(true);
    expect(read('dogfood-lab/ai-crucible')).toEqual({
      status: 'active',
      stage: 'shipped',
      category: 'tool',
    });
  });

  it('leaves unspecified columns intact on a partial update', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    setRepoClassification('o/r', { status: 'active', stage: 'shipped', category: 'tool' });
    setRepoClassification('o/r', { stage: 'maintenance' });
    expect(read('o/r')).toEqual({ status: 'active', stage: 'maintenance', category: 'tool' });
  });

  it('clears stage / category when passed null', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    setRepoClassification('o/r', { stage: 'shipped', category: 'tool' });
    setRepoClassification('o/r', { stage: null, category: null });
    const row = read('o/r');
    expect(row.stage).toBeNull();
    expect(row.category).toBeNull();
  });

  it('throws on an out-of-enum status', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    expect(() => setRepoClassification('o/r', { status: 'shipped' as never })).toThrow(/Invalid status/);
  });

  it('throws on an out-of-enum category', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    expect(() => setRepoClassification('o/r', { category: 'instrument' as never })).toThrow(/Invalid category/);
  });

  it('accepts every documented status and category value', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    for (const status of REPO_STATUSES) {
      expect(setRepoClassification('o/r', { status }).updated).toBe(true);
    }
    for (const category of REPO_CATEGORIES) {
      expect(setRepoClassification('o/r', { category }).updated).toBe(true);
    }
  });

  it('returns { updated:false } for an unknown slug (no throw)', () => {
    const res = setRepoClassification('o/does-not-exist', { status: 'active' });
    expect(res.updated).toBe(false);
  });

  it('returns { updated:false } when no fields are supplied', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    expect(setRepoClassification('o/r', {}).updated).toBe(false);
  });
});
