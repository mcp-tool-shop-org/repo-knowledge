/**
 * src/health/diff.ts — DB-entry change history for a single repo (FT-4).
 *
 * `getRepoDiff(slug, opts)` answers: "what changed for this repo's DB
 * entry between two timestamps?" The default window is the last 7 days
 * (until = now), tunable via opts.since / opts.until.
 *
 * Tracked sources (timestamped via column on the source table):
 *   - repo_notes               via created_at       (added notes)
 *   - audit_runs               via started_at       (audit runs in window)
 *   - repo_published_versions  via synced_at        (versions seen on channel)
 *   - repo_dep_audit_history   via taken_at         (severity deltas)
 *
 * Untracked sources (no history table; flagged in output):
 *   - repo_facts          — has updated_at but no history table; can't
 *                           detect fact_added vs fact_removed cleanly.
 *   - repo_relationships  — no timestamp column.
 *   - Repo-level field changes (description, status, stars) — no
 *                           repos_history table; the source is the
 *                           upstream git log.
 *
 * Out of scope: we deliberately don't add a history table for these in
 * FT-4 (would expand the schema beyond the slice). The renderer
 * surfaces a "not tracked" line so the operator knows the gap is
 * acknowledged rather than missing.
 */
import { getDb, getRepoIdBySlug } from '../db/init.js';

export interface NoteAddedEntry {
  id: number;
  note_type: string;
  title: string | null;
  source: string | null;
  created_at: string;
}

export interface AuditRunEntry {
  id: number;
  started_at: string;
  completed_at: string | null;
  overall_status: string | null;
  overall_posture: string | null;
  scope_level: string | null;
}

export interface DepAuditSnapshotEntry {
  id: number;
  taken_at: string;
  severity_critical: number;
  severity_high: number;
  severity_moderate: number;
  severity_low: number;
  tool: string;
}

export interface DepAuditDelta {
  /** Earliest snapshot in the window. */
  from: DepAuditSnapshotEntry | null;
  /** Latest snapshot in the window. */
  to: DepAuditSnapshotEntry | null;
  /** Delta in counts (to - from). Null if either side is missing. */
  delta: {
    severity_critical: number;
    severity_high: number;
    severity_moderate: number;
    severity_low: number;
  } | null;
  /** Every snapshot in the window, newest first. */
  snapshots: DepAuditSnapshotEntry[];
}

export interface PublishedVersionEntry {
  id: number;
  channel: string;
  version: string;
  published_at: string | null;
  synced_at: string;
  source: string | null;
}

export interface RepoDiffReport {
  slug: string;
  repo_id: number;
  since: string;
  until: string;
  notes_added: NoteAddedEntry[];
  audit_runs: AuditRunEntry[];
  dep_audit: DepAuditDelta;
  published_versions: PublishedVersionEntry[];
  /**
   * Sources we intentionally don't diff yet. Each entry names the
   * source and the reason — surfaced in the renderer so operators can
   * see the gap is acknowledged.
   */
  untracked_sources: { name: string; reason: string }[];
}

export interface RepoDiffOptions {
  /**
   * Lower bound (inclusive) on the diff window. Accepts any string
   * SQLite's datetime() can parse — typically 'YYYY-MM-DD' or
   * 'YYYY-MM-DDTHH:MM:SSZ'. Defaults to 7 days before `until`.
   */
  since?: string;
  /**
   * Upper bound (inclusive). Defaults to datetime('now').
   */
  until?: string;
}

function tableExists(table: string): boolean {
  const db = getDb();
  const row = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
  ).get(table) as { name: string } | undefined;
  return !!row;
}

function hasColumn(table: string, column: string): boolean {
  if (!tableExists(table)) return false;
  const db = getDb();
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some(c => c.name === column);
}

function getNotesInWindow(repo_id: number, since: string, until: string): NoteAddedEntry[] {
  if (!tableExists('repo_notes')) return [];
  if (!hasColumn('repo_notes', 'created_at')) return [];
  const db = getDb();
  return db.prepare(`
    SELECT id, note_type, title, source, created_at
      FROM repo_notes
     WHERE repo_id = ?
       AND created_at >= ?
       AND created_at <= ?
     ORDER BY created_at DESC, id DESC
  `).all(repo_id, since, until) as NoteAddedEntry[];
}

function getAuditRunsInWindow(repo_id: number, since: string, until: string): AuditRunEntry[] {
  if (!tableExists('audit_runs')) return [];
  const db = getDb();
  return db.prepare(`
    SELECT id, started_at, completed_at, overall_status,
           overall_posture, scope_level
      FROM audit_runs
     WHERE repo_id = ?
       AND started_at >= ?
       AND started_at <= ?
     ORDER BY started_at DESC, id DESC
  `).all(repo_id, since, until) as AuditRunEntry[];
}

function getDepAuditDelta(repo_id: number, since: string, until: string): DepAuditDelta {
  if (!tableExists('repo_dep_audit_history')) {
    return { from: null, to: null, delta: null, snapshots: [] };
  }
  const db = getDb();
  const snapshots = db.prepare(`
    SELECT id, taken_at, severity_critical, severity_high,
           severity_moderate, severity_low, tool
      FROM repo_dep_audit_history
     WHERE repo_id = ?
       AND taken_at >= ?
       AND taken_at <= ?
     ORDER BY taken_at DESC, id DESC
  `).all(repo_id, since, until) as DepAuditSnapshotEntry[];

  if (snapshots.length === 0) {
    return { from: null, to: null, delta: null, snapshots: [] };
  }
  const to = snapshots[0];                              // newest
  const from = snapshots[snapshots.length - 1];         // oldest in window
  // If only one snapshot landed in the window we don't have a real
  // delta — call delta null. The caller (renderer) shows the absolute
  // counts in that case.
  const delta = snapshots.length >= 2
    ? {
        severity_critical: to.severity_critical - from.severity_critical,
        severity_high: to.severity_high - from.severity_high,
        severity_moderate: to.severity_moderate - from.severity_moderate,
        severity_low: to.severity_low - from.severity_low,
      }
    : null;
  return { from, to, delta, snapshots };
}

function getPublishedVersionsInWindow(repo_id: number, since: string, until: string): PublishedVersionEntry[] {
  if (!tableExists('repo_published_versions')) return [];
  const db = getDb();
  return db.prepare(`
    SELECT id, channel, version, published_at, synced_at, source
      FROM repo_published_versions
     WHERE repo_id = ?
       AND synced_at >= ?
       AND synced_at <= ?
     ORDER BY synced_at DESC, id DESC
  `).all(repo_id, since, until) as PublishedVersionEntry[];
}

/**
 * Resolve the (since, until) window to concrete SQLite-comparable
 * strings. If neither bound is supplied, default to "last 7 days
 * ending now." If only `since` is supplied, until = now. If only
 * `until` is supplied, since = until - 7 days.
 */
function resolveWindow(opts: RepoDiffOptions): { since: string; until: string } {
  const db = getDb();
  // Pull the current "now" string through SQLite so the comparison
  // strings are in the same format as datetime('now') results stored
  // by the writers.
  const nowRow = db.prepare("SELECT datetime('now') AS now").get() as { now: string };
  const now = nowRow.now;
  const until = opts.until ?? now;
  if (opts.since) {
    return { since: opts.since, until };
  }
  // until - 7 days, resolved via SQLite so the math handles the
  // calendar correctly. Pass `until` itself as the input modifier
  // base.
  const sinceRow = db.prepare("SELECT datetime(?, '-7 days') AS s").get(until) as { s: string };
  return { since: sinceRow.s, until };
}

/**
 * Build a structured diff report for a single repo across the
 * resolved window. Returns null if the slug doesn't resolve to a repo
 * id.
 */
export function getRepoDiff(slug: string, opts: RepoDiffOptions = {}): RepoDiffReport | null {
  const repo_id = getRepoIdBySlug(slug);
  if (repo_id === null) return null;

  const { since, until } = resolveWindow(opts);

  const untracked_sources: { name: string; reason: string }[] = [
    {
      name: 'repo_facts',
      reason: 'no fact-history table — updated_at gives latest but not added/removed deltas (out of FT-4 scope)',
    },
    {
      name: 'repo_relationships',
      reason: 'no timestamp column — graph edges are not tracked over time',
    },
    {
      name: 'repos.* fields',
      reason: 'no repos_history table — repo-level field changes are not tracked; see `git log` of the source for description / status / stars',
    },
  ];

  return {
    slug,
    repo_id,
    since,
    until,
    notes_added: getNotesInWindow(repo_id, since, until),
    audit_runs: getAuditRunsInWindow(repo_id, since, until),
    dep_audit: getDepAuditDelta(repo_id, since, until),
    published_versions: getPublishedVersionsInWindow(repo_id, since, until),
    untracked_sources,
  };
}

/**
 * Pretty-text renderer for RepoDiffReport. Grouped by source so the
 * operator can scan top-to-bottom. Each section is suppressed if its
 * payload is empty (except untracked_sources, which always renders as
 * a footer so operators are reminded the diff has known gaps).
 */
export function renderRepoDiffText(report: RepoDiffReport): string {
  const lines: string[] = [];
  lines.push(`=== rk diff ${report.slug} ===`);
  lines.push(`window: ${report.since}  →  ${report.until}`);
  lines.push('');

  if (report.notes_added.length > 0) {
    lines.push(`--- Notes added (${report.notes_added.length}) ---`);
    for (const n of report.notes_added) {
      lines.push(`  + [${n.note_type}] ${n.title ?? '(untitled)'}  @ ${n.created_at}${n.source ? '  (' + n.source + ')' : ''}`);
    }
    lines.push('');
  }

  if (report.audit_runs.length > 0) {
    lines.push(`--- Audit runs (${report.audit_runs.length}) ---`);
    for (const a of report.audit_runs) {
      const status = a.overall_status ?? 'unknown';
      const posture = a.overall_posture ?? 'unknown';
      lines.push(`  + audit #${a.id} status=${status} posture=${posture}  @ ${a.started_at}`);
    }
    lines.push('');
  }

  if (report.dep_audit.snapshots.length > 0) {
    lines.push(`--- Dep-audit snapshots (${report.dep_audit.snapshots.length}) ---`);
    if (report.dep_audit.delta && report.dep_audit.from && report.dep_audit.to) {
      const d = report.dep_audit.delta;
      const dStr = (n: number): string => n > 0 ? `+${n}` : `${n}`;
      lines.push(`  delta: critical ${dStr(d.severity_critical)}, high ${dStr(d.severity_high)}, moderate ${dStr(d.severity_moderate)}, low ${dStr(d.severity_low)}`);
      lines.push(`  from: ${report.dep_audit.from.taken_at}  (c=${report.dep_audit.from.severity_critical} h=${report.dep_audit.from.severity_high} m=${report.dep_audit.from.severity_moderate} l=${report.dep_audit.from.severity_low})`);
      lines.push(`  to:   ${report.dep_audit.to.taken_at}  (c=${report.dep_audit.to.severity_critical} h=${report.dep_audit.to.severity_high} m=${report.dep_audit.to.severity_moderate} l=${report.dep_audit.to.severity_low})`);
    } else if (report.dep_audit.to) {
      // Single snapshot — show the absolute counts only.
      const t = report.dep_audit.to;
      lines.push(`  single snapshot @ ${t.taken_at}: c=${t.severity_critical} h=${t.severity_high} m=${t.severity_moderate} l=${t.severity_low}`);
    }
    lines.push('');
  }

  if (report.published_versions.length > 0) {
    lines.push(`--- Published versions (${report.published_versions.length}) ---`);
    for (const v of report.published_versions) {
      lines.push(`  + ${v.channel}: ${v.version}  @ ${v.synced_at}${v.published_at ? ' (published_at ' + v.published_at + ')' : ''}`);
    }
    lines.push('');
  }

  const hasAny =
    report.notes_added.length > 0 ||
    report.audit_runs.length > 0 ||
    report.dep_audit.snapshots.length > 0 ||
    report.published_versions.length > 0;
  if (!hasAny) {
    lines.push('(no tracked changes in window)');
    lines.push('');
  }

  lines.push(`--- Not tracked ---`);
  for (const u of report.untracked_sources) {
    lines.push(`  ${u.name}: ${u.reason}`);
  }
  return lines.join('\n');
}
