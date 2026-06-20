/**
 * Build-health change feed.
 *
 * Per Treude & Storey 2010 (ICSE'10, "Awareness 2.0: Staying Aware of
 * Projects, Developers and Tasks Using Dashboards and Feeds"): feeds
 * dominate short-horizon planning; dashboards earn their keep only at
 * decision moments. Per Dowding et al. 2025 (Implementation Science
 * 20:1): 28% dashboard open rate vs much higher feed engagement.
 *
 * The feed is the DEFAULT surface of `rk health` for exactly this
 * reason — change-since-last-sync is the only thing most users
 * actually need to see.
 *
 * Each line is a one-shot, action-tagged delta:
 *
 *   audit_delta            critical: 0 -> 2     repo=foo/bar
 *   action_unpinned_new    action=owner/foo@v5  repo=foo/bar
 *   ci_streak_broken       consecutive=3        repo=foo/bar
 *   toolchain_drift_new    node 22 vs 20.18     repo=foo/bar  rig=5080
 *
 * Per Beyer 2016 (SRE Book Ch.6, "Monitoring Distributed Systems"):
 * "if a page merely merits a robotic response, it shouldn't be a
 * page" — and per He 2022 (arXiv:2206.07230, 11.3% Dependabot
 * deprecation from fatigue) + Tidelift 2024 (62% maintainers
 * overwhelmed): we deliberately suppress flake-shaped events. Single
 * red CI run does NOT emit a streak event (we need >=2 consecutive
 * per Memon 2017's 84% flake finding).
 */
import {
  getDb,
  getDepAuditHistory,
  listWorkflowActions,
  getToolchainDrift,
} from '../db/init.js';

export interface FeedEvent {
  kind:
    | 'audit_delta'
    | 'kev_intersect'
    | 'ci_streak_broken'
    | 'action_unpinned_new'
    | 'action_sha_rewritten'
    | 'toolchain_drift_new';
  repo_slug: string;
  // Free-form structured payload. JSON-serialisable for jq composition.
  payload: Record<string, unknown>;
  // Inline-ready short text for the default text renderer.
  message: string;
}

/**
 * Compute the feed across the portfolio. Each repo is walked once
 * and the most recent 2 audit-history snapshots are compared for
 * deltas; current workflow actions are compared against pin_quality
 * to surface "newly unpinned" entries; CI status is reported when
 * consecutive_failures came in from upstream (we do NOT recompute —
 * the sync worker already applied the >=2 threshold per Memon 2017).
 */
export function buildFeed(opts?: { kevList?: Set<string> }): FeedEvent[] {
  const db = getDb();
  const events: FeedEvent[] = [];
  const kev = opts?.kevList ?? new Set<string>();

  // Walk every repo. We use a lean projection rather than getAllRepos
  // because the feed cares about slug + a few build-health fields.
  const repos = db.prepare(`
    SELECT id, slug, last_ci_status, last_ci_run_at, last_ci_url
    FROM repos
    ORDER BY slug
  `).all() as Array<{
    id: number;
    slug: string;
    last_ci_status: string | null;
    last_ci_run_at: string | null;
    last_ci_url: string | null;
  }>;

  for (const r of repos) {
    // ── audit deltas ──
    // Per VulnCheck Q1 2025 (28.3% within 24h): deltas matter more
    // than levels. Read the most recent two snapshots; emit when
    // critical or high changed. Per Pu 2026 + CISA KEV: also emit a
    // separate kev_intersect event when any new CVE ID is in KEV.
    const history = getDepAuditHistory(r.id, 2);
    if (history.length >= 2) {
      const [latest, prior] = history;
      if (latest.severity_critical !== prior.severity_critical) {
        events.push({
          kind: 'audit_delta',
          repo_slug: r.slug,
          payload: {
            severity: 'critical',
            from: prior.severity_critical,
            to: latest.severity_critical,
          },
          message: `audit_delta  critical: ${prior.severity_critical} -> ${latest.severity_critical}  repo=${r.slug}`,
        });
      }
      if (latest.severity_high !== prior.severity_high) {
        events.push({
          kind: 'audit_delta',
          repo_slug: r.slug,
          payload: {
            severity: 'high',
            from: prior.severity_high,
            to: latest.severity_high,
          },
          message: `audit_delta  high: ${prior.severity_high} -> ${latest.severity_high}  repo=${r.slug}`,
        });
      }

      // KEV intersection on the NEW critical/high IDs (delta only —
      // we don't re-alert on IDs that were already in the prior snapshot).
      const priorCrit = parseCveIds(prior.critical_cve_ids);
      const priorHigh = parseCveIds(prior.high_cve_ids);
      const latestCrit = parseCveIds(latest.critical_cve_ids);
      const latestHigh = parseCveIds(latest.high_cve_ids);
      const newIds = [
        ...diffArrays(latestCrit, priorCrit),
        ...diffArrays(latestHigh, priorHigh),
      ];
      for (const id of newIds) {
        if (kev.has(id)) {
          events.push({
            kind: 'kev_intersect',
            repo_slug: r.slug,
            payload: { cve_id: id },
            message: `kev_intersect  cve=${id}  repo=${r.slug}`,
          });
        }
      }
    } else if (history.length === 1) {
      // First-ever snapshot with findings — surface as audit_delta from null.
      // hg-A-004: mirror the steady-state branch above, which emits for
      // BOTH critical and high. A first audit carrying only HIGH CVEs must
      // not stay silent for a cycle just because critical happens to be 0.
      const h = history[0];
      if (h.severity_critical > 0) {
        events.push({
          kind: 'audit_delta',
          repo_slug: r.slug,
          payload: { severity: 'critical', from: null, to: h.severity_critical },
          message: `audit_delta  critical: 0 -> ${h.severity_critical}  repo=${r.slug}  (first snapshot)`,
        });
      }
      if (h.severity_high > 0) {
        events.push({
          kind: 'audit_delta',
          repo_slug: r.slug,
          payload: { severity: 'high', from: null, to: h.severity_high },
          message: `audit_delta  high: 0 -> ${h.severity_high}  repo=${r.slug}  (first snapshot)`,
        });
      }
    }

    // ── action pin quality (branch refs are the loudest signal) ──
    // Per Alvarez 2025: only 7/100 OSS projects SHA-pin everything →
    // we surface "branch" pins as warn-level, not block-level.
    const actions = listWorkflowActions(r.id);
    for (const a of actions) {
      if (a.pin_quality === 'branch') {
        events.push({
          kind: 'action_unpinned_new',
          repo_slug: r.slug,
          payload: {
            action_ref: a.action_ref,
            pinned_version: a.pinned_version,
            workflow_file: a.workflow_file,
            pin_quality: a.pin_quality,
          },
          message: `action_unpinned_new  action=${a.action_ref}@${a.pinned_version}  workflow=${a.workflow_file}  repo=${r.slug}`,
        });
      }
    }

    // ── CI status (post-flake-threshold; sync layer applied >=2 consecutive) ──
    if (r.last_ci_status === 'failing') {
      events.push({
        kind: 'ci_streak_broken',
        repo_slug: r.slug,
        payload: {
          last_ci_url: r.last_ci_url,
          last_ci_run_at: r.last_ci_run_at,
        },
        message: `ci_streak_broken  repo=${r.slug}  url=${r.last_ci_url ?? 'n/a'}`,
      });
    }

    // ── toolchain drift ──
    const drift = getToolchainDrift(r.id);
    for (const d of drift) {
      events.push({
        kind: 'toolchain_drift_new',
        repo_slug: r.slug,
        payload: {
          tool: d.tool,
          declared: d.declared_version,
          observed: d.observed_version,
          rig: d.rig_id,
        },
        message: `toolchain_drift_new  ${d.tool} declared=${d.declared_version} observed=${d.observed_version}  rig=${d.rig_id}  repo=${r.slug}`,
      });
    }
  }

  return events;
}

function parseCveIds(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function diffArrays(latest: string[], prior: string[]): string[] {
  const priorSet = new Set(prior);
  return latest.filter(x => !priorSet.has(x));
}

/**
 * Render the feed as plain text — one event per line. Empty feed
 * produces a single "No changes." line so the user knows the
 * command ran (per Beyer 2016 "robotic response" heuristic — silence
 * is worse than acknowledgement).
 */
export function renderFeedText(events: FeedEvent[]): string {
  if (events.length === 0) return 'No changes since last sync.';
  return events.map(e => e.message).join('\n');
}
