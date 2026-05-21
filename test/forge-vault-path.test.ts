/**
 * FT-5: forge_vault_path column round-trip.
 *
 * setRepoForgeVaultPath writes the column; getRepoForgeVaultPath +
 * getRepo both read it back. The column is nullable: only game repos
 * populate it.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, upsertRepo, getRepo,
  setRepoForgeVaultPath, getRepoForgeVaultPath,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-forgevault-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('forge_vault_path (FT-5)', () => {
  it('defaults to NULL on a freshly-upserted repo', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    expect(getRepoForgeVaultPath('o/r')).toBeNull();
  });

  it('round-trips a non-null value through setRepoForgeVaultPath', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const result = setRepoForgeVaultPath('o/r', 'F:/AI/forge-vault/o-r');
    expect(result.updated).toBe(true);
    expect(getRepoForgeVaultPath('o/r')).toBe('F:/AI/forge-vault/o-r');
  });

  it('clears the value when passed null', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    setRepoForgeVaultPath('o/r', '/some/path');
    expect(getRepoForgeVaultPath('o/r')).toBe('/some/path');
    setRepoForgeVaultPath('o/r', null);
    expect(getRepoForgeVaultPath('o/r')).toBeNull();
  });

  it('returns { updated: false } for a slug that does not exist', () => {
    const result = setRepoForgeVaultPath('does/not-exist', 'whatever');
    expect(result.updated).toBe(false);
  });

  it('getRepoForgeVaultPath returns null for an unknown slug', () => {
    expect(getRepoForgeVaultPath('does/not-exist')).toBeNull();
  });

  it('getRepo includes forge_vault_path in the returned shape', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    setRepoForgeVaultPath('o/r', 'F:/AI/forge-vault/game-x');
    const repo = getRepo('o/r');
    expect(repo).not.toBeNull();
    expect(repo!.forge_vault_path).toBe('F:/AI/forge-vault/game-x');
  });

  it('non-game repos can leave forge_vault_path NULL while the column still appears in getRepo', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const repo = getRepo('o/r');
    expect(repo).not.toBeNull();
    // Column is present in the SELECT *; null is the absence-of-value.
    expect(repo!.forge_vault_path).toBeNull();
  });
});
