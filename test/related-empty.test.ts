/**
 * STUDY-RK-026: empty getRelated is engine state, not Isolated-OK folklore.
 *
 * Pins the honest empty surfaces:
 *   - `rk related` text sentinel + `--json []`
 *   - `rk show` always prints a Relationships section (never silent omit)
 *   - never invents relationship edges
 *
 * Gates on dist/cli.js (built by pretest / verify), same as cli-publish.test.ts.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openDb, closeDb,
  upsertRepo, addRelationship,
} from '../src/db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = join(ROOT, 'dist', 'cli.js');

let tmpDir: string;
let dbPath: string;

function runCli(args: string[]): { code: number | null; stdout: string; stderr: string } {
  const res = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    env: { ...process.env, NO_COLOR: '1' },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(ROOT, '.tmp-related-empty-'));
  dbPath = join(tmpDir, 'knowledge.db');
  writeFileSync(
    join(tmpDir, 'rk.config.json'),
    JSON.stringify({ dbPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
    'utf-8',
  );
  openDb(dbPath);
  closeDb();
});

afterEach(() => {
  try { closeDb(); } catch { /* idempotent */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('STUDY-RK-026: empty getRelated CLI honesty', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip related-empty CLI tests', () => {});
    return;
  }

  it('rk related prints the text sentinel when no edges are recorded', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'lonely' });
    closeDb();

    const { code, stdout } = runCli(['related', 'o/lonely']);
    expect(code).toBe(0);
    expect(stdout).toContain('No relationships recorded for: o/lonely');
    expect(stdout).not.toMatch(/depends_on|related_to|supersedes|shares_domain_with|companion_to|wraps/);
  });

  it('rk related --json emits [] when no edges are recorded', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'lonely' });
    closeDb();

    const { code, stdout } = runCli(['related', 'o/lonely', '--json']);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed).toEqual([]);
  });

  it('rk show prints an honest empty Relationships section (does not omit, does not invent)', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'lonely' });
    closeDb();

    const { code, stdout } = runCli(['show', 'o/lonely']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/─── Relationships ───/);
    expect(stdout).toMatch(/No relationships recorded/);
    expect(stdout).not.toMatch(/depends_on|related_to|supersedes|shares_domain_with|companion_to|wraps/);
    expect(stdout).not.toMatch(/→ /);
  });

  it('rk show still lists recorded edges (non-empty path unchanged)', () => {
    openDb(dbPath);
    const from = upsertRepo({ owner: 'o', name: 'api' });
    const to = upsertRepo({ owner: 'o', name: 'auth' });
    addRelationship(from, 'depends_on', to, 'uses auth');
    closeDb();

    const { code, stdout } = runCli(['show', 'o/api']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/─── Relationships ───/);
    expect(stdout).toMatch(/depends_on → o\/auth/);
    expect(stdout).not.toMatch(/No relationships recorded/);
  });

  it('rk related lists recorded edges and does not print the empty sentinel', () => {
    openDb(dbPath);
    const from = upsertRepo({ owner: 'o', name: 'api' });
    const to = upsertRepo({ owner: 'o', name: 'auth' });
    addRelationship(from, 'depends_on', to, 'uses auth');
    closeDb();

    const { code, stdout } = runCli(['related', 'o/api']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/Relationships for o\/api/);
    expect(stdout).toMatch(/depends_on → o\/auth/);
    expect(stdout).not.toMatch(/No relationships recorded for:/);
  });
});
