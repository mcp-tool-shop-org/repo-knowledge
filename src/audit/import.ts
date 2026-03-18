/**
 * Audit import contract.
 *
 * Each audit run produces a set of JSON files:
 *   run.json           — audit run metadata
 *   controls.json      — per-control results
 *   findings.json      — concrete issues discovered
 *   metrics.json       — snapshot metrics
 *   artifacts.json     — manifest of raw report files
 *
 * This module validates and imports them into SQLite.
 * Raw artifacts stay on disk; only references enter the DB.
 */
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { Database as DatabaseType } from 'better-sqlite3';
import { getDb, getRepoIdBySlug } from '../db/init.js';

// ─── Input interfaces ────────────────────────────────────────────────────────

export interface AuditRunInput {
  slug: string;
  audit_version?: string;
  commit_sha?: string;
  branch?: string;
  tag?: string;
  auditor?: string;
  scope_level?: string;
  overall_status?: string;
  status?: string;
  overall_posture?: string;
  posture?: string;
  domains_checked?: string[];
  summary?: string;
  blocking_release?: boolean;
  started_at?: string;
  completed_at?: string;
}

export interface ControlResultInput {
  control_id: string;
  result: string;
  notes?: string;
  evidence_ref?: string;
  tool_source?: string;
  measured_value?: string;
}

export interface FindingInput {
  domain: string;
  control_id?: string;
  title: string;
  description?: string;
  severity: string;
  confidence?: string;
  status?: string;
  location?: string;
  tool_source?: string;
  evidence_ref?: string;
  remediation?: string;
  cve_id?: string;
  cvss_score?: number;
}

export interface MetricsInput {
  critical_count?: number;
  high_count?: number;
  medium_count?: number;
  low_count?: number;
  info_count?: number;
  coverage_percent?: number;
  test_count?: number;
  outdated_dependencies?: number;
  outdated_dependency_count?: number;
  vulnerable_dependencies?: number;
  secrets_found?: number;
  secrets_found_count?: number;
  ci_security_checks?: number;
  sbom_present?: boolean;
  backup_plan_present?: boolean;
  license_issues?: number;
  controls_passed?: number;
  controls_pass?: number;
  controls_failed?: number;
  controls_fail?: number;
  controls_warned?: number;
  controls_warn?: number;
  controls_skipped?: number;
  controls_total?: number;
  controls_na?: number;
  controls_not_run?: number;
  findings_open_critical?: number;
  findings_open_high?: number;
  findings_open_medium?: number;
  findings_open_low?: number;
  findings_open_info?: number;
  domains_checked_count?: number;
  dependency_count?: number;
  ci_present?: boolean;
  tests_present?: boolean;
  container_present?: boolean;
  iac_present?: boolean;
  deploy_present?: boolean;
  integrations_count?: number;
  pass_rate?: number;
}

export interface ArtifactInput {
  artifact_type: string;
  path: string;
  checksum?: string;
  size_bytes?: number;
  generated_by?: string;
  format?: string;
}

export interface AuditInlineInput {
  run: AuditRunInput;
  controls?: ControlResultInput[];
  findings?: FindingInput[];
  metrics?: MetricsInput;
  artifacts?: ArtifactInput[];
}

export interface ImportResult {
  runId: number | bigint;
  controls: number;
  findings: number;
  artifacts?: number;
}

// ─── Validation helpers ──────────────────────────────────────────────────────

const VALID_STATUSES = ['pass', 'pass_with_findings', 'fail', 'incomplete'];
const VALID_POSTURES = ['healthy', 'needs_attention', 'critical', 'unknown'];
const VALID_SCOPES = ['core', 'full', 'deep'];
const VALID_RESULTS = ['pass', 'fail', 'warn', 'not_applicable', 'not_run', 'error'];
const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
const VALID_FINDING_STATUSES = ['open', 'in_progress', 'fixed', 'accepted_risk', 'false_positive', 'mitigated'];
const VALID_CONFIDENCES = ['high', 'medium', 'low'];

function validate(value: string | undefined, allowed: string[], field: string): void {
  if (value && !allowed.includes(value)) {
    throw new Error(`Invalid ${field}: "${value}". Must be one of: ${allowed.join(', ')}`);
  }
}

// ─── Import a complete audit run ─────────────────────────────────────────────

/**
 * Import a full audit from a directory containing the JSON contract files.
 */
export function importAudit(auditDir: string, artifactsRoot?: string): ImportResult {
  const db = getDb();

  // Load and validate run.json
  const runPath = join(auditDir, 'run.json');
  if (!existsSync(runPath)) throw new Error(`Missing run.json in ${auditDir}`);
  const run: AuditRunInput = JSON.parse(readFileSync(runPath, 'utf-8'));

  // Resolve repo
  const repoId = getRepoIdBySlug(run.slug);
  if (!repoId) throw new Error(`Repo not found: ${run.slug}. Run 'rk sync' first.`);

  // Normalize aliases: status → overall_status, posture → overall_posture
  const overallStatus = run.overall_status || run.status || 'incomplete';
  const overallPosture = run.overall_posture || run.posture || 'unknown';

  validate(overallStatus, VALID_STATUSES, 'overall_status');
  validate(overallPosture, VALID_POSTURES, 'overall_posture');
  validate(run.scope_level, VALID_SCOPES, 'scope_level');

  // Insert audit run
  const runResult = db.prepare(`
    INSERT INTO audit_runs (
      repo_id, audit_version, commit_sha, branch, tag, auditor,
      scope_level, overall_status, overall_posture, domains_checked,
      summary, blocking_release, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    repoId,
    run.audit_version || '1',
    run.commit_sha || null,
    run.branch || null,
    run.tag || null,
    run.auditor || 'claude',
    run.scope_level || 'core',
    overallStatus,
    overallPosture,
    run.domains_checked ? JSON.stringify(run.domains_checked) : null,
    run.summary || null,
    run.blocking_release ? 1 : 0,
    run.started_at || new Date().toISOString(),
    run.completed_at || null
  );
  const runId = runResult.lastInsertRowid;

  let controlCount = 0;
  let findingCount = 0;
  let artifactCount = 0;

  // Import controls.json
  const controlsPath = join(auditDir, 'controls.json');
  if (existsSync(controlsPath)) {
    const controls: ControlResultInput[] = JSON.parse(readFileSync(controlsPath, 'utf-8'));
    const insControl = db.prepare(`
      INSERT OR REPLACE INTO audit_control_results
        (audit_run_id, control_id, result, notes, evidence_ref, tool_source, measured_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const c of controls) {
        validate(c.result, VALID_RESULTS, `control ${c.control_id} result`);
        insControl.run(runId, c.control_id, c.result, c.notes || null,
          c.evidence_ref || null, c.tool_source || null, c.measured_value || null);
        controlCount++;
      }
    });
    tx();
  }

  // Import findings.json
  const findingsPath = join(auditDir, 'findings.json');
  if (existsSync(findingsPath)) {
    const findings: FindingInput[] = JSON.parse(readFileSync(findingsPath, 'utf-8'));
    const insFinding = db.prepare(`
      INSERT INTO audit_findings (
        audit_run_id, repo_id, domain, control_id, title, description,
        severity, confidence, status, location, tool_source,
        evidence_ref, remediation, cve_id, cvss_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const f of findings) {
        validate(f.severity, VALID_SEVERITIES, `finding "${f.title}" severity`);
        validate(f.status, VALID_FINDING_STATUSES, `finding "${f.title}" status`);
        validate(f.confidence, VALID_CONFIDENCES, `finding "${f.title}" confidence`);
        insFinding.run(
          runId, repoId, f.domain, f.control_id || null, f.title,
          f.description || null, f.severity, f.confidence || 'high',
          f.status || 'open', f.location || null, f.tool_source || null,
          f.evidence_ref || null, f.remediation || null,
          f.cve_id || null, f.cvss_score || null
        );
        findingCount++;
      }
    });
    tx();
  }

  // Import metrics.json
  const metricsPath = join(auditDir, 'metrics.json');
  if (existsSync(metricsPath)) {
    const m: MetricsInput = JSON.parse(readFileSync(metricsPath, 'utf-8'));
    insertMetrics(db, runId, m);
  }

  // Import artifacts.json (references only — files stay on disk)
  const artifactsPath = join(auditDir, 'artifacts.json');
  if (existsSync(artifactsPath)) {
    const artifacts: ArtifactInput[] = JSON.parse(readFileSync(artifactsPath, 'utf-8'));
    const insArtifact = db.prepare(`
      INSERT INTO audit_artifacts
        (audit_run_id, artifact_type, path, checksum, generated_by, format, size_bytes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const a of artifacts) {
        // Compute checksum if file exists and no checksum provided
        let checksum = a.checksum || null;
        let sizeBytes = a.size_bytes || null;
        const fullPath = join(auditDir, a.path);
        if (existsSync(fullPath) && !checksum) {
          const content = readFileSync(fullPath);
          checksum = createHash('md5').update(content).digest('hex');
          sizeBytes = content.length;
        }

        insArtifact.run(
          runId, a.artifact_type, a.path, checksum,
          a.generated_by || null, a.format || null, sizeBytes
        );
        artifactCount++;
      }
    });
    tx();
  }

  return { runId, controls: controlCount, findings: findingCount, artifacts: artifactCount };
}

/**
 * Insert metrics for an audit run. Handles both v1 and v2 field names.
 */
function insertMetrics(db: DatabaseType, runId: number | bigint, m: MetricsInput): void {
  db.prepare(`
    INSERT INTO audit_metrics (
      audit_run_id,
      critical_count, high_count, medium_count, low_count, info_count,
      coverage_percent, test_count, outdated_dependencies, vulnerable_dependencies,
      secrets_found, ci_security_checks, sbom_present, backup_plan_present,
      license_issues,
      controls_passed, controls_failed, controls_warned, controls_skipped, controls_total,
      controls_na, controls_not_run,
      findings_open_critical, findings_open_high, findings_open_medium,
      findings_open_low, findings_open_info,
      domains_checked_count, dependency_count,
      ci_present, tests_present, container_present, iac_present, deploy_present,
      integrations_count,
      pass_rate
    ) VALUES (
      ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?,
      ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?,
      ?,
      ?
    )
  `).run(
    runId,
    m.critical_count ?? m.findings_open_critical ?? 0,
    m.high_count ?? m.findings_open_high ?? 0,
    m.medium_count ?? m.findings_open_medium ?? 0,
    m.low_count ?? m.findings_open_low ?? 0,
    m.info_count ?? m.findings_open_info ?? 0,
    m.coverage_percent ?? null,
    m.test_count ?? null,
    m.outdated_dependencies ?? m.outdated_dependency_count ?? null,
    m.vulnerable_dependencies ?? null,
    m.secrets_found ?? m.secrets_found_count ?? 0,
    m.ci_security_checks ?? null,
    m.sbom_present ? 1 : 0,
    m.backup_plan_present ? 1 : 0,
    m.license_issues ?? 0,
    m.controls_passed ?? m.controls_pass ?? 0,
    m.controls_failed ?? m.controls_fail ?? 0,
    m.controls_warned ?? m.controls_warn ?? 0,
    m.controls_skipped ?? 0,
    m.controls_total ?? 0,
    m.controls_na ?? 0,
    m.controls_not_run ?? 0,
    m.findings_open_critical ?? m.critical_count ?? 0,
    m.findings_open_high ?? m.high_count ?? 0,
    m.findings_open_medium ?? m.medium_count ?? 0,
    m.findings_open_low ?? m.low_count ?? 0,
    m.findings_open_info ?? m.info_count ?? 0,
    m.domains_checked_count ?? 0,
    m.dependency_count ?? null,
    m.ci_present ? 1 : 0,
    m.tests_present ? 1 : 0,
    m.container_present ? 1 : 0,
    m.iac_present ? 1 : 0,
    m.deploy_present ? 1 : 0,
    m.integrations_count ?? null,
    m.pass_rate ?? null
  );
}

/**
 * Import a single audit from inline JSON objects (for MCP / programmatic use).
 */
export function importAuditInline({ run, controls, findings, metrics, artifacts }: AuditInlineInput): ImportResult {
  const db = getDb();

  const repoId = getRepoIdBySlug(run.slug);
  if (!repoId) throw new Error(`Repo not found: ${run.slug}`);

  const overallStatus = run.overall_status || run.status || 'incomplete';
  const overallPosture = run.overall_posture || run.posture || 'unknown';

  validate(overallStatus, VALID_STATUSES, 'overall_status');
  validate(overallPosture, VALID_POSTURES, 'overall_posture');

  const runResult = db.prepare(`
    INSERT INTO audit_runs (
      repo_id, audit_version, commit_sha, branch, tag, auditor,
      scope_level, overall_status, overall_posture, domains_checked,
      summary, blocking_release, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    repoId, run.audit_version || '1', run.commit_sha || null,
    run.branch || null, run.tag || null, run.auditor || 'claude',
    run.scope_level || 'core', overallStatus, overallPosture,
    run.domains_checked ? JSON.stringify(run.domains_checked) : null,
    run.summary || null, run.blocking_release ? 1 : 0,
    run.started_at || new Date().toISOString(), run.completed_at || null
  );
  const runId = runResult.lastInsertRowid;

  let controlCount = 0, findingCount = 0;

  if (controls?.length) {
    const ins = db.prepare(`
      INSERT OR REPLACE INTO audit_control_results
        (audit_run_id, control_id, result, notes, evidence_ref, tool_source, measured_value)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      for (const c of controls) {
        ins.run(runId, c.control_id, c.result, c.notes || null,
          c.evidence_ref || null, c.tool_source || null, c.measured_value || null);
        controlCount++;
      }
    });
    tx();
  }

  if (findings?.length) {
    const ins = db.prepare(`
      INSERT INTO audit_findings (
        audit_run_id, repo_id, domain, control_id, title, description,
        severity, confidence, status, location, tool_source,
        evidence_ref, remediation, cve_id, cvss_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction(() => {
      for (const f of findings) {
        ins.run(
          runId, repoId, f.domain, f.control_id || null, f.title,
          f.description || null, f.severity, f.confidence || 'high',
          f.status || 'open', f.location || null, f.tool_source || null,
          f.evidence_ref || null, f.remediation || null,
          f.cve_id || null, f.cvss_score || null
        );
        findingCount++;
      }
    });
    tx();
  }

  if (metrics) {
    insertMetrics(db, runId, metrics);
  }

  return { runId, controls: controlCount, findings: findingCount };
}
