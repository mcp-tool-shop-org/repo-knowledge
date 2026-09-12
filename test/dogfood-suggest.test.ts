/**
 * Dedicated vitest for src/sync/dogfood-suggest.ts (STUDY-RK-024).
 *
 * HARD: suggest* is a read model over local `repo_facts` only. Facts are
 * seeded in a temp SQLite DB — no testing-os/.swarm sqlite, no operator
 * swarm DB copy, no GitHub source checkout.
 *
 * Existing test/dogfood-intelligence-sync.test.ts and
 * test/dogfood-swarm-sync.test.ts remain the ingest/integration suites.
 * This file owns the module exports: suggestByRepo, suggestBySurface
 * (+escapeLike), the recommendations bucket, and unparseable-JSON skip.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, upsertRepo, getRepoIdBySlug, upsertFact } from '../src/db/init.js';
import { suggestByRepo, suggestBySurface } from '../src/sync/dogfood-suggest.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-dogfood-suggest-'));
  openDb(join(tmpDir, 'test.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

function seedRepo(slug: string) {
  const [owner, name] = slug.split('/', 2);
  upsertRepo({ owner, name });
  return getRepoIdBySlug(slug)!;
}

function seedSurfaces(repoId: number, surfacesCsv: string) {
  upsertFact(repoId, 'dogfood', 'surfaces', surfacesCsv, 'detected', 'local-repo-facts');
}

function seedFinding(repoId: number, id: string, extras: Record<string, string> = {}) {
  upsertFact(repoId, 'dogfood.finding', id, JSON.stringify({
    title: extras.title ?? `title ${id}`,
    issue_kind: extras.issue_kind ?? 'bug',
    summary: extras.summary ?? `summary ${id}`,
  }), 'detected', 'local-repo-facts');
}

function seedPattern(repoId: number, id: string, extras: Record<string, string> = {}) {
  upsertFact(repoId, 'dogfood.pattern', id, JSON.stringify({
    title: extras.title ?? `pattern ${id}`,
    pattern_strength: extras.pattern_strength ?? 'strong',
    summary: extras.summary ?? `pattern summary ${id}`,
  }), 'detected', 'local-repo-facts');
}

function seedRecommendation(repoId: number, id: string, extras: Record<string, string> = {}) {
  upsertFact(repoId, 'dogfood.recommendation', id, JSON.stringify({
    title: extras.title ?? `rec ${id}`,
    recommendation_kind: extras.recommendation_kind ?? 'starter_check',
    confidence: extras.confidence ?? 'strong',
    action_details: extras.action_details ?? `do ${id}`,
  }), 'detected', 'local-repo-facts');
}

function seedDoctrine(repoId: number, id: string, extras: Record<string, string> = {}) {
  upsertFact(repoId, 'dogfood.doctrine', id, JSON.stringify({
    statement: extras.statement ?? `doctrine ${id}`,
    strength: extras.strength ?? 'proven',
  }), 'detected', 'local-repo-facts');
}

function emptySuggestion() {
  return { findings: [], patterns: [], recommendations: [], doctrine: [] };
}

// ─── suggestByRepo ────────────────────────────────────────────────────────

describe('suggestByRepo', () => {
  it('returns empty buckets for an unknown slug', () => {
    expect(suggestByRepo('missing/repo')).toEqual(emptySuggestion());
  });

  it('returns empty buckets when the repo has no dogfood.* facts', () => {
    seedRepo('acme/empty');
    expect(suggestByRepo('acme/empty')).toEqual(emptySuggestion());
  });

  it('reads findings, patterns, doctrine, and the recommendations bucket from local facts', () => {
    const id = seedRepo('acme/catalog');
    seedFinding(id, 'dfind-1', { title: 'MCP handshake', issue_kind: 'interface_assumption', summary: 'stdio' });
    seedPattern(id, 'dpat-1', { title: 'interface truth', pattern_strength: 'strong', summary: 'recurs' });
    seedRecommendation(id, 'drec-1', {
      title: 'add runtime check',
      recommendation_kind: 'starter_check',
      confidence: 'strong',
      action_details: 'verify handshake',
    });
    seedDoctrine(id, 'ddoc-1', { statement: 'verify runtime first', strength: 'proven' });

    const result = suggestByRepo('acme/catalog');

    expect(result.findings).toEqual([{
      finding_id: 'dfind-1',
      title: 'MCP handshake',
      issue_kind: 'interface_assumption',
      summary: 'stdio',
      repo: 'acme/catalog',
    }]);
    expect(result.patterns).toEqual([{
      pattern_id: 'dpat-1',
      title: 'interface truth',
      pattern_strength: 'strong',
      summary: 'recurs',
    }]);
    expect(result.recommendations).toEqual([{
      recommendation_id: 'drec-1',
      title: 'add runtime check',
      recommendation_kind: 'starter_check',
      confidence: 'strong',
      action_details: 'verify handshake',
    }]);
    expect(result.doctrine).toEqual([{
      doctrine_id: 'ddoc-1',
      statement: 'verify runtime first',
      strength: 'proven',
    }]);
  });

  it('defaults missing recommendation/finding fields to empty strings', () => {
    const id = seedRepo('acme/sparse');
    upsertFact(id, 'dogfood.recommendation', 'drec-sparse', JSON.stringify({}), 'detected', 'local-repo-facts');
    upsertFact(id, 'dogfood.finding', 'dfind-sparse', JSON.stringify({}), 'detected', 'local-repo-facts');

    const result = suggestByRepo('acme/sparse');
    expect(result.recommendations).toEqual([{
      recommendation_id: 'drec-sparse',
      title: '',
      recommendation_kind: '',
      confidence: '',
      action_details: '',
    }]);
    expect(result.findings[0]).toMatchObject({
      finding_id: 'dfind-sparse',
      title: '',
      issue_kind: '',
      summary: '',
      repo: 'acme/sparse',
    });
  });

  it('skips unparseable fact JSON and still returns parseable siblings', () => {
    const id = seedRepo('acme/mixed');
    seedFinding(id, 'dfind-good', { title: 'kept' });
    seedRecommendation(id, 'drec-good', { title: 'kept rec' });
    upsertFact(id, 'dogfood.finding', 'dfind-bad', '{not-json', 'detected', 'local-repo-facts');
    upsertFact(id, 'dogfood.recommendation', 'drec-bad', 'null-is-ok-but-this-is-not{', 'detected', 'local-repo-facts');

    const result = suggestByRepo('acme/mixed');
    expect(result.findings.map((f) => f.finding_id)).toEqual(['dfind-good']);
    expect(result.recommendations.map((r) => r.recommendation_id)).toEqual(['drec-good']);
    expect(result.findings.find((f) => f.finding_id === 'dfind-bad')).toBeUndefined();
    expect(result.recommendations.find((r) => r.recommendation_id === 'drec-bad')).toBeUndefined();
  });

  it('ignores dogfood facts without a dotted type (surfaces CSV is not a suggestion row)', () => {
    const id = seedRepo('acme/surfaces-only');
    seedSurfaces(id, 'mcp-server,cli');
    expect(suggestByRepo('acme/surfaces-only')).toEqual(emptySuggestion());
  });
});

// ─── suggestBySurface (+escapeLike) ───────────────────────────────────────

describe('suggestBySurface (+escapeLike)', () => {
  it('returns findings / patterns / recommendations / doctrine for an exact CSV surface', () => {
    const id = seedRepo('acme/mcp');
    seedSurfaces(id, 'mcp-server,cli');
    seedFinding(id, 'F-MCP');
    seedPattern(id, 'P-MCP');
    seedRecommendation(id, 'R-MCP');
    seedDoctrine(id, 'D-MCP');

    const result = suggestBySurface('mcp-server');
    expect(result.findings.map((f) => f.finding_id)).toContain('F-MCP');
    expect(result.patterns.map((p) => p.pattern_id)).toContain('P-MCP');
    expect(result.recommendations.map((r) => r.recommendation_id)).toContain('R-MCP');
    expect(result.doctrine.map((d) => d.doctrine_id)).toContain('D-MCP');
  });

  it('does not substring-match a surface (cli vs cli-docs)', () => {
    const id = seedRepo('acme/docs');
    seedSurfaces(id, 'cli-docs');
    seedFinding(id, 'F-DOCS');

    expect(suggestBySurface('cli').findings).toEqual([]);
    expect(suggestBySurface('cli-docs').findings.map((f) => f.finding_id)).toEqual(['F-DOCS']);
  });

  it('treats underscore in the surface as a literal (escapeLike), not a LIKE wildcard', () => {
    const a = seedRepo('acme/cli-repo');
    seedSurfaces(a, 'cli');
    seedFinding(a, 'F-CLI');
    const b = seedRepo('acme/mcp-repo');
    seedSurfaces(b, 'mcp-server');
    seedFinding(b, 'F-MCP');

    // Buggy LIKE '%_%' would match every non-empty surfaces CSV.
    expect(suggestBySurface('_').findings).toEqual([]);
    // `mcp_server` must not wildcard-match `mcp-server`.
    expect(suggestBySurface('mcp_server').findings).toEqual([]);
  });

  it('treats percent in the surface as a literal, not a LIKE wildcard', () => {
    const id = seedRepo('acme/reports');
    seedSurfaces(id, 'reports');
    seedFinding(id, 'F-REP');

    expect(suggestBySurface('report%').findings).toEqual([]);
    expect(suggestBySurface('%').findings).toEqual([]);
    expect(suggestBySurface('reports').findings.map((f) => f.finding_id)).toEqual(['F-REP']);
  });

  it('matches a multi-element CSV on any exact member', () => {
    const id = seedRepo('acme/multi');
    seedSurfaces(id, 'mcp-server, cli');
    seedFinding(id, 'F-MULTI');

    expect(suggestBySurface('cli').findings.map((f) => f.finding_id)).toContain('F-MULTI');
    expect(suggestBySurface('mcp-server').findings.map((f) => f.finding_id)).toContain('F-MULTI');
    expect(suggestBySurface('other').findings).toEqual([]);
  });

  it('dedupes suggestion rows that appear on more than one matching repo', () => {
    const a = seedRepo('acme/one');
    seedSurfaces(a, 'shared');
    seedFinding(a, 'F-SHARED', { title: 'from one' });
    seedRecommendation(a, 'R-SHARED', { title: 'rec one' });

    const b = seedRepo('acme/two');
    seedSurfaces(b, 'shared');
    seedFinding(b, 'F-SHARED', { title: 'from two' });
    seedRecommendation(b, 'R-SHARED', { title: 'rec two' });

    const result = suggestBySurface('shared');
    expect(result.findings.filter((f) => f.finding_id === 'F-SHARED')).toHaveLength(1);
    expect(result.recommendations.filter((r) => r.recommendation_id === 'R-SHARED')).toHaveLength(1);
  });

  it('skips unparseable fact JSON on the surface path as well', () => {
    const id = seedRepo('acme/broken');
    seedSurfaces(id, 'mcp-server');
    upsertFact(id, 'dogfood.finding', 'F-BAD', '{nope', 'detected', 'local-repo-facts');
    seedFinding(id, 'F-GOOD');

    const result = suggestBySurface('mcp-server');
    expect(result.findings.map((f) => f.finding_id)).toEqual(['F-GOOD']);
  });
});
