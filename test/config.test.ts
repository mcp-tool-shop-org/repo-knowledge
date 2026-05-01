import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveConfig } from '../src/config.js';

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

  // Regression: prior to v1.0.6, callers that passed an override object with
  // `dbPath: undefined` (e.g. fullSync forwarding optional CLI flags) would
  // erase the default and crash inside `path.resolve(undefined)`. The crash
  // exited 0 because commander's sync `parse()` swallowed the rejection,
  // so `rk sync` appeared to succeed while doing nothing.
  it('ignores undefined override values instead of erasing defaults', () => {
    const config = resolveConfig({ dbPath: undefined, owners: undefined });
    expect(config.dbPath).toContain('knowledge.db');
    expect(config.owners).toEqual([]);
  });

  it('throws a clear error if dbPath ends up non-string', () => {
    // Simulate a malformed config file where dbPath is explicitly null.
    writeFileSync(join(tmpDir, 'rk.config.json'), JSON.stringify({
      dbPath: null,
    }));
    expect(() => resolveConfig()).toThrow(/dbPath must be a non-empty string/);
  });

  it('throws if an override sets dbPath to empty string', () => {
    expect(() => resolveConfig({ dbPath: '' })).toThrow(/dbPath must be a non-empty string/);
  });
});
