import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { openDb, closeDb, getDb, upsertRepo } from '../src/db/init.js';
import { seedControls } from '../src/audit/controls.js';
import { importAudit, importAuditInline } from '../src/audit/import.js';
import { getLatestAudit, getAuditPosture, getOpenFindings } from '../src/audit/queries.js';

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
});
