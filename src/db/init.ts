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

let _db: DatabaseType | null = null;

/**
 * Open (or create) the knowledge database.
 * Returns a better-sqlite3 instance with WAL mode and foreign keys enabled.
 */
export function openDb(dbPath: string): DatabaseType {
  if (_db) return _db;

  _db = new Database(dbPath);
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

  // Run migrations
  const version = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version) < 2) {
    const migration = readFileSync(MIGRATION_002, 'utf-8');
    _db.exec(migration);
    console.log('Applied migration 002: audit evidence layer');
  }

  const version2 = (_db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined)?.value || '1';
  if (parseInt(version2) < 3) {
    try {
      const migration = readFileSync(MIGRATION_003, 'utf-8');
      for (const stmt of migration.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'))) {
        try { _db.exec(stmt + ';'); } catch (e: any) {
          if (!e.message.includes('duplicate column')) throw e;
        }
      }
      // Ensure version is updated even if parsed oddly
      _db.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '3')").run();
      console.log('Applied migration 003: metrics v2');
    } catch (e: any) {
      if (!e.message.includes('duplicate column')) console.error('Migration 003 error:', e.message);
    }
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
    data.stars || 0, data.forks || 0, data.open_issues || 0, n(data.license),
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
  if (source === 'github') {
    db.prepare("DELETE FROM repo_topics WHERE repo_id = ? AND source = 'github'").run(repoId);
  }
  const ins = db.prepare('INSERT OR IGNORE INTO repo_topics (repo_id, topic, source) VALUES (?, ?, ?)');
  for (const t of topics) {
    ins.run(repoId, t, source);
  }
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

  // Audit stats (only if tables exist)
  try {
    stats.audit_runs = (db.prepare('SELECT COUNT(*) as count FROM audit_runs').get() as { count: number }).count;
    stats.audit_controls = (db.prepare('SELECT COUNT(*) as count FROM audit_controls').get() as { count: number }).count;
    stats.audit_findings = (db.prepare('SELECT COUNT(*) as count FROM audit_findings').get() as { count: number }).count;
    stats.audited_repos = (db.prepare('SELECT COUNT(DISTINCT repo_id) as count FROM audit_runs').get() as { count: number }).count;
  } catch { /* audit tables may not exist yet */ }

  return stats;
}
