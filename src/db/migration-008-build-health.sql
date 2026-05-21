-- Migration 008: Build / dependency / CI health (FT-3)
--
-- Adds:
--   1. repos.toolchain_pin — JSON string capturing pinned toolchain versions
--      from package.json / pyproject.toml / rust-toolchain.toml. Shape:
--      {node?, typescript?, python?, rust?}. Nullable.
--   2. repos.last_ci_status — enum at the application layer: 'passing' |
--      'failing' | 'unknown' | 'no_workflow'. Nullable (NULL = never
--      synced).
--   3. repos.last_ci_run_at — ISO timestamp of the most recent CI run we
--      observed. Nullable.
--   4. repos.last_ci_url — GitHub Actions run URL. Nullable.
--   5. repo_dep_audit_state — one-to-one with repos, captures the latest
--      `npm audit` (or `pip-audit`) severity rollup. repo_id is BOTH the
--      primary key and the FK so there is at most one row per repo.
--      last_clean_at tracks the last time (severity_critical + severity_high)
--      == 0 — useful for "we haven't had a clean audit in N days" surfacing.
--   6. repo_workflow_actions — one row per (repo, workflow file, action ref).
--      Captures action_ref + pinned_version (what's in the YAML) and
--      latest_known (filled in by a later registry probe). UNIQUE on
--      (repo_id, workflow_file, action_ref) so re-scanning is idempotent.
--   7. Indexes:
--        idx_workflow_actions_repo on (repo_id) — list-per-repo lookups
--        idx_dep_audit_severity on (severity_critical DESC, severity_high DESC)
--          — portfolio health dashboard "highest-risk-repos first" sort
--
-- All changes are additive + idempotent:
--   * ALTER TABLE ADD COLUMN swallows "duplicate column name" via
--     execMigrationIdempotent
--   * CREATE TABLE / CREATE INDEX IF NOT EXISTS for new tables and indexes
--
-- Schema version bumps to '8'.

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repos: add toolchain + CI status columns
--
-- last_ci_status enum is enforced at the application layer
-- (setRepoCiStatus in db/init.ts) for the same reason as lifecycle_status
-- (migration 006) and publisher_method (migration 007) — SQLite ADD COLUMN
-- cannot include a self-referential CHECK constraint, and we want
-- migrations to stay idempotent.
--
-- toolchain_pin stores a JSON object (TEXT in SQLite) rather than four
-- typed columns so the field can grow new keys (e.g. {go, ruby}) without
-- another ALTER cycle. Helpers in db/init.ts handle the JSON.stringify
-- round-trip.
--------------------------------------------------------------------------------
ALTER TABLE repos ADD COLUMN toolchain_pin TEXT;
ALTER TABLE repos ADD COLUMN last_ci_status TEXT;
ALTER TABLE repos ADD COLUMN last_ci_run_at TEXT;
ALTER TABLE repos ADD COLUMN last_ci_url TEXT;

--------------------------------------------------------------------------------
-- repo_dep_audit_state: latest dep-audit severity rollup per repo
--
-- One-to-one with repos via PRIMARY KEY repo_id (no separate id column).
-- This deliberately differs from repo_published_versions (which is
-- many-to-one) because a repo has a single "current" audit snapshot — a
-- new audit run replaces the prior counts wholesale. Historical audit
-- state is intentionally NOT preserved here; if a caller wants a time
-- series, they can subscribe to upsertDepAuditState calls and log
-- elsewhere.
--
-- last_clean_at is updated only when (severity_critical + severity_high)
-- == 0 — the helper sets it on insert/update when the counts qualify.
-- NULL means "never seen a clean state since this row was created."
--
-- tool identifies which auditor produced the counts ('npm_audit',
-- 'pip_audit', etc.) so a repo that switches tooling can be detected by
-- the value changing.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_dep_audit_state (
  repo_id            INTEGER PRIMARY KEY REFERENCES repos(id) ON DELETE CASCADE,
  severity_critical  INTEGER NOT NULL DEFAULT 0,
  severity_high      INTEGER NOT NULL DEFAULT 0,
  severity_moderate  INTEGER NOT NULL DEFAULT 0,
  severity_low       INTEGER NOT NULL DEFAULT 0,
  last_checked_at    TEXT NOT NULL,
  last_clean_at      TEXT,
  tool               TEXT NOT NULL
);

-- Portfolio dashboard query: "show me the riskiest repos first" — uses
-- (severity_critical DESC, severity_high DESC) as a covering composite.
-- The index is on the two highest-severity tiers because moderate / low
-- are cosmetic at the dashboard level.
CREATE INDEX IF NOT EXISTS idx_dep_audit_severity
  ON repo_dep_audit_state(severity_critical DESC, severity_high DESC);

--------------------------------------------------------------------------------
-- repo_workflow_actions: GitHub Actions references pinned in workflow YAML
--
-- One row per (repo, workflow_file, action_ref). Re-scanning the same
-- workflow file updates pinned_version + last_checked_at in place via
-- ON CONFLICT (see upsertWorkflowAction in db/init.ts). latest_known is
-- nullable because the value depends on a separate registry probe (gh
-- release / GitHub Marketplace) that hasn't been wired yet — when a
-- caller has the value, it overrides; when they don't, the existing one
-- stays via coalesce.
--
-- workflow_file stores the path RELATIVE to repo root (e.g.
-- '.github/workflows/ci.yml') so cross-repo comparisons line up cleanly.
-- action_ref stores the action WITHOUT the @version suffix (e.g.
-- 'actions/checkout') — pinned_version is the suffix. Local actions
-- (./.github/actions/foo) are deliberately skipped by the scanner.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_workflow_actions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id          INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  workflow_file    TEXT NOT NULL,
  action_ref       TEXT NOT NULL,
  pinned_version   TEXT NOT NULL,
  latest_known     TEXT,
  last_checked_at  TEXT NOT NULL,
  UNIQUE(repo_id, workflow_file, action_ref)
);

CREATE INDEX IF NOT EXISTS idx_workflow_actions_repo
  ON repo_workflow_actions(repo_id);

--------------------------------------------------------------------------------
-- Stamp schema version. Existing markers (audit_schema_added,
-- fts_triggers_added, lifecycle_paths_added, publish_state_added) stay
-- intact.
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '8');
INSERT OR REPLACE INTO meta(key, value) VALUES ('build_health_added', datetime('now'));
