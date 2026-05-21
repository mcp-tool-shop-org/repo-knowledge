-- Migration 010: Operational hygiene run tables (FT-4)
--
-- Adds two append-only run-history tables that give the operator an
-- audit trail of DB-health checks and sync invocations. The originating
-- motivation (per ROADMAP FT-4) was the silent-failure regression where
-- `rk sync` could complete with zero repos added/updated and no visible
-- error — observability of the sync surface itself was missing.
--
-- These tables are deliberately FK-independent: they describe operator
-- actions on the database as a whole, not actions on individual repos.
-- A db_health_runs row remains valid even if every repo is later
-- deleted, and a sync_runs row records the work that happened across
-- whatever owner/dir set the operator targeted at the time.
--
-- Adds:
--   1. db_health_runs — one row per `rk fsck` invocation. Records the
--      counts each integrity check produced + a final exit_code. The
--      operator can answer "when was the last clean fsck run?" without
--      re-running the checks.
--   2. sync_runs — one row per `rk sync` invocation. Records owners +
--      dirs targeted, add/update/skip counts, errors, and exit_code.
--      Started/finished split lets us detect crashed sync runs (NULL
--      finished_at older than 24h) via fsck.incompleteSyncRuns.
--
-- All changes additive + idempotent:
--   * CREATE TABLE / CREATE INDEX IF NOT EXISTS — re-running this
--     migration on a v10 DB is a no-op.
--
-- Schema version bumps to '10'. Existing meta markers preserved.

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- db_health_runs: audit trail of `rk fsck` invocations
--
-- Each row is one fsck pass. The counts are independent integrity
-- signals — the fsck command returns them as a composite report; this
-- table is the historical equivalent so operators can chart
-- "orphan_path_count over time" or notice a regression.
--
-- exit_code mirrors the process exit: 0 = all clean (or --strict not
-- set), 1 = --strict and at least one check non-zero. Always populated
-- (NOT NULL) so the latest exit_code per run is unambiguous.
--
-- Indexed by run_at DESC for "what did the last 20 runs look like" —
-- the dominant access pattern via `rk runs --db-health`.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS db_health_runs (
  id                              INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at                          TEXT NOT NULL,
  repo_count                      INTEGER,
  fts_entry_count                 INTEGER,
  orphan_path_count               INTEGER,
  broken_relationship_count       INTEGER,
  null_local_path_active_count    INTEGER,
  stale_local_path_count          INTEGER,
  exit_code                       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_health_runs_run_at
  ON db_health_runs(run_at DESC);

--------------------------------------------------------------------------------
-- sync_runs: observability for `rk sync` invocations
--
-- The originating motivation per ROADMAP FT-4: the sync surface had no
-- run-history record, so a silent-zero-sync could complete without any
-- visible evidence beyond a "0 added 0 updated" console line that the
-- operator might miss. Writing a row at start AND completion gives us:
--
--   * "when was sync last run, even if it didn't add anything?"
--   * "did it actually finish, or crash?" (NULL finished_at older than
--     24h surfaces via fsck.incompleteSyncRuns)
--   * "what owners / dirs did that run target?" (owners_json + dirs_scanned_json)
--   * "what errors did it surface?" (errors_json)
--
-- Counts default to 0 so an in-progress row (between INSERT at start
-- and UPDATE at completion) reads as zero-work rather than NULL — the
-- UPDATE at completion populates the real counts.
--
-- exit_code defaults to 0 (so an in-progress row registers as "no error
-- so far"); a thrown error path UPDATEs to 1 + populates errors_json
-- before re-throwing.
--
-- Indexed by started_at DESC for "last 20 sync runs."
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_runs (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at          TEXT NOT NULL,
  finished_at         TEXT,
  owners_json         TEXT,
  dirs_scanned_json   TEXT,
  repos_added         INTEGER DEFAULT 0,
  repos_updated       INTEGER DEFAULT 0,
  repos_skipped       INTEGER DEFAULT 0,
  errors_json         TEXT,
  exit_code           INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_started_at
  ON sync_runs(started_at DESC);

--------------------------------------------------------------------------------
-- Stamp schema version. Existing meta markers stay intact.
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '10');
INSERT OR REPLACE INTO meta(key, value) VALUES ('operational_runs_added', datetime('now'));
