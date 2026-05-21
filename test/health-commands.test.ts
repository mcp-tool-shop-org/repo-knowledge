/**
 * F-TS-FT3.5 (health renderers): seeded-DB tests for buildFeed,
 * buildRepoDoctor, buildHealthTable + their text renderers.
 *
 * No network mocking needed — these renderers consume DB state
 * directly. The sync-build-health.test.ts file covers the
 * shell-out-mocked workers.
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
  upsertWorkflowPermissions,
  upsertObservedToolchain,
  setRepoCiStatus,
  setRepoToolchainPin,
} from '../src/db/init.js';
import {
  buildFeed, renderFeedText,
  buildRepoDoctor, renderDoctorText,
  buildHealthTable, renderHealthTableText,
} from '../src/health/index.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-health-'));
  openDb(join(tmpDir, 'h.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── buildFeed ───────────────────────────────────────────────────────────

describe('buildFeed — change feed (per Treude & Storey 2010)', () => {
  it('emits audit_delta when consecutive snapshots differ', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 2, severity_high: 1,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    const events = buildFeed();
    const deltas = events.filter(e => e.kind === 'audit_delta');
    expect(deltas.length).toBe(2);
    const critDelta = deltas.find(e => e.payload.severity === 'critical')!;
    expect(critDelta.payload.from).toBe(0);
    expect(critDelta.payload.to).toBe(2);
  });

  it('emits kev_intersect when a new CVE ID is in the KEV list', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      critical_cve_ids: ['CVE-2025-30066'],
    });
    const events = buildFeed({ kevList: new Set(['CVE-2025-30066']) });
    const kev = events.find(e => e.kind === 'kev_intersect');
    expect(kev).toBeDefined();
    expect(kev!.payload.cve_id).toBe('CVE-2025-30066');
  });

  it('emits action_unpinned_new only for branch-pinned actions', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'main',
      pin_quality: 'branch',
    });
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/setup-node',
      pinned_version: 'v4',
      pin_quality: 'major',  // not branch — should NOT emit
    });
    const events = buildFeed();
    const unpinned = events.filter(e => e.kind === 'action_unpinned_new');
    expect(unpinned.length).toBe(1);
    expect(unpinned[0].payload.action_ref).toBe('actions/checkout');
  });

  it('emits ci_streak_broken only when last_ci_status is failing', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    setRepoCiStatus(repoId, { status: 'failing' });
    const events = buildFeed();
    expect(events.some(e => e.kind === 'ci_streak_broken')).toBe(true);

    setRepoCiStatus(repoId, { status: 'passing' });
    const events2 = buildFeed();
    expect(events2.some(e => e.kind === 'ci_streak_broken')).toBe(false);
  });

  it('emits toolchain_drift_new for each drifted (tool, rig)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    setRepoToolchainPin(repoId, { node: '22.4.0' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '20.10.0',
    });
    const events = buildFeed();
    const drift = events.find(e => e.kind === 'toolchain_drift_new');
    expect(drift).toBeDefined();
    expect(drift!.payload.tool).toBe('node');
    expect(drift!.payload.declared).toBe('22.4.0');
    expect(drift!.payload.observed).toBe('20.10.0');
  });

  it('renderFeedText returns "No changes" for empty feed', () => {
    expect(renderFeedText([])).toMatch(/no changes/i);
  });
});

// ─── buildRepoDoctor ─────────────────────────────────────────────────────

describe('buildRepoDoctor (decision-moment deep-dive)', () => {
  it('returns null for unknown slug', () => {
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

  it('renderDoctorText produces a multi-section block', () => {
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
});

// ─── buildHealthTable ────────────────────────────────────────────────────

describe('buildHealthTable (JSON-first per McIlroy 1978 / jq)', () => {
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

  it('grades dep_health yellow when critical > 0 but NO CVE IDs (shape-broken)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1, severity_high: 0,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
      // critical_cve_ids deliberately omitted — pre-Pu-2026 shape
    });
    const rows = buildHealthTable();
    expect(rows[0].dep_health).toBe('yellow');
  });

  it('grades action_pin_health red for branch pins (per CISA Mar 2025)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'foo/bar',
      pinned_version: 'main',
      pin_quality: 'branch',
    });
    const rows = buildHealthTable();
    expect(rows[0].action_pin_health).toBe('red');
    expect(rows[0].detail.worst_pin_quality).toBe('branch');
  });

  it('grades action_pin_health green for all SHA pins', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'actions/checkout',
      pinned_version: 'b39b52d1213e96004bfcb1c61a8a6fa8ab84f3e8',
      pin_quality: 'sha',
    });
    const rows = buildHealthTable();
    expect(rows[0].action_pin_health).toBe('green');
  });

  it('reports toolchain_drift=true when declared and observed differ', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    setRepoToolchainPin(repoId, { node: '22.4.0' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '20.10.0',
    });
    const rows = buildHealthTable();
    expect(rows[0].toolchain_drift).toBe(true);
  });

  it('renderHealthTableText prints a header + row per repo', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const rows = buildHealthTable();
    const text = renderHealthTableText(rows);
    expect(text).toContain('SLUG');
    expect(text).toContain('CI');
    expect(text).toContain('DEP');
    expect(text).toContain('ACTIONS');
    expect(text).toContain('o/r');
  });

  it('returns "No repos" when portfolio is empty', () => {
    expect(renderHealthTableText([])).toMatch(/no repos/i);
  });
});
