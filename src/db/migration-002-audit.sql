-- repo-knowledge migration 002: Audit evidence layer
-- Adds structured audit tables for controls, findings, metrics, artifacts, exceptions

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- AUDIT_RUNS — one row per audit execution
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id         INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  audit_version   TEXT DEFAULT '1',              -- schema version of the audit
  commit_sha      TEXT,
  branch          TEXT,
  tag             TEXT,
  auditor         TEXT DEFAULT 'claude',          -- who/what ran it
  scope_level     TEXT DEFAULT 'core'
                    CHECK(scope_level IN ('core','full','deep')),
  overall_status  TEXT DEFAULT 'incomplete'
                    CHECK(overall_status IN ('pass','pass_with_findings','fail','incomplete')),
  overall_posture TEXT DEFAULT 'unknown'
                    CHECK(overall_posture IN ('healthy','needs_attention','critical','unknown')),
  domains_checked TEXT,                           -- JSON array of domain enums checked
  summary         TEXT,                           -- one-paragraph computed summary
  blocking_release INTEGER DEFAULT 0,            -- 1 = findings block release/use
  repo_url        TEXT,
  started_at      TEXT DEFAULT (datetime('now')),
  completed_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_runs_repo ON audit_runs(repo_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_posture ON audit_runs(overall_posture);

--------------------------------------------------------------------------------
-- AUDIT_CONTROLS — canonical checklist items (shared across all repos)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_controls (
  id          TEXT PRIMARY KEY,                   -- e.g. SEC-001, DEP-004, CI-002
  domain      TEXT NOT NULL
                CHECK(domain IN (
                  'inventory','code_quality','security_sast','dependencies_sca',
                  'licenses','secrets','config_iac','containers','runtime',
                  'performance','observability','testing','cicd','deployment',
                  'backup_dr','monitoring','compliance_privacy','supply_chain',
                  'integrations'
                )),
  title       TEXT NOT NULL,
  description TEXT,
  severity    TEXT DEFAULT 'medium'
                CHECK(severity IN ('critical','high','medium','low','info')),
  applicable_to TEXT,                             -- JSON array of app_shapes or null = all
  automated   INTEGER DEFAULT 0,                  -- 1 = can be checked by tool
  tool_hint   TEXT,                               -- suggested tool (e.g. "gitleaks", "trivy")
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_controls_domain ON audit_controls(domain);

--------------------------------------------------------------------------------
-- AUDIT_CONTROL_RESULTS — per run, per control outcome
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_control_results (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_run_id    INTEGER NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  control_id      TEXT NOT NULL REFERENCES audit_controls(id),
  result          TEXT NOT NULL
                    CHECK(result IN ('pass','fail','warn','not_applicable','not_run','error')),
  notes           TEXT,
  evidence_ref    TEXT,                           -- path to artifact or inline evidence
  tool_source     TEXT,                           -- which tool produced this result
  measured_value  TEXT,                           -- e.g. "87%" or "3 findings"
  evidence        TEXT,                           -- JSON array of evidence refs
  summary         TEXT,                           -- distinct from notes
  domain          TEXT,                           -- denormalized for faster queries
  checked_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cr_run ON audit_control_results(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_cr_control ON audit_control_results(control_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cr_unique ON audit_control_results(audit_run_id, control_id);

--------------------------------------------------------------------------------
-- AUDIT_FINDINGS — concrete problems discovered
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_findings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_run_id    INTEGER NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  repo_id         INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL
                    CHECK(domain IN (
                      'inventory','code_quality','security_sast','dependencies_sca',
                      'licenses','secrets','config_iac','containers','runtime',
                      'performance','observability','testing','cicd','deployment',
                      'backup_dr','monitoring','compliance_privacy','supply_chain',
                      'integrations'
                    )),
  control_id      TEXT REFERENCES audit_controls(id),
  title           TEXT NOT NULL,
  description     TEXT,
  severity        TEXT NOT NULL
                    CHECK(severity IN ('critical','high','medium','low','info')),
  confidence      TEXT DEFAULT 'high'
                    CHECK(confidence IN ('high','medium','low')),
  status          TEXT DEFAULT 'open'
                    CHECK(status IN ('open','in_progress','fixed','accepted_risk','false_positive','mitigated')),
  location        TEXT,                           -- file:line or path
  tool_source     TEXT,
  evidence_ref    TEXT,                           -- path to artifact
  remediation     TEXT,                           -- recommended fix
  cve_id          TEXT,                           -- if applicable
  cvss_score      REAL,
  evidence        TEXT,                           -- JSON array of evidence refs
  created_at      TEXT DEFAULT (datetime('now')),
  resolved_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_findings_run ON audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_findings_repo ON audit_findings(repo_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON audit_findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_status ON audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_domain ON audit_findings(domain);

--------------------------------------------------------------------------------
-- AUDIT_ARTIFACTS — pointers to raw reports on disk
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_artifacts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_run_id    INTEGER NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  artifact_type   TEXT NOT NULL,                  -- sarif | json | markdown | log | sbom | screenshot
  path            TEXT NOT NULL,                  -- relative to artifacts root
  checksum        TEXT,
  generated_by    TEXT,                           -- tool name
  format          TEXT,                           -- sarif | json | md | txt | png | csv
  size_bytes      INTEGER,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_artifacts_run ON audit_artifacts(audit_run_id);

--------------------------------------------------------------------------------
-- AUDIT_METRICS — snapshot metrics per run
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_metrics (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_run_id              INTEGER NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  -- Severity counts
  critical_count            INTEGER DEFAULT 0,
  high_count                INTEGER DEFAULT 0,
  medium_count              INTEGER DEFAULT 0,
  low_count                 INTEGER DEFAULT 0,
  info_count                INTEGER DEFAULT 0,
  -- Domain-specific metrics
  coverage_percent          REAL,
  test_count                INTEGER,
  outdated_dependencies     INTEGER,
  vulnerable_dependencies   INTEGER,
  secrets_found             INTEGER DEFAULT 0,
  ci_security_checks        INTEGER,
  sbom_present              INTEGER DEFAULT 0,     -- boolean
  backup_plan_present       INTEGER DEFAULT 0,     -- boolean
  license_issues            INTEGER DEFAULT 0,
  -- Control summary
  controls_passed           INTEGER DEFAULT 0,
  controls_failed           INTEGER DEFAULT 0,
  controls_warned           INTEGER DEFAULT 0,
  controls_skipped          INTEGER DEFAULT 0,
  controls_total            INTEGER DEFAULT 0,
  controls_na               INTEGER DEFAULT 0,
  controls_not_run          INTEGER DEFAULT 0,
  -- Finding severity breakdown
  findings_open_critical    INTEGER DEFAULT 0,
  findings_open_high        INTEGER DEFAULT 0,
  findings_open_medium      INTEGER DEFAULT 0,
  findings_open_low         INTEGER DEFAULT 0,
  findings_open_info        INTEGER DEFAULT 0,
  -- Extended metrics
  domains_checked_count     INTEGER DEFAULT 0,
  dependency_count          INTEGER,
  ci_present                INTEGER DEFAULT 0,
  tests_present             INTEGER DEFAULT 0,
  container_present         INTEGER DEFAULT 0,
  iac_present               INTEGER DEFAULT 0,
  deploy_present            INTEGER DEFAULT 0,
  integrations_count        INTEGER,
  -- Computed
  pass_rate                 REAL,                   -- controls_passed / controls_total
  created_at                TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_run ON audit_metrics(audit_run_id);

--------------------------------------------------------------------------------
-- AUDIT_EXCEPTIONS — formal waivers / accepted risks
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_exceptions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id         INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  finding_id      INTEGER REFERENCES audit_findings(id),
  control_id      TEXT REFERENCES audit_controls(id),
  exception_type  TEXT NOT NULL
                    CHECK(exception_type IN ('accepted_risk','false_positive','deferred','not_applicable')),
  justification   TEXT NOT NULL,
  approved_by     TEXT,
  expires_at      TEXT,                           -- null = permanent
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_exceptions_repo ON audit_exceptions(repo_id);

--------------------------------------------------------------------------------
-- Update schema version
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '3');
INSERT OR REPLACE INTO meta(key, value) VALUES ('audit_schema_added', datetime('now'));
