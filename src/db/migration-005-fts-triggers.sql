-- Migration 005: FTS5 triggers for repo_search drift fix (F-DB-013)
--
-- Problem: repo_search (FTS5) is rebuilt only by rebuildIndex() in src/search/fts.ts,
-- which runs on full-sync. Between syncs, edits to repos / repo_notes / repo_docs
-- silently drift from the FTS index — searches return stale or missing matches.
--
-- Fix: maintain repo_search incrementally via AFTER INSERT/UPDATE/DELETE triggers
-- on the three source tables. The column shape matches the existing FTS table:
--   (slug, source_type, source_id, title, content)
--
-- Strategy:
--   * INSERT and UPDATE both use DELETE-then-INSERT (FTS5 contentless tables
--     don't support UPDATE in the same shape, and the delete keeps the index
--     deduplicated against any prior rebuild that may have left rows).
--   * DELETE removes the matching row by source_type + source_id.
--   * The note/doc triggers reference the slug via JOIN to repos at trigger
--     time, so a freshly inserted/updated note or doc row always gets the
--     CURRENT slug. But a repo SLUG RENAME does not re-fire the note/doc
--     triggers — their rows keep the OLD slug until the row is next edited.
--     The repos UPDATE trigger below therefore also rewrites the slug on the
--     repo's existing note/doc FTS rows (db-A-004-DB), so a rename keeps all
--     of a repo's search rows grouped under one slug.
--
-- The triggers are CREATE TRIGGER IF NOT EXISTS, so re-running this migration
-- is safe. The migration script is also idempotent against partially applied
-- state (e.g. some triggers already present from manual operator action).

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repos: index repo description + purpose
--------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_repo_search_repos_insert
AFTER INSERT ON repos
WHEN NEW.description IS NOT NULL OR NEW.purpose IS NOT NULL
BEGIN
  -- Remove any prior row (defensive — rebuildIndex may have stale state).
  DELETE FROM repo_search WHERE source_type = 'repo' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  VALUES (
    NEW.slug,
    'repo',
    CAST(NEW.id AS TEXT),
    NEW.slug,
    coalesce(NEW.description, '') || char(10) || coalesce(NEW.purpose, '')
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_repos_update
AFTER UPDATE ON repos
BEGIN
  -- db-A-004-DB: when the repo's slug changes, carry the new slug onto
  -- the repo's existing doc/note FTS rows too. Those rows were written
  -- with the slug current at note/doc edit time and are NOT re-fired by
  -- a repos UPDATE, so without this they keep the OLD slug and the
  -- repo's search results split across two slugs. Guarded on an actual
  -- rename so the common no-slug-change UPDATE stays a single-row touch.
  UPDATE repo_search SET slug = NEW.slug
   WHERE slug = OLD.slug AND OLD.slug <> NEW.slug;
  DELETE FROM repo_search WHERE source_type = 'repo' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  SELECT
    NEW.slug,
    'repo',
    CAST(NEW.id AS TEXT),
    NEW.slug,
    coalesce(NEW.description, '') || char(10) || coalesce(NEW.purpose, '')
  WHERE NEW.description IS NOT NULL OR NEW.purpose IS NOT NULL;
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_repos_delete
AFTER DELETE ON repos
BEGIN
  DELETE FROM repo_search WHERE source_type = 'repo' AND source_id = CAST(OLD.id AS TEXT);
  -- Cascade: kill any orphan docs/notes rows tied to this repo. FK ON DELETE
  -- CASCADE already removed the source rows; the FTS triggers below fire on
  -- the cascaded deletes too, but this belt-and-suspenders cleanup covers any
  -- FTS rows left over from a pre-trigger rebuildIndex.
  DELETE FROM repo_search WHERE slug = OLD.slug;
END;

--------------------------------------------------------------------------------
-- repo_notes: index title + content
--------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_repo_search_notes_insert
AFTER INSERT ON repo_notes
BEGIN
  DELETE FROM repo_search WHERE source_type = 'note' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  SELECT
    r.slug,
    'note',
    CAST(NEW.id AS TEXT),
    coalesce(NEW.title, NEW.note_type),
    NEW.content
  FROM repos r
  WHERE r.id = NEW.repo_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_notes_update
AFTER UPDATE ON repo_notes
BEGIN
  DELETE FROM repo_search WHERE source_type = 'note' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  SELECT
    r.slug,
    'note',
    CAST(NEW.id AS TEXT),
    coalesce(NEW.title, NEW.note_type),
    NEW.content
  FROM repos r
  WHERE r.id = NEW.repo_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_notes_delete
AFTER DELETE ON repo_notes
BEGIN
  DELETE FROM repo_search WHERE source_type = 'note' AND source_id = CAST(OLD.id AS TEXT);
END;

--------------------------------------------------------------------------------
-- repo_docs: index title + content (truncated to 50K chars — matches rebuildIndex)
--------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_repo_search_docs_insert
AFTER INSERT ON repo_docs
WHEN NEW.content IS NOT NULL
BEGIN
  DELETE FROM repo_search WHERE source_type = 'doc' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  SELECT
    r.slug,
    'doc',
    CAST(NEW.id AS TEXT),
    coalesce(NEW.title, NEW.path),
    substr(NEW.content, 1, 50000)
  FROM repos r
  WHERE r.id = NEW.repo_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_docs_update
AFTER UPDATE ON repo_docs
BEGIN
  DELETE FROM repo_search WHERE source_type = 'doc' AND source_id = CAST(NEW.id AS TEXT);
  INSERT INTO repo_search (slug, source_type, source_id, title, content)
  SELECT
    r.slug,
    'doc',
    CAST(NEW.id AS TEXT),
    coalesce(NEW.title, NEW.path),
    substr(NEW.content, 1, 50000)
  FROM repos r
  WHERE r.id = NEW.repo_id AND NEW.content IS NOT NULL;
END;

CREATE TRIGGER IF NOT EXISTS trg_repo_search_docs_delete
AFTER DELETE ON repo_docs
BEGIN
  DELETE FROM repo_search WHERE source_type = 'doc' AND source_id = CAST(OLD.id AS TEXT);
END;

-- Mark migration 005 as applied (schema_version stays at '4'; the FTS
-- triggers are an additive, idempotent layer that does not change the
-- migration head — they re-attach safely via CREATE TRIGGER IF NOT EXISTS).
INSERT OR REPLACE INTO meta(key, value) VALUES ('fts_triggers_added', datetime('now'));
