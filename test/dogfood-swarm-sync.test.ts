import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import {
  openDb, closeDb, getDb,
  upsertRepo, getRepoIdBySlug,
} from '../src/db/init.js';
import { syncDogfood } from '../src/sync/dogfood.js';
import { syncSwarmControlPlane } from '../src/sync/swarm.js';

let tmpDir: string;

const freshDate = new Date(Date.now() - 2 * 86400000).toISOString();

function createBaseFixtures(dir: string) {
  const indexDir = join(dir, 'indexes');
  mkdirSync(indexDir, { recursive: true });
  writeFileSync(join(indexDir, 'latest-by-repo.json'), JSON.stringify({
    'test-org/repo-mcp': {
      'mcp-server': {
        run_id: 'repo-mcp-1', verified: 'pass', verification_status: 'accepted',
        finished_at: freshDate, path: 'records/test-org/repo-mcp/run-1.json',
      },
    },
  }));
}

interface FixtureRun {
  id: string;
  repo: string;
  status?: string;
  commit_sha?: string;
  created_at: string;
}

interface FixtureFinding {
  run_id: string;
  finding_id: string;
  severity: string;
  category: string;
  file_path?: string;
  line_number?: number;
  description: string;
  recommendation?: string;
  status: string;
}

/**
 * Build a minimal control-plane.db with only the columns the swarm
 * reader queries — the full swarm schema lives in dogfood-labs.
 */
function createControlPlaneDb(dir: string, runs: FixtureRun[], findings: FixtureFinding[]) {
  const swarmsDir = join(dir, 'swarms');
  mkdirSync(swarmsDir, { recursive: true });
  const db = new Database(join(swarmsDir, 'control-plane.db'));
  db.exec(`
    CREATE TABLE runs (
      id TEXT PRIMARY KEY, repo TEXT NOT NULL, status TEXT NOT NULL,
      commit_sha TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE findings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL,
      finding_id TEXT NOT NULL, severity TEXT NOT NULL, category TEXT NOT NULL,
      file_path TEXT, line_number INTEGER, description TEXT NOT NULL,
      recommendation TEXT, status TEXT NOT NULL
    );
  `);
  const insertRun = db.prepare(
    'INSERT INTO runs (id, repo, status, commit_sha, created_at) VALUES (?, ?, ?, ?, ?)',
  );
  for (const r of runs) {
    insertRun.run(r.id, r.repo, r.status ?? 'health-amend-a', r.commit_sha ?? 'abc123', r.created_at);
  }
  const insertFinding = db.prepare(`
    INSERT INTO findings (run_id, finding_id, severity, category, file_path, line_number, description, recommendation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const f of findings) {
    insertFinding.run(
      f.run_id, f.finding_id, f.severity, f.category,
      f.file_path ?? null, f.line_number ?? null,
      f.description, f.recommendation ?? null, f.status,
    );
  }
  db.close();
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-swarm-'));
  openDb(join(tmpDir, 'test.db'));
  upsertRepo({ slug: 'test-org/repo-mcp', owner: 'test-org', name: 'repo-mcp' } as any);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('Swarm control-plane sync', () => {
  it('syncs findings from the latest run into dogfood.swarm facts', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createControlPlaneDb(fixtureDir,
      [{ id: 'swarm-1', repo: 'test-org/repo-mcp', created_at: '2026-06-01 00:00:00' }],
      [
        { run_id: 'swarm-1', finding_id: 'F-DB-001', severity: 'HIGH', category: 'bug', file_path: 'src/a.ts', line_number: 12, description: 'Off-by-one in pager', recommendation: 'Clamp the index', status: 'approved' },
        { run_id: 'swarm-1', finding_id: 'F-DB-002', severity: 'LOW', category: 'docs', description: 'Stale README flag', status: 'fixed' },
      ],
    );

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.swarm).toBeDefined();
    expect(result.swarm!.runs).toBe(1);
    expect(result.swarm!.findings).toBe(2);
    expect(result.swarm!.open_findings).toBe(1);
    // 2 finding facts + 8 rollup facts
    expect(result.swarm!.facts_upserted).toBe(10);

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const facts = db.prepare(
      "SELECT key, value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm.finding' ORDER BY key",
    ).all(repoId) as { key: string; value: string }[];

    expect(facts.length).toBe(2);
    expect(facts[0].key).toBe('F-DB-001');
    const parsed = JSON.parse(facts[0].value);
    expect(parsed.severity).toBe('HIGH');
    expect(parsed.category).toBe('bug');
    expect(parsed.file_path).toBe('src/a.ts');
    expect(parsed.status).toBe('approved');
    expect(parsed.run_id).toBe('swarm-1');
  });

  it('writes rollup facts with open/fixed counts and severity breakdown', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createControlPlaneDb(fixtureDir,
      [{ id: 'swarm-1', repo: 'test-org/repo-mcp', status: 'health-amend-a', commit_sha: 'deadbee', created_at: '2026-06-01 00:00:00' }],
      [
        { run_id: 'swarm-1', finding_id: 'F-1', severity: 'HIGH', category: 'bug', description: 'a', status: 'approved' },
        { run_id: 'swarm-1', finding_id: 'F-2', severity: 'MEDIUM', category: 'bug', description: 'b', status: 'new' },
        { run_id: 'swarm-1', finding_id: 'F-3', severity: 'MEDIUM', category: 'bug', description: 'c', status: 'fixed' },
        { run_id: 'swarm-1', finding_id: 'F-4', severity: 'LOW', category: 'style', description: 'd', status: 'rejected' },
      ],
    );

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const rollups = Object.fromEntries(
      (db.prepare(
        "SELECT key, value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm'",
      ).all(repoId) as { key: string; value: string }[]).map((r) => [r.key, r.value]),
    );

    expect(rollups['run:id']).toBe('swarm-1');
    expect(rollups['run:status']).toBe('health-amend-a');
    expect(rollups['run:commit_sha']).toBe('deadbee');
    expect(rollups['findings:total']).toBe('4');
    expect(rollups['findings:open']).toBe('2');
    expect(rollups['findings:fixed']).toBe('1');
    expect(rollups['findings:open_by_severity']).toBe('CRITICAL=0,HIGH=1,MEDIUM=1,LOW=0');
  });

  it('only syncs the latest run per repo and replaces stale facts on re-sync', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createControlPlaneDb(fixtureDir,
      [
        { id: 'swarm-old', repo: 'test-org/repo-mcp', created_at: '2026-05-01 00:00:00' },
        { id: 'swarm-new', repo: 'test-org/repo-mcp', created_at: '2026-06-01 00:00:00' },
      ],
      [
        { run_id: 'swarm-old', finding_id: 'F-OLD-1', severity: 'HIGH', category: 'bug', description: 'old', status: 'approved' },
        { run_id: 'swarm-new', finding_id: 'F-NEW-1', severity: 'LOW', category: 'docs', description: 'new', status: 'new' },
      ],
    );

    // First sync seeds a fact from a previous state, proving the
    // replace-on-resync delete actually fires.
    await syncDogfood({ localPath: fixtureDir });
    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.swarm!.runs).toBe(1);
    expect(result.swarm!.findings).toBe(1);

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const keys = (db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm.finding'",
    ).all(repoId) as { key: string }[]).map((r) => r.key);

    expect(keys).toEqual(['F-NEW-1']);
    expect(keys).not.toContain('F-OLD-1');
  });

  it('returns null when no control-plane DB exists', () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    expect(syncSwarmControlPlane(fixtureDir)).toBeNull();
  });

  it('omits swarm from the sync result when no control-plane DB exists', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.repos).toBe(1);
    expect(result.swarm).toBeUndefined();
  });

  it('skips runs whose repo is not in the knowledge DB', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createControlPlaneDb(fixtureDir,
      [{ id: 'swarm-x', repo: 'unknown-org/mystery', created_at: '2026-06-01 00:00:00' }],
      [{ run_id: 'swarm-x', finding_id: 'F-X-1', severity: 'HIGH', category: 'bug', description: 'x', status: 'new' }],
    );

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.swarm!.runs).toBe(0);
    expect(result.swarm!.findings).toBe(0);
    expect(result.swarm!.skipped.length).toBe(1);
    expect(result.swarm!.skipped[0]).toContain('unknown-org/mystery');
  });
});
