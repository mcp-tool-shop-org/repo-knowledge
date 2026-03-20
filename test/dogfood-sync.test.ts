import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, getRepoIdBySlug,
} from '../src/db/init.js';
import { syncDogfood } from '../src/sync/dogfood.js';

let tmpDir: string;

const freshDate = new Date(Date.now() - 2 * 86400000).toISOString();
const staleDate = new Date(Date.now() - 60 * 86400000).toISOString();

function createFixtures(dir: string) {
  // Create index
  const indexDir = join(dir, 'indexes');
  mkdirSync(indexDir, { recursive: true });
  writeFileSync(
    join(indexDir, 'latest-by-repo.json'),
    JSON.stringify({
      'test-org/repo-a': {
        cli: {
          run_id: 'repo-a-1-1',
          verified: 'pass',
          verification_status: 'accepted',
          finished_at: freshDate,
          path: 'records/test-org/repo-a/run-1.json',
        },
      },
      'test-org/repo-b': {
        desktop: {
          run_id: 'repo-b-1-1',
          verified: 'fail',
          verification_status: 'accepted',
          finished_at: staleDate,
          path: 'records/test-org/repo-b/run-1.json',
        },
      },
      'test-org/repo-missing': {
        web: {
          run_id: 'missing-1-1',
          verified: 'pass',
          verification_status: 'accepted',
          finished_at: freshDate,
          path: 'records/test-org/repo-missing/run-1.json',
        },
      },
    }),
  );

  // Create policies
  const policiesDir = join(dir, 'policies', 'repos', 'mcp-tool-shop-org');
  mkdirSync(policiesDir, { recursive: true });
  writeFileSync(
    join(policiesDir, 'repo-a.yaml'),
    'repo: test-org/repo-a\nenforcement:\n  mode: required\n',
  );
  writeFileSync(
    join(policiesDir, 'repo-b.yaml'),
    'repo: test-org/repo-b\nenforcement:\n  mode: warn-only\n  reason: new repo\n',
  );
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-dogfood-'));
  const dbPath = join(tmpDir, 'test.db');
  openDb(dbPath);

  // Seed repos in DB
  upsertRepo({
    slug: 'test-org/repo-a',
    owner: 'test-org',
    name: 'repo-a',
  } as any);
  upsertRepo({
    slug: 'test-org/repo-b',
    owner: 'test-org',
    name: 'repo-b',
  } as any);
  // repo-missing is NOT in the DB — should be skipped
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('syncDogfood', () => {
  it('syncs facts from local dogfood-labs checkout', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createFixtures(fixtureDir);

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.repos).toBe(2);
    expect(result.facts_upserted).toBe(14); // 5 per surface + 2 rollup per repo = 7 * 2
    expect(result.skipped).toContain('test-org/repo-missing');
  });

  it('upserts correct facts for a passing repo', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createFixtures(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-a');
    const facts = db
      .prepare('SELECT fact_type, key, value FROM repo_facts WHERE repo_id = ? AND fact_type = ?')
      .all(repoId, 'dogfood') as { fact_type: string; key: string; value: string }[];

    const byKey = Object.fromEntries(facts.map((f) => [f.key, f.value]));

    expect(byKey['surface:cli:verified']).toBe('pass');
    expect(byKey['surface:cli:enforcement']).toBe('required');
    expect(byKey['surface:cli:run_id']).toBe('repo-a-1-1');
    expect(byKey['status']).toBe('pass');
    expect(byKey['surfaces']).toBe('cli');
    expect(Number(byKey['surface:cli:freshness_days'])).toBeLessThanOrEqual(2);
  });

  it('detects fail status for failing repo', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createFixtures(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-b');
    const status = db
      .prepare("SELECT value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood' AND key = 'status'")
      .get(repoId) as { value: string } | undefined;

    expect(status?.value).toBe('fail');
  });

  it('reads enforcement mode from policy YAML', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createFixtures(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-b');
    const enforcement = db
      .prepare("SELECT value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood' AND key = 'surface:desktop:enforcement'")
      .get(repoId) as { value: string } | undefined;

    expect(enforcement?.value).toBe('warn-only');
  });

  it('skips repos not in the database', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createFixtures(fixtureDir);

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.skipped).toEqual(['test-org/repo-missing']);
    expect(result.repos).toBe(2);
  });
});
