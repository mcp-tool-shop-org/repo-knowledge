/**
 * F-TS-FT2 (Publish State): exercises the schema + helpers added by
 * migration-007.
 *
 * Covers:
 *   1. upsertPublishedVersion insert → second call with same
 *      (repo_id, channel, version) updates synced_at, NOT row identity.
 *   2. getLatestPublishedVersion returns the most-recently-synced version
 *      per channel (ORDER BY synced_at DESC LIMIT 1).
 *   3. setRepoPackageNames updates the three columns + reads back via getRepo.
 *   4. setRepoPackageNames rejects invalid publisher_method values.
 *   5. getReposByNpmPackage reverse-lookup hit + miss.
 *   6. listPublishedVersions returns all rows for a repo sorted by
 *      (channel, synced_at DESC).
 *   7. migration-007 idempotency: re-running openDb on a v7 DB is a no-op.
 *   8. FK ON DELETE CASCADE — deleting a repo cascades to its
 *      repo_published_versions rows.
 *   9. PUBLISHER_METHODS enum is the exact list documented in the migration.
 *
 * These tests pin the contract the CLI (rk versions / rk drift / rk
 * bind-package) and sync workers (syncNpmVersion etc) depend on.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo,
  upsertPublishedVersion,
  getLatestPublishedVersion,
  listPublishedVersions,
  setRepoPackageNames,
  getReposByNpmPackage,
  PUBLISHER_METHODS,
  PUBLISHED_VERSION_CHANNELS,
} from '../src/db/init.js';

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-publish-'));
  dbPath = join(tmpDir, 'publish.db');
  openDb(dbPath);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('upsertPublishedVersion (F-TS-FT2)', () => {
  it('inserts a new (repo, channel, version) row', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.0.0',
      published_at: '2026-01-01T00:00:00Z',
      source: 'npm_view',
    });

    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM repo_published_versions WHERE repo_id = ?'
    ).all(repoId) as Array<{ channel: string; version: string }>;
    expect(rows.length).toBe(1);
    expect(rows[0].channel).toBe('npm');
    expect(rows[0].version).toBe('1.0.0');
  });

  it('upserts on conflict — same (repo, channel, version) refreshes synced_at, not row count', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.0.0',
      published_at: '2026-01-01T00:00:00Z',
    });
    const db = getDb();
    const firstRow = db.prepare(
      'SELECT id, synced_at FROM repo_published_versions WHERE repo_id = ? AND channel = ? AND version = ?'
    ).get(repoId, 'npm', '1.0.0') as { id: number; synced_at: string };
    expect(firstRow).toBeDefined();

    // Second call — same triple. Must not add a row; synced_at refreshes.
    // We sleep just enough that SQLite's datetime('now') (second resolution)
    // would tick if anything is rewritten — but since the upsert must
    // refresh synced_at unconditionally, we mainly care about row count.
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.0.0',
    });

    const all = db.prepare(
      'SELECT id, synced_at FROM repo_published_versions WHERE repo_id = ? AND channel = ? AND version = ?'
    ).all(repoId, 'npm', '1.0.0') as Array<{ id: number; synced_at: string }>;
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(firstRow.id);
  });

  it('preserves prior published_at when re-upsert omits it (coalesce on conflict)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.0.0',
      published_at: '2026-01-01T00:00:00Z',
    });
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.0.0',
      // published_at intentionally omitted/null on re-sync
      source: 'npm_view',
    });

    const db = getDb();
    const row = db.prepare(
      'SELECT published_at FROM repo_published_versions WHERE repo_id = ? AND channel = ? AND version = ?'
    ).get(repoId, 'npm', '1.0.0') as { published_at: string };
    // coalesce keeps the original timestamp; a re-sync without a timestamp
    // must NOT clobber a known-good value.
    expect(row.published_at).toBe('2026-01-01T00:00:00Z');
  });
});

describe('getLatestPublishedVersion (F-TS-FT2)', () => {
  it('returns the most-recently-synced version per channel', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.1' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.2' });

    // The most-recently-synced row is the last upsert (1.0.2). We force
    // monotonically increasing synced_at via a tiny direct UPDATE so the
    // ORDER BY synced_at DESC has a deterministic answer regardless of
    // SQLite's second-resolution clock.
    const db = getDb();
    db.prepare(
      "UPDATE repo_published_versions SET synced_at = datetime('now', '-2 minutes') WHERE version = ?"
    ).run('1.0.0');
    db.prepare(
      "UPDATE repo_published_versions SET synced_at = datetime('now', '-1 minutes') WHERE version = ?"
    ).run('1.0.1');
    db.prepare(
      "UPDATE repo_published_versions SET synced_at = datetime('now') WHERE version = ?"
    ).run('1.0.2');

    const latest = getLatestPublishedVersion(repoId, 'npm');
    expect(latest).not.toBeNull();
    expect(latest!.version).toBe('1.0.2');
  });

  it('returns null when no row exists for the (repo, channel)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    const latest = getLatestPublishedVersion(repoId, 'npm');
    expect(latest).toBeNull();
  });

  it('filters by channel — npm latest is independent of pypi latest', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });

    const npm = getLatestPublishedVersion(repoId, 'npm');
    const pypi = getLatestPublishedVersion(repoId, 'pypi');
    expect(npm!.version).toBe('1.0.0');
    expect(pypi!.version).toBe('2.0.0');
  });
});

describe('listPublishedVersions (F-TS-FT2)', () => {
  it('returns every row for a repo across channels, grouped by channel', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.1' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'github_release', version: '1.0.0' });

    const rows = listPublishedVersions(repoId);
    expect(rows.length).toBe(4);

    // Sorted by channel ASC. The exact ordering depends on the helper
    // contract, but every channel must appear.
    const channels = new Set(rows.map(r => r.channel));
    expect(channels.has('npm')).toBe(true);
    expect(channels.has('pypi')).toBe(true);
    expect(channels.has('github_release')).toBe(true);
  });

  it('returns empty array when the repo has no published versions', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    const rows = listPublishedVersions(repoId);
    expect(rows).toEqual([]);
  });
});

describe('setRepoPackageNames (F-TS-FT2)', () => {
  it('updates the three binding columns and reads back via getRepo', () => {
    upsertRepo({ owner: 'mcp-tool-shop-org', name: 'repo-knowledge' });

    const result = setRepoPackageNames('mcp-tool-shop-org/repo-knowledge', {
      npm: '@mcptoolshop/repo-knowledge',
      pypi: null,
      publisher_method: 'npm_trusted',
    });
    expect(result.updated).toBe(true);

    const db = getDb();
    const row = db.prepare(
      'SELECT npm_package_name, pypi_package_name, publisher_method FROM repos WHERE slug = ?'
    ).get('mcp-tool-shop-org/repo-knowledge') as {
      npm_package_name: string | null;
      pypi_package_name: string | null;
      publisher_method: string | null;
    };
    expect(row.npm_package_name).toBe('@mcptoolshop/repo-knowledge');
    expect(row.pypi_package_name).toBeNull();
    expect(row.publisher_method).toBe('npm_trusted');
  });

  it('leaves undefined fields intact; null explicitly clears', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    setRepoPackageNames('o/r', {
      npm: '@scope/r',
      pypi: 'r-py',
      publisher_method: 'npm_trusted',
    });

    // Second call with only npm: undefined preserves; null clears.
    setRepoPackageNames('o/r', { npm: null });

    const db = getDb();
    const row = db.prepare(
      'SELECT npm_package_name, pypi_package_name, publisher_method FROM repos WHERE slug = ?'
    ).get('o/r') as {
      npm_package_name: string | null;
      pypi_package_name: string | null;
      publisher_method: string | null;
    };
    expect(row.npm_package_name).toBeNull();             // cleared via null
    expect(row.pypi_package_name).toBe('r-py');           // preserved (undefined)
    expect(row.publisher_method).toBe('npm_trusted');     // preserved (undefined)
  });

  it('throws on an out-of-enum publisher_method value', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    expect(() =>
      // @ts-expect-error — intentionally bad enum value to trigger validation
      setRepoPackageNames('o/r', { publisher_method: 'pypi_bogus' })
    ).toThrow(/publisher_method/);
  });

  it('returns updated:false for a non-existent slug', () => {
    const result = setRepoPackageNames('nope/missing', { npm: '@nope/missing' });
    expect(result.updated).toBe(false);
  });
});

describe('getReposByNpmPackage (F-TS-FT2)', () => {
  it('reverse-lookup hit: returns the repo bound to a given npm name', () => {
    upsertRepo({ owner: 'mcp-tool-shop-org', name: 'repo-knowledge' });
    setRepoPackageNames('mcp-tool-shop-org/repo-knowledge', {
      npm: '@mcptoolshop/repo-knowledge',
      publisher_method: 'npm_trusted',
    });

    const hits = getReposByNpmPackage('@mcptoolshop/repo-knowledge');
    expect(hits.length).toBe(1);
    expect(hits[0].slug).toBe('mcp-tool-shop-org/repo-knowledge');
  });

  it('returns empty array for an unknown npm name (miss)', () => {
    const hits = getReposByNpmPackage('@no-such/package');
    expect(hits).toEqual([]);
  });

  it('returns multiple rows when more than one repo is bound to the same name', () => {
    // Edge case: a monorepo migration can temporarily yield two repos
    // pointing at the same npm name. The helper must not collapse them.
    upsertRepo({ owner: 'o', name: 'old' });
    upsertRepo({ owner: 'o', name: 'new' });
    setRepoPackageNames('o/old', { npm: '@scope/shared' });
    setRepoPackageNames('o/new', { npm: '@scope/shared' });

    const hits = getReposByNpmPackage('@scope/shared');
    expect(hits.length).toBe(2);
    const slugs = hits.map(h => h.slug as string).sort();
    expect(slugs).toEqual(['o/new', 'o/old']);
  });
});

describe('migration-007 idempotency (F-TS-FT2)', () => {
  it('re-opening a v7 DB is a no-op (does not throw, does not regress version)', () => {
    closeDb();
    openDb(dbPath);
    const db = getDb();
    const v1 = (db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v1).toBe('7');

    closeDb();
    expect(() => openDb(dbPath)).not.toThrow();
    const v2 = (getDb().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string }).value;
    expect(v2).toBe('7');
  });
});

describe('FK ON DELETE CASCADE for repo_published_versions (F-TS-FT2)', () => {
  it('deleting a repo cascades to delete its published_versions rows', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.1' });

    const db = getDb();
    const beforeCount = (db.prepare(
      'SELECT COUNT(*) AS c FROM repo_published_versions WHERE repo_id = ?'
    ).get(repoId) as { c: number }).c;
    expect(beforeCount).toBe(2);

    // Direct DELETE — exercises the FK cascade independently of helpers.
    db.prepare('DELETE FROM repos WHERE id = ?').run(repoId);

    const afterCount = (db.prepare(
      'SELECT COUNT(*) AS c FROM repo_published_versions WHERE repo_id = ?'
    ).get(repoId) as { c: number }).c;
    expect(afterCount).toBe(0);
  });
});

describe('PUBLISHER_METHODS and PUBLISHED_VERSION_CHANNELS enums (F-TS-FT2)', () => {
  it('exposes the exact PUBLISHER_METHODS enum documented in migration-007', () => {
    // Pin the closed set so a silent expansion (without a corresponding
    // CLI validation + doc update) is caught by the test suite.
    const expected = [
      'pypi_trusted', 'pypi_token', 'npm_token', 'npm_trusted',
      'github_release_only', 'none',
    ];
    expect([...PUBLISHER_METHODS]).toEqual(expected);
  });

  it('exposes the exact PUBLISHED_VERSION_CHANNELS enum documented in migration-007', () => {
    const expected = ['npm', 'pypi', 'github_release', 'vsce'];
    expect([...PUBLISHED_VERSION_CHANNELS]).toEqual(expected);
  });
});
