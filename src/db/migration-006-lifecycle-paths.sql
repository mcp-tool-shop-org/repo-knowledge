-- Migration 006: Lifecycle + cross-rig paths (FT-1)
--
-- Adds:
--   1. repos.lifecycle_status — enum: active | deprecated | archived |
--      superseded | marketing_wing | prototype. Default 'active'.
--   2. repos.deprecated_at — ISO date string for when a repo entered a
--      terminal lifecycle state. Nullable.
--   3. repos.replaced_by_repo_id — FK to repos(id) ON DELETE SET NULL.
--      Captures "what to use instead" for superseded repos.
--   4. rigs — registry of physical/logical machines that host clones of
--      these repos (e.g. 'mac-m5max', 'windows-5080').
--   5. repo_local_paths — (repo, rig) → local clone path. Replaces the
--      single repos.local_path column for cross-rig coordination, but
--      that column is preserved unchanged for backward compatibility.
--
-- All changes are additive + idempotent:
--   * ALTER TABLE ADD COLUMN swallows "duplicate column name" via
--     execMigrationIdempotent
--   * CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS for new
--     tables and indexes
--   * Backfills use INSERT/UPDATE patterns that are safe to re-run
--
-- Schema version bumps to '6'.

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repos: add lifecycle columns
--
-- SQLite ADD COLUMN cannot include a CHECK constraint that references
-- the table itself, so the enum is enforced at the application layer
-- (db/init.ts helpers reject out-of-enum values). The default 'active'
-- makes existing rows valid without an explicit backfill, but we run an
-- UPDATE below to be explicit about intent.
--------------------------------------------------------------------------------
ALTER TABLE repos ADD COLUMN lifecycle_status TEXT DEFAULT 'active';
ALTER TABLE repos ADD COLUMN deprecated_at TEXT;
ALTER TABLE repos ADD COLUMN replaced_by_repo_id INTEGER REFERENCES repos(id) ON DELETE SET NULL;

-- Backfill: any existing row missing lifecycle_status gets 'active'.
-- The DEFAULT already covers new rows; this covers rows that pre-date
-- the column (SQLite's ADD COLUMN DEFAULT does populate existing rows
-- with the default value, so this is a belt-and-suspenders explicit set).
UPDATE repos SET lifecycle_status = 'active'
  WHERE lifecycle_status IS NULL;

-- NOTE: replaced_by_repo_id backfill from repo_relationships is performed
-- by the openDb wiring in src/db/init.ts AFTER this SQL runs, conditional
-- on the repo_relationships table existing. Inlining the UPDATE here would
-- break minimal-v1 schema fixtures (e.g. migration-sequence test) that
-- don't yet have repo_relationships. The JS-side backfill is idempotent
-- and uses the same semantic: for each repo_relationships row with
-- relation_type='supersedes', set the source repo's replaced_by_repo_id
-- to the target repo's id.

--------------------------------------------------------------------------------
-- rigs: physical/logical machines that host repo clones
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rigs (
  rig_id        TEXT PRIMARY KEY,                 -- e.g. 'mac-m5max', 'windows-5080'
  hostname      TEXT,
  primary_root  TEXT,                             -- e.g. '/Volumes/T9-Shared/AI' or 'E:/AI'
  last_seen_at  TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

--------------------------------------------------------------------------------
-- repo_local_paths: (repo, rig) → local clone path
--
-- Unique on (repo_id, rig_id) — one path per (repo, rig). Re-registering
-- the same pair updates last_seen_at + local_path via ON CONFLICT.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_local_paths (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id       INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  rig_id        TEXT NOT NULL REFERENCES rigs(rig_id) ON DELETE CASCADE,
  local_path    TEXT NOT NULL,
  last_seen_at  TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(repo_id, rig_id)
);

CREATE INDEX IF NOT EXISTS idx_repo_local_paths_repo ON repo_local_paths(repo_id);

--------------------------------------------------------------------------------
-- Stamp schema version. Keeps audit_schema_added / fts_triggers_added
-- intact — those markers are independent of the linear version ladder.
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '6');
INSERT OR REPLACE INTO meta(key, value) VALUES ('lifecycle_paths_added', datetime('now'));
