-- Migration 009: Build health extensions (FT-3.5 — research-grounded)
--
-- Extends the FT-3 (migration-008) skeleton with the signals the
-- 5-agent research swarm (2026-05-20) identified as load-bearing for
-- portfolio health surfacing. Every column/table added here is sourced
-- to specific cited evidence — the corresponding code in
-- src/db/init.ts and src/sync/build-health.ts carries the citation as
-- a comment at the load-bearing decision site.
--
-- Added:
--   1. repo_dep_audit_state.{critical_cve_ids, high_cve_ids, audit_omit_dev}
--      — per Pu 2026 (NDSS): 68.28% of npm findings unreachable noise →
--      store CVE IDs (not just counts) so downstream tooling can EPSS-join
--      (Jacobs 2021, EPSS ROC AUC 0.838) and KEV-intersect (CISA KEV:
--      0.004% of CVEs actually exploited). Per Latendresse 2022
--      (arXiv:2207.14711): <1% of installed deps reach prod → audit_omit_dev
--      flag tracks whether the run excluded devDependencies.
--
--   2. repo_dep_audit_history (NEW TABLE) — timestamped snapshot
--      history so callers can compute deltas. Per VulnCheck Q1 2025:
--      28.3% of exploited CVEs hit within 24h → deltas matter more
--      than levels. The FT-3 design kept only the "latest" row in
--      repo_dep_audit_state; this table fills the missing time series.
--
--   3. repo_workflow_actions.{resolved_sha, pin_quality, immutable_publisher}
--      — per CISA Mar 2025 (CVE-2025-30066, tj-actions tag-rewrite):
--      SHA-pinned actions were immune → store resolved 40-char SHA.
--      Per OpenSSF 2024: SHA is the only immutable reference → grade
--      pin_quality (sha / immutable-semver / mutable-semver / major /
--      branch). Per GitHub Immutable Actions (2025): immutable_publisher
--      flag flips @v5 risk from RISK to OK when publisher opts in.
--      Per Alvarez 2025 (7/100 OSS pin everything): grade, don't fail.
--
--   4. repo_workflow_permissions (NEW TABLE) — GITHUB_TOKEN scoping
--      per Beyer 2016 (SRE Workbook Ch.5): permissions: blocks limit
--      blast radius → capture for compound-risk scoring.
--
--   5. repo_observed_toolchain (NEW TABLE) — observed per (repo, rig)
--      for drift detection vs repos.toolchain_pin. Per JetBrains 2025
--      drift report: drift = declared - observed. Validates FT-1's
--      rigs abstraction; the declared side already lives on
--      repos.toolchain_pin from migration-008.
--
-- All changes additive + idempotent:
--   * ALTER TABLE ADD COLUMN swallows "duplicate column name" via
--     execMigrationIdempotent
--   * CREATE TABLE / CREATE INDEX IF NOT EXISTS for new entities
--
-- Schema version bumps to '9'.

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repo_dep_audit_state: extend with CVE IDs + dev/prod scope
--
-- critical_cve_ids / high_cve_ids store JSON arrays of CVE/GHSA
-- identifiers ([]"CVE-2025-XXXXX", "GHSA-yyyy-..."]) — TEXT in SQLite,
-- helpers in db/init.ts handle the round-trip. Only critical+high
-- because moderate/low (per ACM CSUR 2024 10.1145/3723158) carry 46–70%
-- false positives and would inflate JSON payload noise at the
-- surfacing layer.
--
-- audit_omit_dev is a boolean (0/1). When set, the run excluded
-- devDependencies — only the prod chain is reflected in the counts.
-- A second snapshot can capture the dev-inclusive view so callers can
-- compare reachable vs total.
--------------------------------------------------------------------------------
ALTER TABLE repo_dep_audit_state ADD COLUMN critical_cve_ids TEXT;
ALTER TABLE repo_dep_audit_state ADD COLUMN high_cve_ids TEXT;
ALTER TABLE repo_dep_audit_state ADD COLUMN audit_omit_dev INTEGER DEFAULT 0;

--------------------------------------------------------------------------------
-- repo_dep_audit_history: timestamped snapshots for delta computation
--
-- Per VulnCheck Q1 2025: 28.3% of exploited CVEs land within 24h of
-- disclosure. The feed surface needs deltas ("critical: 0 -> 2"), not
-- absolute counts. This table is append-only — one row per
-- syncNpmAudit / syncPipAudit invocation. The repo_dep_audit_state
-- row stays as the "latest" projection for fast lookup.
--
-- Indexed by (repo_id, taken_at DESC) for "show me the last 10 snapshots"
-- queries — feed renderer reads (latest, second-latest) to compute delta.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_dep_audit_history (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id            INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  taken_at           TEXT NOT NULL,
  severity_critical  INTEGER NOT NULL DEFAULT 0,
  severity_high      INTEGER NOT NULL DEFAULT 0,
  severity_moderate  INTEGER NOT NULL DEFAULT 0,
  severity_low       INTEGER NOT NULL DEFAULT 0,
  critical_cve_ids   TEXT,
  high_cve_ids       TEXT,
  audit_omit_dev     INTEGER DEFAULT 0,
  tool               TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dep_audit_history_repo_taken
  ON repo_dep_audit_history(repo_id, taken_at DESC);

--------------------------------------------------------------------------------
-- repo_workflow_actions: extend with SHA + pin-quality grade
--
-- resolved_sha: 40-char commit SHA. Best-effort — populated when the
--   scanner is invoked with --resolve-shas (calls `gh api repos/.../commits/<ref>`).
--   NULL when the ref is already a SHA, or when resolution failed.
--
-- pin_quality: enum at the application layer (PinQuality type in
--   src/db/init.ts). Values:
--     'sha'               — 40-char hex SHA (per CISA: immune to tag-rewrite)
--     'immutable-semver'  — vN.M.P AND the action repo has Immutable
--                           Releases enabled (per GitHub 2025: publisher-opted)
--     'mutable-semver'    — vN.M.P with no immutable guarantee
--     'major'             — vN tag (e.g. @v5, follows latest within major)
--     'branch'            — main / master / arbitrary branch name (worst)
--   App-layer enum keeps the migration self-contained — adding a 6th
--   value would otherwise require an ALTER TABLE with the same CHECK
--   constraint dance as lifecycle_status (migration-006).
--
-- immutable_publisher: 0/1 flag captured at the same time as pin_quality.
--   Set when the action's repo has Immutable Releases turned on
--   (probed via `gh api repos/<owner>/<name>/releases/latest --jq .immutable`).
--   Per GitHub Immutable Actions (2025), this flips the risk profile
--   for mutable-semver pins.
--------------------------------------------------------------------------------
ALTER TABLE repo_workflow_actions ADD COLUMN resolved_sha TEXT;
ALTER TABLE repo_workflow_actions ADD COLUMN pin_quality TEXT;
ALTER TABLE repo_workflow_actions ADD COLUMN immutable_publisher INTEGER DEFAULT 0;

--------------------------------------------------------------------------------
-- repo_workflow_permissions: GITHUB_TOKEN scoping per workflow file
--
-- One row per (repo_id, workflow_file). permissions_json captures the
-- raw permissions: block as JSON, or the literal string "default" if no
-- permissions: block is present at the workflow root (which is the
-- riskiest configuration — token defaults to repo-wide write).
--
-- Per Beyer 2016 (SRE Workbook Ch.5): permissions: blocks limit blast
-- radius → capture so compound risk scoring can fold workflow scope into
-- the pin_quality grade. A repo with all SHA pins BUT no permissions:
-- block is still exposed if any action gets compromised.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_workflow_permissions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id          INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  workflow_file    TEXT NOT NULL,
  permissions_json TEXT,
  last_checked_at  TEXT NOT NULL,
  UNIQUE(repo_id, workflow_file)
);

CREATE INDEX IF NOT EXISTS idx_workflow_permissions_repo
  ON repo_workflow_permissions(repo_id);

--------------------------------------------------------------------------------
-- repo_observed_toolchain: observed toolchain version per (repo, rig)
--
-- Drift detection layer per JetBrains 2025: drift = declared (repos.toolchain_pin
-- — from migration-008) - observed (this table — what's actually
-- installed on each rig). UNIQUE(repo_id, rig_id, tool) keeps one row
-- per tool per rig.
--
-- `tool` values mirror keys in toolchain_pin JSON: 'node', 'typescript',
-- 'python', 'rust'. Helpers in db/init.ts compute drift by comparing
-- this table against repos.toolchain_pin.
--
-- rig_id FK chains via REFERENCES rigs(rig_id) ON DELETE CASCADE — when
-- a rig is removed the observation rows disappear with it.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_observed_toolchain (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id           INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  rig_id            TEXT NOT NULL REFERENCES rigs(rig_id) ON DELETE CASCADE,
  tool              TEXT NOT NULL,
  observed_version  TEXT NOT NULL,
  observed_at       TEXT NOT NULL,
  UNIQUE(repo_id, rig_id, tool)
);

CREATE INDEX IF NOT EXISTS idx_observed_toolchain_repo
  ON repo_observed_toolchain(repo_id);

--------------------------------------------------------------------------------
-- Stamp schema version. Existing markers stay intact.
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '9');
INSERT OR REPLACE INTO meta(key, value) VALUES ('build_health_extensions_added', datetime('now'));
