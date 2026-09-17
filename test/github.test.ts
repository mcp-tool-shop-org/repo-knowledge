/**
 * Dedicated vitest for src/sync/github.ts (STUDY-RK-024).
 *
 * HARD: GitHub metadata only. execFileSync is mocked so `gh repo list` /
 * `gh api …/releases` return canned JSON — never a live GitHub call, never
 * a source-tree checkout, never a Contents/blob fetch.
 *
 * Existing test/sync-404-archived.test.ts remains the integration suite for
 * vanished-repo archival / channel / truncation. This file owns the module
 * exports: fetchGitHubRepos (incl. malformed degrade), fetchReleases,
 * syncGitHub(+pruneVanished / includeReleases), and validateGhIdentifier
 * (unexported; locked via the public wrappers).
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
import { openDb, closeDb, upsertRepo, getRepo } from '../src/db/init.js';
import { fetchGitHubRepos, fetchReleases, syncGitHub } from '../src/sync/github.js';

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;

let tmpDir: string;
let stdoutSpy: ReturnType<typeof vi.spyOn>;
let stderrSpy: ReturnType<typeof vi.spyOn>;
let logSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

function ghRepo(name: string, owner = 'org', extras: Record<string, unknown> = {}) {
  return {
    name,
    owner: { login: owner },
    description: extras.description ?? name,
    url: extras.url ?? `https://github.com/${owner}/${name}`,
    isPrivate: extras.isPrivate ?? false,
    isArchived: extras.isArchived ?? false,
    isFork: extras.isFork ?? false,
    defaultBranchRef: extras.defaultBranchRef ?? { name: 'main' },
    stargazerCount: extras.stargazerCount ?? 0,
    forkCount: extras.forkCount ?? 0,
    createdAt: extras.createdAt ?? null,
    updatedAt: extras.updatedAt ?? null,
    pushedAt: extras.pushedAt ?? null,
    primaryLanguage: extras.primaryLanguage ?? null,
    repositoryTopics: extras.repositoryTopics ?? [],
    licenseInfo: extras.licenseInfo ?? null,
    ...extras,
  };
}

function mockRepoList(payload: unknown) {
  mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
    if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
      return typeof payload === 'string' ? payload : JSON.stringify(payload);
    }
    throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
  });
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-github-'));
  openDb(join(tmpDir, 'test.db'));
  mockExecFileSync.mockReset();
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

// ─── fetchGitHubRepos ─────────────────────────────────────────────────────

describe('fetchGitHubRepos', () => {
  it('maps a mocked gh repo list JSON array into GitHubRepo records', () => {
    mockRepoList([
      ghRepo('catalog', 'acme', {
        description: 'metadata catalog',
        isPrivate: false,
        stargazerCount: 3,
        forkCount: 1,
        defaultBranchRef: { name: 'trunk' },
        primaryLanguage: { name: 'TypeScript' },
        repositoryTopics: ['mcp', { name: 'catalog' }],
        licenseInfo: { spdxId: 'MIT', key: 'mit' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
        pushedAt: '2026-03-01T00:00:00Z',
      }),
    ]);

    const repos = fetchGitHubRepos('acme');

    expect(mockExecFileSync).toHaveBeenCalledWith(
      'gh',
      expect.arrayContaining(['repo', 'list', 'acme', '--limit', '200', '--json']),
      expect.objectContaining({ encoding: 'utf-8' }),
    );
    expect(repos).toHaveLength(1);
    expect(repos[0]).toMatchObject({
      owner: 'acme',
      name: 'catalog',
      github_url: 'https://github.com/acme/catalog',
      description: 'metadata catalog',
      visibility: 'public',
      archived: false,
      is_fork: false,
      default_branch: 'trunk',
      stars: 3,
      forks: 1,
      license: 'MIT',
      topics: ['mcp', 'catalog'],
      primary_language: 'TypeScript',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
      pushed_at: '2026-03-01T00:00:00Z',
    });
    expect(repos[0].languages).toEqual({});
  });

  it('honors opts.limit on the gh argv and maps isPrivate → visibility private', () => {
    mockRepoList([ghRepo('secret', 'acme', { isPrivate: true })]);

    const repos = fetchGitHubRepos('acme', { limit: 25 });

    const argv = mockExecFileSync.mock.calls[0][1] as string[];
    expect(argv).toContain('--limit');
    expect(argv[argv.indexOf('--limit') + 1]).toBe('25');
    expect(repos[0].visibility).toBe('private');
  });

  it('falls back to licenseInfo.key and default_branch main when optional fields are absent', () => {
    mockRepoList([
      {
        name: 'bare',
        owner: {},
        isPrivate: false,
        licenseInfo: { key: 'apache-2.0' },
      },
    ]);

    const repos = fetchGitHubRepos('acme');
    expect(repos[0].owner).toBe('acme');
    expect(repos[0].license).toBe('apache-2.0');
    expect(repos[0].default_branch).toBe('main');
    expect(repos[0].topics).toEqual([]);
    expect(repos[0].primary_language).toBeNull();
  });

  it('degrades to [] and logs stderr when gh returns malformed JSON (F-DB-017)', () => {
    mockRepoList('not-json{');

    const repos = fetchGitHubRepos('acme');
    expect(repos).toEqual([]);
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Failed to parse repos JSON for acme/);
  });

  it('degrades to [] when gh returns a JSON object instead of an array', () => {
    mockRepoList({ name: 'not-an-array' });

    const repos = fetchGitHubRepos('acme');
    expect(repos).toEqual([]);
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/expected array, got object/);
  });

  it('degrades to [] when execFileSync throws (ambient gh failure)', () => {
    mockExecFileSync.mockImplementation(() => {
      throw new Error('gh: command not found');
    });

    const repos = fetchGitHubRepos('acme');
    expect(repos).toEqual([]);
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Failed to fetch repos for acme/);
  });
});

// ─── validateGhIdentifier (via public wrappers) ───────────────────────────

describe('validateGhIdentifier (via fetchGitHubRepos / fetchReleases)', () => {
  it('rejects an owner containing spaces before gh is spawned', () => {
    expect(() => fetchGitHubRepos('bad owner')).toThrow(/Invalid GitHub owner/);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('rejects an owner containing a semicolon', () => {
    expect(() => fetchGitHubRepos('org;rm')).toThrow(/Invalid GitHub owner/);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('rejects an empty owner', () => {
    expect(() => fetchGitHubRepos('')).toThrow(/GitHub owner is required/);
    expect(mockExecFileSync).not.toHaveBeenCalled();
  });

  it('allows A-Z / a-z / 0-9 / "." / "-" / "_" owners through to gh', () => {
    mockRepoList([]);
    expect(fetchGitHubRepos('Acme_org.1-2')).toEqual([]);
    expect(mockExecFileSync).toHaveBeenCalledWith(
      'gh',
      expect.arrayContaining(['repo', 'list', 'Acme_org.1-2']),
      expect.any(Object),
    );
  });

  it('fetchReleases rejects a spaced name without throwing (caught → [])', () => {
    const releases = fetchReleases('acme', 'bad name');
    expect(releases).toEqual([]);
    expect(mockExecFileSync).not.toHaveBeenCalled();
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Invalid GitHub name/);
  });

  it('fetchReleases rejects a semicolon in owner without throwing', () => {
    const releases = fetchReleases('acme;id', 'repo');
    expect(releases).toEqual([]);
    expect(mockExecFileSync).not.toHaveBeenCalled();
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Invalid GitHub owner/);
  });
});

// ─── fetchReleases ────────────────────────────────────────────────────────

describe('fetchReleases', () => {
  it('parses gh --jq one-object-per-line metadata (no source blobs)', () => {
    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'api' && args[1] === 'repos/acme/catalog/releases') {
        expect(args).toContain('--jq');
        return [
          JSON.stringify({
            tag_name: 'v1.2.0',
            name: '1.2.0',
            body: 'notes',
            prerelease: false,
            published_at: '2026-04-01T00:00:00Z',
          }),
          JSON.stringify({
            tag_name: 'v1.1.0-rc',
            name: 'rc',
            body: '',
            prerelease: true,
            published_at: '2026-03-01T00:00:00Z',
          }),
        ].join('\n');
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    const releases = fetchReleases('acme', 'catalog');
    expect(releases).toEqual([
      {
        tag: 'v1.2.0',
        title: '1.2.0',
        body: 'notes',
        prerelease: false,
        published_at: '2026-04-01T00:00:00Z',
      },
      {
        tag: 'v1.1.0-rc',
        title: 'rc',
        body: '',
        prerelease: true,
        published_at: '2026-03-01T00:00:00Z',
      },
    ]);
  });

  it('skips a single malformed line and keeps the rest (F-DB-018)', () => {
    mockExecFileSync.mockReturnValue(
      [
        '{"tag_name":"v1.0.0","name":"ok","body":"","prerelease":false,"published_at":"2026-01-01T00:00:00Z"}',
        'not-json',
        '{"tag_name":"v0.9.0","name":"older","body":"","prerelease":false,"published_at":"2025-12-01T00:00:00Z"}',
      ].join('\n'),
    );

    const releases = fetchReleases('acme', 'catalog');
    expect(releases.map((r) => r.tag)).toEqual(['v1.0.0', 'v0.9.0']);
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Skipped malformed release JSON line for acme\/catalog/);
  });

  it('returns [] on blank gh output', () => {
    mockExecFileSync.mockReturnValue('   \n');
    expect(fetchReleases('acme', 'catalog')).toEqual([]);
  });

  it('returns [] and logs stderr when gh api throws', () => {
    mockExecFileSync.mockImplementation(() => {
      throw new Error('HTTP 404');
    });
    expect(fetchReleases('acme', 'catalog')).toEqual([]);
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/Failed to fetch releases for acme\/catalog/);
  });
});

// ─── syncGitHub ───────────────────────────────────────────────────────────

describe('syncGitHub', () => {
  it('upserts metadata repos, topics, and primary-language facts from mocked gh JSON', () => {
    mockRepoList([
      ghRepo('catalog', 'acme', {
        description: 'synced',
        primaryLanguage: { name: 'TypeScript' },
        repositoryTopics: ['mcp'],
      }),
    ]);

    const result = syncGitHub(['acme']);
    expect(result.synced).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.vanished).toEqual([]);

    const repo = getRepo('acme/catalog');
    expect(repo).not.toBeNull();
    expect(repo!.description).toBe('synced');
    expect(repo!.topics).toContain('mcp');
    const lang = (repo!.facts as Array<{ fact_type: string; key: string; value: string }>)
      .find((f) => f.fact_type === 'language' && f.key === 'primary');
    expect(lang?.value).toBe('TypeScript');
  });

  it('skips forks unless includeForks is set', () => {
    mockRepoList([
      ghRepo('lib', 'acme'),
      ghRepo('forked', 'acme', { isFork: true }),
    ]);

    const skipped = syncGitHub(['acme']);
    expect(skipped.synced).toBe(1);
    expect(skipped.skipped).toBe(1);
    expect(getRepo('acme/lib')).not.toBeNull();
    expect(getRepo('acme/forked')).toBeNull();

    mockExecFileSync.mockClear();
    mockRepoList([
      ghRepo('lib', 'acme'),
      ghRepo('forked', 'acme', { isFork: true }),
    ]);
    const included = syncGitHub(['acme'], { includeForks: true });
    expect(included.synced).toBe(2);
    expect(included.skipped).toBe(0);
    expect(getRepo('acme/forked')).not.toBeNull();
  });

  it('does not call fetchReleases unless includeReleases is set', () => {
    mockRepoList([ghRepo('catalog', 'acme')]);

    syncGitHub(['acme']);

    const apiCalls = mockExecFileSync.mock.calls.filter(
      (c) => c[0] === 'gh' && Array.isArray(c[1]) && (c[1] as string[])[0] === 'api',
    );
    expect(apiCalls).toHaveLength(0);
    expect(getRepo('acme/catalog')!.releases).toEqual([]);
  });

  it('fetches release metadata and upserts it when includeReleases is true', () => {
    mockExecFileSync.mockImplementation((cmd: string, args: string[]) => {
      if (cmd === 'gh' && args[0] === 'repo' && args[1] === 'list') {
        return JSON.stringify([ghRepo('catalog', 'acme')]);
      }
      if (cmd === 'gh' && args[0] === 'api' && args[1] === 'repos/acme/catalog/releases') {
        expect(args).toEqual(expect.arrayContaining(['--jq']));
        return JSON.stringify({
          tag_name: 'v2.0.0',
          name: 'two',
          body: 'release notes (metadata, not a source blob)',
          prerelease: false,
          published_at: '2026-05-01T00:00:00Z',
        });
      }
      throw new Error(`unexpected exec: ${cmd} ${args.join(' ')}`);
    });

    const result = syncGitHub(['acme'], { includeReleases: true });
    expect(result.synced).toBe(1);
    expect(result.errors).toEqual([]);

    const releases = getRepo('acme/catalog')!.releases as Array<{ tag: string; title: string }>;
    expect(releases).toHaveLength(1);
    expect(releases[0].tag).toBe('v2.0.0');
    expect(releases[0].title).toBe('two');
  });

  it('DEFAULT (no pruneVanished) detects vanished slugs but does not archive them', () => {
    upsertRepo({ owner: 'acme', name: 'still-here', status: 'active' });
    upsertRepo({ owner: 'acme', name: 'gone', status: 'active' });
    mockRepoList([ghRepo('still-here', 'acme')]);

    const result = syncGitHub(['acme']);
    expect(result.vanished).toContain('acme/gone');
    expect(getRepo('acme/gone')!.lifecycle_status).toBe('active');
    expect(getRepo('acme/gone')!.deprecated_at).toBeNull();
  });

  it('archives vanished public repos only when pruneVanished is true', () => {
    upsertRepo({ owner: 'acme', name: 'still-here', status: 'active', visibility: 'public' });
    upsertRepo({ owner: 'acme', name: 'gone', status: 'active', visibility: 'public' });
    mockRepoList([ghRepo('still-here', 'acme')]);

    const result = syncGitHub(['acme'], { pruneVanished: true });
    expect(result.synced).toBe(1);
    expect(result.vanished).toContain('acme/gone');
    expect(getRepo('acme/still-here')!.lifecycle_status).toBe('active');
    expect(getRepo('acme/gone')!.lifecycle_status).toBe('archived');
    expect(getRepo('acme/gone')!.deprecated_at).not.toBeNull();
  });

  it('treats an empty listing as ambient failure — no vanish detection, no archive', () => {
    upsertRepo({ owner: 'acme', name: 'kept', status: 'active' });
    mockRepoList([]);

    const result = syncGitHub(['acme'], { pruneVanished: true });
    expect(result.vanished).toEqual([]);
    expect(getRepo('acme/kept')!.lifecycle_status).toBe('active');
  });

  it('does not archive a recorded-private vanished repo even under pruneVanished', () => {
    upsertRepo({ owner: 'acme', name: 'visible', status: 'active', visibility: 'public' });
    upsertRepo({ owner: 'acme', name: 'hidden', status: 'active', visibility: 'private' });
    mockRepoList([ghRepo('visible', 'acme')]);

    const result = syncGitHub(['acme'], { pruneVanished: true });
    expect(result.vanished).toContain('acme/hidden');
    expect(getRepo('acme/hidden')!.lifecycle_status).toBe('active');
  });

  it('does not treat case-only slug drift as vanished (sync-A-004)', () => {
    upsertRepo({ owner: 'Acme', name: 'Catalog', status: 'active', visibility: 'public' });
    mockRepoList([ghRepo('catalog', 'Acme')]);

    const result = syncGitHub(['Acme'], { pruneVanished: true });
    expect(result.vanished).toEqual([]);
    expect(getRepo('Acme/Catalog')!.lifecycle_status).toBe('active');
  });

  it('suppresses pruneVanished archival when the listing hits the limit (SYNC-PH-04)', () => {
    upsertRepo({ owner: 'acme', name: 'p1', status: 'active' });
    upsertRepo({ owner: 'acme', name: 'p2', status: 'active' });
    upsertRepo({ owner: 'acme', name: 'past-cutoff', status: 'active' });
    mockRepoList([ghRepo('p1', 'acme'), ghRepo('p2', 'acme')]);

    syncGitHub(['acme'], { pruneVanished: true, limit: 2 });
    expect(getRepo('acme/past-cutoff')!.lifecycle_status).toBe('active');
    const stderr = errorSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(stderr).toMatch(/truncated/i);
  });

  it('writes progress to stderr, never stdout', () => {
    mockRepoList([ghRepo('catalog', 'acme')]);
    syncGitHub(['acme']);

    const stderrLines = errorSpy.mock.calls.map((c) => String(c[0]));
    expect(stderrLines.some((l) => l.includes('Syncing acme...'))).toBe(true);
    expect(stderrSpy.mock.calls.map((c) => String(c[0]))).toContain('.');
    expect(stdoutSpy.mock.calls.map((c) => String(c[0]))).not.toContain('.');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
