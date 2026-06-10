import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, getRepoIdBySlug,
} from '../src/db/init.js';
import { syncDogfood } from '../src/sync/dogfood.js';
import { suggestByRepo, suggestBySurface } from '../src/sync/dogfood-suggest.js';

let tmpDir: string;

const freshDate = new Date(Date.now() - 2 * 86400000).toISOString();

function createBaseFixtures(dir: string) {
  // Standard dogfood index
  const indexDir = join(dir, 'indexes');
  mkdirSync(indexDir, { recursive: true });
  writeFileSync(join(indexDir, 'latest-by-repo.json'), JSON.stringify({
    'test-org/repo-mcp': {
      'mcp-server': {
        run_id: 'repo-mcp-1', verified: 'pass', verification_status: 'accepted',
        finished_at: freshDate, path: 'records/test-org/repo-mcp/run-1.json',
      },
    },
    'test-org/repo-cli': {
      cli: {
        run_id: 'repo-cli-1', verified: 'pass', verification_status: 'accepted',
        finished_at: freshDate, path: 'records/test-org/repo-cli/run-1.json',
      },
    },
  }));

  // Policies
  const policiesDir = join(dir, 'policies', 'repos', 'mcp-tool-shop-org');
  mkdirSync(policiesDir, { recursive: true });
  writeFileSync(join(policiesDir, 'repo-mcp.yaml'), 'enforcement:\n  mode: required\n');
  writeFileSync(join(policiesDir, 'repo-cli.yaml'), 'enforcement:\n  mode: required\n');
}

function createIntelligenceExport(dir: string) {
  // Pre-generated intelligence export file
  writeFileSync(join(dir, '.intelligence-export.json'), JSON.stringify({
    exported_at: new Date().toISOString(),
    source: 'dogfood-labs',
    counts: { findings: 2, patterns: 1, recommendations: 1, doctrine: 1 },
    findings: [
      {
        finding_id: 'dfind-mcp-interface',
        title: 'MCP server runtime interface misclassified',
        repo: 'test-org/repo-mcp',
        product_surface: 'mcp-server',
        issue_kind: 'interface_assumption',
        root_cause_kind: 'surface_misclassification',
        remediation_kind: 'classification_fix',
        transfer_scope: 'surface_archetype',
        summary: 'MCP server was verified using CLI assumptions.',
      },
      {
        finding_id: 'dfind-cli-entrypoint',
        title: 'CLI entrypoint flags wrong',
        repo: 'test-org/repo-cli',
        product_surface: 'cli',
        issue_kind: 'entrypoint_truth',
        root_cause_kind: 'docs_code_drift',
        remediation_kind: 'scenario_change',
        transfer_scope: 'surface_archetype',
        summary: 'CLI scenario used wrong flags.',
      },
    ],
    patterns: [{
      pattern_id: 'dpat-interface-truth',
      title: 'Interface truth recurs across repos',
      pattern_kind: 'recurring_failure',
      pattern_strength: 'strong',
      transfer_scope: 'surface_archetype',
      summary: 'Multiple repos misclassified runtime interface.',
      source_finding_ids: ['dfind-mcp-interface', 'dfind-cli-entrypoint'],
      dimensions: { product_surfaces: ['mcp-server', 'cli'], issue_kinds: ['interface_assumption', 'entrypoint_truth'] },
      support: { finding_count: 2, repo_count: 2, surface_count: 2 },
    }],
    recommendations: [{
      recommendation_id: 'drec-mcp-runtime-check',
      title: 'Add runtime truth verification to MCP starter rollout',
      recommendation_kind: 'starter_check',
      confidence: 'strong',
      applies_to: { product_surfaces: ['mcp-server'] },
      action: { type: 'add_check', target: 'rollout', details: 'Verify stdio JSON-RPC handshake before scenario authoring.' },
      based_on_pattern_ids: ['dpat-interface-truth'],
    }],
    doctrine: [{
      doctrine_id: 'ddoc-runtime-truth',
      title: 'Verify runtime truth before rollout',
      doctrine_kind: 'rollout_law',
      strength: 'proven',
      statement: 'Verify runtime interface truth before designing rollout scenarios.',
      rationale: 'Backed by 1 accepted pattern across 2 repos.',
      transfer_scope: 'org_wide',
      based_on_pattern_ids: ['dpat-interface-truth'],
    }],
  }));
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-intel-'));
  const dbPath = join(tmpDir, 'test.db');
  openDb(dbPath);

  upsertRepo({ slug: 'test-org/repo-mcp', owner: 'test-org', name: 'repo-mcp' } as any);
  upsertRepo({ slug: 'test-org/repo-cli', owner: 'test-org', name: 'repo-cli' } as any);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('Intelligence sync', () => {
  it('syncs intelligence artifacts alongside dogfood status', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.intelligence).toBeDefined();
    expect(result.intelligence!.findings).toBe(2);
    expect(result.intelligence!.patterns).toBe(1);
    expect(result.intelligence!.recommendations).toBe(1);
    expect(result.intelligence!.doctrine).toBe(1);
    expect(result.intelligence!.facts_upserted).toBeGreaterThan(0);
  });

  it('stores findings as dogfood.finding facts', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const repoId = getRepoIdBySlug('test-org/repo-mcp');
    const facts = db.prepare(
      "SELECT key, value FROM repo_facts WHERE repo_id = ? AND fact_type = 'dogfood.finding'"
    ).all(repoId) as { key: string; value: string }[];

    expect(facts.length).toBe(1);
    expect(facts[0].key).toBe('dfind-mcp-interface');
    const parsed = JSON.parse(facts[0].value);
    expect(parsed.issue_kind).toBe('interface_assumption');
  });

  it('stores patterns as dogfood.pattern facts', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const facts = db.prepare(
      "SELECT key, value FROM repo_facts WHERE fact_type = 'dogfood.pattern'"
    ).all() as { key: string; value: string }[];

    expect(facts.length).toBeGreaterThanOrEqual(1);
    expect(facts[0].key).toBe('dpat-interface-truth');
  });

  it('stores doctrine as dogfood.doctrine facts', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);

    await syncDogfood({ localPath: fixtureDir });

    const db = getDb();
    const facts = db.prepare(
      "SELECT key, value FROM repo_facts WHERE fact_type = 'dogfood.doctrine'"
    ).all() as { key: string; value: string }[];

    expect(facts.length).toBeGreaterThanOrEqual(1);
    const parsed = JSON.parse(facts[0].value);
    expect(parsed.statement).toContain('runtime interface truth');
  });

  it('degrades cleanly when the legacy exporter crashes', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    // Legacy layout whose exporter dies on startup (the ajv-not-installed
    // shape from the field): sync must complete with zero intelligence,
    // not propagate the child's crash.
    mkdirSync(join(fixtureDir, 'tools', 'findings'), { recursive: true });
    writeFileSync(
      join(fixtureDir, 'tools', 'findings', 'cli.js'),
      "process.stderr.write('Error [ERR_MODULE_NOT_FOUND]: Cannot find package boom');\nprocess.exit(1);\n",
    );

    const result = await syncDogfood({ localPath: fixtureDir });

    expect(result.repos).toBe(2);
    expect(result.intelligence).toBeDefined();
    expect(result.intelligence!.findings).toBe(0);
    expect(result.intelligence!.facts_upserted).toBe(0);
  });

  it('gracefully handles missing intelligence export', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    // No intelligence export file

    const result = await syncDogfood({ localPath: fixtureDir });

    // Should still sync base dogfood facts
    expect(result.repos).toBe(2);
    // Intelligence may be undefined or have zero counts
    if (result.intelligence) {
      expect(result.intelligence.findings).toBe(0);
    }
  });
});

describe('suggest-dogfood retrieval', () => {
  it('retrieves findings by repo', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);
    await syncDogfood({ localPath: fixtureDir });

    const result = suggestByRepo('test-org/repo-mcp');
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].finding_id).toBe('dfind-mcp-interface');
  });

  it('retrieves patterns by repo', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);
    await syncDogfood({ localPath: fixtureDir });

    const result = suggestByRepo('test-org/repo-mcp');
    expect(result.patterns.length).toBeGreaterThanOrEqual(1);
    expect(result.patterns[0].pattern_id).toBe('dpat-interface-truth');
  });

  it('retrieves doctrine by repo', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);
    await syncDogfood({ localPath: fixtureDir });

    const result = suggestByRepo('test-org/repo-mcp');
    expect(result.doctrine.length).toBeGreaterThanOrEqual(1);
    expect(result.doctrine[0].statement).toContain('runtime interface truth');
  });

  it('retrieves by surface', async () => {
    const fixtureDir = join(tmpDir, 'dogfood-labs');
    mkdirSync(fixtureDir);
    createBaseFixtures(fixtureDir);
    createIntelligenceExport(fixtureDir);
    await syncDogfood({ localPath: fixtureDir });

    const result = suggestBySurface('mcp-server');
    expect(result.findings.length).toBeGreaterThanOrEqual(1);

    // F-TS-019: pin specific finding_ids so we prove the surface filter
    // actually filters. The previous assertion only counted >=1, which would
    // pass even if the filter returned EVERY finding regardless of surface.
    // The mcp-server surface contributes dfind-mcp-interface and excludes
    // dfind-cli-entrypoint (which belongs to the cli surface).
    const ids = result.findings.map(f => f.finding_id);
    expect(ids).toContain('dfind-mcp-interface');
    expect(ids).not.toContain('dfind-cli-entrypoint');
  });

  it('returns empty for unknown repo', () => {
    const result = suggestByRepo('nonexistent/repo');
    expect(result.findings.length).toBe(0);
    expect(result.patterns.length).toBe(0);
  });
});
