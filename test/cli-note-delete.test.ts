/**
 * STUDY-RK-035: CLI integration tests for `rk note --delete`.
 *
 * Pins the current command contract in src/cli.ts (explicit `--delete`;
 * `deleteNote` hard-delete by (type, title); no confirm/--yes required):
 *   1. success  — existing note → exit 0
 *   2. not-found — missing (type, title) → exit 1
 *   3. misuse   — add path without --content and without --delete → exit 2
 *
 * Keep classify set/clear only (no --delete on classify). Do not invent a
 * silent-delete-default (delete still requires `--delete`). Optional
 * confirm/--yes is polish only and is not added here.
 *
 * Analogist #3 (KEP --force claim) remains unverified — do not land as verified.
 *
 * Gates on dist/cli.js (built by `npm run build` in pretest / verify),
 * matching test/cli-publish.test.ts: isolated cwd + rk.config.json + temp DB
 * so the production knowledge.db is never touched.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openDb, closeDb, getDb,
  upsertRepo, upsertNote,
} from '../src/db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = join(ROOT, 'dist', 'cli.js');

let tmpDir: string;
let dbPath: string;

function runCli(args: string[], env: Record<string, string> = {}): { code: number | null; stdout: string; stderr: string } {
  const res = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    env: { ...process.env, ...env, NO_COLOR: '1' },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function noteCount(slug?: string): number {
  if (slug) {
    const row = getDb().prepare(
      `SELECT COUNT(*) AS c FROM repo_notes n
         JOIN repos r ON r.id = n.repo_id
        WHERE r.slug = ?`
    ).get(slug) as { c: number };
    return row.c;
  }
  const row = getDb().prepare('SELECT COUNT(*) AS c FROM repo_notes').get() as { c: number };
  return row.c;
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(__dirname, '..', '.tmp-cli-note-delete-'));
  dbPath = join(tmpDir, 'knowledge.db');
  writeFileSync(
    join(tmpDir, 'rk.config.json'),
    JSON.stringify({ dbPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
    'utf-8'
  );
  openDb(dbPath);
  closeDb();
});

afterEach(() => {
  try { closeDb(); } catch { /* idempotent */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('rk note --delete (STUDY-RK-035)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip CLI note --delete tests', () => {
      // Intentional skip: tests need a built CLI binary.
    });
    return;
  }

  it('deletes an existing note and exits 0', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertNote(repoId, 'next_step', 'stale plan', 'superseded next step');
    upsertNote(repoId, 'thesis', 'thesis', 'keep me');
    closeDb();

    const { code, stdout } = runCli([
      'note', 'o/r', '--type', 'next_step', '--title', 'stale plan', '--delete',
    ]);

    expect(code).toBe(0);
    expect(stdout).toMatch(/Deleted next_step note "stale plan" from o\/r/);

    openDb(dbPath);
    expect(noteCount('o/r')).toBe(1);
    const leftover = getDb().prepare(
      'SELECT note_type, title FROM repo_notes'
    ).get() as { note_type: string; title: string };
    expect(leftover).toEqual({ note_type: 'thesis', title: 'thesis' });
    closeDb();
  });

  it('exits 1 when --delete targets a missing note', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertNote(repoId, 'thesis', 'thesis', 'body');
    closeDb();

    const { code, stderr } = runCli([
      'note', 'o/r', '--type', 'thesis', '--title', 'nope', '--delete',
    ]);

    expect(code).toBe(1);
    expect(stderr).toMatch(/no thesis note titled "nope" on o\/r/i);
    expect(stderr).toMatch(/rk show o\/r/);

    openDb(dbPath);
    expect(noteCount('o/r')).toBe(1);
    closeDb();
  });

  it('exits 2 when adding without --content and without --delete', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    // Current CLI path in src/cli.ts: --content is required unless --delete.
    // Do not invent a new UX or a silent-delete-default.
    const { code, stderr } = runCli(['note', 'o/r', '--type', 'thesis']);

    expect(code).toBe(2);
    expect(stderr).toMatch(/--content is required when adding a note/i);
    expect(stderr).toMatch(/--delete/);

    openDb(dbPath);
    expect(noteCount()).toBe(0);
    closeDb();
  });
});
