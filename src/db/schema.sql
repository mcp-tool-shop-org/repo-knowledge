-- repo-knowledge schema v1
-- Knowledge catalog for repos: identity, tech, state, notes, docs, facts, relationships

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

--------------------------------------------------------------------------------
-- REPOS — one row per repo
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  owner           TEXT NOT NULL,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,          -- owner/name
  github_url      TEXT,
  local_path      TEXT,
  description     TEXT,
  purpose         TEXT,                          -- human-authored "why this exists"
  category        TEXT,                          -- product | tool | library | experiment | blueprint | marketing
  status          TEXT DEFAULT 'unknown'
                    CHECK(status IN ('active','paused','archived','unknown')),
  stage           TEXT,                          -- free-form: "Phase 1", "shipped", "prototype"
  visibility      TEXT DEFAULT 'public'
                    CHECK(visibility IN ('public','private','internal')),
  archived        INTEGER DEFAULT 0,
  default_branch  TEXT DEFAULT 'main',
  stars           INTEGER DEFAULT 0,
  forks           INTEGER DEFAULT 0,
  open_issues     INTEGER DEFAULT 0,
  license         TEXT,
  created_at      TEXT,
  updated_at      TEXT,
  pushed_at       TEXT,
  synced_at       TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_repos_owner_name ON repos(owner, name);

--------------------------------------------------------------------------------
-- REPO_TECH — structured technical fingerprint
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_tech (
  repo_id           INTEGER PRIMARY KEY REFERENCES repos(id) ON DELETE CASCADE,
  primary_language   TEXT,
  languages          TEXT,          -- JSON object {lang: bytes}
  frameworks         TEXT,          -- JSON array
  runtime            TEXT,
  platform_targets   TEXT,          -- JSON array
  package_manager    TEXT,
  app_shape          TEXT,          -- cli | desktop | web | library | mcp-server | api | game
  deployment_shape   TEXT           -- npm | pypi | cargo | docker | github-pages | binary | none
);

--------------------------------------------------------------------------------
-- REPO_TOPICS — GitHub topics + manual tags
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_topics (
  repo_id   INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  topic     TEXT NOT NULL,
  source    TEXT DEFAULT 'github' CHECK(source IN ('github','manual')),
  PRIMARY KEY (repo_id, topic)
);

--------------------------------------------------------------------------------
-- REPO_NOTES — human-authored durable notes
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id     INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  note_type   TEXT NOT NULL
                CHECK(note_type IN (
                  'thesis','architecture','warning','next_step',
                  'drift_risk','release_summary','convention',
                  'pain_point','command','general'
                )),
  title       TEXT,
  content     TEXT NOT NULL,
  source      TEXT DEFAULT 'manual',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_repo ON repo_notes(repo_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON repo_notes(note_type);

--------------------------------------------------------------------------------
-- REPO_DOCS — indexed document registry
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_docs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id         INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  path            TEXT NOT NULL,
  doc_type        TEXT,            -- readme | changelog | license | docs | plan | audit | other
  title           TEXT,
  summary         TEXT,
  content         TEXT,
  checksum        TEXT,
  last_indexed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_docs_repo ON repo_docs(repo_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_docs_repo_path ON repo_docs(repo_id, path);

--------------------------------------------------------------------------------
-- REPO_FACTS — extracted facts worth querying
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_facts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id       INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  fact_type     TEXT NOT NULL,     -- framework | dependency | test_count | ci_status | version | etc
  key           TEXT NOT NULL,
  value         TEXT,
  confidence    TEXT DEFAULT 'detected'
                  CHECK(confidence IN ('detected','manual','inferred')),
  source_path   TEXT,
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_facts_repo ON repo_facts(repo_id);
CREATE INDEX IF NOT EXISTS idx_facts_type ON repo_facts(fact_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_facts_unique ON repo_facts(repo_id, fact_type, key);

--------------------------------------------------------------------------------
-- REPO_RELATIONSHIPS — cross-repo edges
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_relationships (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  from_repo_id    INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  relation_type   TEXT NOT NULL
                    CHECK(relation_type IN (
                      'depends_on','related_to','supersedes',
                      'shares_domain_with','shares_package_with',
                      'companion_to'
                    )),
  to_repo_id      INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  note            TEXT
);

CREATE INDEX IF NOT EXISTS idx_rel_from ON repo_relationships(from_repo_id);
CREATE INDEX IF NOT EXISTS idx_rel_to ON repo_relationships(to_repo_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rel_unique
  ON repo_relationships(from_repo_id, relation_type, to_repo_id);

--------------------------------------------------------------------------------
-- REPO_AUDITS — audit history
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_audits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id     INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  audit_type  TEXT NOT NULL,       -- shipcheck | security | docs | ci
  result      TEXT,                -- pass | fail | partial | skip
  summary     TEXT,
  score       REAL,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audits_repo ON repo_audits(repo_id);

--------------------------------------------------------------------------------
-- REPO_RELEASES — what shipped and when
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repo_releases (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id       INTEGER REFERENCES repos(id) ON DELETE CASCADE,
  tag           TEXT NOT NULL,
  title         TEXT,
  body          TEXT,
  prerelease    INTEGER DEFAULT 0,
  published_at  TEXT,
  synced_at     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_releases_repo ON repo_releases(repo_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_releases_unique ON repo_releases(repo_id, tag);

--------------------------------------------------------------------------------
-- FULL-TEXT SEARCH — FTS5 index across docs, notes, and repo metadata
--------------------------------------------------------------------------------
CREATE VIRTUAL TABLE IF NOT EXISTS repo_search USING fts5(
  slug,
  source_type,       -- repo | note | doc
  source_id,         -- id in source table
  title,
  content,
  tokenize='porter unicode61'
);

--------------------------------------------------------------------------------
-- META — schema version tracking
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '1');
INSERT OR REPLACE INTO meta(key, value) VALUES ('created_at', datetime('now'));
