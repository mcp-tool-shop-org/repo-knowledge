-- Migration 007: Publish state (FT-2)
--
-- Adds:
--   1. repos.npm_package_name — explicit binding when repo name ≠ package
--      name (e.g. mcp-tool-shop-org/sovereignty → @mcptoolshop/sovereignty).
--      Nullable.
--   2. repos.pypi_package_name — same idea for PyPI. Nullable.
--   3. repos.publisher_method — enum enforced at the application layer.
--      Values: 'pypi_trusted' | 'pypi_token' | 'npm_token' | 'npm_trusted' |
--              'github_release_only' | 'none'. Nullable (NULL = unknown).
--   4. repo_published_versions — one row per (repo, channel, version)
--      tuple. Channel is 'npm', 'pypi', 'github_release', or 'vsce'.
--      UNIQUE(repo_id, channel, version) — same version on same channel
--      stays a single row across re-syncs (synced_at refreshes on
--      conflict).
--
-- All changes are additive + idempotent:
--   * ALTER TABLE ADD COLUMN swallows "duplicate column name" via
--     execMigrationIdempotent
--   * CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS for new
--     tables and indexes
--
-- Schema version bumps to '7'.

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repos: add package-binding + publisher-method columns
--
-- The publisher_method enum is enforced at the application layer (set via
-- setRepoPackageNames in db/init.ts) for the same reason as
-- lifecycle_status in migration 006 — SQLite ADD COLUMN cannot include a
-- CHECK constraint referencing the table itself, and we want migrations
-- to stay idempotent.
--------------------------------------------------------------------------------
ALTER TABLE repos ADD COLUMN npm_package_name TEXT;
ALTER TABLE repos ADD COLUMN pypi_package_name TEXT;
ALTER TABLE repos ADD COLUMN publisher_method TEXT;

--------------------------------------------------------------------------------
-- repo_published_versions: registry of versions seen on publishing channels
--
-- channel is one of 'npm', 'pypi', 'github_release', 'vsce'.
-- source tracks sync provenance (e.g. 'npm_view', 'pip_index',
-- 'gh_release', 'vsce') so a re-sync can prefer the more authoritative
-- source if needed.
--
-- published_at is nullable because some channels (or older registry
-- entries) don't expose a publication timestamp.
--
-- synced_at refreshes on conflict so "most recently synced" queries work
-- even if a version was previously inserted with a stale timestamp.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_published_versions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id       INTEGER NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  channel       TEXT NOT NULL,
  version       TEXT NOT NULL,
  published_at  TEXT,
  source        TEXT,
  synced_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(repo_id, channel, version)
);

-- Index supports "latest synced version per channel" — used by
-- getLatestPublishedVersion. ORDER BY synced_at DESC LIMIT 1 against
-- this composite covers the common access pattern.
CREATE INDEX IF NOT EXISTS idx_published_versions_repo_channel
  ON repo_published_versions(repo_id, channel, synced_at DESC);

--------------------------------------------------------------------------------
-- Stamp schema version. Existing markers (audit_schema_added,
-- fts_triggers_added, lifecycle_paths_added) stay intact.
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '7');
INSERT OR REPLACE INTO meta(key, value) VALUES ('publish_state_added', datetime('now'));
