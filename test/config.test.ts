import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveConfig, addOwner, removeOwner } from '../src/config.js';

let tmpDir: string;
let origCwd: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-cfg-'));
  origCwd = process.cwd();
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(origCwd);
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('resolveConfig', () => {
  it('uses defaults when no config file exists', () => {
    const config = resolveConfig();
    expect(config.owners).toEqual([]);
    expect(config.localDirs).toHaveLength(1);
    expect(config.dbPath).toContain('knowledge.db');
  });

  it('loads rk.config.json from CWD', () => {
    writeFileSync(join(tmpDir, 'rk.config.json'), JSON.stringify({
      owners: ['my-org'],
      localDirs: ['/home/user/code'],
    }));

    const config = resolveConfig();
    expect(config.owners).toEqual(['my-org']);
  });

  it('explicit overrides win', () => {
    writeFileSync(join(tmpDir, 'rk.config.json'), JSON.stringify({
      owners: ['file-org'],
    }));

    const config = resolveConfig({ owners: ['override-org'] });
    expect(config.owners).toEqual(['override-org']);
  });

  it('resolves relative paths to absolute', () => {
    const config = resolveConfig({ dbPath: './data/test.db' });
    expect(config.dbPath).toMatch(/^[A-Z]:|^\//); // absolute
    expect(config.dbPath).toContain('test.db');
  });
});

describe('malformed rk.config.json handling (db-A-007)', () => {
  const cfgPath = () => join(process.cwd(), 'rk.config.json');

  it('resolveConfig warns on stderr and falls back to defaults', () => {
    // Not valid JSON — a truncated write or hand-edit gone wrong.
    writeFileSync(cfgPath(), '{ "owners": ["org-a", ');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const config = resolveConfig();
      // Empty owners (defaults) — NOT silently the partial pre-truncation list.
      expect(config.owners).toEqual([]);
      // The operator MUST be told why their config didn't take effect.
      const warned = spy.mock.calls.some(c =>
        String(c[0]).includes('rk.config.json is malformed')
      );
      expect(warned).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });

  it('addOwner refuses to clobber a malformed config and leaves the file untouched', () => {
    const original = '{ "owners": ["keep-me" oops broken';
    writeFileSync(cfgPath(), original);

    // The write must be refused (throw), NOT silently overwrite the file
    // with a fresh single-owner shape (which would destroy recoverable
    // content).
    expect(() => addOwner('new-org')).toThrow(/malformed/i);

    // The on-disk file is byte-identical — nothing was written.
    expect(existsSync(cfgPath())).toBe(true);
    expect(readFileSync(cfgPath(), 'utf-8')).toBe(original);
  });

  it('removeOwner refuses to clobber a malformed config too', () => {
    const original = 'totally not json at all';
    writeFileSync(cfgPath(), original);
    expect(() => removeOwner('whatever')).toThrow(/malformed/i);
    expect(readFileSync(cfgPath(), 'utf-8')).toBe(original);
  });

  it('addOwner still works normally on a well-formed (or missing) config', () => {
    // Missing file is fine — create fresh.
    const r1 = addOwner('first-org');
    expect(r1.added).toBe(true);
    expect(r1.owners).toContain('first-org');
    // Well-formed file — append.
    const r2 = addOwner('second-org');
    expect(r2.added).toBe(true);
    expect(r2.owners).toEqual(['first-org', 'second-org']);
  });
});

describe('non-array array-field handling (PH-DB-006)', () => {
  const cfgPath = () => join(process.cwd(), 'rk.config.json');

  it('owners set to a non-array warns on stderr and falls back to [] (no throw)', () => {
    // Valid JSON, but owners is a string instead of an array. A later
    // .map()/iteration over owners would throw a cryptic
    // ".map is not a function" deep in the sync pipeline. resolveConfig must
    // coerce it back to the DEFAULTS value (empty array) and tell the
    // operator why.
    writeFileSync(cfgPath(), JSON.stringify({ owners: 'my-org' }));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const config = resolveConfig();
      expect(config.owners).toEqual([]);
      // localDirs is still its default (one resolved entry).
      expect(Array.isArray(config.localDirs)).toBe(true);
      // localDirs.map() must not throw — pin that resolveConfig completed.
      expect(() => config.localDirs.map(d => d)).not.toThrow();
      const warned = spy.mock.calls.some(c =>
        String(c[0]).includes('"owners" is not an array')
      );
      expect(warned).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });

  it('localDirs set to a non-array warns and falls back to the default', () => {
    writeFileSync(cfgPath(), JSON.stringify({ localDirs: 42 }));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const config = resolveConfig();
      expect(Array.isArray(config.localDirs)).toBe(true);
      // The single default './' resolved to an absolute path — length 1.
      expect(config.localDirs).toHaveLength(1);
      const warned = spy.mock.calls.some(c =>
        String(c[0]).includes('"localDirs" is not an array')
      );
      expect(warned).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});
