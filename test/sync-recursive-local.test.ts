/**
 * FT-5: scanDirectory recursive --local sweep.
 *
 * Sets up a fixture tree under tmpDir with three nested git repos at
 * varying depths plus a node_modules directory that must be pruned.
 * Asserts:
 *   - default depth (4) finds all three repos
 *   - node_modules is skipped (denylist)
 *   - non-git intermediate directories are descended INTO without being
 *     counted as repos
 *   - maxDepth=0 falls back to the legacy single-level behavior
 *   - scanner does NOT recurse INSIDE a found repo
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb } from '../src/db/init.js';
import { scanDirectory } from '../src/sync/local.js';

// local.ts imports readdirSync from 'fs' (a frozen ESM namespace, so vi.spyOn
// cannot redefine it). Mock the 'fs' module instead: every call delegates to
// the real implementation EXCEPT for a single path we flip to throw EACCES,
// letting us drive scanDirectory's error-aggregation branch deterministically
// and portably (no real chmod/EPERM needed). The hoisted holder lets the test
// arm/disarm the failing path; default '' never matches, so all other tests in
// this file see real fs behavior.
const fsMockState = vi.hoisted(() => ({ brokenPath: '' }));
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    readdirSync: ((p: Parameters<typeof actual.readdirSync>[0], opts: Parameters<typeof actual.readdirSync>[1]) => {
      if (typeof p === 'string' && p === fsMockState.brokenPath) {
        const err = new Error('EACCES: permission denied, scandir') as NodeJS.ErrnoException;
        err.code = 'EACCES';
        throw err;
      }
      return (actual.readdirSync as (...a: unknown[]) => unknown)(p, opts);
    }) as typeof actual.readdirSync,
  };
});

let tmpDir: string;

// Helper: write a minimal git-repo shape with a package.json so the
// ingest pipeline has something to chew on (it parses package.json
// for tech facts). The .git directory just needs to exist — its
// contents don't matter for the recursive-scan probe.
function fakeRepo(dir: string): void {
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(dir, '.git'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: dir.split(/[/\\]/).pop(), version: '0.0.0' }, null, 2),
    'utf-8'
  );
  writeFileSync(join(dir, 'README.md'), `# ${dir.split(/[/\\]/).pop()}`, 'utf-8');
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-recscan-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('scanDirectory recursive scan (FT-5)', () => {
  it('finds three nested repos at varying depths with the default depth (4)', () => {
    const root = join(tmpDir, 'workspace');

    // Repo 1 — depth 1 (immediate child of root).
    fakeRepo(join(root, 'alpha'));
    // Repo 2 — depth 2 (under a non-git intermediate).
    fakeRepo(join(root, 'projects', 'beta'));
    // Repo 3 — depth 3 (deeper nesting).
    fakeRepo(join(root, 'orgs', 'team-x', 'gamma'));

    const result = scanDirectory(root, { maxDepth: 4 });
    expect(result.scanned).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it('skips node_modules even when it contains a .git directory', () => {
    const root = join(tmpDir, 'with-nm');
    fakeRepo(join(root, 'real-repo'));
    // Simulate a node_modules with a .git inside (eg a vendored
    // module). Must NOT be scanned.
    mkdirSync(join(root, 'node_modules', 'package', '.git'), { recursive: true });

    const result = scanDirectory(root, { maxDepth: 4 });
    expect(result.scanned).toBe(1);
  });

  it('skips standard build / dep directories from the denylist', () => {
    const root = join(tmpDir, 'with-build');
    fakeRepo(join(root, 'real-repo'));
    // dist, target, vendor, .next, .astro — all should be pruned
    // even when they contain a .git directory.
    mkdirSync(join(root, 'dist', 'fake-repo', '.git'), { recursive: true });
    mkdirSync(join(root, 'target', 'fake-repo', '.git'), { recursive: true });
    mkdirSync(join(root, 'vendor', 'fake-repo', '.git'), { recursive: true });
    mkdirSync(join(root, '.next', 'fake-repo', '.git'), { recursive: true });
    mkdirSync(join(root, '.astro', 'fake-repo', '.git'), { recursive: true });

    const result = scanDirectory(root, { maxDepth: 4 });
    expect(result.scanned).toBe(1);
  });

  it('maxDepth=0 behaves like the legacy single-level scan', () => {
    const root = join(tmpDir, 'workspace');
    fakeRepo(join(root, 'top-repo'));
    fakeRepo(join(root, 'nested', 'inner-repo'));  // 2 levels deep

    const result = scanDirectory(root, { maxDepth: 0 });
    // Only top-repo at depth 1 is found; nested/inner-repo is skipped
    // because depth budget is exhausted.
    expect(result.scanned).toBe(1);
  });

  it('does NOT recurse INSIDE a found repo (no double-count of vendored sub-repos)', () => {
    const root = join(tmpDir, 'workspace');
    const outer = join(root, 'outer-repo');
    fakeRepo(outer);
    // A nested .git inside the outer repo (e.g., a git submodule) must
    // NOT be ingested as a separate repo.
    mkdirSync(join(outer, 'subdir', 'inner-vendored', '.git'), { recursive: true });

    const result = scanDirectory(root, { maxDepth: 5 });
    expect(result.scanned).toBe(1);
  });

  it('descends past non-git intermediates without counting them as repos', () => {
    const root = join(tmpDir, 'workspace');
    // Three levels of non-git directories, then the actual repo.
    fakeRepo(join(root, 'a', 'b', 'c', 'leaf-repo'));

    const result = scanDirectory(root, { maxDepth: 4 });
    expect(result.scanned).toBe(1);
  });

  it('records the error for a permission-denied subdir AND keeps scanning siblings (ts-A-007)', () => {
    const root = join(tmpDir, 'workspace');
    // A real repo sibling that must still be scanned despite the error.
    fakeRepo(join(root, 'good-repo'));
    // A non-git directory the walk will try to readdirSync to recurse
    // into — we make THAT one throw EACCES.
    const brokenDir = join(root, 'broken-dir');
    mkdirSync(brokenDir, { recursive: true });

    // Arm the mock to throw ONLY for brokenDir; everything else (root scan,
    // good-repo ingest) delegates to the real readdirSync. This drives the
    // error-aggregation branch in scanDirectory's walk() deterministically.
    fsMockState.brokenPath = brokenDir;
    try {
      const result = scanDirectory(root, { maxDepth: 4 });

      // The sibling repo was still ingested — the error did not halt the walk.
      expect(result.scanned).toBe(1);
      // The broken subdir is recorded in errors with its path + cause.
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain(brokenDir);
      expect(result.errors[0]).toMatch(/EACCES/);
    } finally {
      fsMockState.brokenPath = '';
    }
  });
});
