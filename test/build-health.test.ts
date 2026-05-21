/**
 * F-TS-FT3.5 (DB helpers): exercises the build-health helpers in
 * src/db/init.ts added by migration-009.
 *
 * Covers: CVE ID round-trip on repo_dep_audit_state, history insertion,
 * pin_quality enum validation, observed toolchain UPSERT, workflow
 * permissions UPSERT, getToolchainDrift declared-vs-observed
 * comparison, and FK cascade for the new tables.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertRig,
  upsertDepAuditState, getDepAuditState,
  appendDepAuditHistory, getDepAuditHistory,
  upsertWorkflowAction, listWorkflowActions,
  upsertWorkflowPermissions, listWorkflowPermissions,
  upsertObservedToolchain, listObservedToolchain,
  setRepoToolchainPin, getToolchainDrift,
  setRepoCiStatus,
  getPortfolioHealth,
  PIN_QUALITIES,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-bh-'));
  openDb(join(tmpDir, 'bh.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('upsertDepAuditState — CVE ID storage (per Pu 2026 NDSS)', () => {
  it('round-trips critical_cve_ids + high_cve_ids as JSON arrays', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertDepAuditState({
      repo_id: repoId,
      severity_critical: 2,
      severity_high: 1,
      severity_moderate: 5,
      severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-30066', 'CVE-2025-12345'],
      high_cve_ids: ['GHSA-aaaa-bbbb-cccc'],
      audit_omit_dev: true,
    });
    const row = getDepAuditState(repoId);
    expect(row).not.toBeNull();
    expect(row!.severity_critical).toBe(2);
    expect(row!.audit_omit_dev).toBe(1);
    expect(JSON.parse(row!.critical_cve_ids!)).toEqual(['CVE-2025-30066', 'CVE-2025-12345']);
    expect(JSON.parse(row!.high_cve_ids!)).toEqual(['GHSA-aaaa-bbbb-cccc']);
  });

  it('stores null cve ids when omitted; audit_omit_dev defaults to 0', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertDepAuditState({
      repo_id: repoId,
      severity_critical: 0,
      severity_high: 0,
      severity_moderate: 0,
      severity_low: 0,
      tool: 'npm_audit',
    });
    const row = getDepAuditState(repoId);
    expect(row).not.toBeNull();
    expect(row!.critical_cve_ids).toBeNull();
    expect(row!.high_cve_ids).toBeNull();
    expect(row!.audit_omit_dev).toBe(0);
    // Clean state stamps last_clean_at
    expect(row!.last_clean_at).not.toBeNull();
  });

  it('preserves last_clean_at across a dirty re-upsert', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertDepAuditState({
      repo_id: repoId,
      severity_critical: 0,
      severity_high: 0,
      severity_moderate: 0,
      severity_low: 0,
      tool: 'npm_audit',
    });
    const clean = getDepAuditState(repoId)!.last_clean_at;
    expect(clean).not.toBeNull();

    upsertDepAuditState({
      repo_id: repoId,
      severity_critical: 1,
      severity_high: 0,
      severity_moderate: 0,
      severity_low: 0,
      tool: 'npm_audit',
    });
    expect(getDepAuditState(repoId)!.last_clean_at).toBe(clean);
  });
});

describe('appendDepAuditHistory + getDepAuditHistory (per VulnCheck Q1 2025)', () => {
  it('appends snapshots and returns them newest-first', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 2,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-1'],
    });
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 3, severity_high: 1,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-1', 'CVE-2025-2'],
    });
    const history = getDepAuditHistory(repoId);
    expect(history.length).toBe(2);
    // newest first
    expect(history[0].severity_critical).toBe(3);
    expect(history[1].severity_critical).toBe(1);
    // CVE IDs round-trip
    expect(JSON.parse(history[0].critical_cve_ids!)).toEqual(['CVE-2025-1', 'CVE-2025-2']);
  });

  it('also updates repo_dep_audit_state projection in the same transaction', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 4, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    const latest = getDepAuditState(repoId);
    expect(latest).not.toBeNull();
    expect(latest!.severity_critical).toBe(4);
  });

  it('respects the limit parameter', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    for (let i = 0; i < 5; i++) {
      appendDepAuditHistory({
        repo_id: repoId,
        severity_critical: i, severity_high: 0,
        severity_moderate: 0, severity_low: 0,
        tool: 'npm_audit',
      });
    }
    expect(getDepAuditHistory(repoId, 2).length).toBe(2);
    expect(getDepAuditHistory(repoId, 10).length).toBe(5);
  });
});

describe('upsertWorkflowAction — pin_quality enum (per OpenSSF 2024)', () => {
  it('stores resolved_sha / pin_quality / immutable_publisher', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'v4',
      pin_quality: 'major',
      immutable_publisher: false,
    });
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/setup-node',
      pinned_version: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      pin_quality: 'sha',
      resolved_sha: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      immutable_publisher: true,
    });
    const rows = listWorkflowActions(repoId);
    expect(rows.length).toBe(2);
    const checkout = rows.find(r => r.action_ref === 'actions/checkout')!;
    expect(checkout.pin_quality).toBe('major');
    expect(checkout.immutable_publisher).toBe(0);
    const setupNode = rows.find(r => r.action_ref === 'actions/setup-node')!;
    expect(setupNode.pin_quality).toBe('sha');
    expect(setupNode.resolved_sha).toBe('b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8');
    expect(setupNode.immutable_publisher).toBe(1);
  });

  it('rejects pin_quality values outside PIN_QUALITIES', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    expect(() => {
      upsertWorkflowAction({
        repo_id: repoId,
        workflow_file: '.github/workflows/ci.yml',
        action_ref: 'actions/checkout',
        pinned_version: 'v4',
        // @ts-expect-error - deliberate invalid value
        pin_quality: 'invalid-quality',
      });
    }).toThrow(/Invalid pin_quality/);
  });

  it('coalesces undefined fields on update (preserves prior values)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'v4',
      pin_quality: 'major',
      immutable_publisher: true,
    });
    // Re-upsert without pin_quality / immutable_publisher → preserve.
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'v4.2.0',
    });
    const row = listWorkflowActions(repoId)[0];
    expect(row.pinned_version).toBe('v4.2.0');
    expect(row.pin_quality).toBe('major');  // preserved
    expect(row.immutable_publisher).toBe(1); // preserved
  });

  it('PIN_QUALITIES has the documented 5 values', () => {
    expect(PIN_QUALITIES).toEqual(['sha', 'immutable-semver', 'mutable-semver', 'major', 'branch']);
  });
});

describe('workflow permissions (per Beyer 2016 SRE Workbook)', () => {
  it('upserts and lists per (repo_id, workflow_file)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowPermissions({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      permissions_json: 'default',
    });
    upsertWorkflowPermissions({
      repo_id: repoId,
      workflow_file: '.github/workflows/release.yml',
      permissions_json: JSON.stringify({ contents: 'read', 'id-token': 'write' }),
    });
    const rows = listWorkflowPermissions(repoId);
    expect(rows.length).toBe(2);
    expect(rows[0].permissions_json).toBe('default');
    // Re-upsert overwrites
    upsertWorkflowPermissions({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      permissions_json: JSON.stringify({ contents: 'read' }),
    });
    const updated = listWorkflowPermissions(repoId).find(
      r => r.workflow_file === '.github/workflows/ci.yml'
    )!;
    expect(JSON.parse(updated.permissions_json!)).toEqual({ contents: 'read' });
  });
});

describe('observed toolchain + drift (per JetBrains 2025)', () => {
  it('upserts (repo, rig, tool) observations', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '22.4.0',
    });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '22.5.0',  // re-observe
    });
    const rows = listObservedToolchain(repoId);
    expect(rows.length).toBe(1);
    expect(rows[0].observed_version).toBe('22.5.0');
  });

  it('getToolchainDrift returns only mismatched tools', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    setRepoToolchainPin(repoId, { node: '22.4.0', typescript: '5.9.3' });

    // Same node, drifted typescript
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '22.4.0',
    });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'typescript', observed_version: '5.5.0',
    });
    const drift = getToolchainDrift(repoId);
    expect(drift.length).toBe(1);
    expect(drift[0].tool).toBe('typescript');
    expect(drift[0].declared_version).toBe('5.9.3');
    expect(drift[0].observed_version).toBe('5.5.0');
  });

  it('returns empty drift when no toolchain_pin is set (opt-out is not drift)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '22.4.0',
    });
    expect(getToolchainDrift(repoId)).toEqual([]);
  });
});

describe('FK cascade — migration-009 tables', () => {
  it('cascades repo_workflow_permissions on repo delete', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowPermissions({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      permissions_json: 'default',
    });
    expect(listWorkflowPermissions(repoId).length).toBe(1);
    getDb().prepare('DELETE FROM repos WHERE id = ?').run(repoId);
    expect(listWorkflowPermissions(repoId).length).toBe(0);
  });

  it('cascades repo_observed_toolchain on rig delete', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '22.4.0',
    });
    expect(listObservedToolchain(repoId).length).toBe(1);
    getDb().prepare('DELETE FROM rigs WHERE rig_id = ?').run('rig-A');
    expect(listObservedToolchain(repoId).length).toBe(0);
  });
});

describe('getPortfolioHealth — extended fields (per Pu 2026 / JetBrains 2025)', () => {
  it('surfaces CVE IDs + last_ci_run_at + last_ci_url + toolchain_pin', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertDepAuditState({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-30066'],
      audit_omit_dev: true,
    });
    setRepoCiStatus(repoId, {
      status: 'passing',
      run_at: '2026-05-21T00:00:00Z',
      url: 'https://github.com/o/r/actions/runs/1',
    });
    setRepoToolchainPin(repoId, { node: '22.4.0' });

    const rows = getPortfolioHealth();
    expect(rows.length).toBe(1);
    const row = rows[0];
    expect(row.severity_critical).toBe(1);
    expect(JSON.parse(row.critical_cve_ids!)).toEqual(['CVE-2025-30066']);
    expect(row.audit_omit_dev).toBe(1);
    expect(row.last_ci_status).toBe('passing');
    expect(row.last_ci_url).toBe('https://github.com/o/r/actions/runs/1');
    expect(JSON.parse(row.toolchain_pin!)).toEqual({ node: '22.4.0' });
  });
});
