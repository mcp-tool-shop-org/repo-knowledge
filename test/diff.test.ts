/**
 * F-TS-FT4: getRepoDiff (FT-4).
 *
 * Seeds notes / audit_runs / repo_dep_audit_history / repo_published_versions
 * with explicit timestamps, calls getRepoDiff with various windows, and
 * verifies which entries appear in each section.
 *
 * SQLite datetime() strings are 'YYYY-MM-DD HH:MM:SS' UTC; we use
 * datetime('now', '-N days') and direct ISO strings to seed the
 * timestamps.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertNote, upsertPublishedVersion,
  appendDepAuditHistory,
} from '../src/db/init.js';
import { getRepoDiff } from '../src/health/diff.js';

let tmpDir: string;
let repoId: number;
const SLUG = 'o/r';

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-diff-'));
  openDb(join(tmpDir, 'test.db'));
  repoId = Number(upsertRepo({ owner: 'o', name: 'r' }));
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('getRepoDiff — slug resolution', () => {
  it('returns null for an unknown slug', () => {
    const r = getRepoDiff('does-not/exist');
    expect(r).toBeNull();
  });

  it('returns a report for a known slug with no changes', () => {
    const r = getRepoDiff(SLUG);
    expect(r).not.toBeNull();
    expect(r!.slug).toBe(SLUG);
    expect(r!.notes_added.length).toBe(0);
    expect(r!.audit_runs.length).toBe(0);
    expect(r!.dep_audit.snapshots.length).toBe(0);
    expect(r!.published_versions.length).toBe(0);
    // untracked_sources is the educational footer — always populated.
    expect(r!.untracked_sources.length).toBeGreaterThan(0);
  });
});

describe('getRepoDiff — notes_added', () => {
  it('captures notes whose created_at falls inside the default 7-day window', () => {
    upsertNote(repoId, 'thesis', 'recent note', 'fresh body', 'manual');
    const r = getRepoDiff(SLUG)!;
    expect(r.notes_added.length).toBe(1);
    expect(r.notes_added[0].note_type).toBe('thesis');
    expect(r.notes_added[0].title).toBe('recent note');
  });

  it('excludes notes older than the window', () => {
    // Insert directly so we can backdate the timestamp.
    const db = getDb();
    db.prepare(`
      INSERT INTO repo_notes (repo_id, note_type, title, content, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-30 days'), datetime('now', '-30 days'))
    `).run(repoId, 'general', 'old note', 'old body', 'manual');

    const r = getRepoDiff(SLUG)!;
    expect(r.notes_added.length).toBe(0);
  });

  it('--since / --until override the window correctly', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO repo_notes (repo_id, note_type, title, content, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-30 days'), datetime('now', '-30 days'))
    `).run(repoId, 'general', 'far past', 'body', 'manual');

    // Default window misses it.
    expect(getRepoDiff(SLUG)!.notes_added.length).toBe(0);

    // Custom 60-day window includes it.
    const since = (db.prepare("SELECT datetime('now', '-60 days') AS s").get() as { s: string }).s;
    const r = getRepoDiff(SLUG, { since })!;
    expect(r.notes_added.length).toBe(1);
    expect(r.notes_added[0].title).toBe('far past');
  });
});

describe('getRepoDiff — audit_runs', () => {
  it('captures audit_runs whose started_at lands inside the window', () => {
    const db = getDb();
    const r = db.prepare(`
      INSERT INTO audit_runs (repo_id, scope_level, overall_status, overall_posture)
      VALUES (?, 'core', 'pass', 'healthy')
    `).run(repoId);
    expect(r.changes).toBe(1);

    const report = getRepoDiff(SLUG)!;
    expect(report.audit_runs.length).toBe(1);
    expect(report.audit_runs[0].overall_status).toBe('pass');
    expect(report.audit_runs[0].overall_posture).toBe('healthy');
  });

  it('excludes audit_runs older than the window', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_runs (repo_id, scope_level, overall_status, overall_posture, started_at)
      VALUES (?, 'core', 'fail', 'critical', datetime('now', '-30 days'))
    `).run(repoId);

    const report = getRepoDiff(SLUG)!;
    expect(report.audit_runs.length).toBe(0);
  });
});

describe('getRepoDiff — dep_audit delta', () => {
  it('reports a delta when multiple snapshots land in the window', () => {
    // First snapshot: 0 critical / 1 high.
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0,
      severity_high: 1,
      severity_moderate: 2,
      severity_low: 3,
      tool: 'npm',
    });
    // Second snapshot, 1 critical / 0 high. Both within the default window.
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 1,
      severity_high: 0,
      severity_moderate: 2,
      severity_low: 3,
      tool: 'npm',
    });

    const report = getRepoDiff(SLUG)!;
    expect(report.dep_audit.snapshots.length).toBe(2);
    expect(report.dep_audit.delta).not.toBeNull();
    expect(report.dep_audit.delta!.severity_critical).toBe(1);  // to - from = 1 - 0
    expect(report.dep_audit.delta!.severity_high).toBe(-1);     // 0 - 1
    expect(report.dep_audit.delta!.severity_moderate).toBe(0);
    expect(report.dep_audit.delta!.severity_low).toBe(0);
  });

  it('returns null delta when only one snapshot is in the window', () => {
    appendDepAuditHistory({
      repo_id: repoId,
      severity_critical: 0,
      severity_high: 0,
      severity_moderate: 0,
      severity_low: 0,
      tool: 'npm',
    });
    const report = getRepoDiff(SLUG)!;
    expect(report.dep_audit.snapshots.length).toBe(1);
    expect(report.dep_audit.delta).toBeNull();
    expect(report.dep_audit.to).not.toBeNull();
  });
});

describe('getRepoDiff — date-only --until (hg-A-005)', () => {
  it('includes same-day timestamped rows when --until is a bare date', () => {
    const db = getDb();
    // Today's date (UTC) as SQLite sees it, plus a same-day note stamped
    // at midday so it is lexically GREATER than the bare 'YYYY-MM-DD'.
    const today = (db.prepare("SELECT date('now') AS d").get() as { d: string }).d;
    db.prepare(`
      INSERT INTO repo_notes (repo_id, note_type, title, content, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', 'start of day', '+14 hours'), datetime('now'))
    `).run(repoId, 'general', 'midday note', 'body', 'manual');

    // Bare date-only until. Without end-of-day normalization the midday
    // row ('YYYY-MM-DD 14:00:00') sorts after 'YYYY-MM-DD' and is dropped.
    const r = getRepoDiff(SLUG, { until: today })!;
    const titles = r.notes_added.map(n => n.title);
    expect(titles).toContain('midday note');
  });

  it('still excludes rows on the day AFTER a date-only --until', () => {
    const db = getDb();
    const today = (db.prepare("SELECT date('now') AS d").get() as { d: string }).d;
    // A note stamped tomorrow must NOT leak in when until is today.
    db.prepare(`
      INSERT INTO repo_notes (repo_id, note_type, title, content, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '+1 day'), datetime('now'))
    `).run(repoId, 'general', 'tomorrow note', 'body', 'manual');

    const r = getRepoDiff(SLUG, { until: today })!;
    const titles = r.notes_added.map(n => n.title);
    expect(titles).not.toContain('tomorrow note');
  });
});

describe('getRepoDiff — published_versions', () => {
  it('captures versions whose synced_at lands in the window', () => {
    upsertPublishedVersion({
      repo_id: repoId,
      channel: 'npm',
      version: '1.2.3',
      published_at: '2026-05-15T00:00:00Z',
      source: 'npm_view',
    });
    const r = getRepoDiff(SLUG)!;
    expect(r.published_versions.length).toBe(1);
    expect(r.published_versions[0].channel).toBe('npm');
    expect(r.published_versions[0].version).toBe('1.2.3');
  });

  it('excludes versions older than the window', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO repo_published_versions
        (repo_id, channel, version, published_at, source, synced_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-30 days'))
    `).run(repoId, 'npm', '0.9.0', null, 'npm_view');

    const r = getRepoDiff(SLUG)!;
    expect(r.published_versions.length).toBe(0);
  });
});

describe('getRepoDiff — untracked sources footer', () => {
  it('always reports the known-untracked sources for operator awareness', () => {
    const r = getRepoDiff(SLUG)!;
    const names = r.untracked_sources.map(u => u.name);
    expect(names).toContain('repo_facts');
    expect(names).toContain('repo_relationships');
    // The repo-level fields lookup includes 'repos.*' phrasing.
    expect(names.some(n => n.includes('repos'))).toBe(true);
  });
});
