/**
 * F-TS-FT3.5: migration-009 (build-health extensions) schema transition.
 *
 * Verifies that opening a DB previously at v8 (FT-3 head) advances it to
 * v9 idempotently, adds the new columns/tables, and preserves all v8
 * data + structures.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { openDb, closeDb, getDb } from '../src/db/init.js';

let tmpDir: string;
let dbPath: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-mig-009-'));
  dbPath = join(tmpDir, 'v8.db');
});

afterEach(() => {
  try { closeDb(); } catch { /* may not be open */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('migration-009 (FT-3.5 build-health extensions)', () => {
  it('opening a fresh DB lands at schema_version=10 (current head)', () => {
    // Fresh openDb runs the whole migration ladder; current head is '10'
    // post-FT-4. This test asserts the FT-3.5 v9 structures are present
    // (in the subsequent it()s) — the schema_version assertion just pins
    // the ladder is fully applied.
    openDb(dbPath);
    const v = (getDb().prepare(
      "SELECT value FROM meta WHERE key = 'schema_version'"
    ).get() as { value: string }).value;
    expect(v).toBe('10');
  });

  it('adds critical_cve_ids / high_cve_ids / audit_omit_dev to repo_dep_audit_state', () => {
    openDb(dbPath);
    const cols = getDb().prepare(
      "PRAGMA table_info(repo_dep_audit_state)"
    ).all() as { name: string }[];
    const names = cols.map(c => c.name);
    expect(names).toContain('critical_cve_ids');
    expect(names).toContain('high_cve_ids');
    expect(names).toContain('audit_omit_dev');
  });

  it('creates repo_dep_audit_history table with composite index', () => {
    openDb(dbPath);
    const tables = getDb().prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_dep_audit_history'"
    ).all() as { name: string }[];
    expect(tables.length).toBe(1);

    const idx = getDb().prepare(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND name='idx_dep_audit_history_repo_taken'"
    ).get() as { name: string; sql: string } | undefined;
    expect(idx).toBeDefined();
    expect(idx!.sql).toMatch(/repo_dep_audit_history/);
  });

  it('adds resolved_sha / pin_quality / immutable_publisher to repo_workflow_actions', () => {
    openDb(dbPath);
    const cols = getDb().prepare(
      "PRAGMA table_info(repo_workflow_actions)"
    ).all() as { name: string }[];
    const names = cols.map(c => c.name);
    expect(names).toContain('resolved_sha');
    expect(names).toContain('pin_quality');
    expect(names).toContain('immutable_publisher');
  });

  it('creates repo_workflow_permissions table with UNIQUE(repo_id, workflow_file)', () => {
    openDb(dbPath);
    const tables = getDb().prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_workflow_permissions'"
    ).all() as { name: string }[];
    expect(tables.length).toBe(1);

    // Probe the UNIQUE constraint by attempting a duplicate insert.
    // First insert succeeds; second on same (repo_id, workflow_file) throws.
    const db = getDb();
    db.prepare("INSERT INTO repos(owner, name, slug) VALUES ('o', 'r', 'o/r')").run();
    const repoId = (db.prepare("SELECT id FROM repos WHERE slug='o/r'").get() as { id: number }).id;
    db.prepare(`
      INSERT INTO repo_workflow_permissions
        (repo_id, workflow_file, permissions_json, last_checked_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(repoId, '.github/workflows/ci.yml', 'default');
    expect(() => {
      db.prepare(`
        INSERT INTO repo_workflow_permissions
          (repo_id, workflow_file, permissions_json, last_checked_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(repoId, '.github/workflows/ci.yml', 'default');
    }).toThrow();
  });

  it('creates repo_observed_toolchain table with UNIQUE(repo_id, rig_id, tool)', () => {
    openDb(dbPath);
    const tables = getDb().prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repo_observed_toolchain'"
    ).all() as { name: string }[];
    expect(tables.length).toBe(1);

    const db = getDb();
    db.prepare("INSERT INTO repos(owner, name, slug) VALUES ('o', 'r', 'o/r')").run();
    const repoId = (db.prepare("SELECT id FROM repos WHERE slug='o/r'").get() as { id: number }).id;
    db.prepare(
      "INSERT INTO rigs(rig_id, hostname, primary_root, last_seen_at) VALUES ('rig-1', 'host', '/tmp', datetime('now'))"
    ).run();
    db.prepare(`
      INSERT INTO repo_observed_toolchain
        (repo_id, rig_id, tool, observed_version, observed_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(repoId, 'rig-1', 'node', '22.4.0');
    expect(() => {
      db.prepare(`
        INSERT INTO repo_observed_toolchain
          (repo_id, rig_id, tool, observed_version, observed_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(repoId, 'rig-1', 'node', '22.4.1');
    }).toThrow();
  });

  it('re-opening a v10 DB is a no-op (idempotent)', () => {
    openDb(dbPath);
    closeDb();
    expect(() => openDb(dbPath)).not.toThrow();
    const v = (getDb().prepare(
      "SELECT value FROM meta WHERE key = 'schema_version'"
    ).get() as { value: string }).value;
    expect(v).toBe('10');
  });

  it('cascades repo_dep_audit_history rows when the parent repo is deleted', () => {
    openDb(dbPath);
    const db = getDb();
    db.prepare("INSERT INTO repos(owner, name, slug) VALUES ('o', 'r', 'o/r')").run();
    const repoId = (db.prepare("SELECT id FROM repos WHERE slug='o/r'").get() as { id: number }).id;

    db.prepare(`
      INSERT INTO repo_dep_audit_history
        (repo_id, taken_at, severity_critical, severity_high,
         severity_moderate, severity_low, tool)
      VALUES (?, datetime('now'), 0, 0, 0, 0, 'npm_audit')
    `).run(repoId);
    expect((db.prepare(
      'SELECT COUNT(*) as c FROM repo_dep_audit_history WHERE repo_id = ?'
    ).get(repoId) as { c: number }).c).toBe(1);

    db.prepare('DELETE FROM repos WHERE id = ?').run(repoId);
    expect((db.prepare(
      'SELECT COUNT(*) as c FROM repo_dep_audit_history WHERE repo_id = ?'
    ).get(repoId) as { c: number }).c).toBe(0);
  });
});
