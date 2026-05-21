/**
 * F-DB-014: parseRemote edge-case coverage.
 *
 * `parseRemote` is a private helper inside src/sync/local.ts that extracts
 * (owner, name) from a `git remote get-url origin` output string. It is not
 * exported, so we observe its behavior indirectly through `scanLocalRepo`:
 *
 *   - When parseRemote succeeds → returned `owner`/`name` match the parse.
 *   - When parseRemote fails (returns null) → scanLocalRepo falls back to
 *     `owner='local'`, `name=basename(repoPath)`.
 *
 * Each case below seeds a temp git repo, sets the origin URL to the test
 * input, then runs scanLocalRepo and asserts on the observable shape.
 *
 * Edge cases covered:
 *   - HTTPS with `.git` suffix
 *   - SSH (git@github.com:owner/name)
 *   - Owner with dots
 *   - Non-github host (should reject)
 *   - Trailing slash
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb } from '../src/db/init.js';
import { scanLocalRepo } from '../src/sync/local.js';

let tmpDir: string;

// Initialize a bare git repo at the given path with one commit and the
// supplied origin URL. The remote is set without contacting it (the URL
// is just a string in git config).
function makeGitRepo(repoPath: string, remoteUrl: string) {
  mkdirSync(repoPath, { recursive: true });
  // package.json so `detectTech` finds something — keeps scanLocalRepo from
  // looking weird, but not strictly necessary for parseRemote behavior.
  writeFileSync(
    join(repoPath, 'package.json'),
    JSON.stringify({ name: 'tmp', version: '0.0.0' }),
  );
  const opts = { cwd: repoPath, encoding: 'utf-8' as const, stdio: 'pipe' as const };
  execSync('git init -q', opts);
  // Identity needed even for non-committing operations on some systems.
  execSync('git config user.email "t@t.t"', opts);
  execSync('git config user.name "t"', opts);
  execSync(`git remote add origin "${remoteUrl}"`, opts);
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-pr-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

// All tests below require a working `git` binary. Skip the whole suite
// if git is not on PATH so that CI environments without git stay green.
function gitAvailable(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const describeIfGit = gitAvailable() ? describe : describe.skip;

describeIfGit('parseRemote (F-DB-014) — via scanLocalRepo', () => {
  it('parses https://github.com/owner/name.git', () => {
    const repo = join(tmpDir, 'r1');
    makeGitRepo(repo, 'https://github.com/owner-1/repo-1.git');
    const r = scanLocalRepo(repo);
    expect(r.owner).toBe('owner-1');
    expect(r.name).toBe('repo-1');
    expect(r.github_url).toBe('https://github.com/owner-1/repo-1');
  });

  it('parses git@github.com:owner/name (SSH, no .git suffix)', () => {
    const repo = join(tmpDir, 'r2');
    makeGitRepo(repo, 'git@github.com:owner-2/repo-2');
    const r = scanLocalRepo(repo);
    expect(r.owner).toBe('owner-2');
    expect(r.name).toBe('repo-2');
  });

  it('parses https://github.com/owner.with.dots/name', () => {
    const repo = join(tmpDir, 'r3');
    makeGitRepo(repo, 'https://github.com/owner.with.dots/repo-3');
    const r = scanLocalRepo(repo);
    expect(r.owner).toBe('owner.with.dots');
    expect(r.name).toBe('repo-3');
  });

  it('rejects non-github hosts (falls back to local/basename)', () => {
    const repo = join(tmpDir, 'mything');
    makeGitRepo(repo, 'https://notgithub.com/owner-4/repo-4');
    const r = scanLocalRepo(repo);
    // No github match → fallback to local + basename
    expect(r.owner).toBe('local');
    expect(r.name).toBe(basename(repo));
    expect(r.github_url).toBeNull();
  });

  it('parses URL with trailing slash without crashing', () => {
    const repo = join(tmpDir, 'r5');
    makeGitRepo(repo, 'https://github.com/owner-5/repo-5/');
    const r = scanLocalRepo(repo);
    // The regex stops at `/` so 'repo-5' is captured (trailing slash dropped).
    expect(r.owner).toBe('owner-5');
    expect(r.name).toBe('repo-5');
  });
});
