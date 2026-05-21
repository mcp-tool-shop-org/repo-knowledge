/**
 * FT-5: rk.config.json owners helpers + atomic write.
 *
 * Exercises the four config helpers:
 *   - listOwners()       — read current owners (empty when no file)
 *   - addOwner(name)     — add to file (idempotent)
 *   - removeOwner(name)  — remove from file (idempotent)
 *   - writeRkConfigFile  — atomic write via .tmp + rename
 *
 * All file I/O happens under a temp CWD so we never touch the project's
 * real rk.config.json.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  listOwners, addOwner, removeOwner,
  readRkConfigFile, writeRkConfigFile,
  resolveConfig,
} from '../src/config.js';

let tmpDir: string;
let savedCwd: string;

beforeEach(() => {
  savedCwd = process.cwd();
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-ownerscfg-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(savedCwd);
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('rk.config.json owners helpers (FT-5)', () => {
  it('listOwners returns [] when no config file exists', () => {
    expect(listOwners()).toEqual([]);
  });

  it('addOwner creates the config file with the owner', () => {
    expect(existsSync(join(tmpDir, 'rk.config.json'))).toBe(false);
    const result = addOwner('my-org');
    expect(result.added).toBe(true);
    expect(result.owners).toEqual(['my-org']);
    expect(existsSync(join(tmpDir, 'rk.config.json'))).toBe(true);
    expect(listOwners()).toEqual(['my-org']);
  });

  it('addOwner is idempotent for an already-present owner', () => {
    addOwner('my-org');
    const result = addOwner('my-org');
    expect(result.added).toBe(false);
    expect(result.owners).toEqual(['my-org']);
  });

  it('addOwner appends to an existing owners list without clobbering it', () => {
    writeFileSync(
      join(tmpDir, 'rk.config.json'),
      JSON.stringify({ owners: ['existing'], dbPath: 'data/k.db' }, null, 2),
      'utf-8'
    );
    addOwner('second');
    expect(listOwners()).toEqual(['existing', 'second']);
    // Other keys (dbPath) preserved.
    const file = readRkConfigFile() as Record<string, unknown>;
    expect(file.dbPath).toBe('data/k.db');
  });

  it('removeOwner deletes the owner from the file', () => {
    addOwner('a');
    addOwner('b');
    addOwner('c');
    const result = removeOwner('b');
    expect(result.removed).toBe(true);
    expect(result.owners).toEqual(['a', 'c']);
    expect(listOwners()).toEqual(['a', 'c']);
  });

  it('removeOwner returns { removed: false } when the owner is absent', () => {
    addOwner('a');
    const result = removeOwner('not-in-list');
    expect(result.removed).toBe(false);
    expect(result.owners).toEqual(['a']);
  });

  it('writeRkConfigFile uses an atomic .tmp + rename (no .tmp left behind on success)', () => {
    writeRkConfigFile({ owners: ['a'] });
    expect(existsSync(join(tmpDir, 'rk.config.json'))).toBe(true);
    expect(existsSync(join(tmpDir, 'rk.config.json.tmp'))).toBe(false);
  });

  it('writeRkConfigFile preserves unknown keys for forward compatibility', () => {
    writeFileSync(
      join(tmpDir, 'rk.config.json'),
      JSON.stringify({ owners: ['x'], futureKey: { nested: true } }, null, 2),
      'utf-8'
    );
    addOwner('y');
    const file = readRkConfigFile() as Record<string, unknown>;
    expect(file.owners).toEqual(['x', 'y']);
    expect(file.futureKey).toEqual({ nested: true });
  });

  it('produces well-formed JSON with trailing newline', () => {
    addOwner('a');
    const content = readFileSync(join(tmpDir, 'rk.config.json'), 'utf-8');
    expect(content.endsWith('\n')).toBe(true);
    expect(() => JSON.parse(content)).not.toThrow();
  });
});

describe('resolveConfig owners fallback (FT-5)', () => {
  it('resolveConfig falls back to rk.config.json owners when no override is passed', () => {
    writeFileSync(
      join(tmpDir, 'rk.config.json'),
      JSON.stringify({ owners: ['file-org-1', 'file-org-2'] }, null, 2),
      'utf-8'
    );
    const config = resolveConfig();
    expect(config.owners).toEqual(['file-org-1', 'file-org-2']);
  });

  it('resolveConfig uses an explicit owners override when provided', () => {
    writeFileSync(
      join(tmpDir, 'rk.config.json'),
      JSON.stringify({ owners: ['file-org'] }, null, 2),
      'utf-8'
    );
    const config = resolveConfig({ owners: ['explicit-org'] });
    expect(config.owners).toEqual(['explicit-org']);
  });

  it('resolveConfig with owners=undefined falls back to the file (not the empty default)', () => {
    // FT-5 bug fix: the pre-FT-5 spread `{ ...config, ...overrides }`
    // clobbered file-provided owners when CLI sync forwarded
    // `owners: undefined` through SyncConfig. The fix skips undefined
    // fields so the file value wins.
    writeFileSync(
      join(tmpDir, 'rk.config.json'),
      JSON.stringify({ owners: ['file-org'] }, null, 2),
      'utf-8'
    );
    const config = resolveConfig({ owners: undefined });
    expect(config.owners).toEqual(['file-org']);
  });
});
