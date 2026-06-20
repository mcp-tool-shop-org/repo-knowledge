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

  it('INSERT preserves an explicit null archived (db-A-008)', () => {
    // The INSERT path used `data.archived ? 1 : 0`, collapsing an explicit
    // null to 0 — losing the "unknown archived state" distinction the
    // UPDATE path preserves. Mirror the UPDATE: explicit null stays null.
    const db = getDb();
    upsertRepo({ owner: 'o', name: 'unknown-archived', archived: null });
    const row = db.prepare(
      'SELECT archived FROM repos WHERE slug = ?'
    ).get('o/unknown-archived') as { archived: number | null };
    expect(row.archived).toBeNull();
  });

  it('INSERT coerces a boolean archived to 0/1 (db-A-008 — true half still works)', () => {
    const db = getDb();
    upsertRepo({ owner: 'o', name: 'is-archived', archived: true });
    upsertRepo({ owner: 'o', name: 'not-archived', archived: false });
    const a = db.prepare('SELECT archived FROM repos WHERE slug = ?').get('o/is-archived') as { archived: number };
    const b = db.prepare('SELECT archived FROM repos WHERE slug = ?').get('o/not-archived') as { archived: number };
    expect(a.archived).toBe(1);
    expect(b.archived).toBe(0);
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
    // F-TS-015: explicitly pin upsert (not insert) semantics — exactly one
    // row exists for (fact_type, key) after two writes. A regression that
    // dropped the ON CONFLICT clause would produce two rows; without this
    // assertion the test would still find the latest value via .find() and
    // silently pass.
    expect(repo!.facts.filter((f: any) => f.key === 'react')).toHaveLength(1);
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

  it('framework filter matches array elements exactly, not as a substring (db-A-006)', () => {
    // The frameworks column is a JSON array. The old `LIKE %react%` filter
    // over-matched: a repo whose ONLY framework is "react-native" wrongly
    // showed up under framework=react. Pin exact element matching.
    const reactRepo = upsertRepo({ owner: 'o', name: 'react-app' });
    upsertTech(reactRepo, { frameworks: ['react', 'vite'] });
    const nativeRepo = upsertRepo({ owner: 'o', name: 'native-app' });
    upsertTech(nativeRepo, { frameworks: ['react-native'] });

    const hits = findRepos({ framework: 'react' });
    const slugs = hits.map(h => h.slug);
    // The genuine react repo matches…
    expect(slugs).toContain('o/react-app');
    // …but the react-native-only repo MUST NOT (no substring over-match).
    expect(slugs).not.toContain('o/native-app');
  });

  it('framework filter does not treat LIKE metacharacters in the value specially (db-A-006)', () => {
    // A filter value containing % or _ must not match arbitrary text via
    // LIKE wildcard semantics — json_each equality is literal.
    const repo = upsertRepo({ owner: 'o', name: 'r' });
    upsertTech(repo, { frameworks: ['react'] });
    const hits = findRepos({ framework: 'r_act' }); // '_' would be a LIKE wildcard
    expect(hits).toHaveLength(0);
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

describe('FTS slug rename consistency (db-A-004-DB)', () => {
  it('renaming a repo slug carries the new slug onto its doc + note FTS rows', () => {
    const db = getDb();
    const id = upsertRepo({ owner: 'o', name: 'old', description: 'desc' });
    upsertDoc(id, 'README.md', 'readme', 'README', 'doc body', 'cksum1');
    upsertNote(id, 'thesis', 'thesis', 'note body');

    // Sanity: the doc + note FTS rows currently carry the OLD slug.
    const oldSlug = 'o/old';
    const beforeDoc = (db.prepare(
      "SELECT COUNT(*) AS c FROM repo_search WHERE source_type='doc' AND slug = ?"
    ).get(oldSlug) as { c: number }).c;
    const beforeNote = (db.prepare(
      "SELECT COUNT(*) AS c FROM repo_search WHERE source_type='note' AND slug = ?"
    ).get(oldSlug) as { c: number }).c;
    expect(beforeDoc).toBe(1);
    expect(beforeNote).toBe(1);

    // Rename the repo's slug (owner/name change). The repos UPDATE trigger
    // must rewrite the slug on the repo's doc/note FTS rows too, so search
    // grouping doesn't split across the old and new slug.
    const newSlug = 'o/new';
    db.prepare("UPDATE repos SET name = 'new', slug = ? WHERE id = ?").run(newSlug, id);

    // No FTS rows are left under the old slug…
    const strayOld = (db.prepare(
      'SELECT COUNT(*) AS c FROM repo_search WHERE slug = ?'
    ).get(oldSlug) as { c: number }).c;
    expect(strayOld).toBe(0);

    // …and the doc + note rows now carry the NEW slug.
    const afterDoc = (db.prepare(
      "SELECT COUNT(*) AS c FROM repo_search WHERE source_type='doc' AND slug = ?"
    ).get(newSlug) as { c: number }).c;
    const afterNote = (db.prepare(
      "SELECT COUNT(*) AS c FROM repo_search WHERE source_type='note' AND slug = ?"
    ).get(newSlug) as { c: number }).c;
    expect(afterDoc).toBe(1);
    expect(afterNote).toBe(1);
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
