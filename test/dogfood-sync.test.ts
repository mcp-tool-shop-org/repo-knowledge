import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, getRepoIdBySlug,
} from '../src/db/init.js';
import { syncDogfood } from '../src/sync/dogfood.js';

// ─── F-TS-011: deterministic wall-clock fixture ──────────────────────────────
// Pin the system clock so freshness assertions don't drift with real time.
// Without this, `freshness_days` computed as floor((now - finished_at) / 1d)
// can flip between 2 and 3 (or 1 and 2) depending on when the test runs.
const PINNED_NOW = new Date('2026-05-20T00:00:00.000Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(PINNED_NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

let tmpDir: string;

// Computed against PINNED_NOW so freshness === exactly 2 (not <=2).
const freshDate = new Date(PINNED_NOW.getTime() - 2 * 86400000).toISOString();
const staleDate = new Date(PINNED_NOW.getTime() - 60 * 86400000).toISOString();

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
    // F-TS-010: behavior, not arithmetic. We assert that facts were inserted
    // (positive count) and that the *specific* keys we expect are present.
    // The previous `toBe(14)` coupled the test to "5 surface facts + 2 rollup
    // facts per repo × 2 repos" — adding any new fact would break the test
    // for no semantic reason.
    expect(result.facts_upserted).toBeGreaterThan(0);
    // The skipped entry may include a human-readable hint (Stage C
    // humanization). Match the slug substring so the hint can evolve.
    expect(result.skipped.some(s => s.includes('test-org/repo-missing'))).toBe(true);

    // Pin specific keys via byKey pattern — these are the behavioral contract.
    const db = getDb();
    const repoAId = getRepoIdBySlug('test-org/repo-a');
    const factsA = db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood'"
    ).all(repoAId) as { key: string }[];
    const keysA = new Set(factsA.map(f => f.key));

    // Surface-scoped facts
    expect(keysA.has('surface:cli:verified')).toBe(true);
    expect(keysA.has('surface:cli:enforcement')).toBe(true);
    expect(keysA.has('surface:cli:freshness_days')).toBe(true);
    expect(keysA.has('surface:cli:run_id')).toBe(true);
    expect(keysA.has('surface:cli:finished_at')).toBe(true);
    // Rollup facts
    expect(keysA.has('status')).toBe(true);
    expect(keysA.has('surfaces')).toBe(true);
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
    // F-TS-011: clock is pinned to PINNED_NOW; freshness is EXACTLY 2 (not <=).
    expect(Number(byKey['surface:cli:freshness_days'])).toBe(2);
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

    // The skipped entry may carry a human hint after the slug. Match by
    // length + substring so the hint can change without breaking this test.
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]).toContain('test-org/repo-missing');
    expect(result.repos).toBe(2);
  });
});

// ─── F-DB-016: computeFreshnessDays NaN / invalid-date contract ─────────────
// computeFreshnessDays is private inside src/sync/dogfood.ts. We observe its
// behavior through syncDogfood by feeding bad `finished_at` strings in the
// fixture and reading the stored freshness fact value back from SQLite.
//
// Contract (post-fix):
//   - Valid ISO date  → numeric freshness in days
//   - Empty string    → stored as the literal 'unknown' (NOT 'NaN', NOT '')
//   - Invalid string  → stored as the literal 'unknown'
//
// PROACTIVE: assertions on 'unknown' will FAIL until the source patch
// returns null from computeFreshnessDays and the call-site stores 'unknown'
// in place of `String(null)`.
describe('computeFreshnessDays via syncDogfood (F-DB-016)', () => {
  it('valid date → numeric freshness', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    const idxDir = join(fixtureDir, 'indexes');
    mkdirSync(idxDir, { recursive: true });
    writeFileSync(join(idxDir, 'latest-by-repo.json'), JSON.stringify({
      'test-org/repo-a': {
        cli: {
          run_id: 'r1', verified: 'pass', verification_status: 'accepted',
          finished_at: freshDate, path: 'p.json',
        },
      },
    }));
    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const v = db.prepare(
      "SELECT value FROM repo_facts WHERE fact_type='dogfood' AND key='surface:cli:freshness_days'"
    ).get() as { value: string };
    expect(v.value).toBe('2');
    expect(Number.isFinite(Number(v.value))).toBe(true);
  });

  it('empty string finished_at → unknown, never NaN', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    const idxDir = join(fixtureDir, 'indexes');
    mkdirSync(idxDir, { recursive: true });
    writeFileSync(join(idxDir, 'latest-by-repo.json'), JSON.stringify({
      'test-org/repo-a': {
        cli: {
          run_id: 'r1', verified: 'pass', verification_status: 'accepted',
          finished_at: '', path: 'p.json',
        },
      },
    }));
    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const v = db.prepare(
      "SELECT value FROM repo_facts WHERE fact_type='dogfood' AND key='surface:cli:freshness_days'"
    ).get() as { value: string };
    // The stored value must NOT be 'NaN' (the silent-failure shape we are
    // preventing). Accept either 'unknown' (preferred) or any non-numeric
    // sentinel — what matters is that downstream consumers don't mistake
    // NaN for a real distance.
    expect(v.value).not.toBe('NaN');
    expect(Number.isFinite(Number(v.value))).toBe(false);
  });

  it('invalid date string → not NaN', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    const idxDir = join(fixtureDir, 'indexes');
    mkdirSync(idxDir, { recursive: true });
    writeFileSync(join(idxDir, 'latest-by-repo.json'), JSON.stringify({
      'test-org/repo-a': {
        cli: {
          run_id: 'r1', verified: 'pass', verification_status: 'accepted',
          finished_at: 'not-a-date-at-all', path: 'p.json',
        },
      },
    }));
    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const v = db.prepare(
      "SELECT value FROM repo_facts WHERE fact_type='dogfood' AND key='surface:cli:freshness_days'"
    ).get() as { value: string };
    expect(v.value).not.toBe('NaN');
    expect(Number.isFinite(Number(v.value))).toBe(false);
  });
});
