import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertNote, upsertFact, upsertDoc,
  getRepo, findRepos, getRepoIdBySlug,
} from '../src/db/init.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'rk-sec-'));
  const dbPath = join(tmpDir, 'test.db');
  openDb(dbPath);
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('SQL injection resistance', () => {
  it('handles single quotes in repo names', () => {
    const id = upsertRepo({ owner: "O'Reilly", name: "it's-a-test" });
    expect(id).toBeGreaterThan(0);
    const repo = getRepo("O'Reilly/it's-a-test");
    expect(repo).not.toBeNull();
    expect(repo!.owner).toBe("O'Reilly");
  });

  it('handles SQL keywords in descriptions', () => {
    const id = upsertRepo({
      owner: 'test',
      name: 'repo',
      description: "DROP TABLE repos; -- malicious",
    });
    const repo = getRepo('test/repo');
    expect(repo!.description).toBe("DROP TABLE repos; -- malicious");
    // Table should still exist
    const db = getDb();
    const tables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='repos'"
    ).all();
    expect(tables).toHaveLength(1);
  });

  it('handles UNION injection attempts in slug lookup', () => {
    upsertRepo({ owner: 'safe', name: 'repo' });
    const result = getRepoIdBySlug("' UNION SELECT sql FROM sqlite_master --");
    expect(result).toBeNull();
  });

  it('handles SQL injection in note content', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertNote(id, 'thesis', 'thesis', "'; DROP TABLE repo_notes; --");
    const repo = getRepo('o/r');
    expect(repo!.notes).toHaveLength(1);
    expect(repo!.notes[0].content).toBe("'; DROP TABLE repo_notes; --");
  });

  it('handles SQL injection in fact values', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    upsertFact(id, 'framework', "' OR '1'='1", "malicious");
    const repo = getRepo('o/r');
    const fact = repo!.facts.find((f: any) => f.key === "' OR '1'='1");
    expect(fact).toBeDefined();
    expect(fact.value).toBe('malicious');
  });

  it('handles SQL injection in document content', () => {
    const id = upsertRepo({ owner: 'o', name: 'r' });
    const payload = "Robert'); DROP TABLE repo_docs;--";
    const docId = upsertDoc(id, 'README.md', 'readme', 'README', payload, 'hash1');
    expect(docId).toBeGreaterThan(0);
    // Table should still exist
    const db = getDb();
    const docs = db.prepare("SELECT count(*) as c FROM repo_docs").get() as { c: number };
    expect(docs.c).toBe(1);
  });
});

describe('malformed input handling', () => {
  it('handles empty strings in required fields', () => {
    const id = upsertRepo({ owner: '', name: '' });
    expect(id).toBeGreaterThan(0);
    const repo = getRepo('/');
    expect(repo).not.toBeNull();
  });

  it('handles extremely long strings', () => {
    const longStr = 'x'.repeat(10000);
    const id = upsertRepo({ owner: 'o', name: 'r', description: longStr });
    const repo = getRepo('o/r');
    expect(repo!.description).toBe(longStr);
  });

  it('handles unicode and emoji in all fields', () => {
    const id = upsertRepo({
      owner: '組織',
      name: 'リポ🚀',
      description: '日本語の説明 with émojis 🎉',
    });
    const repo = getRepo('組織/リポ🚀');
    expect(repo).not.toBeNull();
    expect(repo!.description).toBe('日本語の説明 with émojis 🎉');
  });

  it('handles null bytes in strings', () => {
    const id = upsertRepo({ owner: 'o', name: 'r', description: 'before\x00after' });
    const repo = getRepo('o/r');
    expect(repo).not.toBeNull();
  });

  it('handles newlines and control characters', () => {
    const id = upsertRepo({
      owner: 'o',
      name: 'r',
      description: 'line1\nline2\r\nline3\ttab',
    });
    const repo = getRepo('o/r');
    expect(repo!.description).toBe('line1\nline2\r\nline3\ttab');
  });

  it('findRepos handles nonexistent filter values gracefully', () => {
    upsertRepo({ owner: 'o', name: 'r' });
    const results = findRepos({ language: "'; DROP TABLE repos; --" });
    expect(results).toHaveLength(0);
  });
});
