/**
 * Portfolio health table renderer.
 *
 * Per McIlroy 1978 (Unix philosophy) + jq design: structured output is
 * the load-bearing contract — JSON is primary, pretty text is layered
 * on top. `rk health table` defaults to JSON so it composes with jq,
 * grep, awk; `--text` is opt-in human formatting.
 *
 * Each row produced here folds the research findings into actionable
 * health categories:
 *   - ci_health     : red/yellow/green per Memon 2017 / DORA 2024
 *   - dep_health    : red/yellow/green per Pu 2026 / CISA KEV
 *   - action_health : red/yellow/green per CISA Mar 2025 / OpenSSF 2024
 *   - toolchain_drift: boolean per JetBrains 2025
 */
import { getDb, getPortfolioHealth, getToolchainDrift, listWorkflowActions } from '../db/init.js';
import type { PortfolioHealthRow } from '../db/init.js';
import { bold, colorByStatus } from '../colors.js';

export interface HealthTableRow {
  slug: string;
  lifecycle_status: string | null;
  ci_health: 'green' | 'yellow' | 'red' | 'unknown';
  dep_health: 'green' | 'yellow' | 'red' | 'unknown';
  action_pin_health: 'green' | 'yellow' | 'red' | 'unknown';
  toolchain_drift: boolean;
  last_synced_at: string | null;
  // Inline detail so jq users can drill in without a second query.
  detail: {
    ci_status: string | null;
    severity_critical: number;
    severity_high: number;
    critical_cve_count: number;   // length of critical_cve_ids array
    audit_omit_dev: boolean;
    workflow_action_count: number;
    worst_pin_quality: string | null;
  };
}

/**
 * Project (db rollup + per-repo computed signals) into a single table
 * row per repo. Per Beyer 2016 (SRE Book Ch.6): every column is
 * actionable; we elide noise so the renderer doesn't show "120 low"
 * columns that have a 70% false-positive rate (ACM CSUR 2024).
 */
export function buildHealthTable(): HealthTableRow[] {
  const portfolio = getPortfolioHealth();
  const rows: HealthTableRow[] = [];

  for (const r of portfolio) {
    const repoId = getRepoIdBySlug_local(r.slug);
    const drift = repoId ? getToolchainDrift(repoId) : [];
    const actions = repoId ? listWorkflowActions(repoId) : [];

    rows.push({
      slug: r.slug,
      lifecycle_status: r.lifecycle_status,
      ci_health: gradeCi(r),
      dep_health: gradeDep(r),
      action_pin_health: gradeActions(actions),
      toolchain_drift: drift.length > 0,
      // No top-level synced_at in the rollup view — surface CI run_at as the
      // freshest signal we have. Other timestamps live inside the doctor view.
      last_synced_at: r.last_ci_run_at,
      detail: {
        ci_status: r.last_ci_status,
        severity_critical: r.severity_critical,
        severity_high: r.severity_high,
        critical_cve_count: parseCveCount(r.critical_cve_ids),
        audit_omit_dev: r.audit_omit_dev === 1,
        workflow_action_count: r.workflow_action_count,
        worst_pin_quality: worstPinQuality(actions),
      },
    });
  }
  return rows;
}

// Per Memon 2017 + DORA 2024:
//   - red:    last_ci_status='failing' (we already require 2 consecutive
//             failures upstream per the Memon flake finding)
//   - yellow: status='unknown' (auth/network/in-progress)
//   - green:  status='passing'
function gradeCi(r: PortfolioHealthRow): HealthTableRow['ci_health'] {
  if (r.last_ci_status === 'failing') return 'red';
  if (r.last_ci_status === 'passing') return 'green';
  if (r.last_ci_status === 'no_workflow') return 'yellow';
  if (r.last_ci_status === 'unknown') return 'unknown';
  return 'unknown';
}

// Per Pu 2026 (NDSS) + CISA KEV + ACM CSUR 2024:
//   - red:     critical > 0 AND we have at least one CVE ID captured
//              (a finding without an ID is shape-broken; better surfaced
//              as yellow than alarming on a number with no anchor)
//   - yellow:  critical > 0 (no IDs) OR high > 0
//   - unknown: no dep-audit row at all (never scanned) — distinct from clean
//   - green:   scanned and all zeros
function gradeDep(r: PortfolioHealthRow): HealthTableRow['dep_health'] {
  if (r.severity_critical > 0) {
    return parseCveCount(r.critical_cve_ids) > 0 ? 'red' : 'yellow';
  }
  if (r.severity_high > 0) return 'yellow';
  // hg-A-002: audit-presence is signalled by the CVE-id columns, NOT by
  // last_ci_status. getPortfolioHealth LEFT JOINs repo_dep_audit_state and
  // exposes critical_cve_ids / high_cve_ids UN-coalesced — both are NULL
  // iff no dep-audit row exists (severity_* are coalesced to 0, so they
  // can't tell "scanned-clean" from "never-scanned"). Gating on
  // last_ci_status meant a CI-synced but never-dep-audited repo showed
  // green; gate on the real audit sentinel instead.
  if (r.critical_cve_ids === null && r.high_cve_ids === null) {
    // No audit data yet — distinct from clean.
    return 'unknown';
  }
  return 'green';
}

// Per CISA Mar 2025 + OpenSSF 2024 + Alvarez 2025:
//   - red:    any pin_quality='branch' (worst, mutable per CISA)
//   - yellow: any 'major' or 'mutable-semver' (without immutable_publisher)
//   - green:  all 'sha' or 'immutable-semver' or no actions at all
function gradeActions(actions: ReturnType<typeof listWorkflowActions>): HealthTableRow['action_pin_health'] {
  if (actions.length === 0) return 'unknown';
  let hasBranch = false;
  let hasMajor = false;
  let hasMutable = false;
  for (const a of actions) {
    if (a.pin_quality === 'branch') hasBranch = true;
    else if (a.pin_quality === 'major') hasMajor = true;
    else if (a.pin_quality === 'mutable-semver' && a.immutable_publisher !== 1) hasMutable = true;
  }
  if (hasBranch) return 'red';
  if (hasMajor || hasMutable) return 'yellow';
  return 'green';
}

function worstPinQuality(actions: ReturnType<typeof listWorkflowActions>): string | null {
  if (actions.length === 0) return null;
  // Ordered worst → best so we can return the first hit per the priority.
  const order = ['branch', 'major', 'mutable-semver', 'immutable-semver', 'sha'] as const;
  for (const q of order) {
    if (actions.some(a => a.pin_quality === q)) return q;
  }
  return null;
}

function parseCveCount(json: string | null): number {
  if (!json) return 0;
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

// Local helper — the public getRepoIdBySlug is in db/init.ts but already
// imported by parent CLI code; we keep this internal so the build-health
// renderer doesn't accidentally take a load-bearing dep on a public API
// surface for one lookup.
function getRepoIdBySlug_local(slug: string): number | null {
  const db = getDb();
  const row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  return row?.id ?? null;
}

/**
 * Pretty-text rendering of the health table — optional, behind --text.
 * Per Treude & Storey 2010 (ICSE'10): feeds dominate short-horizon
 * planning; dashboards earn keep only at decision moments. This is the
 * decision-moment dashboard; ASCII columns are the cheapest format
 * that survives every shell. Per Dowding 2025 (Implementation Science
 * 20:1): 28% dashboard open rate validates "make it skim-friendly."
 */
export function renderHealthTableText(rows: HealthTableRow[]): string {
  if (rows.length === 0) return 'No repos in portfolio.';
  // Build column widths. Slug is the runaway field; cap at 50 chars.
  const slugW = Math.min(50, Math.max(4, ...rows.map(r => r.slug.length)));
  const header = bold(pad('SLUG', slugW) + '  ' +
    pad('CI', 7) + '  ' + pad('DEP', 7) + '  ' + pad('ACTIONS', 7) + '  ' +
    pad('DRIFT', 5));
  // Separator width is based on the VISIBLE header (bold() is zero-width when
  // color is off, and the ANSI codes don't change the rendered column width).
  const sep = '─'.repeat(pad('SLUG', slugW).length + 2 + 7 + 2 + 7 + 2 + 7 + 2 + 5);
  const lines: string[] = [header, sep];
  for (const r of rows) {
    // Stage D: pad FIRST (alignment), then colorize the grade cell by its
    // status word so the conventional green/yellow/red reads at a glance.
    const drift = r.toolchain_drift ? 'yes' : 'no';
    lines.push(
      pad(r.slug.length > slugW ? r.slug.slice(0, slugW - 1) + '…' : r.slug, slugW) + '  ' +
      colorByStatus(r.ci_health, pad(r.ci_health, 7)) + '  ' +
      colorByStatus(r.dep_health, pad(r.dep_health, 7)) + '  ' +
      colorByStatus(r.action_pin_health, pad(r.action_pin_health, 7)) + '  ' +
      colorByStatus(r.toolchain_drift ? 'drift' : 'clean', pad(drift, 5))
    );
  }
  return lines.join('\n');
}

function pad(s: string, w: number): string {
  if (s.length >= w) return s;
  return s + ' '.repeat(w - s.length);
}
