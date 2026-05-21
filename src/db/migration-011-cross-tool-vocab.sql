-- Migration 011: Cross-tool vocabulary (FT-5)
--
-- Adds two cross-tool relationship vocabulary values and a forge_vault_path
-- column on repos. Both are additive — pre-existing data is preserved
-- byte-identically.
--
-- New relation_type enum values (extending the migration-001 set):
--   * 'wraps'                   — A is a higher-level wrapper around B
--   * 'collaborated_in_mission' — A and B worked together inside a Role OS mission
--
-- SQLite cannot extend a CHECK constraint via ALTER TABLE. The canonical
-- pattern is "create new table with the new constraint → INSERT…SELECT
-- → DROP old → ALTER…RENAME". We disable FK enforcement for that block
-- because the FROM/TO references would temporarily point at a table the
-- engine no longer treats as the parent during the swap.
--
-- The block is gated at the JS layer on whether `cross_tool_vocab_added`
-- meta marker already exists; the SQL itself is also written to be safe
-- to re-run if the marker logic is bypassed (the new enum check accepts
-- the old values plus the new ones, and INSERT…SELECT against an
-- already-extended table is a no-op as long as DROP is the last step).
--
-- All changes are additive + idempotent:
--   * The relation-table recreate copies every existing row (no data
--     loss).
--   * forge_vault_path is a plain ADD COLUMN — execMigrationIdempotent
--     would tolerate duplicate-column on re-run but we gate the whole
--     migration on the meta marker instead.
--
-- Schema version bumps to '11'. Existing meta markers preserved.

--------------------------------------------------------------------------------
-- repo_relationships: extend the relation_type CHECK enum
--
-- The legacy schema (migration-001) embedded the CHECK list directly. To
-- extend it we use the SQLite-recommended pattern. FK enforcement must
-- be off for the swap because the old and new tables share a name during
-- the rename and any FK pointing at repo_relationships(id) would be
-- temporarily invalid — there are none currently, but disabling FKs
-- defensively matches SQLite's official recipe.
--------------------------------------------------------------------------------
PRAGMA foreign_keys = OFF;

CREATE TABLE repo_relationships_new (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  from_repo_id    INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  relation_type   TEXT NOT NULL
                    CHECK(relation_type IN (
                      'depends_on','related_to','supersedes',
                      'shares_domain_with','shares_package_with',
                      'companion_to',
                      -- FT-5: cross-tool vocabulary
                      'wraps','collaborated_in_mission'
                    )),
  to_repo_id      INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  note            TEXT
);

-- Copy every row from the old table into the new one. Column order
-- matches the original schema.sql definition exactly so SELECT * is safe.
INSERT INTO repo_relationships_new (id, from_repo_id, relation_type, to_repo_id, note)
SELECT id, from_repo_id, relation_type, to_repo_id, note FROM repo_relationships;

-- Drop the old table. The previous indexes attached to it are dropped
-- automatically by SQLite when the table is dropped.
DROP TABLE repo_relationships;

-- Rename the new table into place. After this point, all writes target
-- the extended CHECK constraint.
ALTER TABLE repo_relationships_new RENAME TO repo_relationships;

-- Re-create the indexes that lived on the old table. The migration-001
-- schema declared two regular indexes + one unique index; we restore
-- them verbatim so query plans stay byte-identical.
CREATE INDEX IF NOT EXISTS idx_rel_from ON repo_relationships(from_repo_id);
CREATE INDEX IF NOT EXISTS idx_rel_to ON repo_relationships(to_repo_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rel_unique
  ON repo_relationships(from_repo_id, relation_type, to_repo_id);

PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- repos: add forge_vault_path
--
-- Game repos point at their forge-vault wing (the offline narrative /
-- asset registry that lives outside the repo itself). Nullable — only
-- game repos populate it; non-game repos leave it NULL.
--------------------------------------------------------------------------------
ALTER TABLE repos ADD COLUMN forge_vault_path TEXT;

--------------------------------------------------------------------------------
-- Stamp schema version + add the meta marker that gates the gate at
-- application layer (see execMigrationStrict gating in src/db/init.ts).
--------------------------------------------------------------------------------
INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '11');
INSERT OR REPLACE INTO meta(key, value) VALUES ('cross_tool_vocab_added', datetime('now'));
