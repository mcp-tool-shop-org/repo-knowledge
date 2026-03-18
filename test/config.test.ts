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
});
