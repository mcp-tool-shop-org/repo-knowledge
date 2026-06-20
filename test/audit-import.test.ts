import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { openDb, closeDb, getDb, upsertRepo } from '../src/db/init.js';
import { seedControls } from '../src/audit/controls.js';
import { importAudit, importAuditInline } from '../src/audit/import.js';
import {
  getLatestAudit, getAuditPosture, getOpenFindings,
  getPortfolioPosture, findByAuditStatus, compareRuns,
} from '../src/audit/queries.js';

const __dirname2 = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname2, 'fixtures', 'sample-audit');

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-audit-'));
  openDb(join(tmpDir, 'test.db'));
  seedControls(getDb());
  upsertRepo({ owner: 'test-org', name: 'sample-test-repo' });
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('importAudit', () => {
  it('imports from directory', () => {
    const result = importAudit(FIXTURES);
    expect(result.runId).toBeGreaterThan(0);
    expect(result.controls).toBe(2);
    expect(result.findings).toBe(1);
  });
});

describe('importAuditInline', () => {
  it('imports from inline objects', () => {
    const result = importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
        summary: 'Test inline audit',
      },
      controls: [
        { control_id: 'INV-001', result: 'pass' },
        { control_id: 'SCR-002', result: 'fail', notes: 'Token found' },
      ],
      findings: [
        { domain: 'secrets', title: 'Live token', severity: 'critical', status: 'open' },
      ],
      metrics: {
        controls_total: 2,
        controls_passed: 1,
        controls_failed: 1,
        critical_count: 1,
      },
    });

    expect(result.runId).toBeGreaterThan(0);
    expect(result.controls).toBe(2);
    expect(result.findings).toBe(1);
  });

  it('rejects invalid status', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'invalid_status' as any,
        overall_posture: 'healthy',
      },
    })).toThrow('Invalid overall_status');
  });

  it('rejects unknown repo', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'nonexistent/repo',
        overall_status: 'pass',
        overall_posture: 'healthy',
      },
    })).toThrow('Repo not found');
  });
});

describe('audit queries', () => {
  it('getLatestAudit returns full audit', () => {
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'pass_with_findings',
        overall_posture: 'needs_attention',
      },
      controls: [{ control_id: 'INV-001', result: 'pass' }],
      findings: [{ domain: 'secrets', title: 'Token', severity: 'high' }],
    });

    const repoRow = getDb().prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number };
    const audit = getLatestAudit(repoRow.id);

    expect(audit).not.toBeNull();
    expect(audit!.overall_status).toBe('pass_with_findings');
    expect(audit!.controls).toHaveLength(1);
    expect(audit!.findings).toHaveLength(1);
  });

  it('getAuditPosture returns summary', () => {
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      metrics: { controls_total: 80, controls_passed: 50, pass_rate: 0.625 },
    });

    const repoRow = getDb().prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number };
    const posture = getAuditPosture(repoRow.id);

    expect(posture).not.toBeNull();
    expect(posture!.overall_posture).toBe('critical');
    expect(posture!.pass_rate).toBe(0.625);
  });

  it('getOpenFindings filters by severity', () => {
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { domain: 'secrets', title: 'Critical token', severity: 'critical' },
        { domain: 'code_quality', title: 'Minor style', severity: 'low' },
      ],
    });

    const criticals = getOpenFindings({ severity: 'critical' });
    expect(criticals).toHaveLength(1);
    expect(criticals[0].title).toBe('Critical token');
  });

  // ─── F-TS-012: portfolio + filter + no-filter coverage ────────────────────
  // These three queries (getPortfolioPosture, findByAuditStatus,
  // getOpenFindings-with-no-filter) used to be untested. The proactive coverage
  // pass adds them now so future schema/query drift surfaces immediately.

  it('getOpenFindings without filter returns all open findings', () => {
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { domain: 'secrets', title: 'Critical token', severity: 'critical' },
        { domain: 'code_quality', title: 'Minor style', severity: 'low' },
        { domain: 'testing', title: 'Flaky test', severity: 'medium' },
      ],
    });

    const all = getOpenFindings();
    expect(all.length).toBe(3);
    // Ordered by severity (critical, high, medium, low, info), then created_at DESC.
    expect(all[0].severity).toBe('critical');
    expect(all[0].title).toBe('Critical token');
    const titles = all.map(f => f.title);
    expect(titles).toContain('Minor style');
    expect(titles).toContain('Flaky test');
  });

  it('getPortfolioPosture returns multi-repo rows ordered by criticality', () => {
    upsertRepo({ owner: 'test-org', name: 'healthy-repo' });
    upsertRepo({ owner: 'test-org', name: 'attention-repo' });

    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      metrics: { critical_count: 3, high_count: 1, controls_total: 10, controls_passed: 7, pass_rate: 0.7 },
    });
    importAuditInline({
      run: {
        slug: 'test-org/healthy-repo',
        overall_status: 'pass',
        overall_posture: 'healthy',
      },
      metrics: { controls_total: 10, controls_passed: 10, pass_rate: 1.0 },
    });
    importAuditInline({
      run: {
        slug: 'test-org/attention-repo',
        overall_status: 'pass_with_findings',
        overall_posture: 'needs_attention',
      },
      metrics: { high_count: 2, controls_total: 10, controls_passed: 8, pass_rate: 0.8 },
    });

    const rows = getPortfolioPosture();
    const slugs = rows.map(r => r.slug);
    expect(slugs).toContain('test-org/sample-test-repo');
    expect(slugs).toContain('test-org/healthy-repo');
    expect(slugs).toContain('test-org/attention-repo');

    // Ordering: critical → needs_attention → healthy.
    const audited = rows.filter(r => r.overall_posture !== null);
    const posturesInOrder = audited.map(r => r.overall_posture);
    const criticalIdx = posturesInOrder.indexOf('critical');
    const needsAttIdx = posturesInOrder.indexOf('needs_attention');
    const healthyIdx = posturesInOrder.indexOf('healthy');

    expect(criticalIdx).toBeGreaterThanOrEqual(0);
    expect(needsAttIdx).toBeGreaterThan(criticalIdx);
    expect(healthyIdx).toBeGreaterThan(needsAttIdx);
  });

  it('findByAuditStatus filters by posture', () => {
    upsertRepo({ owner: 'test-org', name: 'critical-repo' });
    upsertRepo({ owner: 'test-org', name: 'healthy-repo' });

    importAuditInline({
      run: { slug: 'test-org/critical-repo', overall_status: 'fail', overall_posture: 'critical' },
    });
    importAuditInline({
      run: { slug: 'test-org/healthy-repo', overall_status: 'pass', overall_posture: 'healthy' },
    });

    const criticals = findByAuditStatus({ posture: 'critical' });
    expect(criticals).toHaveLength(1);
    expect((criticals[0] as any).slug).toBe('test-org/critical-repo');

    const healthy = findByAuditStatus({ posture: 'healthy' });
    expect(healthy).toHaveLength(1);
    expect((healthy[0] as any).slug).toBe('test-org/healthy-repo');
  });

  it('findByAuditStatus filters by unaudited', () => {
    upsertRepo({ owner: 'test-org', name: 'audited-repo' });
    upsertRepo({ owner: 'test-org', name: 'never-audited' });

    importAuditInline({
      run: { slug: 'test-org/audited-repo', overall_status: 'pass', overall_posture: 'healthy' },
    });

    const unaudited = findByAuditStatus({ unaudited: true });
    const slugs = unaudited.map(r => (r as any).slug);
    expect(slugs).toContain('test-org/never-audited');
    expect(slugs).not.toContain('test-org/audited-repo');
  });

  it('findByAuditStatus filters by has_critical (blocking severity)', () => {
    upsertRepo({ owner: 'test-org', name: 'blocking-repo' });
    upsertRepo({ owner: 'test-org', name: 'clean-repo' });

    importAuditInline({
      run: { slug: 'test-org/blocking-repo', overall_status: 'fail', overall_posture: 'critical' },
      findings: [
        { domain: 'secrets', title: 'Live token', severity: 'critical' },
      ],
    });
    importAuditInline({
      run: { slug: 'test-org/clean-repo', overall_status: 'pass', overall_posture: 'healthy' },
    });

    const blocking = findByAuditStatus({ has_critical: true });
    const slugs = blocking.map(r => (r as any).slug);
    expect(slugs).toContain('test-org/blocking-repo');
    expect(slugs).not.toContain('test-org/clean-repo');
  });

  it('findByAuditStatus filters by failed_control', () => {
    upsertRepo({ owner: 'test-org', name: 'failing-repo' });

    importAuditInline({
      run: { slug: 'test-org/failing-repo', overall_status: 'fail', overall_posture: 'critical' },
      controls: [
        { control_id: 'INV-001', result: 'fail', notes: 'missing manifest' },
      ],
    });

    const failed = findByAuditStatus({ failed_control: 'INV-001' });
    expect(failed.length).toBe(1);
    expect((failed[0] as any).slug).toBe('test-org/failing-repo');
    expect((failed[0] as any).result).toBe('fail');
  });

  it('findByAuditStatus returns empty array for no filter', () => {
    const result = findByAuditStatus({});
    expect(result).toEqual([]);
  });
});

// ─── F-AG-013: compareRuns null vs 0 ─────────────────────────────────────────
// When a prior metric column is null (e.g. the older run did not record
// pass_rate), compareRuns must not silently coerce null to 0 — that hides
// "we didn't measure" behind "we measured zero." This test pins the
// contract that the diff returns null when either side's metric is null.
//
// PROACTIVE: this test will FAIL until the source patch lands. The fix
// changes `(b || 0) - (a || 0)` to a null-preserving diff helper.
describe('compareRuns null vs 0 (F-AG-013)', () => {
  it('does not conflate null pass_rate with 0', () => {
    const db = getDb();
    const repoId = (db.prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number }).id;

    // Insert two audit_runs and metrics rows by hand to control nullness
    // precisely. importAuditInline always provides a metrics row even when
    // the caller omits one, so we go around it.
    const run1 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now', '-1 day'), 0)
    `).run(repoId);
    const run2 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now'), 0)
    `).run(repoId);

    // run1 metrics: pass_rate is explicitly NULL
    db.prepare(`
      INSERT INTO audit_metrics (audit_run_id, critical_count, high_count, medium_count, pass_rate, controls_passed)
      VALUES (?, 0, 0, 0, NULL, 5)
    `).run(run1.lastInsertRowid);
    // run2 metrics: pass_rate has a real value
    db.prepare(`
      INSERT INTO audit_metrics (audit_run_id, critical_count, high_count, medium_count, pass_rate, controls_passed)
      VALUES (?, 0, 0, 0, 0.92, 10)
    `).run(run2.lastInsertRowid);

    const cmp = compareRuns(run1.lastInsertRowid as number, run2.lastInsertRowid as number);
    expect(cmp).not.toBeNull();
    // The contract: null pass_rate on either side does NOT coerce to 0.
    // The BUG we are preventing is 0.92 - 0 = 0.92 (false improvement signal).
    expect(cmp!.pass_rate).toBeNull();
  });

  it('returns numeric diff when both metrics are present', () => {
    const db = getDb();
    const repoId = (db.prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number }).id;

    const run1 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now', '-1 day'), 0)
    `).run(repoId);
    const run2 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now'), 0)
    `).run(repoId);

    db.prepare(`
      INSERT INTO audit_metrics (audit_run_id, critical_count, high_count, medium_count, pass_rate, controls_passed)
      VALUES (?, 2, 3, 4, 0.7, 5)
    `).run(run1.lastInsertRowid);
    db.prepare(`
      INSERT INTO audit_metrics (audit_run_id, critical_count, high_count, medium_count, pass_rate, controls_passed)
      VALUES (?, 1, 2, 3, 0.92, 8)
    `).run(run2.lastInsertRowid);

    const cmp = compareRuns(run1.lastInsertRowid as number, run2.lastInsertRowid as number);
    expect(cmp).not.toBeNull();
    expect(cmp!.critical).toBe(-1);
    expect(cmp!.high).toBe(-1);
    expect(cmp!.pass_rate).toBeCloseTo(0.22, 5);
    expect(cmp!.improved).toBe(true);
  });
});

// ─── db-A-003-audit: latest-run tiebreak on id DESC ───────────────────────────
// started_at is caller-supplied and only second-precision, so two runs can
// share an identical started_at. Runs are append-only with a monotonic
// AUTOINCREMENT id, so "latest" must break ties on id DESC — otherwise a
// stale run can non-deterministically win and show as latest. This test pins
// that the higher-id run is selected when started_at is identical.
describe('getLatestAudit tiebreak (db-A-003-audit)', () => {
  it('selects the higher-id run when started_at is identical', () => {
    const sameTs = '2026-06-20T12:00:00.000Z';

    // Older run inserted first (lower id), with stale posture.
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
        summary: 'stale run',
        started_at: sameTs,
      },
    });
    // Newer run inserted second (higher id), with the current posture — same
    // started_at to the second.
    const newer = importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'pass',
        overall_posture: 'healthy',
        summary: 'current run',
        started_at: sameTs,
      },
    });

    const repoRow = getDb().prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number };
    const audit = getLatestAudit(repoRow.id);

    expect(audit).not.toBeNull();
    // Without the id DESC tiebreaker, the engine may return either tied row;
    // with it, the higher-id (newer) run always wins.
    expect(audit!.id).toBe(Number(newer.runId));
    expect(audit!.overall_posture).toBe('healthy');
    expect(audit!.summary).toBe('current run');

    // getAuditPosture shares the same latest-run query — it must agree.
    const posture = getAuditPosture(repoRow.id);
    expect(posture!.overall_posture).toBe('healthy');
  });
});

// ─── db-A-004-audit: re-import creates a new run (idempotency scoped to runId)
// The advertised idempotency holds only WITHIN one run id; every import
// inserts a NEW audit_runs row, so re-importing the same fixture creates a
// SECOND run by design (append-only history) rather than overwriting. This
// test pins the documented behavior.
describe('re-import creates a new run (db-A-004-audit)', () => {
  it('importing the same fixture twice produces two distinct runs', () => {
    const first = importAudit(FIXTURES);
    const second = importAudit(FIXTURES);

    expect(Number(second.runId)).toBeGreaterThan(Number(first.runId));

    const repoRow = getDb().prepare("SELECT id FROM repos WHERE slug = 'test-org/sample-test-repo'").get() as { id: number };
    const runCount = (getDb().prepare(
      'SELECT COUNT(*) AS n FROM audit_runs WHERE repo_id = ?'
    ).get(repoRow.id) as { n: number }).n;
    expect(runCount).toBe(2);

    // Latest reflects the SECOND run (db-A-003-audit tiebreak), not a merged one.
    const audit = getLatestAudit(repoRow.id);
    expect(audit!.id).toBe(Number(second.runId));
  });
});

// ─── db-A-001-audit: unknown control_id yields a clear pre-tx error ────────────
// A typo'd control_id (e.g. the nonexistent CI-002 — real id is CIC-002) must
// surface as a clear "Unknown control_id" error BEFORE the transaction, not an
// opaque "FOREIGN KEY constraint failed" rollback. Checked on both the
// controls[] and findings[] control_id paths.
describe('unknown control_id (db-A-001-audit)', () => {
  it('rejects a bogus control_id on a control result with a clear error', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'pass',
        overall_posture: 'healthy',
      },
      controls: [
        { control_id: 'CI-002', result: 'pass' }, // typo: real id is CIC-002
      ],
    })).toThrow('Unknown control_id: CI-002');
  });

  it('rejects a bogus control_id on a finding with a clear error', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { domain: 'cicd', title: 'CI gap', severity: 'high', control_id: 'CI-002' },
      ],
    })).toThrow('Unknown control_id: CI-002');
  });

  it('accepts a real seeded control_id', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'pass',
        overall_posture: 'healthy',
      },
      controls: [
        { control_id: 'CIC-002', result: 'pass' }, // the real id
      ],
    })).not.toThrow();
  });
});

// ─── db-A-002-audit: shared domain/severity validation on the inline path ──────
// importAuditInline relied solely on validateInputs, which omitted finding
// domain/severity presence + the domain-enum check. A missing domain reached
// .run() as a bind-undefined TypeError; a bogus domain surfaced as a raw CHECK
// failure. The checks now live in validateInputs so both import paths share them.
describe('inline finding domain/severity validation (db-A-002-audit)', () => {
  it('rejects a finding missing domain with a clear validation error', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { title: 'No domain', severity: 'high' } as any,
      ],
    })).toThrow(/missing required field: domain/);
  });

  it('rejects a finding with an invalid domain enum value', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { domain: 'not_a_real_domain', title: 'Bad domain', severity: 'high' } as any,
      ],
    })).toThrow('Invalid findings[0] ("Bad domain") domain');
  });

  it('rejects a finding missing severity with a clear validation error', () => {
    expect(() => importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
      },
      findings: [
        { domain: 'secrets', title: 'No severity' } as any,
      ],
    })).toThrow(/missing required field: severity/);
  });
});

// ─── db-A-005-audit: malformed metrics.json shape guard ────────────────────────
// metrics.json is cast to MetricsInput with no object-shape guard, unlike its
// controls/findings/artifacts siblings. A null/scalar/array body would pass the
// cast and blow up inside the transaction. The guard rejects it up-front with a
// clear "expected metrics object" error.
describe('malformed metrics.json (db-A-005-audit)', () => {
  function makeAuditDir(metricsBody: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'rk-audit-metrics-'));
    // Reuse the sample fixture's run.json so the import gets past repo resolution.
    cpSync(join(FIXTURES, 'run.json'), join(dir, 'run.json'));
    writeFileSync(join(dir, 'metrics.json'), metricsBody, 'utf-8');
    return dir;
  }

  it('rejects a scalar metrics body with a clear error', () => {
    const dir = makeAuditDir('42');
    try {
      expect(() => importAudit(dir)).toThrow(/expected metrics object/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects a null metrics body with a clear error', () => {
    const dir = makeAuditDir('null');
    try {
      expect(() => importAudit(dir)).toThrow(/expected metrics object, got null/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects an array metrics body with a clear error', () => {
    const dir = makeAuditDir('[]');
    try {
      expect(() => importAudit(dir)).toThrow(/expected metrics object, got array/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
