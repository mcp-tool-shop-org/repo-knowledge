/**
 * STUDY-RK-023: dedicated suite for src/health/doctor.ts.
 *
 * health-commands.test.ts already covers builders via the health/index.js
 * barrel. This file owns buildRepoDoctor + renderDoctorText, including the
 * malformed toolchain_pin → null declared path. DB-read only.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertRig,
  appendDepAuditHistory,
  upsertWorkflowAction,
  upsertWorkflowPermissions,
  upsertObservedToolchain,
  setRepoCiStatus,
  setRepoToolchainPin,
} from '../src/db/init.js';
import { buildRepoDoctor, renderDoctorText } from '../src/health/doctor.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-doctor-'));
  openDb(join(tmpDir, 'doctor.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildRepoDoctor', () => {
  it('returns null for an unknown slug', () => {
    expect(buildRepoDoctor('nothing/here')).toBeNull();
  });

  it('aggregates dep audit + actions + CI + toolchain into one report', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-30066'],
    });
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      resolved_sha: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      pin_quality: 'sha',
    });
    upsertWorkflowPermissions({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      permissions_json: 'default',
    });
    setRepoCiStatus(repoId, { status: 'passing' });

    const report = buildRepoDoctor('o/r');
    expect(report).not.toBeNull();
    expect(report!.dep_audit.latest!.severity_critical).toBe(1);
    expect(report!.dep_audit.critical_cve_ids).toEqual(['CVE-2025-30066']);
    expect(report!.workflow_actions.length).toBe(1);
    expect(report!.workflow_actions[0].pin_quality).toBe('sha');
    expect(report!.workflow_permissions.length).toBe(1);
    expect(report!.ci.status).toBe('passing');
  });

  it('sets toolchain.declared from a well-formed toolchain_pin', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    setRepoToolchainPin(repoId, { node: '22.4.0' });
    const report = buildRepoDoctor('o/r');
    expect(report).not.toBeNull();
    expect(report!.toolchain.declared).toEqual({ node: '22.4.0' });
  });

  // STUDY-RK-023 thin lock: malformed toolchain_pin JSON → declared null
  // (catch path in buildRepoDoctor). Drift stays empty even with observations
  // because getToolchainDrift also fails closed on the same JSON.
  it('treats malformed toolchain_pin as null doctor toolchain fields', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '20.10.0',
    });
    getDb().prepare('UPDATE repos SET toolchain_pin = ? WHERE id = ?')
      .run('{not-json', repoId);

    const report = buildRepoDoctor('o/r');
    expect(report).not.toBeNull();
    expect(report!.toolchain.declared).toBeNull();
    expect(report!.toolchain.drift).toEqual([]);
    expect(report!.toolchain.observed.length).toBe(1);
  });
});

describe('renderDoctorText', () => {
  it('produces a multi-section block', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    setRepoCiStatus(repoId, { status: 'passing' });
    const report = buildRepoDoctor('o/r')!;
    const text = renderDoctorText(report);
    expect(text).toContain('o/r');
    expect(text).toContain('CI');
    expect(text).toContain('Toolchain');
    expect(text).toContain('Dep audit');
    expect(text).toContain('Workflow actions');
  });

  it('renders the null-declared toolchain line after malformed toolchain_pin', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    getDb().prepare('UPDATE repos SET toolchain_pin = ? WHERE id = ?')
      .run('not-json-at-all', repoId);
    const text = renderDoctorText(buildRepoDoctor('o/r')!);
    expect(text).toContain('Declared:   (no toolchain_pin set)');
  });
});
