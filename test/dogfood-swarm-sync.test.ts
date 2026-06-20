import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import Database from 'better-sqlite3';
import {
  openDb, closeDb, getDb,
  upsertRepo, getRepoIdBySlug, upsertFact,
} from '../src/db/init.js';
import { syncDogfood } from '../src/sync/dogfood.js';
import { syncSwarmControlPlane } from '../src/sync/swarm.js';
import { suggestBySurface } from '../src/sync/dogfood-suggest.js';

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

  it('breaks created_at ties deterministically by id; surfaces CRITICAL + recurring (ts-A-005 / ts-A-006)', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    // Two runs for the SAME repo with the SAME created_at. ORDER BY
    // created_at alone leaves the Map-overwrite winner undefined — on a
    // plain scan SQLite returns rows in insertion (rowid) order, so the
    // LAST-inserted run wins. We insert the intended WINNER ('swarm-zzz',
    // greater id) FIRST and the intended LOSER ('swarm-aaa') LAST, so:
    //   - buggy ORDER BY created_at → loser 'swarm-aaa' inserted last wins
    //     → run:id='swarm-aaa' → assertions below FAIL.
    //   - fixed ORDER BY created_at ASC, id ASC → 'swarm-zzz' (greater id)
    //     sorts last → wins → run:id='swarm-zzz' → assertions PASS.
    // The winning run carries a CRITICAL + recurring finding so the rollup
    // also pins ts-A-006: CRITICAL shows in open_by_severity AND
    // 'recurring' counts as open (it is in OPEN_STATUSES).
    createControlPlaneDb(fixtureDir,
      [
        { id: 'swarm-zzz', repo: 'test-org/repo-mcp', commit_sha: 'winner0', created_at: '2026-06-01 00:00:00' },
        { id: 'swarm-aaa', repo: 'test-org/repo-mcp', commit_sha: 'loser00', created_at: '2026-06-01 00:00:00' },
      ],
      [
        { run_id: 'swarm-zzz', finding_id: 'F-WIN-CRIT', severity: 'CRITICAL', category: 'security', description: 'critical recurring issue', status: 'recurring' },
        { run_id: 'swarm-aaa', finding_id: 'F-LOSE-1', severity: 'LOW', category: 'style', description: 'from the losing run', status: 'new' },
      ],
    );

    const result = await syncDogfood({ localPath: fixtureDir });

    // Only one run mirrored, and it is the higher-id tie-break winner.
    expect(result.swarm!.runs).toBe(1);

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const rollups = Object.fromEntries(
      (db.prepare(
        "SELECT key, value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm'",
      ).all(repoId) as { key: string; value: string }[]).map((r) => [r.key, r.value]),
    );

    // Tie-break: the winning run's id + commit are stamped, not the loser's.
    expect(rollups['run:id']).toBe('swarm-zzz');
    expect(rollups['run:commit_sha']).toBe('winner0');

    // ts-A-006: the recurring CRITICAL finding is the only finding mirrored
    // (we read the winning run's findings, not the loser's), it counts as
    // open, and it lands in the CRITICAL severity bucket.
    expect(rollups['findings:total']).toBe('1');
    expect(rollups['findings:open']).toBe('1');
    expect(rollups['findings:open_by_severity']).toBe('CRITICAL=1,HIGH=0,MEDIUM=0,LOW=0');

    // The losing run's finding must NOT be present.
    const findingKeys = (db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm.finding'",
    ).all(repoId) as { key: string }[]).map((r) => r.key);
    expect(findingKeys).toEqual(['F-WIN-CRIT']);
    expect(findingKeys).not.toContain('F-LOSE-1');
  });

  it('skips-with-warn a swarm finding with an empty finding_id instead of upserting it (SYNC-PH-05)', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createControlPlaneDb(fixtureDir,
      [{ id: 'swarm-1', repo: 'test-org/repo-mcp', created_at: '2026-06-01 00:00:00' }],
      [
        // Empty finding_id — must be skipped (keyless fact would corrupt the set).
        { run_id: 'swarm-1', finding_id: '', severity: 'HIGH', category: 'bug', description: 'empty id', status: 'new' },
        // A well-formed finding that must still land.
        { run_id: 'swarm-1', finding_id: 'F-OK-1', severity: 'LOW', category: 'docs', description: 'ok', status: 'new' },
      ],
    );

    const result = await syncDogfood({ localPath: fixtureDir });

    // Only the well-formed finding was upserted; the empty-id one is skipped.
    expect(result.swarm!.findings).toBe(1);
    expect(result.swarm!.skipped.some(s => s.includes('empty finding_id or severity'))).toBe(true);

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const findingKeys = (db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm.finding'",
    ).all(repoId) as { key: string }[]).map(r => r.key);
    expect(findingKeys).toEqual(['F-OK-1']);

    // The rollup total reflects only the upserted finding, not the skipped one.
    const total = (db.prepare(
      "SELECT value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.swarm' AND key = 'findings:total'",
    ).get(repoId) as { value: string }).value;
    expect(total).toBe('1');
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

describe('syncDogfood index error handling', () => {
  it('throws a structured, path-bearing error on a malformed local index (sync-A-002)', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    const indexDir = join(fixtureDir, 'indexes');
    mkdirSync(indexDir, { recursive: true });
    // Truncated / invalid JSON — a bare JSON.parse here would throw the
    // terse "Unexpected end of JSON input" with no path context.
    writeFileSync(join(indexDir, 'latest-by-repo.json'), '{ "test-org/repo-mcp": ');

    await expect(syncDogfood({ localPath: fixtureDir })).rejects.toThrow(
      /dogfood index at .*latest-by-repo\.json is malformed:/,
    );
  });

  it('syncs other repos + records the bad one in skipped when one surface entry is malformed (SYNC-PH-01)', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    const indexDir = join(fixtureDir, 'indexes');
    mkdirSync(indexDir, { recursive: true });

    // Register a second repo so we can prove the walk continued past the bad one.
    upsertRepo({ slug: 'test-org/good-repo', owner: 'test-org', name: 'good-repo' } as any);

    // 'test-org/repo-mcp' carries a MALFORMED surface entry — `verified` and
    // `run_id` are undefined (a drifted export). Without the per-entry guard
    // this throws "SQLite3 can't bind undefined" at upsertFact and aborts the
    // ENTIRE sync. 'test-org/good-repo' is well-formed and must still land.
    writeFileSync(join(indexDir, 'latest-by-repo.json'), JSON.stringify({
      'test-org/repo-mcp': {
        'mcp-server': {
          // no verified / run_id — only finished_at present.
          finished_at: freshDate,
        },
      },
      'test-org/good-repo': {
        'cli': {
          run_id: 'good-1', verified: 'pass', verification_status: 'accepted',
          finished_at: freshDate, path: 'records/test-org/good-repo/run-1.json',
        },
      },
    }));

    const result = await syncDogfood({ localPath: fixtureDir });

    // The good repo synced — a single malformed surface entry did not abort
    // the walk. (Both repos enter the loop, so result.repos counts both.)
    const goodId = getRepoIdBySlug('test-org/good-repo');
    expect(goodId).not.toBeNull();
    const db = getDb();
    const goodFacts = db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood' AND key = 'surface:cli:verified'",
    ).all(goodId) as { key: string }[];
    expect(goodFacts.length).toBe(1);

    // The malformed surface was recorded in skipped with an actionable reason.
    const badSkip = result.skipped.find(s => s.includes('test-org/repo-mcp') && s.includes('mcp-server'));
    expect(badSkip).toBeDefined();
    expect(badSkip).toMatch(/malformed entry/);

    // And the malformed surface did NOT write a verified fact for repo-mcp.
    const repoMcpId = getRepoIdBySlug('test-org/repo-mcp');
    const mcpVerified = db.prepare(
      "SELECT key FROM repo_facts WHERE repo_id = ? AND key = 'surface:mcp-server:verified'",
    ).all(repoMcpId) as { key: string }[];
    expect(mcpVerified.length).toBe(0);
  });

  it('skips-with-warning a repo whose surfaces value is null / non-object (sync-A-003)', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    const indexDir = join(fixtureDir, 'indexes');
    mkdirSync(indexDir, { recursive: true });
    // Drifted index: 'test-org/repo-mcp' has a valid surfaces object, but
    // two sibling repos carry a null and an array value respectively.
    // Without the shape guard, the null value throws at Object.entries
    // mid-walk and kills the whole sync (the valid repo never lands).
    writeFileSync(join(indexDir, 'latest-by-repo.json'), JSON.stringify({
      'test-org/repo-mcp': {
        'mcp-server': {
          run_id: 'repo-mcp-1', verified: 'pass', verification_status: 'accepted',
          finished_at: freshDate, path: 'records/test-org/repo-mcp/run-1.json',
        },
      },
      'test-org/null-repo': null,
      'test-org/array-repo': ['not', 'an', 'object'],
    }));

    const result = await syncDogfood({ localPath: fixtureDir });

    // The valid repo still synced — a single drifted value did not abort
    // the walk.
    expect(result.repos).toBe(1);
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    expect(repoId).not.toBeNull();

    // Both malformed entries were recorded in skipped with an actionable
    // reason naming the bad shape.
    const skippedNull = result.skipped.find(s => s.includes('test-org/null-repo'));
    const skippedArray = result.skipped.find(s => s.includes('test-org/array-repo'));
    expect(skippedNull).toBeDefined();
    expect(skippedNull).toMatch(/malformed surfaces value/);
    expect(skippedArray).toBeDefined();
    expect(skippedArray).toMatch(/got array/);
  });
});

describe('suggestBySurface — LIKE escaping + exact membership (sync-A-007)', () => {
  // Seed a repo with a CSV `surfaces` fact and one finding so the
  // suggestion has scoped content to return.
  function seedRepoWithSurfaces(slug: string, owner: string, name: string, surfacesCsv: string, findingId: string) {
    upsertRepo({ slug, owner, name } as any);
    const repoId = getRepoIdBySlug(slug)!;
    upsertFact(repoId, 'dogfood', 'surfaces', surfacesCsv, 'detected', 'testing-os/indexes/latest-by-repo.json');
    upsertFact(repoId, 'dogfood.finding', findingId, JSON.stringify({
      title: `finding for ${slug}`, issue_kind: 'bug', summary: 's',
    }), 'detected', 'testing-os/intelligence-export');
    return repoId;
  }

  it('treats an underscore in --surface literally instead of as a wildcard', () => {
    // Two repos, neither with a literal underscore in its surfaces CSV.
    seedRepoWithSurfaces('o/cli-repo', 'o', 'cli-repo', 'cli', 'F-CLI-1');
    seedRepoWithSurfaces('o/rep-repo', 'o', 'rep-repo', 'reports', 'F-REP-1');

    // Buggy LIKE '%_%' makes `_` match any single char → EVERY repo with a
    // non-empty surfaces CSV matches. With the fix, `_` is escaped + the
    // exact membership check requires a surface literally named "_", which
    // neither repo has → no findings returned.
    const result = suggestBySurface('_');
    expect(result.findings.length).toBe(0);
  });

  it('matches a surface as a whole CSV element, not a substring', () => {
    // 'cli-docs' must NOT be matched by querying 'cli' — substring match
    // was never intended; the surface list is comma-delimited elements.
    seedRepoWithSurfaces('o/docs-repo', 'o', 'docs-repo', 'cli-docs', 'F-DOCS-1');

    const substringQuery = suggestBySurface('cli');
    expect(substringQuery.findings.find(f => f.finding_id === 'F-DOCS-1')).toBeUndefined();

    // Exact element matches.
    const exactQuery = suggestBySurface('cli-docs');
    expect(exactQuery.findings.find(f => f.finding_id === 'F-DOCS-1')).toBeDefined();
  });

  it('returns the matching repo for an exact multi-element CSV surface', () => {
    seedRepoWithSurfaces('o/multi', 'o', 'multi', 'mcp-server,cli', 'F-MULTI-1');

    const cliHit = suggestBySurface('cli');
    expect(cliHit.findings.find(f => f.finding_id === 'F-MULTI-1')).toBeDefined();
    const mcpHit = suggestBySurface('mcp-server');
    expect(mcpHit.findings.find(f => f.finding_id === 'F-MULTI-1')).toBeDefined();
  });
});
