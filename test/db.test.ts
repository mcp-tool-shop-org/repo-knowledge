import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertTech, upsertFact, upsertDoc, upsertNote,
  setTopics, upsertRelease, addRelationship,
  getRepo, findRepos, getRelated, getRepoIdBySlug, getAllRepos, getStats,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-test-'));
  const dbPath = join(tmpDir, 'test.db');
  openDb(dbPath);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('openDb', () => {
  it('creates tables and runs migrations', () => {
    const db = getDb();
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all() as { name: string }[];
    const names = tables.map(t => t.name);
    expect(names).toContain('repos');
    expect(names).toContain('repo_tech');
    expect(names).toContain('repo_notes');
    expect(names).toContain('audit_runs');
    expect(names).toContain('audit_controls');
    expect(names).toContain('audit_findings');
    expect(names).toContain('audit_metrics');
  });

  it('sets WAL mode', () => {
    const db = getDb();
    const mode = db.pragma('journal_mode') as { journal_mode: string }[];
    expect(mode[0].journal_mode).toBe('wal');
  });
});

describe('upsertRepo', () => {
  it('inserts a new repo', () => {
    const id = upsertRepo({ owner: 'test-org', name: 'test-repo', description: 'A test' });
    expect(id).toBeGreaterThan(0);

    const repo = getRepo('test-org/test-repo');
    expect(repo).not.toBeNull();
    expect(repo!.description).toBe('A test');
  });

  it('updates an existing repo', () => {
    upsertRepo({ owner: 'test-org', name: 'test-repo', description: 'Version 1' });
    upsertRepo({ owner: 'test-org', name: 'test-repo', description: 'Version 2' });

    const repo = getRepo('test-org/test-repo');
    expect(repo!.description).toBe('Version 2');
  });
});

describe('upsertTech', () => {
  it('stores tech fingerprint', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertTech(id, {
      primary_language: 'TypeScript',
      frameworks: ['react', 'tauri'],
      runtime: 'node',
      app_shape: 'desktop',
    });

    const repo = getRepo('o/r');
    expect(repo!.tech.primary_language).toBe('TypeScript');
    expect(repo!.tech.app_shape).toBe('desktop');
  });
});

describe('upsertFact', () => {
  it('inserts and upserts facts', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertFact(id, 'framework', 'react', 'true');
    upsertFact(id, 'framework', 'react', 'v18');

    const repo = getRepo('o/r');
    const reactFact = repo!.facts.find((f: any) => f.key === 'react');
    expect(reactFact.value).toBe('v18');
  });
});

describe('upsertNote', () => {
  it('creates and updates notes', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertNote(id, 'thesis', 'thesis', 'Original thesis');
    upsertNote(id, 'thesis', 'thesis', 'Updated thesis');

    const repo = getRepo('o/r');
    expect(repo!.notes).toHaveLength(1);
    expect(repo!.notes[0].content).toBe('Updated thesis');
  });
});

describe('upsertDoc', () => {
  it('stores documents with checksum dedup', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    const docId1 = upsertDoc(id, 'README.md', 'readme', 'README', 'Hello world', 'abc123');
    const docId2 = upsertDoc(id, 'README.md', 'readme', 'README', 'Hello world', 'abc123');
    expect(docId1).toBe(docId2); // same checksum, no update
  });
});

describe('setTopics', () => {
  it('sets topics for a repo', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    setTopics(id, ['mcp', 'cli', 'sqlite']);

    const repo = getRepo('o/r');
    expect(repo!.topics).toContain('mcp');
    expect(repo!.topics).toContain('cli');
  });
});

describe('addRelationship', () => {
  it('creates relationships between repos', () => {
    const id1 = upsertRepo({ owner: 'o', name: 'a' });
    const id2 = upsertRepo({ owner: 'o', name: 'b' });
    addRelationship(id1, 'depends_on', id2, 'uses as dependency');

    const related = getRelated(id1);
    expect(related).toHaveLength(1);
    expect(related[0].slug).toBe('o/b');
  });
});

describe('findRepos', () => {
  it('filters by language', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertTech(id, { primary_language: 'Rust' });

    const results = findRepos({ language: 'Rust' });
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe('o/r');
  });

  it('returns empty for no match', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const results = findRepos({ language: 'Haskell' });
    expect(results).toHaveLength(0);
  });
});

describe('getStats', () => {
  it('returns counts', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const stats = getStats();
    expect(stats.repos).toBe(1);
    expect(stats.notes).toBe(0);
  });
});

describe('getRepoIdBySlug', () => {
  it('resolves by exact slug', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const id = getRepoIdBySlug('o/r');
    expect(id).not.toBeNull();
  });

  it('returns null for missing', () => {
    expect(getRepoIdBySlug('x/y')).toBeNull();
  });
});
