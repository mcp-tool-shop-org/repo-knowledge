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
import { readFileSync, existsSync } from 'fs';
import { join, resolve, sep } from 'path';
import { createHash } from 'crypto';
import type { Database as DatabaseType } from 'better-sqlite3';
import { getDb, getRepoIdBySlug } from '../db/init.js';
import { rebuildIndex } from '../search/fts.js';
import { DOMAINS } from './controls.js';

/**
 * F-AG-019: filename-named JSON read helper. Centralises the
 * try/catch shape that previously appeared inline at every JSON
 * loading site. Naming the file in the thrown error means a malformed
 * controls.json doesn't surface as "Unexpected token" with no
 * context — the operator sees `Failed to read /path/to/controls.json: ...`.
 */
function readJson(p: string): unknown {
  let raw: string;
  try {
    raw = readFileSync(p, 'utf-8');
  } catch (e: unknown) {
    throw new Error(`Failed to read ${p}: ${(e as Error).message}`, { cause: e });
  }
  try {
    return JSON.parse(raw);
  } catch (e: unknown) {
    throw new Error(`Failed to parse ${p}: ${(e as Error).message}`, { cause: e });
  }
}

/**
 * F-AG-008: pass_rate normalisation at the boundary.
 *
 * Some audit producers emit pass_rate as a percent (0-100), others as a
 * fraction (0-1). Normalise to a fraction in [0, 1] before insert and
 * throw on out-of-range values rather than silently storing garbage.
 *
 * Exported so cli.ts and tests can reuse the same boundary contract.
 */
export function normalizePassRate(input: number | null | undefined): number | null {
  if (input == null) return null;
  if (!Number.isFinite(input)) {
    throw new Error(`Invalid pass_rate: ${input} — must be a finite number`);
  }
  const passRate = input > 1 ? input / 100 : input;
  if (passRate < 0 || passRate > 1) {
    throw new Error(`Invalid pass_rate: ${input} — out of range (must be 0-1 fraction or 0-100 percent)`);
  }
  return passRate;
}

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
    // Stage C humanization: show both the bad value and the allowed list
    // so the operator doesn't have to grep the source to find the enum.
    throw new Error(`Invalid ${field}: "${value}". Must be one of: ${allowed.join(', ')}`);
  }
}

/**
 * F-AG-004: shared input validator for both directory + inline import paths.
 *
 * Both `importAudit` and `importAuditInline` accept the same {run,
 * controls, findings} shape, and the same CHECK constraints in
 * migration-002-audit.sql apply to both. Centralizing the validation
 * means we cannot drift between the two entry points — adding a new
 * status enum here covers both.
 */
function validateInputs(
  run: AuditRunInput,
  controls?: ControlResultInput[],
  findings?: FindingInput[],
): { overallStatus: string; overallPosture: string } {
  const overallStatus = run.overall_status || run.status || 'incomplete';
  const overallPosture = run.overall_posture || run.posture || 'unknown';

  validate(overallStatus, VALID_STATUSES, 'overall_status');
  validate(overallPosture, VALID_POSTURES, 'overall_posture');
  validate(run.scope_level, VALID_SCOPES, 'scope_level');

  if (controls?.length) {
    for (let i = 0; i < controls.length; i++) {
      const c = controls[i];
      if (!c || !c.control_id) {
        throw new Error(`controls[${i}] missing required field: control_id`);
      }
      validate(c.result, VALID_RESULTS, `controls[${i}] (${c.control_id}) result`);
    }
  }

  if (findings?.length) {
    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      if (!f || !f.title) {
        throw new Error(`findings[${i}] missing required field: title`);
      }
      // db-A-002-audit: domain + severity are NOT NULL in migration-002 and
      // domain carries a CHECK enum. Validate presence + the domain enum here
      // in the shared validator so importAuditInline gets the same guard the
      // directory path already had at its pre-load site — otherwise a missing
      // domain reaches .run() as undefined (bind error) and a bogus domain
      // surfaces as a raw CHECK-constraint failure mid-transaction.
      if (!f.domain) {
        throw new Error(`findings[${i}] ("${f.title}") missing required field: domain`);
      }
      if (!f.severity) {
        throw new Error(`findings[${i}] ("${f.title}") missing required field: severity`);
      }
      validate(f.domain, DOMAINS, `findings[${i}] ("${f.title}") domain`);
      validate(f.severity, VALID_SEVERITIES, `findings[${i}] ("${f.title}") severity`);
      validate(f.status, VALID_FINDING_STATUSES, `findings[${i}] ("${f.title}") status`);
      validate(f.confidence, VALID_CONFIDENCES, `findings[${i}] ("${f.title}") confidence`);
    }
  }

  return { overallStatus, overallPosture };
}

/**
 * db-A-001-audit: pre-transaction control_id existence check.
 *
 * audit_control_results.control_id and audit_findings.control_id both carry
 * a FK to audit_controls(id). A typo (e.g. the nonexistent `CI-002` that
 * AUDIT-CONTRACT.md once referenced — the real id is `CIC-002`) would
 * otherwise surface as an opaque "FOREIGN KEY constraint failed" mid-
 * transaction, rolling back the whole import with no hint which id was
 * wrong. Validating up-front against the seeded catalog yields a clear
 * "Unknown control_id: X" before we open the write transaction.
 *
 * Findings allow a null/absent control_id (the FK is nullable), so only
 * present values are checked.
 */
function validateControlIds(
  db: DatabaseType,
  controls?: ControlResultInput[],
  findings?: FindingInput[],
): void {
  const ids = new Set<string>();
  for (const c of controls ?? []) {
    if (c?.control_id) ids.add(c.control_id);
  }
  for (const f of findings ?? []) {
    if (f?.control_id) ids.add(f.control_id);
  }
  if (ids.size === 0) return;

  const exists = db.prepare('SELECT 1 FROM audit_controls WHERE id = ?');
  for (const id of ids) {
    if (!exists.get(id)) {
      throw new Error(`Unknown control_id: ${id}. Not in the seeded control catalog.`);
    }
  }
}

// ─── Import a complete audit run ─────────────────────────────────────────────

/**
 * Import a full audit from a directory containing the JSON contract files.
 *
 * F-AG-003: the entire write block runs inside a SINGLE db.transaction so
 * the import is atomic — a partial failure (e.g. a corrupted findings.json
 * after run.json + controls.json already loaded) rolls back cleanly
 * rather than leaving an audit_runs row with no controls or metrics
 * attached. Pre-load + validate JSON OUTSIDE the transaction; rebuildIndex
 * also runs AFTER commit (it manipulates an FTS5 virtual table that
 * doesn't compose well inside a higher-level write tx).
 */
export function importAudit(auditDir: string, _artifactsRoot?: string): ImportResult {
  const db = getDb();
  const resolvedAuditDir = resolve(auditDir);

  // F-AG-020: pre-load + validate every JSON file BEFORE we touch the DB.
  // This way a corrupt metrics.json doesn't leave a run + controls row
  // already written; either the whole import lands or none of it does.
  const runPath = join(auditDir, 'run.json');
  if (!existsSync(runPath)) throw new Error(`Missing run.json in ${auditDir}`);
  const run = readJson(runPath) as AuditRunInput;

  const controlsPath = join(auditDir, 'controls.json');
  let controls: ControlResultInput[] | undefined;
  if (existsSync(controlsPath)) {
    const raw = readJson(controlsPath);
    if (!Array.isArray(raw)) {
      throw new Error(`${controlsPath}: expected array of control results, got ${typeof raw}`);
    }
    raw.forEach((c, i) => {
      if (!c || typeof c !== 'object' || !(c as any).control_id) {
        throw new Error(`${controlsPath}[${i}]: missing required field control_id`);
      }
    });
    controls = raw as ControlResultInput[];
  }

  const findingsPath = join(auditDir, 'findings.json');
  let findings: FindingInput[] | undefined;
  if (existsSync(findingsPath)) {
    const raw = readJson(findingsPath);
    if (!Array.isArray(raw)) {
      throw new Error(`${findingsPath}: expected array of findings, got ${typeof raw}`);
    }
    raw.forEach((f, i) => {
      if (!f || typeof f !== 'object' || !(f as any).title || !(f as any).severity || !(f as any).domain) {
        throw new Error(`${findingsPath}[${i}]: missing required field (title, severity, or domain)`);
      }
    });
    findings = raw as FindingInput[];
  }

  const metricsPath = join(auditDir, 'metrics.json');
  let metrics: MetricsInput | undefined;
  if (existsSync(metricsPath)) {
    const raw = readJson(metricsPath);
    // db-A-005-audit: guard the shape before the cast, matching the
    // controls/findings/artifacts siblings above. metrics.json is a single
    // object (not an array). A null, scalar, or array body would otherwise
    // pass the cast and blow up inside insertMetrics (property reads on a
    // null, or undefined binds from a scalar) mid-transaction.
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(`${metricsPath}: expected metrics object, got ${raw === null ? 'null' : Array.isArray(raw) ? 'array' : typeof raw}`);
    }
    metrics = raw as MetricsInput;
  }

  const artifactsPath = join(auditDir, 'artifacts.json');
  let artifacts: ArtifactInput[] | undefined;
  if (existsSync(artifactsPath)) {
    const raw = readJson(artifactsPath);
    if (!Array.isArray(raw)) {
      throw new Error(`${artifactsPath}: expected array of artifacts, got ${typeof raw}`);
    }
    raw.forEach((a, i) => {
      if (!a || typeof a !== 'object' || !(a as any).path || !(a as any).artifact_type) {
        throw new Error(`${artifactsPath}[${i}]: missing required field (path or artifact_type)`);
      }
      // F-AG-001: reject artifact paths that escape the audit directory.
      // The path is later joined to auditDir and read as a file — a path
      // like `../../etc/passwd` or `/etc/passwd` would otherwise let an
      // attacker-controlled audit manifest exfiltrate arbitrary files
      // via the checksum/size logic below.
      const apath = (a as any).path as string;
      if (typeof apath !== 'string') {
        throw new Error(`${artifactsPath}[${i}]: path must be a string`);
      }
      // Reject absolute paths up-front (cross-platform: starts with `/`
      // on POSIX, drive letter on Windows). `path.resolve` would collapse
      // them and bypass the dir-prefix check.
      if (/^[A-Za-z]:[\\/]/.test(apath) || apath.startsWith('/') || apath.startsWith('\\')) {
        throw new Error(`${artifactsPath}[${i}]: absolute artifact paths not allowed: ${apath}`);
      }
      const resolved = resolve(resolvedAuditDir, apath);
      if (!resolved.startsWith(resolvedAuditDir + sep) && resolved !== resolvedAuditDir) {
        throw new Error(`Artifact path escapes audit dir: ${apath}`);
      }
    });
    artifacts = raw as ArtifactInput[];
  }

  // Resolve repo
  const repoId = getRepoIdBySlug(run.slug);
  if (!repoId) throw new Error(`Repo not found: ${run.slug}. Run 'rk sync' first.`);

  // F-AG-004: shared validation contract — same enum rules cover both
  // controls + findings on inline and directory paths.
  const { overallStatus, overallPosture } = validateInputs(run, controls, findings);

  // db-A-001-audit: reject unknown control_ids BEFORE the transaction so a
  // typo yields a clear error instead of an opaque FK-constraint rollback.
  validateControlIds(db, controls, findings);

  let controlCount = 0;
  let findingCount = 0;
  let artifactCount = 0;
  let runId: number | bigint = 0;

  // F-AG-003: single outer transaction wrapping every write. Atomic
  // import — either every table lands consistent or nothing does.
  const tx = db.transaction(() => {
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
    runId = runResult.lastInsertRowid;

    if (controls) {
      const insControl = db.prepare(`
        INSERT OR REPLACE INTO audit_control_results
          (audit_run_id, control_id, result, notes, evidence_ref, tool_source, measured_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of controls) {
        insControl.run(runId, c.control_id, c.result, c.notes || null,
          c.evidence_ref || null, c.tool_source || null, c.measured_value || null);
        controlCount++;
      }
    }

    if (findings) {
      // F-AG-002: switch from INSERT OR REPLACE to ON CONFLICT…DO UPDATE
      // so the existing row id is preserved when a finding gets re-imported.
      // INSERT OR REPLACE deletes the row and reinserts a new one with a
      // fresh autoincrement id; any FK references (audit_exceptions.finding_id,
      // dashboards keyed by id) would silently break.
      // Canonical identity = (audit_run_id, domain, title, severity) — same
      // as idx_findings_canonical in migration 004.
      //
      // db-A-004-audit: NOTE the conflict key is scoped to audit_run_id, so
      // this id-preserving update ONLY fires for two findings within the SAME
      // run id. It is NOT cross-run dedup: each importAudit/importAuditInline
      // call inserts a brand-new audit_runs row (a fresh runId) above, so
      // re-importing the same fixture produces a SECOND run with its own
      // findings — by design, runs are an append-only history. The DO UPDATE
      // matters for retries that reuse a runId, not for re-imports.
      const insFinding = db.prepare(`
        INSERT INTO audit_findings (
          audit_run_id, repo_id, domain, control_id, title, description,
          severity, confidence, status, location, tool_source,
          evidence_ref, remediation, cve_id, cvss_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(audit_run_id, domain, title, severity) DO UPDATE SET
          control_id = excluded.control_id,
          description = excluded.description,
          confidence = excluded.confidence,
          status = excluded.status,
          location = excluded.location,
          tool_source = excluded.tool_source,
          evidence_ref = excluded.evidence_ref,
          remediation = excluded.remediation,
          cve_id = excluded.cve_id,
          cvss_score = excluded.cvss_score
      `);
      for (const f of findings) {
        insFinding.run(
          runId, repoId, f.domain, f.control_id || null, f.title,
          f.description || null, f.severity, f.confidence || 'high',
          f.status || 'open', f.location || null, f.tool_source || null,
          // F-AG-011: ?? preserves "explicit 0" / "explicit empty string"
          // values that || would collapse to null. cvss_score==0 is a
          // semantically meaningful "info-only" rating.
          f.evidence_ref || null, f.remediation || null,
          f.cve_id || null, f.cvss_score ?? null
        );
        findingCount++;
      }
    }

    if (metrics) {
      insertMetrics(db, runId, metrics);
    }

    if (artifacts) {
      const insArtifact = db.prepare(`
        INSERT INTO audit_artifacts
          (audit_run_id, artifact_type, path, checksum, generated_by, format, size_bytes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const a of artifacts) {
        // Compute checksum if file exists and no checksum provided.
        // Path-escape check already happened in pre-validation above.
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
    }
  });
  tx();

  // Rebuild FTS5 index AFTER commit — FTS5 virtual-table writes don't
  // compose cleanly inside a higher-level transaction that also writes
  // to the source tables.
  rebuildIndex();

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
    // F-AG-008: normalize at the boundary so a producer emitting
    // pass_rate=95 (percent) and another emitting 0.95 (fraction)
    // both land as 0.95 in the DB. Out-of-range values throw.
    normalizePassRate(m.pass_rate)
  );
}

/**
 * Import a single audit from inline JSON objects (for MCP / programmatic use).
 *
 * Shares the same validation contract + ON CONFLICT semantics as the
 * directory-import path — F-AG-004 dedupes the enum checks; F-AG-002
 * preserves finding row ids when two findings collide WITHIN ONE run id.
 *
 * db-A-004-audit: idempotency is scoped to a single run id, NOT across
 * imports. Every call inserts a new audit_runs row (append-only run
 * history), so re-importing the same payload deliberately creates a second
 * run with its own findings — it does NOT overwrite the prior run. Callers
 * that want a single "current" run should query getLatestAudit (which now
 * tiebreaks on id DESC, db-A-003-audit), not rely on re-import to dedup.
 */
export function importAuditInline({ run, controls, findings, metrics, artifacts: _artifacts }: AuditInlineInput): ImportResult {
  const db = getDb();

  const repoId = getRepoIdBySlug(run.slug);
  if (!repoId) throw new Error(`Repo not found: ${run.slug}`);

  const { overallStatus, overallPosture } = validateInputs(run, controls, findings);

  // db-A-001-audit: reject unknown control_ids BEFORE the transaction so a
  // typo yields a clear error instead of an opaque FK-constraint rollback.
  validateControlIds(db, controls, findings);

  let controlCount = 0, findingCount = 0;
  let runId: number | bigint = 0;

  const tx = db.transaction(() => {
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
    runId = runResult.lastInsertRowid;

    if (controls?.length) {
      const ins = db.prepare(`
        INSERT OR REPLACE INTO audit_control_results
          (audit_run_id, control_id, result, notes, evidence_ref, tool_source, measured_value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of controls) {
        ins.run(runId, c.control_id, c.result, c.notes || null,
          c.evidence_ref || null, c.tool_source || null, c.measured_value || null);
        controlCount++;
      }
    }

    if (findings?.length) {
      const ins = db.prepare(`
        INSERT INTO audit_findings (
          audit_run_id, repo_id, domain, control_id, title, description,
          severity, confidence, status, location, tool_source,
          evidence_ref, remediation, cve_id, cvss_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(audit_run_id, domain, title, severity) DO UPDATE SET
          control_id = excluded.control_id,
          description = excluded.description,
          confidence = excluded.confidence,
          status = excluded.status,
          location = excluded.location,
          tool_source = excluded.tool_source,
          evidence_ref = excluded.evidence_ref,
          remediation = excluded.remediation,
          cve_id = excluded.cve_id,
          cvss_score = excluded.cvss_score
      `);
      for (const f of findings) {
        ins.run(
          runId, repoId, f.domain, f.control_id || null, f.title,
          f.description || null, f.severity, f.confidence || 'high',
          f.status || 'open', f.location || null, f.tool_source || null,
          // F-AG-011: ?? preserves 0
          f.evidence_ref || null, f.remediation || null,
          f.cve_id || null, f.cvss_score ?? null
        );
        findingCount++;
      }
    }

    if (metrics) {
      insertMetrics(db, runId, metrics);
    }
  });
  tx();

  // Rebuild FTS5 index AFTER commit
  rebuildIndex();

  return { runId, controls: controlCount, findings: findingCount };
}
