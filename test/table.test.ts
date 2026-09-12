/**
 * STUDY-RK-023: dedicated suite for src/health/table.ts.
 *
 * health-commands.test.ts already covers builders via the health/index.js
 * barrel. This file owns buildHealthTable + renderHealthTableText, including
 * gradeCi no_workflow / unknown. DB-read only.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb,
  upsertRepo, upsertRig,
  appendDepAuditHistory,
  upsertWorkflowAction,
  upsertObservedToolchain,
  setRepoCiStatus,
  setRepoToolchainPin,
} from '../src/db/init.js';
import { buildHealthTable, renderHealthTableText } from '../src/health/table.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-table-'));
  openDb(join(tmpDir, 'table.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildHealthTable', () => {
  it('grades dep_health red when critical > 0 AND CVE IDs captured', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-30066'],
    });
    const rows = buildHealthTable();
    expect(rows.length).toBe(1);
    expect(rows[0].dep_health).toBe('red');
    expect(rows[0].detail.critical_cve_count).toBe(1);
  });

  it('grades dep_health unknown for a CI-synced repo with no dep-audit row (hg-A-002)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'ci-only' }) as number;
    setRepoCiStatus(repoId, { status: 'passing' });
    const rows = buildHealthTable();
    expect(rows.length).toBe(1);
    expect(rows[0].detail.ci_status).toBe('passing');
    expect(rows[0].dep_health).toBe('unknown');
  });

  it('grades dep_health green for a scanned-clean repo with empty CVE-id arrays', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'clean' }) as number;
    setRepoCiStatus(repoId, { status: 'passing' });
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: [],
      high_cve_ids: [],
    });
    expect(buildHealthTable()[0].dep_health).toBe('green');
  });

  it('grades dep_health yellow when critical > 0 but NO CVE IDs (shape-broken)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    expect(buildHealthTable()[0].dep_health).toBe('yellow');
  });

  it('grades action_pin_health red for branch pins and green for SHA pins', () => {
    const redId = upsertRepo({ owner: 'o', name: 'branchy' }) as number;
    upsertWorkflowAction({
      repo_id: redId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'foo/bar',
      pinned_version: 'main',
      pin_quality: 'branch',
    });
    const greenId = upsertRepo({ owner: 'o', name: 'sha-pin' }) as number;
    upsertWorkflowAction({
      repo_id: greenId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      pin_quality: 'sha',
    });
    const rows = buildHealthTable();
    const branchy = rows.find(r => r.slug === 'o/branchy')!;
    const shaPin = rows.find(r => r.slug === 'o/sha-pin')!;
    expect(branchy.action_pin_health).toBe('red');
    expect(branchy.detail.worst_pin_quality).toBe('branch');
    expect(shaPin.action_pin_health).toBe('green');
  });

  it('reports toolchain_drift=true when declared and observed differ', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    setRepoToolchainPin(repoId, { node: '22.4.0' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '20.10.0',
    });
    expect(buildHealthTable()[0].toolchain_drift).toBe(true);
  });

  // STUDY-RK-023 thin lock: gradeCi no_workflow → yellow (Memon/DORA map).
  it('grades ci_health yellow when last_ci_status is no_workflow', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'no-ci' }) as number;
    setRepoCiStatus(repoId, { status: 'no_workflow' });
    const row = buildHealthTable()[0];
    expect(row.detail.ci_status).toBe('no_workflow');
    expect(row.ci_health).toBe('yellow');
  });

  // STUDY-RK-023 thin lock: gradeCi unknown → unknown (distinct from yellow).
  it('grades ci_health unknown when last_ci_status is unknown', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'opaque' }) as number;
    setRepoCiStatus(repoId, { status: 'unknown' });
    const row = buildHealthTable()[0];
    expect(row.detail.ci_status).toBe('unknown');
    expect(row.ci_health).toBe('unknown');
  });
});

describe('renderHealthTableText', () => {
  it('prints a header + row per repo', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const text = renderHealthTableText(buildHealthTable());
    expect(text).toContain('SLUG');
    expect(text).toContain('CI');
    expect(text).toContain('DEP');
    expect(text).toContain('ACTIONS');
    expect(text).toContain('o/r');
  });

  it('returns "No repos" when the portfolio is empty', () => {
    expect(renderHealthTableText([])).toMatch(/no repos/i);
  });
});
