/**
 * STUDY-RK-022: dedicated suite for src/audit/queries.ts.
 *
 * audit-import.test.ts already covers getLatestAudit, getAuditPosture,
 * getOpenFindings, getPortfolioPosture, findByAuditStatus (most filters),
 * and compareRuns (F-AG-013). This file does not remove that coverage.
 * It adds getExceptions (previously zero test references) and a direct
 * assert for findByAuditStatus({ domain_failing }) which was only reached
 * via the MCP audit_failing tool.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb, upsertRepo } from '../src/db/init.js';
import { seedControls } from '../src/audit/controls.js';
import { importAuditInline } from '../src/audit/import.js';
import {
  getLatestAudit,
  getAuditPosture,
  getOpenFindings,
  getPortfolioPosture,
  findByAuditStatus,
  getExceptions,
  compareRuns,
} from '../src/audit/queries.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-audit-queries-'));
  openDb(join(tmpDir, 'test.db'));
  seedControls(getDb());
  upsertRepo({ owner: 'test-org', name: 'sample-test-repo' });
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

function repoId(slug = 'test-org/sample-test-repo'): number {
  return (getDb().prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number }).id;
}

describe('getExceptions', () => {
  it('returns an empty list when the repo has no exceptions', () => {
    expect(getExceptions(repoId())).toEqual([]);
  });

  it('returns exceptions for the repo with control_title join, newest first', () => {
    const db = getDb();
    const id = repoId();

    db.prepare(`
      INSERT INTO audit_exceptions (repo_id, control_id, exception_type, justification, approved_by, created_at)
      VALUES (?, 'INV-001', 'accepted_risk', 'legacy inventory gap', 'alice', '2026-01-01T00:00:00Z')
    `).run(id);
    db.prepare(`
      INSERT INTO audit_exceptions (repo_id, control_id, exception_type, justification, approved_by, created_at)
      VALUES (?, 'SCR-002', 'false_positive', 'scanner noise', 'bob', '2026-06-01T00:00:00Z')
    `).run(id);

    const rows = getExceptions(id);
    expect(rows).toHaveLength(2);
    expect(rows[0].control_id).toBe('SCR-002');
    expect(rows[0].control_title).toBe('No active hardcoded secrets, tokens, credentials, or keys');
    expect(rows[0].exception_type).toBe('false_positive');
    expect(rows[0].justification).toBe('scanner noise');
    expect(rows[1].control_id).toBe('INV-001');
    expect(rows[1].control_title).toBe('README present and materially current');
    expect(rows[1].exception_type).toBe('accepted_risk');
  });

  it('does not return exceptions belonging to another repo', () => {
    upsertRepo({ owner: 'test-org', name: 'other-repo' });
    const a = repoId('test-org/sample-test-repo');
    const b = repoId('test-org/other-repo');

    getDb().prepare(`
      INSERT INTO audit_exceptions (repo_id, control_id, exception_type, justification)
      VALUES (?, 'DEP-001', 'deferred', 'wait for lockfile')
    `).run(b);

    expect(getExceptions(a)).toEqual([]);
    const other = getExceptions(b);
    expect(other).toHaveLength(1);
    expect(other[0].control_id).toBe('DEP-001');
    expect(other[0].control_title).toBe('Dependency inventory generated successfully');
  });
});

describe('findByAuditStatus domain_failing', () => {
  it('returns latest-run failing controls in the given domain', () => {
    upsertRepo({ owner: 'test-org', name: 'failing-repo' });
    upsertRepo({ owner: 'test-org', name: 'clean-repo' });

    importAuditInline({
      run: { slug: 'test-org/failing-repo', overall_status: 'fail', overall_posture: 'critical' },
      controls: [
        { control_id: 'SCR-002', result: 'fail', notes: 'token found' },
        { control_id: 'INV-001', result: 'pass' },
      ],
    });
    importAuditInline({
      run: { slug: 'test-org/clean-repo', overall_status: 'pass', overall_posture: 'healthy' },
      controls: [{ control_id: 'SCR-002', result: 'pass' }],
    });

    const failing = findByAuditStatus({ domain_failing: 'secrets' });
    expect(failing).toHaveLength(1);
    expect(failing[0].slug).toBe('test-org/failing-repo');
    expect(failing[0].control_id).toBe('SCR-002');
    expect(failing[0].result).toBe('fail');

    expect(findByAuditStatus({ domain_failing: 'inventory' })).toEqual([]);
  });
});

describe('query surfaces (dedicated, non-regressing audit-import coverage)', () => {
  it('getLatestAudit and getAuditPosture return null when the repo has no runs', () => {
    const id = repoId();
    expect(getLatestAudit(id)).toBeNull();
    expect(getAuditPosture(id)).toBeNull();
  });

  it('getLatestAudit / getAuditPosture / getOpenFindings / getPortfolioPosture agree on a seeded run', () => {
    importAuditInline({
      run: {
        slug: 'test-org/sample-test-repo',
        overall_status: 'fail',
        overall_posture: 'critical',
        summary: 'queries dedicated',
      },
      controls: [{ control_id: 'SCR-002', result: 'fail' }],
      findings: [{ domain: 'secrets', title: 'Live token', severity: 'critical', status: 'open' }],
      metrics: { controls_total: 10, controls_passed: 7, pass_rate: 0.7, critical_count: 1 },
    });

    const id = repoId();
    const audit = getLatestAudit(id);
    expect(audit).not.toBeNull();
    expect(audit!.overall_posture).toBe('critical');
    expect(audit!.controls).toHaveLength(1);
    expect(audit!.findings).toHaveLength(1);

    const posture = getAuditPosture(id);
    expect(posture).not.toBeNull();
    expect(posture!.overall_status).toBe('fail');
    expect(posture!.open_findings.critical).toBe(1);
    expect(posture!.failed_domains).toContain('secrets');
    expect(posture!.pass_rate).toBe(0.7);

    const open = getOpenFindings({ domain: 'secrets' });
    expect(open).toHaveLength(1);
    expect(open[0].title).toBe('Live token');

    const portfolio = getPortfolioPosture();
    expect(portfolio.some((r) => r.slug === 'test-org/sample-test-repo' && r.overall_posture === 'critical')).toBe(true);
  });

  it('compareRuns returns null when either run has no metrics', () => {
    const db = getDb();
    const id = repoId();
    const run1 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now', '-1 day'), 0)
    `).run(id);
    const run2 = db.prepare(`
      INSERT INTO audit_runs (repo_id, audit_version, overall_status, overall_posture, started_at, blocking_release)
      VALUES (?, '1.0', 'pass', 'healthy', datetime('now'), 0)
    `).run(id);

    db.prepare(`
      INSERT INTO audit_metrics (audit_run_id, critical_count, high_count)
      VALUES (?, 0, 0)
    `).run(run1.lastInsertRowid);

    expect(compareRuns(run1.lastInsertRowid as number, run2.lastInsertRowid as number)).toBeNull();
    expect(compareRuns(99999, run1.lastInsertRowid as number)).toBeNull();
  });
});
