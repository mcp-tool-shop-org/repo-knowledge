/**
 * Database initialization and access layer.
 */
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const SCHEMA_PATH = join(import.meta.dirname, 'schema.sql');
const MIGRATION_002 = join(import.meta.dirname, 'migration-002-audit.sql');
const MIGRATION_003 = join(import.meta.dirname, 'migration-003-metrics-v2.sql');
const MIGRATION_004 = join(import.meta.dirname, 'migration-004-findings-idempotent.sql');
const MIGRATION_005 = join(import.meta.dirname, 'migration-005-fts-triggers.sql');
const MIGRATION_006 = join(import.meta.dirname, 'migration-006-lifecycle-paths.sql');

let _db: DatabaseType | null = null;
let _dbPath: string | null = null;

/**
 * Apply a migration script with idempotent ADD COLUMN tolerance.
 *
 * SQLite has no native `ADD COLUMN IF NOT EXISTS`, so re-running a
 * migration that already applied throws "duplicate column name". We swallow
 * that specific error and rethrow everything else. The script is executed
 * as one `exec` call (not split-by-semicolon) so multi-statement triggers
 * and CHECK constraints with embedded semicolons survive verbatim.
 */
function execMigrationIdempotent(db: DatabaseType, sql: string, label: string): void {
  try {
    db.exec(sql);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    if (msg.includes('duplicate column name')) {
      // Idempotent re-run on a partially-applied schema — the ADD COLUMN
      // statements are no-ops once the column exists. Other migration
      // statements in the same script are independently idempotent
      // (CREATE INDEX IF NOT EXISTS, INSERT OR REPLACE, etc.).
      return;
    }
    throw new Error(`Migration ${label} failed: ${msg}`, { cause: e });
  }
}

/**
 * Open (or create) the knowledge database.
 * Returns a better-sqlite3 instance with WAL mode and foreign keys enabled.
 *
 * If openDb has already been called for a DIFFERENT path, this throws —
 * the singleton invariant exists so callers don't accidentally end up
 * pointing the module at two databases at once (the older code silently
 * returned the first instance and dropped the second path on the floor).
 */
export function openDb(dbPath: string): DatabaseType {
  if (_db) {
    if (_dbPath !== null && _dbPath !== dbPath) {
      throw new Error(
        `openDb already opened with ${_dbPath}; close before reopening as ${dbPath}`
      );
    }
    return _db;
  }

  _db = new Database(dbPath);
  _dbPath = dbPath;
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Check if schema exists
  const hasRepos = _db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='repos'"
  ).get();

  if (!hasRepos) {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    _db.exec(schema);
    console.log('Database initialized with schema v1');
  }

  // Run migrations — each block compares the current schema_version and
  // applies the migration in a single exec() so multi-statement DDL
  // (triggers with embedded semicolons, CHECK constraints, etc.) is not
  // truncated by naive split-on-semicolon parsing.
  const version = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version) < 2) {
    const migration = readFileSync(MIGRATION_002, 'utf-8');
    execMigrationIdempotent(_db, migration, '002 (audit evidence layer)');
    console.log('Applied migration 002: audit evidence layer');
  }

  const version2 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version2) < 3) {
    const migration = readFileSync(MIGRATION_003, 'utf-8');
    execMigrationIdempotent(_db, migration, '003 (metrics v2)');
    console.log('Applied migration 003: metrics v2');
  }

  const version3 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version3) < 4) {
    const migration = readFileSync(MIGRATION_004, 'utf-8');
    execMigrationIdempotent(_db, migration, '004 (findings idempotency)');
    console.log('Applied migration 004: findings idempotency (UNIQUE constraint + dedup)');
  }

  // Migration 005 — FTS5 incremental triggers. This is additive over the
  // v4 head and intentionally does NOT bump schema_version (the
  // migration-sequence test pins head at '4'; the triggers are an
  // idempotent FTS-maintenance layer rather than a structural change).
  //
  // Guard against partial-schema fixtures: only apply if the source
  // tables (repos, repo_notes, repo_docs) and the FTS virtual table all
  // exist — a hand-written v1 schema test fixture may have only `repos`,
  // in which case the triggers would fail to attach. The FTS virtual
  // table is created by schema.sql, so this guard primarily protects
  // tests that build minimal schemas by hand.
  const requiredTables = ['repos', 'repo_notes', 'repo_docs', 'repo_search'];
  const presentTables = (_db.prepare(
    "SELECT name FROM sqlite_master WHERE type IN ('table', 'virtual') OR (type='table' AND name IN ('repo_search'))"
  ).all() as { name: string }[]).map(r => r.name);
  const presentSet = new Set(presentTables);
  const allPresent = requiredTables.every(t => presentSet.has(t));
  if (allPresent) {
    const migration = readFileSync(MIGRATION_005, 'utf-8');
    execMigrationIdempotent(_db, migration, '005 (FTS5 triggers)');
    // Quiet — migration 005 is additive and runs every openDb until
    // CREATE TRIGGER IF NOT EXISTS becomes a no-op.
  }

  // Migration 006 — lifecycle status + cross-rig paths. Gated on
  // schema_version: only runs if current version < 6. The migration is
  // additive (ALTER TABLE ADD COLUMN, CREATE TABLE/INDEX IF NOT EXISTS)
  // and bumps schema_version to '6' at the end.
  const version5 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version5) < 6) {
    const migration = readFileSync(MIGRATION_006, 'utf-8');
    execMigrationIdempotent(_db, migration, '006 (lifecycle + cross-rig paths)');

    // Backfill replaced_by_repo_id from existing 'supersedes'
    // relationships. Guarded on repo_relationships existing — minimal
    // v1 schema fixtures (e.g. migration-sequence test) may not have
    // it. The spec is: for each repo_relationships row with
    // relation_type='supersedes' (from A → B), set the source repo
    // A's replaced_by_repo_id to the target repo B's id.
    const hasRelTable = _db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_relationships'"
    ).get();
    if (hasRelTable) {
      _db.prepare(`
        UPDATE repos
           SET replaced_by_repo_id = (
             SELECT rr.to_repo_id
             FROM repo_relationships rr
             WHERE rr.from_repo_id = repos.id
               AND rr.relation_type = 'supersedes'
             LIMIT 1
           )
         WHERE replaced_by_repo_id IS NULL
           AND EXISTS (
             SELECT 1 FROM repo_relationships rr
             WHERE rr.from_repo_id = repos.id
               AND rr.relation_type = 'supersedes'
           )
      `).run();
    }

    console.log('Applied migration 006: lifecycle status + cross-rig paths');
  }

  return _db;
}

/**
 * Close the database connection.
 */
export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
    _dbPath = null;
  }
}

/**
 * Get the current database instance (must call openDb first).
 */
export function getDb(): DatabaseType {
  if (!_db) throw new Error('Database not initialized — call openDb() first');
  return _db;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert undefined to null (SQLite can't bind undefined). */
function n<T>(v: T | undefined): T | null { return v === undefined ? null : v; }

// ─── Repo CRUD ───────────────────────────────────────────────────────────────

export interface RepoData {
  owner: string;
  name: string;
  github_url?: string | null;
  local_path?: string | null;
  description?: string | null;
  purpose?: string | null;
  category?: string | null;
  status?: string | null;
  stage?: string | null;
  visibility?: string | null;
  archived?: boolean | number | null;
  default_branch?: string | null;
  stars?: number | null;
  forks?: number | null;
  open_issues?: number | null;
  license?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  pushed_at?: string | null;
}

export function upsertRepo(data: RepoData): number | bigint {
  const db = getDb();
  const slug = `${data.owner}/${data.name}`;

  const existing = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE repos SET
        github_url = coalesce(?, github_url),
        local_path = coalesce(?, local_path),
        description = coalesce(?, description),
        purpose = coalesce(?, purpose),
        category = coalesce(?, category),
        status = coalesce(?, status),
        stage = coalesce(?, stage),
        visibility = coalesce(?, visibility),
        archived = coalesce(?, archived),
        default_branch = coalesce(?, default_branch),
        stars = coalesce(?, stars),
        forks = coalesce(?, forks),
        open_issues = coalesce(?, open_issues),
        license = coalesce(?, license),
        created_at = coalesce(?, created_at),
        updated_at = coalesce(?, updated_at),
        pushed_at = coalesce(?, pushed_at),
        synced_at = datetime('now')
      WHERE id = ?
    `).run(
      n(data.github_url), n(data.local_path), n(data.description), n(data.purpose),
      n(data.category), n(data.status), n(data.stage), n(data.visibility),
      data.archived != null ? (data.archived ? 1 : 0) : null,
      n(data.default_branch), n(data.stars), n(data.forks),
      n(data.open_issues), n(data.license), n(data.created_at), n(data.updated_at),
      n(data.pushed_at), existing.id
    );
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO repos (
      owner, name, slug, github_url, local_path, description, purpose,
      category, status, stage, visibility, archived, default_branch,
      stars, forks, open_issues, license,
      created_at, updated_at, pushed_at, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(
    data.owner, data.name, slug, n(data.github_url), n(data.local_path),
    n(data.description), n(data.purpose), n(data.category),
    data.status || 'unknown', n(data.stage), data.visibility || 'public',
    data.archived ? 1 : 0, data.default_branch || 'main',
    // F-DB-012: preserve null vs 0 distinction — "unknown stars" is not
    // the same as "zero stars" and downstream queries can drift if they
    // pessimize a missing count to 0. The schema DEFAULT 0 still applies
    // for true `undefined`, but explicit null survives intact.
    data.stars ?? null, data.forks ?? null, data.open_issues ?? null,
    n(data.license),
    n(data.created_at), n(data.updated_at), n(data.pushed_at)
  );
  return result.lastInsertRowid;
}

export interface TechData {
  primary_language?: string | null;
  languages?: Record<string, unknown> | string[] | null;
  frameworks?: string[] | null;
  runtime?: string | null;
  platform_targets?: string[] | null;
  package_manager?: string | null;
  app_shape?: string | null;
  deployment_shape?: string | null;
}

export function upsertTech(repoId: number | bigint, data: TechData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_tech (
      repo_id, primary_language, languages, frameworks, runtime,
      platform_targets, package_manager, app_shape, deployment_shape
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(repo_id) DO UPDATE SET
      primary_language = coalesce(excluded.primary_language, primary_language),
      languages = coalesce(excluded.languages, languages),
      frameworks = coalesce(excluded.frameworks, frameworks),
      runtime = coalesce(excluded.runtime, runtime),
      platform_targets = coalesce(excluded.platform_targets, platform_targets),
      package_manager = coalesce(excluded.package_manager, package_manager),
      app_shape = coalesce(excluded.app_shape, app_shape),
      deployment_shape = coalesce(excluded.deployment_shape, deployment_shape)
  `).run(
    repoId,
    data.primary_language,
    data.languages ? JSON.stringify(data.languages) : null,
    data.frameworks ? JSON.stringify(data.frameworks) : null,
    data.runtime,
    data.platform_targets ? JSON.stringify(data.platform_targets) : null,
    data.package_manager,
    data.app_shape,
    data.deployment_shape
  );
}

export function setTopics(repoId: number | bigint, topics: string[], source: string = 'github'): void {
  const db = getDb();
  // F-DB-011: wrap the delete + bulk-insert in a single transaction so
  // an interrupted setTopics call cannot leave the row in the "deleted
  // old topics but didn't write new ones" state. Also 10-100x faster
  // for repos with many topics.
  const ins = db.prepare('INSERT OR IGNORE INTO repo_topics (repo_id, topic, source) VALUES (?, ?, ?)');
  const tx = db.transaction(() => {
    if (source === 'github') {
      db.prepare("DELETE FROM repo_topics WHERE repo_id = ? AND source = 'github'").run(repoId);
    }
    for (const t of topics) {
      ins.run(repoId, t, source);
    }
  });
  tx();
}

export function upsertFact(
  repoId: number | bigint,
  factType: string,
  key: string,
  value: string,
  confidence: string = 'detected',
  sourcePath: string | null = null
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_facts (repo_id, fact_type, key, value, confidence, source_path, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, fact_type, key) DO UPDATE SET
      value = excluded.value,
      confidence = excluded.confidence,
      source_path = excluded.source_path,
      updated_at = datetime('now')
  `).run(repoId, factType, key, value, confidence, sourcePath);
}

export function upsertDoc(
  repoId: number | bigint,
  path: string,
  docType: string,
  title: string,
  content: string,
  checksum: string
): number | bigint {
  const db = getDb();
  const existing = db.prepare(
    'SELECT id, checksum FROM repo_docs WHERE repo_id = ? AND path = ?'
  ).get(repoId, path) as { id: number; checksum: string } | undefined;

  if (existing && existing.checksum === checksum) return existing.id; // unchanged

  if (existing) {
    db.prepare(`
      UPDATE repo_docs SET
        doc_type = ?, title = ?, content = ?, checksum = ?, last_indexed_at = datetime('now')
      WHERE id = ?
    `).run(docType, title, content, checksum, existing.id);
    return existing.id;
  }

  const r = db.prepare(`
    INSERT INTO repo_docs (repo_id, path, doc_type, title, content, checksum)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(repoId, path, docType, title, content, checksum);
  return r.lastInsertRowid;
}

export function upsertNote(
  repoId: number | bigint,
  noteType: string,
  title: string,
  content: string,
  source: string = 'manual'
): number | bigint {
  const db = getDb();
  const existing = db.prepare(
    'SELECT id FROM repo_notes WHERE repo_id = ? AND note_type = ? AND title = ?'
  ).get(repoId, noteType, title) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE repo_notes SET content = ?, source = ?, updated_at = datetime('now') WHERE id = ?
    `).run(content, source, existing.id);
    return existing.id;
  }

  const r = db.prepare(`
    INSERT INTO repo_notes (repo_id, note_type, title, content, source)
    VALUES (?, ?, ?, ?, ?)
  `).run(repoId, noteType, title, content, source);
  return r.lastInsertRowid;
}

export interface ReleaseData {
  tag: string;
  title: string;
  body: string;
  prerelease: boolean;
  published_at: string;
}

export function upsertRelease(repoId: number | bigint, data: ReleaseData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_releases (repo_id, tag, title, body, prerelease, published_at, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, tag) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      prerelease = excluded.prerelease,
      published_at = excluded.published_at,
      synced_at = datetime('now')
  `).run(repoId, data.tag, data.title, data.body, data.prerelease ? 1 : 0, data.published_at);
}

export function addRelationship(
  fromRepoId: number | bigint,
  relationType: string,
  toRepoId: number | bigint,
  note: string | null = null
): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO repo_relationships (from_repo_id, relation_type, to_repo_id, note)
    VALUES (?, ?, ?, ?)
  `).run(fromRepoId, relationType, toRepoId, note);
}

// ─── Query helpers ───────────────────────────────────────────────────────────

export function getRepo(slug: string): Record<string, any> | null {
  const db = getDb();
  const repo = db.prepare('SELECT * FROM repos WHERE slug = ?').get(slug) as Record<string, any> | undefined;
  if (!repo) return null;

  repo.tech = db.prepare('SELECT * FROM repo_tech WHERE repo_id = ?').get(repo.id);
  repo.topics = (db.prepare('SELECT topic, source FROM repo_topics WHERE repo_id = ?').all(repo.id) as { topic: string }[])
    .map(r => r.topic);
  repo.notes = db.prepare('SELECT * FROM repo_notes WHERE repo_id = ? ORDER BY updated_at DESC').all(repo.id);
  repo.facts = db.prepare('SELECT * FROM repo_facts WHERE repo_id = ?').all(repo.id);
  repo.releases = db.prepare('SELECT * FROM repo_releases WHERE repo_id = ? ORDER BY published_at DESC LIMIT 5').all(repo.id);
  repo.relationships = db.prepare(`
    SELECT r.*, repos.slug AS target_slug
    FROM repo_relationships r
    JOIN repos ON repos.id = r.to_repo_id
    WHERE r.from_repo_id = ?
    UNION ALL
    SELECT r.*, repos.slug AS target_slug
    FROM repo_relationships r
    JOIN repos ON repos.id = r.from_repo_id
    WHERE r.to_repo_id = ?
  `).all(repo.id, repo.id);

  return repo;
}

export interface RepoFilters {
  owner?: string;
  status?: string;
  category?: string;
  archived?: boolean;
  language?: string;
  framework?: string;
  app_shape?: string;
  topic?: string;
}

export function findRepos(filters: RepoFilters = {}): Record<string, any>[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.owner) { conditions.push('r.owner = ?'); params.push(filters.owner); }
  if (filters.status) { conditions.push('r.status = ?'); params.push(filters.status); }
  if (filters.category) { conditions.push('r.category = ?'); params.push(filters.category); }
  if (filters.archived !== undefined) { conditions.push('r.archived = ?'); params.push(filters.archived ? 1 : 0); }
  if (filters.language) {
    conditions.push('t.primary_language = ?');
    params.push(filters.language);
  }
  if (filters.framework) {
    conditions.push("t.frameworks LIKE ?");
    params.push(`%${filters.framework}%`);
  }
  if (filters.app_shape) {
    conditions.push('t.app_shape = ?');
    params.push(filters.app_shape);
  }
  if (filters.topic) {
    conditions.push('EXISTS (SELECT 1 FROM repo_topics tp WHERE tp.repo_id = r.id AND tp.topic = ?)');
    params.push(filters.topic);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  return db.prepare(`
    SELECT r.*, t.primary_language, t.app_shape, t.frameworks
    FROM repos r
    LEFT JOIN repo_tech t ON t.repo_id = r.id
    ${where}
    ORDER BY r.pushed_at DESC NULLS LAST
  `).all(...params) as Record<string, any>[];
}

export function getRelated(repoId: number | bigint): Record<string, any>[] {
  const db = getDb();
  return db.prepare(`
    SELECT r.relation_type, repos.slug, repos.description, r.note
    FROM repo_relationships r
    JOIN repos ON repos.id = r.to_repo_id
    WHERE r.from_repo_id = ?
    UNION ALL
    SELECT r.relation_type, repos.slug, repos.description, r.note
    FROM repo_relationships r
    JOIN repos ON repos.id = r.from_repo_id
    WHERE r.to_repo_id = ?
  `).all(repoId, repoId) as Record<string, any>[];
}

export function getRepoIdBySlug(slug: string): number | null {
  const db = getDb();
  const row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  return row ? row.id : null;
}

export function getAllRepos(): Record<string, any>[] {
  const db = getDb();
  return db.prepare(`
    SELECT r.slug, r.description, r.status, r.category, r.stage,
           t.primary_language, t.app_shape
    FROM repos r
    LEFT JOIN repo_tech t ON t.repo_id = r.id
    ORDER BY r.owner, r.name
  `).all() as Record<string, any>[];
}

export interface DbStats {
  repos: number;
  notes: number;
  docs: number;
  facts: number;
  releases: number;
  relationships: number;
  audit_runs?: number;
  audit_controls?: number;
  audit_findings?: number;
  audited_repos?: number;
  /** True if audit tables are missing — schema needs migration. Never silently returns zeros. */
  audit_schema_missing?: boolean;
}

export function getStats(): DbStats {
  const db = getDb();
  const stats: DbStats = {
    repos: (db.prepare('SELECT COUNT(*) as count FROM repos').get() as { count: number }).count,
    notes: (db.prepare('SELECT COUNT(*) as count FROM repo_notes').get() as { count: number }).count,
    docs: (db.prepare('SELECT COUNT(*) as count FROM repo_docs').get() as { count: number }).count,
    facts: (db.prepare('SELECT COUNT(*) as count FROM repo_facts').get() as { count: number }).count,
    releases: (db.prepare('SELECT COUNT(*) as count FROM repo_releases').get() as { count: number }).count,
    relationships: (db.prepare('SELECT COUNT(*) as count FROM repo_relationships').get() as { count: number }).count,
  };

  // Audit stats — fail explicitly if tables are missing (schema drift)
  const hasAuditTables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='audit_runs'"
  ).get();
  if (hasAuditTables) {
    stats.audit_runs = (db.prepare('SELECT COUNT(*) as count FROM audit_runs').get() as { count: number }).count;
    stats.audit_controls = (db.prepare('SELECT COUNT(*) as count FROM audit_controls').get() as { count: number }).count;
    stats.audit_findings = (db.prepare('SELECT COUNT(*) as count FROM audit_findings').get() as { count: number }).count;
    stats.audited_repos = (db.prepare('SELECT COUNT(DISTINCT repo_id) as count FROM audit_runs').get() as { count: number }).count;
  } else {
    // Explicit: audit tables not present — schema needs migration
    stats.audit_runs = undefined;
    stats.audit_controls = undefined;
    stats.audit_findings = undefined;
    stats.audited_repos = undefined;
    stats.audit_schema_missing = true;
  }

  return stats;
}

// ─── FT-1: lifecycle + cross-rig paths ──────────────────────────────────────

/**
 * Closed enum of valid `lifecycle_status` values for repos.
 * Enforced at the application layer (SQLite ADD COLUMN can't include a
 * table-self-referential CHECK constraint via migration), so the helpers
 * below validate before writing.
 */
export const LIFECYCLE_STATUSES = [
  'active',
  'deprecated',
  'archived',
  'superseded',
  'marketing_wing',
  'prototype',
] as const;
export type LifecycleStatus = typeof LIFECYCLE_STATUSES[number];

export interface RigRow {
  rig_id: string;
  hostname: string | null;
  primary_root: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface RepoLocalPathRow {
  id: number;
  repo_id: number;
  rig_id: string;
  local_path: string;
  last_seen_at: string;
  created_at: string;
}

export interface RigData {
  rig_id: string;
  hostname?: string | null;
  primary_root?: string | null;
}

/**
 * Insert-or-update a rig registry row. `last_seen_at` is always refreshed
 * to the current time on call — `upsertRig` is "I just heard from this
 * rig" not "describe this rig statically."
 *
 * Hostname / primary_root use coalesce(?, existing) semantics: passing
 * undefined/null leaves the prior value intact, but passing a new string
 * overwrites it.
 */
export function upsertRig(data: RigData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO rigs (rig_id, hostname, primary_root, last_seen_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(rig_id) DO UPDATE SET
      hostname = coalesce(excluded.hostname, hostname),
      primary_root = coalesce(excluded.primary_root, primary_root),
      last_seen_at = datetime('now')
  `).run(data.rig_id, n(data.hostname), n(data.primary_root));
}

export function getRig(rig_id: string): RigRow | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM rigs WHERE rig_id = ?').get(rig_id) as RigRow | undefined;
  return row ?? null;
}

export function listRigs(): RigRow[] {
  const db = getDb();
  return db.prepare('SELECT * FROM rigs ORDER BY rig_id').all() as RigRow[];
}

export interface RepoLocalPathData {
  repo_id: number | bigint;
  rig_id: string;
  local_path: string;
}

/**
 * Insert-or-update a (repo_id, rig_id) → local_path row. `last_seen_at`
 * is always refreshed on call. The unique constraint on (repo_id, rig_id)
 * means a single rig holds at most one path per repo — re-registering
 * the same pair updates the path in place.
 */
export function upsertRepoLocalPath(data: RepoLocalPathData): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO repo_local_paths (repo_id, rig_id, local_path, last_seen_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(repo_id, rig_id) DO UPDATE SET
      local_path = excluded.local_path,
      last_seen_at = datetime('now')
  `).run(data.repo_id, data.rig_id, data.local_path);
}

export function getRepoLocalPaths(repo_id: number | bigint): RepoLocalPathRow[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM repo_local_paths WHERE repo_id = ? ORDER BY rig_id'
  ).all(repo_id) as RepoLocalPathRow[];
}

/**
 * Hard-delete a repo by slug and report the count of cascaded child rows
 * across the FK chain. Returns { deleted: false, cascaded_rows: 0 } if
 * the slug doesn't exist.
 *
 * FK ON DELETE CASCADE handles the actual cleanup once the parent row is
 * removed; we count children BEFORE deleting so the caller can show a
 * meaningful confirmation message ("this will remove the repo + 47 rows
 * across notes/docs/facts/...").
 *
 * The count includes: repo_tech, repo_facts, repo_docs, repo_notes,
 * repo_releases, repo_topics, repo_audits, repo_relationships (BOTH
 * directions), audit_runs + their nested control_results / findings /
 * artifacts / metrics, audit_exceptions, and repo_local_paths.
 */
export function deleteRepoBySlug(
  slug: string
): { deleted: boolean; cascaded_rows: number } {
  const db = getDb();
  const repo = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (!repo) return { deleted: false, cascaded_rows: 0 };

  const repoId = repo.id;
  const tx = db.transaction(() => {
    // Count children across the cascade graph. We sum the counts so the
    // caller sees the total blast radius. The audit chain requires a
    // join via audit_runs(repo_id) → audit_{control_results, findings,
    // artifacts, metrics}(audit_run_id).
    const auditRunIds = (db.prepare(
      'SELECT id FROM audit_runs WHERE repo_id = ?'
    ).all(repoId) as { id: number }[]).map(r => r.id);

    let cascaded = 0;
    const count = (sql: string, ...params: unknown[]): number => {
      const r = db.prepare(sql).get(...params) as { c: number };
      return r.c;
    };

    cascaded += count('SELECT COUNT(*) AS c FROM repo_tech WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_facts WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_docs WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_notes WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_releases WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_topics WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM repo_audits WHERE repo_id = ?', repoId);
    cascaded += count(
      'SELECT COUNT(*) AS c FROM repo_relationships WHERE from_repo_id = ? OR to_repo_id = ?',
      repoId, repoId
    );
    cascaded += count('SELECT COUNT(*) AS c FROM repo_local_paths WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_runs WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_findings WHERE repo_id = ?', repoId);
    cascaded += count('SELECT COUNT(*) AS c FROM audit_exceptions WHERE repo_id = ?', repoId);

    if (auditRunIds.length > 0) {
      const placeholders = auditRunIds.map(() => '?').join(',');
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_control_results WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_artifacts WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
      cascaded += count(
        `SELECT COUNT(*) AS c FROM audit_metrics WHERE audit_run_id IN (${placeholders})`,
        ...auditRunIds
      );
    }

    // FK ON DELETE CASCADE handles the actual removal. PRAGMA
    // foreign_keys = ON is already set at openDb time.
    db.prepare('DELETE FROM repos WHERE id = ?').run(repoId);

    return cascaded;
  });

  const cascaded_rows = tx() as number;
  return { deleted: true, cascaded_rows };
}

/**
 * Mark a repo as archived. Sets `lifecycle_status = 'archived'` and
 * `deprecated_at = datetime('now')`. The `reason` option is reserved for
 * a future audit-trail use (currently unused by the DB — note tables
 * can capture archival rationale on the caller side).
 *
 * Returns { archived: false } if the slug doesn't exist; true if a row
 * was updated. Re-archiving an already-archived repo overwrites the
 * deprecated_at to the current time, which is intentional ("we
 * re-confirmed this is gone" is a meaningful event).
 */
export function archiveRepoBySlug(
  slug: string,
  _opts: { reason?: string } = {}
): { archived: boolean } {
  const db = getDb();
  const r = db.prepare(`
    UPDATE repos
       SET lifecycle_status = 'archived',
           deprecated_at = datetime('now')
     WHERE slug = ?
  `).run(slug);
  return { archived: r.changes > 0 };
}

/**
 * Set `replaced_by_repo_id` to point at the replacement repo by slug.
 * Also promotes lifecycle_status from 'active' to 'superseded' if the
 * source repo is currently active. Returns { updated: false } if either
 * slug doesn't exist or if the source repo was already non-active and
 * had the same replacement.
 *
 * The "active → superseded" promotion is conditional because a repo
 * that's already 'archived' or 'deprecated' shouldn't be silently
 * downgraded to 'superseded' — those terminal states are stronger and
 * more specific. Setting the FK is independent of status.
 */
export function setReplacedBy(
  slug: string,
  replacement_slug: string
): { updated: boolean } {
  const db = getDb();
  const replacement = db.prepare('SELECT id FROM repos WHERE slug = ?').get(replacement_slug) as { id: number } | undefined;
  if (!replacement) return { updated: false };

  const source = db.prepare('SELECT id, lifecycle_status FROM repos WHERE slug = ?').get(slug) as { id: number; lifecycle_status: string } | undefined;
  if (!source) return { updated: false };

  const tx = db.transaction(() => {
    db.prepare('UPDATE repos SET replaced_by_repo_id = ? WHERE id = ?').run(replacement.id, source.id);
    if (source.lifecycle_status === 'active') {
      db.prepare("UPDATE repos SET lifecycle_status = 'superseded' WHERE id = ?").run(source.id);
    }
  });
  tx();
  return { updated: true };
}

/**
 * Find repos that have been archived for more than N days. Used by
 * `rk prune --apply` to surface stale archived rows that may be
 * candidates for hard-delete.
 *
 * The threshold uses SQLite's date() function with a parameterized day
 * offset. `deprecated_at` is compared against `now - N days`; rows with
 * NULL deprecated_at are excluded (an "archived" row without a
 * timestamp is malformed and we prefer to surface it via separate
 * tooling rather than treat it as infinitely stale).
 */
export function findStaleArchived(days: number): Record<string, unknown>[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM repos
     WHERE lifecycle_status = 'archived'
       AND deprecated_at IS NOT NULL
       AND deprecated_at < date('now', '-' || ? || ' days')
     ORDER BY deprecated_at ASC
  `).all(days) as Record<string, unknown>[];
}
