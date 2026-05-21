/**
 * F-TS-FT2 (CLI publish commands): integration tests for the new
 * `rk versions`, `rk drift`, and `rk bind-package` commands.
 *
 * Gates on dist/cli.js existing (built by `npm run build` in
 * `prepublishOnly` / `verify`). If the dist artifact is absent we log a
 * skip and return — the CI harness builds before testing.
 *
 * Tests seed a temporary DB with known published_version rows and known
 * package.json content, then invoke the CLI via spawnSync against an
 * isolated rk.config.json so the production DB is never touched.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openDb, closeDb, getDb,
  upsertRepo,
  upsertPublishedVersion,
  setRepoPackageNames,
} from '../src/db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = join(ROOT, 'dist', 'cli.js');

let tmpDir: string;
let dbPath: string;
let configPath: string;

function runCli(args: string[], env: Record<string, string> = {}): { code: number | null; stdout: string; stderr: string } {
  const res = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    env: { ...process.env, ...env, NO_COLOR: '1' },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(__dirname, '..', '.tmp-cli-publish-'));
  dbPath = join(tmpDir, 'knowledge.db');
  configPath = join(tmpDir, 'rk.config.json');
  writeFileSync(
    configPath,
    JSON.stringify({ dbPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
    'utf-8'
  );
  // Pre-open the DB so the schema is applied (migrations run on first open).
  openDb(dbPath);
  closeDb();
});

afterEach(() => {
  // closeDb is idempotent and may already be closed.
  try { closeDb(); } catch { /* idempotent */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('rk versions / drift / bind-package (F-TS-FT2)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip CLI publish tests', () => {
      // Intentional skip: tests need a built CLI binary.
    });
    return;
  }

  // ─── rk versions ────────────────────────────────────────────────────────

  it('rk versions <slug> displays "No published versions" when the DB is empty for that repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'empty' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/empty']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/no published versions/i);
  });

  it('rk versions <slug> renders rows from the DB when published_versions exist', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.1' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/r']);
    expect(code).toBe(0);
    // Versions should appear in the output
    expect(stdout).toMatch(/1\.0\.0/);
    expect(stdout).toMatch(/1\.0\.1/);
    expect(stdout).toMatch(/2\.0\.0/);
    // Channels should be grouped/shown
    expect(stdout).toMatch(/npm/i);
    expect(stdout).toMatch(/pypi/i);
  });

  it('rk versions --channel npm filters to a single channel', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/r', '--channel', 'npm']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/1\.0\.0/);
    // pypi must NOT appear in the filtered output
    expect(stdout).not.toMatch(/2\.0\.0/);
  });

  it('rk versions on a non-existent slug exits non-zero', () => {
    const { code, stderr, stdout } = runCli(['versions', 'no/such-repo']);
    expect(code).not.toBe(0);
    expect(stderr + stdout).toMatch(/not found/i);
  });

  // ─── rk drift ───────────────────────────────────────────────────────────

  it('rk drift reports "no drift" when source version matches registry latest', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'aligned', local_path: join(tmpDir, 'aligned') }) as number;
    setRepoPackageNames('o/aligned', { npm: '@scope/aligned' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.2.3' });
    closeDb();

    // Seed a local package.json with the same version
    mkdirSync(join(tmpDir, 'aligned'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'aligned', 'package.json'),
      JSON.stringify({ name: '@scope/aligned', version: '1.2.3' }),
      'utf-8'
    );

    const { code, stdout } = runCli(['drift', 'o/aligned']);
    expect(code).toBe(0);
    // Output should indicate no drift
    expect(stdout.toLowerCase()).toMatch(/no drift|drift: no/);
  });

  it('rk drift reports drift when source > registry', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'ahead', local_path: join(tmpDir, 'ahead') }) as number;
    setRepoPackageNames('o/ahead', { npm: '@scope/ahead' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    closeDb();

    mkdirSync(join(tmpDir, 'ahead'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'ahead', 'package.json'),
      JSON.stringify({ name: '@scope/ahead', version: '1.0.1' }),
      'utf-8'
    );

    const { code, stdout } = runCli(['drift', 'o/ahead']);
    // Default mode is exit 0 — drift is informational. --strict is required
    // for a non-zero exit, tested below.
    expect(code).toBe(0);
    expect(stdout).toMatch(/1\.0\.0/);
    expect(stdout).toMatch(/1\.0\.1/);
    expect(stdout.toLowerCase()).toMatch(/drift/);
  });

  it('rk drift --strict exits non-zero when drift is detected', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'ahead2', local_path: join(tmpDir, 'ahead2') }) as number;
    setRepoPackageNames('o/ahead2', { npm: '@scope/ahead2' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    closeDb();

    mkdirSync(join(tmpDir, 'ahead2'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'ahead2', 'package.json'),
      JSON.stringify({ name: '@scope/ahead2', version: '1.0.1' }),
      'utf-8'
    );

    const { code } = runCli(['drift', 'o/ahead2', '--strict']);
    expect(code).not.toBe(0);
  });

  // ─── rk bind-package ────────────────────────────────────────────────────

  it('rk bind-package --npm sets npm_package_name on the repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code, stdout } = runCli([
      'bind-package', 'o/r', '--npm', '@scope/r',
    ]);
    expect(code).toBe(0);
    expect(stdout.toLowerCase()).toMatch(/bound|set|updated/);

    // Verify the DB was actually updated
    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT npm_package_name FROM repos WHERE slug = ?'
    ).get('o/r') as { npm_package_name: string };
    expect(row.npm_package_name).toBe('@scope/r');
    closeDb();
  });

  it('rk bind-package --publisher-method rejects an invalid enum value (exit 2)', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code, stderr, stdout } = runCli([
      'bind-package', 'o/r', '--publisher-method', 'pypi_bogus',
    ]);
    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/publisher.method|invalid/i);
  });

  it('rk bind-package --pypi sets pypi_package_name on the repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'p' });
    closeDb();

    const { code } = runCli([
      'bind-package', 'o/p', '--pypi', 'p-py',
    ]);
    expect(code).toBe(0);

    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT pypi_package_name FROM repos WHERE slug = ?'
    ).get('o/p') as { pypi_package_name: string };
    expect(row.pypi_package_name).toBe('p-py');
    closeDb();
  });

  it('rk bind-package --publisher-method accepts a valid enum value', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code } = runCli([
      'bind-package', 'o/r', '--publisher-method', 'npm_trusted',
    ]);
    expect(code).toBe(0);

    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT publisher_method FROM repos WHERE slug = ?'
    ).get('o/r') as { publisher_method: string };
    expect(row.publisher_method).toBe('npm_trusted');
    closeDb();
  });
});
