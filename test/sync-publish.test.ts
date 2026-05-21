/**
 * F-TS-FT2 (Sync publish workers): exercises the sync helpers in
 * src/sync/publish.ts. Heavily mocked — the helpers shell out to
 * `npm view` and `gh release list`, plus a PyPI HTTP fetch, and we
 * don't want test failures to depend on the network.
 *
 * Strategy:
 *   - vi.mock 'node:child_process' so execFileSync calls from
 *     syncNpmVersion / syncGitHubReleases return canned bytes.
 *   - vi.spyOn global.fetch for PyPI HTTP calls.
 *   - For network-failure paths the mocks throw / reject; we assert the
 *     helper returns [] AND logs to stderr (captured via
 *     vi.spyOn(console, 'error')).
 *
 * Signatures the helpers implement (pinned by these tests):
 *   syncNpmVersion(npm_name)         → PublishedVersionRecord[]   (sync)
 *   syncPyPIVersion(pypi_name)       → Promise<PublishedVersionRecord[]>
 *   syncGitHubReleases(owner, name)  → PublishedVersionRecord[]   (sync)
 *   syncPublishStateForRepo(id, row) → Promise<{ updated, errors }>
 *
 * Each PublishedVersionRecord = { channel, version, published_at, source }.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// vi.mock must be hoistable. We mock node:child_process so execFileSync
// inside src/sync/publish.ts returns canned bytes.
vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    execFileSync: vi.fn(),
  };
});

import { execFileSync } from 'child_process';
import {
  openDb, closeDb,
  upsertRepo,
  setRepoPackageNames,
  getLatestPublishedVersion,
  listPublishedVersions,
} from '../src/db/init.js';
import {
  syncNpmVersion,
  syncPyPIVersion,
  syncGitHubReleases,
  syncPublishStateForRepo,
} from '../src/sync/publish.js';

const mockExecFileSync = execFileSync as unknown as ReturnType<typeof vi.fn>;

let tmpDir: string;
let dbPath: string;
let stderrSpy: ReturnType<typeof vi.spyOn>;
let fetchSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-sync-publish-'));
  dbPath = join(tmpDir, 'sync.db');
  openDb(dbPath);
  mockExecFileSync.mockReset();
  stderrSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  // Default fetch mock — individual tests override.
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    throw new Error('fetch not configured for this test');
  });
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
  stderrSpy.mockRestore();
  fetchSpy.mockRestore();
});

// ─── syncNpmVersion ────────────────────────────────────────────────────────

describe('syncNpmVersion (F-TS-FT2)', () => {
  it('parses npm view --json output, skips created/modified, returns versions newest-first', () => {
    const npmJson = JSON.stringify({
      created: '2026-01-01T00:00:00Z',
      modified: '2026-03-25T00:00:00Z',
      '1.0.0': '2026-01-01T00:00:00Z',
      '1.0.1': '2026-02-01T00:00:00Z',
      '1.0.2': '2026-03-25T00:00:00Z',
    });
    mockExecFileSync.mockReturnValue(npmJson);

    const versions = syncNpmVersion('@mcptoolshop/repo-knowledge');

    expect(versions.length).toBe(3);
    // Most recent first (sorted DESC by published_at)
    expect(versions[0].version).toBe('1.0.2');
    expect(versions[2].version).toBe('1.0.0');
    // 'created' and 'modified' must NOT appear as version rows
    expect(versions.map(v => v.version)).not.toContain('created');
    expect(versions.map(v => v.version)).not.toContain('modified');
    // Channel field stamped on every row
    expect(versions.every(v => v.channel === 'npm')).toBe(true);
    // Source field stamped on every row
    expect(versions.every(v => v.source === 'npm_view')).toBe(true);
  });

  it('returns [] and logs to stderr on npm view failure', () => {
    mockExecFileSync.mockImplementation(() => {
      throw new Error('npm ERR! 404 Not Found');
    });

    const versions = syncNpmVersion('@nonexistent/package');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('handles empty registry response (no versions yet)', () => {
    mockExecFileSync.mockReturnValue(
      JSON.stringify({ created: '2026-01-01T00:00:00Z', modified: '2026-01-01T00:00:00Z' })
    );
    const versions = syncNpmVersion('@brand-new/package');
    expect(versions).toEqual([]);
  });

  it('rejects invalid npm package name shape with stderr log', () => {
    const versions = syncNpmVersion('bad name with spaces');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('handles malformed JSON from npm view (treats as empty)', () => {
    mockExecFileSync.mockReturnValue('not json');
    const versions = syncNpmVersion('@scope/pkg');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });
});

// ─── syncPyPIVersion ──────────────────────────────────────────────────────

describe('syncPyPIVersion (F-TS-FT2)', () => {
  it('parses PyPI JSON shape — versions from `releases` keys with upload_time_iso_8601', async () => {
    const pypiJson = {
      info: { name: 'repo-knowledge' },
      releases: {
        '1.0.0': [{ upload_time_iso_8601: '2026-01-01T00:00:00.000000Z' }],
        '1.0.1': [{ upload_time_iso_8601: '2026-02-01T00:00:00.000000Z' }],
        '1.0.2': [{ upload_time_iso_8601: '2026-03-25T00:00:00.000000Z' }],
      },
    };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => pypiJson,
    } as Response);

    const versions = await syncPyPIVersion('repo-knowledge');

    expect(versions.length).toBe(3);
    const allVersions = versions.map(v => v.version);
    expect(allVersions).toContain('1.0.0');
    expect(allVersions).toContain('1.0.1');
    expect(allVersions).toContain('1.0.2');
    // Channel field stamped on every row
    expect(versions.every(v => v.channel === 'pypi')).toBe(true);
  });

  it('returns [] and logs to stderr on PyPI 404', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not Found' }),
    } as Response);

    const versions = await syncPyPIVersion('no-such-package');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('returns [] and logs to stderr when fetch itself throws', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('ECONNRESET'));

    const versions = await syncPyPIVersion('repo-knowledge');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('handles releases with empty dist arrays (yanked versions) gracefully', () => {
    // Some old PyPI entries have empty release arrays. Helper records
    // the version with null published_at rather than skip or throw.
    const pypiJson = {
      info: { name: 'p' },
      releases: {
        '0.1.0': [],
        '0.2.0': [{ upload_time_iso_8601: '2026-02-01T00:00:00Z' }],
      },
    };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => pypiJson,
    } as Response);

    return syncPyPIVersion('p').then(versions => {
      expect(versions.map(v => v.version).sort()).toEqual(['0.1.0', '0.2.0']);
      // Empty dist → published_at = null
      const yanked = versions.find(v => v.version === '0.1.0');
      expect(yanked!.published_at).toBeNull();
    });
  });

  it('rejects invalid PyPI package name shape', async () => {
    const versions = await syncPyPIVersion('bad name');
    expect(versions).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });
});

// ─── syncGitHubReleases ───────────────────────────────────────────────────

describe('syncGitHubReleases (F-TS-FT2)', () => {
  it('parses gh release list output and strips leading `v` from tagName', () => {
    const ghJson = JSON.stringify([
      { tagName: 'v1.0.2', publishedAt: '2026-03-25T10:00:00Z', name: '1.0.2' },
      { tagName: 'v1.0.1', publishedAt: '2026-02-01T10:00:00Z', name: '1.0.1' },
      { tagName: '1.0.0', publishedAt: '2026-01-01T10:00:00Z', name: '1.0.0' },
    ]);
    mockExecFileSync.mockReturnValue(ghJson);

    const releases = syncGitHubReleases('mcp-tool-shop-org', 'repo-knowledge');

    expect(releases.length).toBe(3);
    // `v` prefix stripped on all rows
    expect(releases.every(r => !r.version.startsWith('v'))).toBe(true);
    const tags = releases.map(r => r.version);
    expect(tags).toContain('1.0.0');
    expect(tags).toContain('1.0.1');
    expect(tags).toContain('1.0.2');
    // Channel + source stamped
    expect(releases.every(r => r.channel === 'github_release')).toBe(true);
    expect(releases.every(r => r.source === 'gh_release')).toBe(true);
  });

  it('returns [] and logs to stderr on gh failure', () => {
    mockExecFileSync.mockImplementation(() => {
      throw new Error('gh: command not found');
    });

    const releases = syncGitHubReleases('o', 'r');
    expect(releases).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('handles empty release list', () => {
    mockExecFileSync.mockReturnValue('[]');
    const releases = syncGitHubReleases('o', 'empty');
    expect(releases).toEqual([]);
  });

  it('handles invalid JSON from gh (logs and returns [])', () => {
    mockExecFileSync.mockReturnValue('not json');
    const releases = syncGitHubReleases('o', 'r');
    expect(releases).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });

  it('rejects invalid GitHub owner shape', () => {
    const releases = syncGitHubReleases('bad owner with spaces', 'r');
    expect(releases).toEqual([]);
    expect(stderrSpy).toHaveBeenCalled();
  });
});

// ─── syncPublishStateForRepo ──────────────────────────────────────────────

describe('syncPublishStateForRepo (F-TS-FT2)', () => {
  it('upserts npm versions when npm_package_name binding is set', async () => {
    const repoId = upsertRepo({ owner: 'mcp-tool-shop-org', name: 'repo-knowledge' }) as number;
    setRepoPackageNames('mcp-tool-shop-org/repo-knowledge', {
      npm: '@mcptoolshop/repo-knowledge',
    });

    const npmJson = JSON.stringify({
      created: '2026-01-01T00:00:00Z',
      modified: '2026-03-25T00:00:00Z',
      '1.0.5': '2026-03-25T00:00:00Z',
    });
    mockExecFileSync.mockImplementation((file: string, args: readonly string[]) => {
      if (args.includes('release')) return '[]';            // gh release list
      return npmJson;                                        // npm view
    });
    fetchSpy.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) } as Response);

    const summary = await syncPublishStateForRepo(repoId, {
      owner: 'mcp-tool-shop-org',
      name: 'repo-knowledge',
      npm_package_name: '@mcptoolshop/repo-knowledge',
    });

    expect(summary.updated).toBeGreaterThan(0);
    const latest = getLatestPublishedVersion(repoId, 'npm');
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe('1.0.5');
  });

  it('upserts pypi versions when pypi_package_name binding is set', async () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;

    // gh release list will be called (owner+name set) — return empty.
    mockExecFileSync.mockReturnValue('[]');

    const pypiJson = {
      info: { name: 'r' },
      releases: { '0.1.0': [{ upload_time_iso_8601: '2026-01-01T00:00:00Z' }] },
    };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => pypiJson,
    } as Response);

    const summary = await syncPublishStateForRepo(repoId, {
      owner: 'o',
      name: 'r',
      pypi_package_name: 'r',
    });

    expect(summary.updated).toBeGreaterThan(0);
    const latest = getLatestPublishedVersion(repoId, 'pypi');
    expect(latest!.version).toBe('0.1.0');
  });

  it('upserts github_release versions whenever owner+name are present', async () => {
    const repoId = upsertRepo({ owner: 'mcp-tool-shop-org', name: 'repo-knowledge' }) as number;
    const ghJson = JSON.stringify([
      { tagName: 'v1.0.5', publishedAt: '2026-03-25T10:00:00Z', name: '1.0.5' },
    ]);
    mockExecFileSync.mockReturnValue(ghJson);

    const summary = await syncPublishStateForRepo(repoId, {
      owner: 'mcp-tool-shop-org',
      name: 'repo-knowledge',
    });

    expect(summary.updated).toBeGreaterThan(0);
    const latest = getLatestPublishedVersion(repoId, 'github_release');
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe('1.0.5');
  });

  it('does not crash when no bindings + no owner/name (returns updated=0)', async () => {
    const repoId = upsertRepo({ owner: 'o', name: 'unbound' }) as number;
    // Pass a binding row with no owner/name/npm/pypi — nothing to sync.
    const summary = await syncPublishStateForRepo(repoId, {});
    expect(summary.updated).toBe(0);
    expect(summary.errors).toEqual([]);
  });

  it('collects per-channel errors without throwing when one channel fails', async () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    // npm view throws; gh release list returns valid empty.
    mockExecFileSync.mockImplementation((file: string, args: readonly string[]) => {
      if (args.includes('release')) return '[]';
      throw new Error('npm broken');
    });

    const summary = await syncPublishStateForRepo(repoId, {
      owner: 'o',
      name: 'r',
      npm_package_name: '@scope/r',
    });

    // npm failure is logged to stderr via the helper; the orchestrator
    // returns gracefully — no throw.
    expect(summary).toBeDefined();
    expect(summary.errors).toBeInstanceOf(Array);
  });
});

// ─── DB writes via published-version sync ─────────────────────────────────

describe('Sync end-to-end writes (F-TS-FT2)', () => {
  it('listPublishedVersions reflects rows written by syncPublishStateForRepo', async () => {
    const repoId = upsertRepo({ owner: 'mcp-tool-shop-org', name: 'r' }) as number;
    const npmJson = JSON.stringify({
      created: '2026-01-01T00:00:00Z',
      modified: '2026-03-25T00:00:00Z',
      '1.0.0': '2026-01-01T00:00:00Z',
      '1.0.1': '2026-02-01T00:00:00Z',
    });
    mockExecFileSync.mockImplementation((file: string, args: readonly string[]) => {
      if (args.includes('release')) return '[]';
      return npmJson;
    });
    fetchSpy.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) } as Response);

    await syncPublishStateForRepo(repoId, {
      owner: 'mcp-tool-shop-org',
      name: 'r',
      npm_package_name: '@mcptoolshop/r',
    });

    const all = listPublishedVersions(repoId);
    const npmRows = all.filter(r => r.channel === 'npm');
    expect(npmRows.length).toBe(2);
  });
});
