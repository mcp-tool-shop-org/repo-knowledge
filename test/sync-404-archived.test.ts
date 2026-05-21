/**
 * FT-5: GitHub 404 → lifecycle_status='archived' + warning note.
 *
 * Strategy: vi.mock child_process so execFileSync emits canned `gh repo
 * list` output. We seed the DB with two previously-active repos, then
 * fire syncGitHub() against a mock that returns only one of them. The
 * vanished repo must flip to lifecycle_status='archived' and acquire a
 * warning note.
 *
 * Defense-in-depth: a sync with an EMPTY fetch result must NOT archive
 * anything (could be a rate-limit / auth failure / network blip, not
 * signal). That ambient-failure path is exercised in the second test.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    execFileSync: vi.fn(),
  };
});

import { execFileSync } from 'child_process';
import {
  openDb, closeDb, getDb, upsertRepo, getRepo,
} from '../src/db/init.js';
import { syncGitHub } from '../src/sync/github.js';

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;

let tmpDir: string;
let stdoutSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-gh404-'));
  openDb(join(tmpDir, 'test.db'));
  mockExecFileSync.mockReset();
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
  stdoutSpy.mockRestore();
  logSpy.mockRestore();
});

describe('syncGitHub vanished-repo archival (FT-5)', () => {
  it('archives a previously-active repo not returned by the GH fetch', () => {
    // Seed: two active repos under owner 'org'.
    upsertRepo({ owner: 'org', name: 'still-here', status: 'active' });
    upsertRepo({ owner: 'org', name: 'vanished',   status: 'active' });

    // Mock gh: returns only 'still-here'. 'vanished' is missing → archive candidate.
    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([
          {
            name: 'still-here',
            owner: { login: 'org' },
            description: 'survivor',
            url: 'https://github.com/org/still-here',
            isPrivate: false,
            isArchived: false,
            isFork: false,
            defaultBranchRef: { name: 'main' },
            stargazerCount: 0,
            forkCount: 0,
            createdAt: null,
            updatedAt: null,
            pushedAt: null,
            primaryLanguage: null,
            repositoryTopics: [],
            licenseInfo: null,
          },
        ]);
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    const result = syncGitHub(['org']);

    expect(result.synced).toBe(1);

    // 'still-here' should remain active.
    const stillHere = getRepo('org/still-here');
    expect(stillHere).not.toBeNull();
    expect(stillHere!.lifecycle_status).toBe('active');

    // 'vanished' should now be archived.
    const vanished = getRepo('org/vanished');
    expect(vanished).not.toBeNull();
    expect(vanished!.lifecycle_status).toBe('archived');
    expect(vanished!.deprecated_at).not.toBeNull();

    // Warning note attached.
    const notes = (vanished!.notes as Array<Record<string, unknown>>);
    const warning = notes.find(n => n.note_type === 'warning' && String(n.title).includes('GitHub 404'));
    expect(warning).toBeDefined();
    expect(String(warning!.content)).toMatch(/404 at \d{4}-\d{2}-\d{2}T/);
    expect(String(warning!.content)).toContain('rk delete org/vanished');
  });

  it('does NOT archive anything when the owner-level fetch returns empty (ambient failure)', () => {
    // Seed: two active repos.
    upsertRepo({ owner: 'org', name: 'a', status: 'active' });
    upsertRepo({ owner: 'org', name: 'b', status: 'active' });

    // Mock gh: returns empty array (rate limit, auth missing, etc.).
    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([]);
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    syncGitHub(['org']);

    // Both should still be active — empty fetch is treated as no signal,
    // not as "everything vanished."
    const a = getRepo('org/a');
    const b = getRepo('org/b');
    expect(a!.lifecycle_status).toBe('active');
    expect(b!.lifecycle_status).toBe('active');
  });

  it('does not archive repos belonging to OTHER owners not in this sync', () => {
    // 'org' has a vanished repo; 'untouched' has an unrelated repo
    // that must stay active because we're only syncing 'org'.
    upsertRepo({ owner: 'org', name: 'vanished', status: 'active' });
    upsertRepo({ owner: 'untouched', name: 'safe', status: 'active' });

    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list' && args[2] === 'org') {
        return JSON.stringify([
          {
            name: 'present',
            owner: { login: 'org' },
            description: 'a different repo',
            url: 'https://github.com/org/present',
            isPrivate: false,
            isArchived: false,
            isFork: false,
            defaultBranchRef: { name: 'main' },
            stargazerCount: 0,
            forkCount: 0,
            createdAt: null,
            updatedAt: null,
            pushedAt: null,
            primaryLanguage: null,
            repositoryTopics: [],
            licenseInfo: null,
          },
        ]);
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    syncGitHub(['org']);

    // 'untouched/safe' must not be archived even though it wasn't seen.
    const safe = getRepo('untouched/safe');
    expect(safe!.lifecycle_status).toBe('active');

    // 'org/vanished' SHOULD be archived (was active under the synced owner).
    const vanished = getRepo('org/vanished');
    expect(vanished!.lifecycle_status).toBe('archived');
  });

  it('does not re-archive a repo that is already archived (idempotent)', () => {
    // Seed: one repo, already archived.
    upsertRepo({ owner: 'org', name: 'already', status: 'active' });
    const db = getDb();
    db.prepare("UPDATE repos SET lifecycle_status = 'archived', deprecated_at = '2024-01-01' WHERE slug = 'org/already'").run();

    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([
          {
            name: 'fresh',
            owner: { login: 'org' },
            description: 'still here',
            url: 'https://github.com/org/fresh',
            isPrivate: false,
            isArchived: false,
            isFork: false,
            defaultBranchRef: { name: 'main' },
            stargazerCount: 0,
            forkCount: 0,
            createdAt: null,
            updatedAt: null,
            pushedAt: null,
            primaryLanguage: null,
            repositoryTopics: [],
            licenseInfo: null,
          },
        ]);
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    syncGitHub(['org']);

    // The snapshot only includes ACTIVE repos at start of sync — the
    // already-archived one was excluded from the priorActive set, so no
    // second archive pass fires and the deprecated_at timestamp is
    // preserved.
    const already = getRepo('org/already');
    expect(already!.lifecycle_status).toBe('archived');
    expect(already!.deprecated_at).toBe('2024-01-01');
    // No new warning notes should have been added.
    const notes = (already!.notes as Array<Record<string, unknown>>);
    const warnings = notes.filter(n => n.note_type === 'warning');
    expect(warnings.length).toBe(0);
  });
});
