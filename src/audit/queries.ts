/**
 * Audit query layer — structured queries over the audit evidence.
 */
import { getDb } from '../db/init.js';

// ─── Return type interfaces ──────────────────────────────────────────────────

export interface AuditRun {
  id: number;
  repo_id: number;
  slug: string;
  audit_version: string;
  commit_sha: string | null;
  branch: string | null;
  tag: string | null;
  auditor: string;
  scope_level: string;
  overall_status: string;
  overall_posture: string;
  domains_checked: string | null;
  summary: string | null;
  blocking_release: number;
  started_at: string;
  completed_at: string | null;
  controls?: AuditControlResult[];
  findings?: AuditFinding[];
  metrics?: AuditMetrics | null;
  artifacts?: AuditArtifact[];
}

export interface AuditControlResult {
  audit_run_id: number;
  control_id: string;
  result: string;
  notes: string | null;
  evidence_ref: string | null;
  tool_source: string | null;
  measured_value: string | null;
  control_title?: string;
  domain?: string;
  control_severity?: string;
}

export interface AuditFinding {
  id: number;
  audit_run_id: number;
  repo_id: number;
  domain: string;
  control_id: string | null;
  title: string;
  description: string | null;
  severity: string;
  confidence: string;
  status: string;
  location: string | null;
  tool_source: string | null;
  evidence_ref: string | null;
  remediation: string | null;
  cve_id: string | null;
  cvss_score: number | null;
  created_at: string;
  slug?: string;
}

export interface AuditMetrics {
  audit_run_id: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  coverage_percent: number | null;
  test_count: number | null;
  outdated_dependencies: number | null;
  vulnerable_dependencies: number | null;
  secrets_found: number;
  pass_rate: number | null;
  controls_passed: number;
  controls_failed: number;
  controls_warned: number;
  controls_skipped: number;
  controls_total: number;
  [key: string]: any;
}

export interface AuditArtifact {
  id: number;
  audit_run_id: number;
  artifact_type: string;
  path: string;
  checksum: string | null;
  generated_by: string | null;
  format: string | null;
  size_bytes: number | null;
}

export interface AuditPosture {
  last_audited: string;
  commit_sha: string | null;
  scope_level: string;
  overall_status: string;
  overall_posture: string;
  blocking_release: boolean;
  summary: string | null;
  open_findings: Record<string, number>;
  failed_domains: string[];
  pass_rate: number | null;
  controls_passed: number;
  controls_total: number;
}

export interface PortfolioEntry {
  slug: string;
  status: string;
  category: string | null;
  primary_language: string | null;
  app_shape: string | null;
  overall_posture: string | null;
  overall_status: string | null;
  blocking_release: number | null;
  last_audited: string | null;
  scope_level: string | null;
  critical_count: number | null;
  high_count: number | null;
  medium_count: number | null;
  pass_rate: number | null;
  controls_total: number | null;
}

export interface AuditStatusFilters {
  posture?: string;
  unaudited?: boolean;
  has_critical?: boolean;
  failed_control?: string;
  domain_failing?: string;
}

export interface FindingSeverityFilter {
  severity?: string;
  domain?: string;
  limit?: number;
}

export interface RunComparison {
  critical: number;
  high: number;
  medium: number;
  pass_rate: number;
  controls_passed: number;
  improved: boolean;
}

// ─── Query functions ─────────────────────────────────────────────────────────

/**
 * Get the latest audit run for a repo.
 */
export function getLatestAudit(repoId: number | bigint): AuditRun | null {
  const db = getDb();
  const run = db.prepare(`
    SELECT ar.*, r.slug
    FROM audit_runs ar
    JOIN repos r ON r.id = ar.repo_id
    WHERE ar.repo_id = ?
    ORDER BY ar.started_at DESC LIMIT 1
  `).get(repoId) as AuditRun | undefined;

  if (!run) return null;

  run.controls = db.prepare(`
    SELECT cr.*, ac.title AS control_title, ac.domain, ac.severity AS control_severity
    FROM audit_control_results cr
    JOIN audit_controls ac ON ac.id = cr.control_id
    WHERE cr.audit_run_id = ?
    ORDER BY ac.domain, ac.id
  `).all(run.id) as AuditControlResult[];

  run.findings = db.prepare(`
    SELECT * FROM audit_findings
    WHERE audit_run_id = ?
    ORDER BY
      CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
      created_at DESC
  `).all(run.id) as AuditFinding[];

  run.metrics = db.prepare('SELECT * FROM audit_metrics WHERE audit_run_id = ?').get(run.id) as AuditMetrics | undefined ?? null;
  run.artifacts = db.prepare('SELECT * FROM audit_artifacts WHERE audit_run_id = ?').all(run.id) as AuditArtifact[];

  return run;
}

/**
 * Get audit posture for a repo (summary view for rk show).
 */
export function getAuditPosture(repoId: number | bigint): AuditPosture | null {
  const db = getDb();
  const run = db.prepare(`
    SELECT id, overall_status, overall_posture, summary, blocking_release,
           started_at, completed_at, commit_sha, scope_level
    FROM audit_runs WHERE repo_id = ?
    ORDER BY started_at DESC LIMIT 1
  `).get(repoId) as { id: number; overall_status: string; overall_posture: string; summary: string | null; blocking_release: number; started_at: string; completed_at: string | null; commit_sha: string | null; scope_level: string } | undefined;

  if (!run) return null;

  const findingSummary = db.prepare(`
    SELECT severity, COUNT(*) as count
    FROM audit_findings
    WHERE audit_run_id = ? AND status = 'open'
    GROUP BY severity
  `).all(run.id) as { severity: string; count: number }[];

  const failedDomains = (db.prepare(`
    SELECT DISTINCT ac.domain
    FROM audit_control_results cr
    JOIN audit_controls ac ON ac.id = cr.control_id
    WHERE cr.audit_run_id = ? AND cr.result = 'fail'
  `).all(run.id) as { domain: string }[]).map(r => r.domain);

  const metrics = db.prepare('SELECT * FROM audit_metrics WHERE audit_run_id = ?').get(run.id) as AuditMetrics | undefined;

  return {
    last_audited: run.started_at,
    commit_sha: run.commit_sha,
    scope_level: run.scope_level,
    overall_status: run.overall_status,
    overall_posture: run.overall_posture,
    blocking_release: !!run.blocking_release,
    summary: run.summary,
    open_findings: Object.fromEntries(findingSummary.map(f => [f.severity, f.count])),
    failed_domains: failedDomains,
    pass_rate: metrics?.pass_rate ?? null,
    controls_passed: metrics?.controls_passed ?? 0,
    controls_total: metrics?.controls_total ?? 0,
  };
}

/**
 * Portfolio-wide posture: all repos with their latest audit status.
 */
export function getPortfolioPosture(): PortfolioEntry[] {
  const db = getDb();
  return db.prepare(`
    SELECT r.slug, r.status, r.category,
           t.primary_language, t.app_shape,
           ar.overall_posture, ar.overall_status, ar.blocking_release,
           ar.started_at AS last_audited, ar.scope_level,
           am.critical_count, am.high_count, am.medium_count,
           am.pass_rate, am.controls_total
    FROM repos r
    LEFT JOIN repo_tech t ON t.repo_id = r.id
    LEFT JOIN audit_runs ar ON ar.id = (
      SELECT id FROM audit_runs WHERE repo_id = r.id ORDER BY started_at DESC LIMIT 1
    )
    LEFT JOIN audit_metrics am ON am.audit_run_id = ar.id
    ORDER BY
      CASE ar.overall_posture
        WHEN 'critical' THEN 0 WHEN 'needs_attention' THEN 1
        WHEN 'healthy' THEN 2 ELSE 3
      END,
      r.slug
  `).all() as PortfolioEntry[];
}

/**
 * Find repos matching specific audit criteria.
 */
export function findByAuditStatus(filters: AuditStatusFilters = {}): Record<string, any>[] {
  const db = getDb();

  if (filters.posture) {
    return db.prepare(`
      SELECT r.slug, ar.overall_posture, ar.overall_status, ar.started_at,
             am.critical_count, am.high_count, am.pass_rate
      FROM repos r
      JOIN audit_runs ar ON ar.id = (
        SELECT id FROM audit_runs WHERE repo_id = r.id ORDER BY started_at DESC LIMIT 1
      )
      LEFT JOIN audit_metrics am ON am.audit_run_id = ar.id
      WHERE ar.overall_posture = ?
      ORDER BY r.slug
    `).all(filters.posture) as Record<string, any>[];
  }

  if (filters.unaudited) {
    return db.prepare(`
      SELECT r.slug, r.status, t.primary_language, t.app_shape
      FROM repos r
      LEFT JOIN repo_tech t ON t.repo_id = r.id
      WHERE NOT EXISTS (SELECT 1 FROM audit_runs ar WHERE ar.repo_id = r.id)
      AND r.archived = 0
      ORDER BY r.slug
    `).all() as Record<string, any>[];
  }

  if (filters.has_critical) {
    return db.prepare(`
      SELECT DISTINCT r.slug, af.title, af.description, af.remediation
      FROM audit_findings af
      JOIN repos r ON r.id = af.repo_id
      WHERE af.severity = 'critical' AND af.status = 'open'
      ORDER BY r.slug, af.created_at DESC
    `).all() as Record<string, any>[];
  }

  if (filters.failed_control) {
    return db.prepare(`
      SELECT r.slug, cr.result, cr.notes, cr.measured_value
      FROM audit_control_results cr
      JOIN audit_runs ar ON ar.id = cr.audit_run_id
      JOIN repos r ON r.id = ar.repo_id
      WHERE cr.control_id = ? AND cr.result = 'fail'
      AND ar.id = (SELECT id FROM audit_runs WHERE repo_id = r.id ORDER BY started_at DESC LIMIT 1)
      ORDER BY r.slug
    `).all(filters.failed_control) as Record<string, any>[];
  }

  if (filters.domain_failing) {
    return db.prepare(`
      SELECT DISTINCT r.slug, ac.id AS control_id, ac.title, cr.result, cr.notes
      FROM audit_control_results cr
      JOIN audit_controls ac ON ac.id = cr.control_id
      JOIN audit_runs ar ON ar.id = cr.audit_run_id
      JOIN repos r ON r.id = ar.repo_id
      WHERE ac.domain = ? AND cr.result = 'fail'
      AND ar.id = (SELECT id FROM audit_runs WHERE repo_id = r.id ORDER BY started_at DESC LIMIT 1)
      ORDER BY r.slug, ac.id
    `).all(filters.domain_failing) as Record<string, any>[];
  }

  return [];
}

/**
 * Get all open findings across the portfolio, grouped by severity.
 */
export function getOpenFindings(filters: FindingSeverityFilter = {}): AuditFinding[] {
  const db = getDb();
  const conditions: string[] = ['af.status = ?'];
  const params: (string | number)[] = ['open'];

  if (filters.severity) {
    conditions.push('af.severity = ?');
    params.push(filters.severity);
  }
  if (filters.domain) {
    conditions.push('af.domain = ?');
    params.push(filters.domain);
  }

  const limit = filters.limit || 50;

  return db.prepare(`
    SELECT af.*, r.slug
    FROM audit_findings af
    JOIN repos r ON r.id = af.repo_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY
      CASE af.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
      af.created_at DESC
    LIMIT ?
  `).all(...params, limit) as AuditFinding[];
}

/**
 * Get exceptions for a repo.
 */
export function getExceptions(repoId: number | bigint): Record<string, any>[] {
  const db = getDb();
  return db.prepare(`
    SELECT ae.*, ac.title AS control_title
    FROM audit_exceptions ae
    LEFT JOIN audit_controls ac ON ac.id = ae.control_id
    WHERE ae.repo_id = ?
    ORDER BY ae.created_at DESC
  `).all(repoId) as Record<string, any>[];
}

/**
 * Compare two audit runs (trend).
 */
export function compareRuns(runId1: number | bigint, runId2: number | bigint): RunComparison | null {
  const db = getDb();

  const metrics1 = db.prepare('SELECT * FROM audit_metrics WHERE audit_run_id = ?').get(runId1) as AuditMetrics | undefined;
  const metrics2 = db.prepare('SELECT * FROM audit_metrics WHERE audit_run_id = ?').get(runId2) as AuditMetrics | undefined;

  if (!metrics1 || !metrics2) return null;

  return {
    critical: (metrics2.critical_count || 0) - (metrics1.critical_count || 0),
    high: (metrics2.high_count || 0) - (metrics1.high_count || 0),
    medium: (metrics2.medium_count || 0) - (metrics1.medium_count || 0),
    pass_rate: (metrics2.pass_rate || 0) - (metrics1.pass_rate || 0),
    controls_passed: (metrics2.controls_passed || 0) - (metrics1.controls_passed || 0),
    improved: (metrics2.critical_count || 0) <= (metrics1.critical_count || 0) &&
              (metrics2.high_count || 0) <= (metrics1.high_count || 0),
  };
}
