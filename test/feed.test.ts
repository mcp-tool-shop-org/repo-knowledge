/**
 * STUDY-RK-023: dedicated suite for src/health/feed.ts.
 *
 * health-commands.test.ts already covers builders via the health/index.js
 * barrel. This file owns buildFeed(+kevList) + renderFeedText, including
 * the action_sha_rewritten FeedEvent path. DB-read only.
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
import { buildFeed, renderFeedText, type FeedEvent } from '../src/health/feed.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-feed-'));
  openDb(join(tmpDir, 'feed.db'));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildFeed', () => {
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

  it('emits a first-snapshot audit_delta for a HIGH-only first audit (hg-A-004)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'high-only' }) as number;
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0, severity_high: 3,
      severity_moderate: 0, severity_low: 0,
      tool: 'npm_audit',
    });
    const events = buildFeed();
    const highDelta = events.find(
      e => e.kind === 'audit_delta' && e.payload.severity === 'high',
    );
    expect(highDelta).toBeDefined();
    expect(highDelta!.payload.from).toBeNull();
    expect(highDelta!.payload.to).toBe(3);
    expect(
      events.some(e => e.kind === 'audit_delta' && e.payload.severity === 'critical'),
    ).toBe(false);
  });

  it('emits kev_intersect when a new CVE ID is in the kevList', () => {
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
      pin_quality: 'major',
    });
    const events = buildFeed();
    const unpinned = events.filter(e => e.kind === 'action_unpinned_new');
    expect(unpinned.length).toBe(1);
    expect(unpinned[0].payload.action_ref).toBe('actions/checkout');
  });

  it('emits ci_streak_broken only when last_ci_status is failing', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    setRepoCiStatus(repoId, { status: 'failing' });
    expect(buildFeed().some(e => e.kind === 'ci_streak_broken')).toBe(true);

    setRepoCiStatus(repoId, { status: 'passing' });
    expect(buildFeed().some(e => e.kind === 'ci_streak_broken')).toBe(false);
  });

  it('emits toolchain_drift_new for each drifted (tool, rig)', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertRig({ rig_id: 'rig-A' });
    setRepoToolchainPin(repoId, { node: '22.4.0' });
    upsertObservedToolchain({
      repo_id: repoId, rig_id: 'rig-A', tool: 'node', observed_version: '20.10.0',
    });
    const drift = buildFeed().find(e => e.kind === 'toolchain_drift_new');
    expect(drift).toBeDefined();
    expect(drift!.payload.tool).toBe('node');
    expect(drift!.payload.declared).toBe('22.4.0');
    expect(drift!.payload.observed).toBe('20.10.0');
  });

  // STUDY-RK-023 thin lock: action_sha_rewritten is a FeedEvent kind.
  // buildFeed has no emission branch today — current action rows (including
  // a tag pin whose resolved_sha drifted from a prior upsert) must not
  // invent that kind. The event path is the typed kind + renderer below.
  it('does not emit action_sha_rewritten from current workflow-action rows', () => {
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'tj-actions/changed-files',
      pinned_version: 'v45.0.7',
      resolved_sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      pin_quality: 'mutable-semver',
    });
    upsertWorkflowAction({
      repo_id: repoId,
      workflow_file: '.github/workflows/ci.yml',
      action_ref: 'tj-actions/changed-files',
      pinned_version: 'v45.0.7',
      resolved_sha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      pin_quality: 'mutable-semver',
    });
    const events = buildFeed();
    expect(events.some(e => e.kind === 'action_sha_rewritten')).toBe(false);
    const kinds = new Set(events.map(e => e.kind));
    expect(kinds.has('action_unpinned_new')).toBe(false);
  });
});

describe('renderFeedText', () => {
  it('returns "No changes" for an empty feed', () => {
    expect(renderFeedText([])).toMatch(/no changes/i);
  });

  it('renders an action_sha_rewritten event message', () => {
    const events: FeedEvent[] = [{
      kind: 'action_sha_rewritten',
      repo_slug: 'o/r',
      payload: {
        action_ref: 'tj-actions/changed-files',
        from: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        to: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      },
      message: 'action_sha_rewritten  action=tj-actions/changed-files  repo=o/r',
    }];
    const text = renderFeedText(events);
    expect(text).toContain('action_sha_rewritten');
    expect(text).toContain('tj-actions/changed-files');
    expect(text).toContain('o/r');
  });
});
