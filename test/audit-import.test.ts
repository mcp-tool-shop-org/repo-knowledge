import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
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
