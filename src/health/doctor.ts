/**
 * Single-repo build-health doctor: deep-dive view of one repo's
 * dep audit / workflow actions / CI signal / toolchain / permissions.
 *
 * Per Beyer 2016 (SRE Book Ch.6) + Dowding 2025: when the user opens
 * a dashboard (28% of the time per Dowding), they've made the decision
 * to engage — show them everything, structured. The doctor is the
 * deepest read in the system; JSON-first so jq can drill in.
 */
import {
  getDb,
  getDepAuditState,
  getDepAuditHistory,
  listWorkflowActions,
  listWorkflowPermissions,
  listObservedToolchain,
  getToolchainDrift,
} from '../db/init.js';
import type {
  DepAuditStateRow,
  DepAuditHistoryRow,
  WorkflowActionRow,
  WorkflowPermissionsRow,
  ObservedToolchainRow,
  ToolchainDriftRow,
} from '../db/init.js';

export interface RepoDoctorReport {
  slug: string;
  lifecycle_status: string | null;
  ci: {
    status: string | null;
    run_at: string | null;
    url: string | null;
  };
  toolchain: {
    declared: Record<string, string> | null;
    observed: ObservedToolchainRow[];
    drift: ToolchainDriftRow[];
  };
  dep_audit: {
    latest: DepAuditStateRow | null;
    // Per Pu 2026 / Latendresse 2022: surface the IDs the renderer
    // hides in the table view so the doctor view shows the full
    // reachable + dev-included shape.
    critical_cve_ids: string[];
    high_cve_ids: string[];
    history: DepAuditHistoryRow[];
  };
  workflow_actions: WorkflowActionRow[];
  workflow_permissions: WorkflowPermissionsRow[];
}

/**
 * Build a single-repo deep-dive report. Returns null if the slug
 * doesn't resolve to a repo.
 */
export function buildRepoDoctor(slug: string): RepoDoctorReport | null {
  const db = getDb();
  const repo = db.prepare(`
    SELECT id, slug, lifecycle_status, last_ci_status, last_ci_run_at, last_ci_url, toolchain_pin
    FROM repos
    WHERE slug = ?
  `).get(slug) as {
    id: number;
    slug: string;
    lifecycle_status: string | null;
    last_ci_status: string | null;
    last_ci_run_at: string | null;
    last_ci_url: string | null;
    toolchain_pin: string | null;
  } | undefined;

  if (!repo) return null;

  const auditLatest = getDepAuditState(repo.id);
  const auditHistory = getDepAuditHistory(repo.id, 10);
  const actions = listWorkflowActions(repo.id);
  const perms = listWorkflowPermissions(repo.id);
  const observed = listObservedToolchain(repo.id);
  const drift = getToolchainDrift(repo.id);

  let declared: Record<string, string> | null = null;
  if (repo.toolchain_pin) {
    try {
      declared = JSON.parse(repo.toolchain_pin) as Record<string, string>;
    } catch {
      declared = null;
    }
  }

  return {
    slug: repo.slug,
    lifecycle_status: repo.lifecycle_status,
    ci: {
      status: repo.last_ci_status,
      run_at: repo.last_ci_run_at,
      url: repo.last_ci_url,
    },
    toolchain: {
      declared,
      observed,
      drift,
    },
    dep_audit: {
      latest: auditLatest,
      critical_cve_ids: parseList(auditLatest?.critical_cve_ids ?? null),
      high_cve_ids: parseList(auditLatest?.high_cve_ids ?? null),
      history: auditHistory,
    },
    workflow_actions: actions,
    workflow_permissions: perms,
  };
}

function parseList(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Pretty-text rendering of a single-repo doctor report. Per Treude &
 * Storey 2010: dashboards earn their keep at decision moments — the
 * user has explicitly requested one repo, so we show everything that
 * matters in sectioned blocks.
 */
export function renderDoctorText(report: RepoDoctorReport): string {
  const lines: string[] = [];
  lines.push(`═══ ${report.slug} ═══`);
  lines.push(`Lifecycle:  ${report.lifecycle_status ?? 'unknown'}`);

  // CI
  lines.push('');
  lines.push('─── CI ───');
  lines.push(`Status:     ${report.ci.status ?? 'unknown'}`);
  if (report.ci.run_at) lines.push(`Last run:   ${report.ci.run_at}`);
  if (report.ci.url) lines.push(`Latest URL: ${report.ci.url}`);

  // Toolchain
  lines.push('');
  lines.push('─── Toolchain ───');
  if (report.toolchain.declared) {
    lines.push(`Declared:   ${JSON.stringify(report.toolchain.declared)}`);
  } else {
    lines.push('Declared:   (no toolchain_pin set)');
  }
  if (report.toolchain.observed.length > 0) {
    lines.push('Observed:');
    for (const o of report.toolchain.observed) {
      lines.push(`  rig=${o.rig_id} ${o.tool}=${o.observed_version}  (at ${o.observed_at})`);
    }
  } else {
    lines.push('Observed:   (no observations on file)');
  }
  if (report.toolchain.drift.length > 0) {
    lines.push('Drift:');
    for (const d of report.toolchain.drift) {
      lines.push(`  ${d.tool}: declared=${d.declared_version} observed=${d.observed_version}  rig=${d.rig_id}`);
    }
  }

  // Dep audit — per Pu 2026: show IDs explicitly because counts alone
  // are a 68.28%-unreachable lie. Per Latendresse 2022: surface the
  // dev-scope flag so the user knows what was audited.
  lines.push('');
  lines.push('─── Dep audit (latest) ───');
  if (report.dep_audit.latest) {
    const l = report.dep_audit.latest;
    lines.push(`Tool:       ${l.tool}`);
    lines.push(`Checked:    ${l.last_checked_at}  (omit_dev=${l.audit_omit_dev === 1})`);
    lines.push(`Severity:   critical=${l.severity_critical} high=${l.severity_high} moderate=${l.severity_moderate} low=${l.severity_low}`);
    if (report.dep_audit.critical_cve_ids.length > 0) {
      lines.push(`Critical IDs (per Pu 2026 — EPSS/KEV-joinable):`);
      for (const id of report.dep_audit.critical_cve_ids) lines.push(`  ${id}`);
    }
    if (report.dep_audit.high_cve_ids.length > 0) {
      lines.push(`High IDs:`);
      for (const id of report.dep_audit.high_cve_ids) lines.push(`  ${id}`);
    }
    if (l.last_clean_at) lines.push(`Last clean: ${l.last_clean_at}`);
  } else {
    lines.push('(no audit data on file)');
  }

  if (report.dep_audit.history.length > 0) {
    lines.push('');
    lines.push(`Last ${report.dep_audit.history.length} snapshots (newest first):`);
    for (const h of report.dep_audit.history) {
      lines.push(`  ${h.taken_at}  crit=${h.severity_critical} high=${h.severity_high}  omit_dev=${h.audit_omit_dev === 1}`);
    }
  }

  // Workflow actions
  lines.push('');
  lines.push('─── Workflow actions ───');
  if (report.workflow_actions.length === 0) {
    lines.push('(no actions on file — workflow scan not yet run)');
  } else {
    // Group by workflow file for legibility.
    const byFile: Record<string, WorkflowActionRow[]> = {};
    for (const a of report.workflow_actions) {
      (byFile[a.workflow_file] ??= []).push(a);
    }
    for (const [file, acts] of Object.entries(byFile)) {
      lines.push(`  ${file}`);
      for (const a of acts) {
        const sha = a.resolved_sha ? `  sha=${a.resolved_sha.slice(0, 12)}` : '';
        const immutable = a.immutable_publisher === 1 ? '  immutable_publisher=yes' : '';
        const pq = a.pin_quality ?? 'ungraded';
        lines.push(`    ${a.action_ref}@${a.pinned_version}  [${pq}]${sha}${immutable}`);
      }
    }
  }

  // Workflow permissions
  lines.push('');
  lines.push('─── Workflow permissions ───');
  if (report.workflow_permissions.length === 0) {
    lines.push('(no permissions captured yet)');
  } else {
    for (const p of report.workflow_permissions) {
      lines.push(`  ${p.workflow_file}: ${p.permissions_json ?? '(null)'}`);
    }
  }

  return lines.join('\n');
}
