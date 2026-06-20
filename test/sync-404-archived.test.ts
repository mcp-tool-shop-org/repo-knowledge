/**
 * FT-5: GitHub vanished-repo detection + (opt-in) archival.
 *
 * Strategy: vi.mock child_process so execFileSync emits canned `gh repo
 * list` output. We seed the DB with previously-active repos, then fire
 * syncGitHub() against a mock that returns only some of them.
 *
 * sync-A-006 (deepened): archival is OPT-IN via `{ pruneVanished: true }`.
 * A routine sync only DETECTS vanished repos (reports them in
 * `result.vanished`) and NEVER mutates lifecycle state — listing-absence is
 * an ambiguous signal (a private repo invisible to an under-scoped token is
 * absent the same way a deleted one is). The archival tests below therefore
 * pass pruneVanished:true; the safe-default test asserts no mutation without it.
 *
 * Defense-in-depth: a sync with an EMPTY fetch result must NOT archive
 * anything (could be a rate-limit / auth failure / network blip, not signal).
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

    const result = syncGitHub(['org'], { pruneVanished: true });

    expect(result.synced).toBe(1);
    expect(result.vanished).toContain('org/vanished');

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
    const warning = notes.find(n => n.note_type === 'warning' && String(n.title).includes('GitHub listing absence'));
    expect(warning).toBeDefined();
    // sync-A-001: the note records only what we observed (absent from the
    // listing) at an ISO timestamp — it must NOT assert a 404 / deletion
    // for a repo that was never individually probed.
    expect(String(warning!.content)).toMatch(/at \d{4}-\d{2}-\d{2}T/);
    expect(String(warning!.content)).not.toMatch(/404/);
    expect(String(warning!.content)).not.toMatch(/may be deleted/);
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

    syncGitHub(['org'], { pruneVanished: true });

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

  it('does NOT archive a private prior-active repo omitted from the fetch (sync-A-001 / sync-A-006)', () => {
    // An under-scoped token (missing `repo` scope) returns only PUBLIC
    // repos and silently omits private ones. The private repo is active
    // and present on GitHub — archiving it would stamp a live repo
    // "may be deleted." Seed one private + one public repo; the fetch
    // returns only the public one.
    upsertRepo({ owner: 'org', name: 'pub-survivor', status: 'active', visibility: 'public' });
    upsertRepo({ owner: 'org', name: 'private-repo', status: 'active', visibility: 'private' });

    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        // Only the public repo is visible to this under-scoped token.
        return JSON.stringify([
          {
            name: 'pub-survivor',
            owner: { login: 'org' },
            description: 'visible',
            url: 'https://github.com/org/pub-survivor',
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

    // Even WITH archival opted in, a recorded-private repo is never archived
    // (defense-in-depth on top of the safe opt-in default).
    syncGitHub(['org'], { pruneVanished: true });

    // The private repo must remain active — visibility=private is the
    // guard that distinguishes "invisible to this token" from "vanished."
    const priv = getRepo('org/private-repo');
    expect(priv).not.toBeNull();
    expect(priv!.lifecycle_status).toBe('active');
    expect(priv!.deprecated_at).toBeNull();
    // And no warning note slandering a live private repo.
    const privNotes = (priv!.notes as Array<Record<string, unknown>>);
    expect(privNotes.filter(n => n.note_type === 'warning').length).toBe(0);

    // Sanity: the public survivor stays active too (it was returned).
    expect(getRepo('org/pub-survivor')!.lifecycle_status).toBe('active');
  });

  it('does NOT archive a repo whose stored slug differs only by casing (sync-A-004)', () => {
    // GitHub identity is case-insensitive. The DB holds the slug with
    // upper-case owner/name; the fetch returns lower-case. A naive
    // case-sensitive diff would see the stored slug as "vanished."
    upsertRepo({ owner: 'Org', name: 'CamelRepo', status: 'active', visibility: 'public' });

    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([
          {
            name: 'camelrepo',           // lower-cased name
            owner: { login: 'Org' },     // same owner as the snapshot key
            description: 'same repo, different casing',
            url: 'https://github.com/Org/camelrepo',
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

    syncGitHub(['Org'], { pruneVanished: true });

    // The original-cased row must stay active — the lower-cased fetch
    // result is the SAME repo, not a vanish.
    const stored = getRepo('Org/CamelRepo');
    expect(stored).not.toBeNull();
    expect(stored!.lifecycle_status).toBe('active');
    expect(stored!.deprecated_at).toBeNull();
  });

  it('DEFAULT sync (no --prune-vanished) detects but never archives a vanished repo (sync-A-006 deepened)', () => {
    // The surviving-HIGH scenario: a routine `rk sync` must not mutate
    // lifecycle state on listing-absence. The visibility guard was inert
    // because local-scanned repos store visibility='public' — so even a
    // genuinely-private repo absent from an under-scoped fetch looks public
    // here. The SAFE DEFAULT (no archival) protects it regardless of the
    // unreliable visibility column.
    upsertRepo({ owner: 'org', name: 'survivor', status: 'active', visibility: 'public' });
    // A locally-scanned private repo: stored as 'public' (the default), the
    // exact shape that defeated the old guard.
    upsertRepo({ owner: 'org', name: 'looks-public-is-private', status: 'active', visibility: 'public' });

    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([
          {
            name: 'survivor', owner: { login: 'org' }, description: 'returned',
            url: 'https://github.com/org/survivor', isPrivate: false, isArchived: false,
            isFork: false, defaultBranchRef: { name: 'main' }, stargazerCount: 0,
            forkCount: 0, createdAt: null, updatedAt: null, pushedAt: null,
            primaryLanguage: null, repositoryTopics: [], licenseInfo: null,
          },
        ]);
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    // NO pruneVanished flag — the default.
    const result = syncGitHub(['org']);

    // Detection still runs and reports the candidate...
    expect(result.vanished).toContain('org/looks-public-is-private');
    // ...but NOTHING is mutated: the repo stays active with no warning note.
    const repo = getRepo('org/looks-public-is-private');
    expect(repo!.lifecycle_status).toBe('active');
    expect(repo!.deprecated_at).toBeNull();
    expect((repo!.notes as Array<Record<string, unknown>>).filter(n => n.note_type === 'warning').length).toBe(0);
  });
});
