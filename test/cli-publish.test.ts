/**
 * F-TS-FT2 (CLI publish commands): integration tests for the new
 * `rk versions`, `rk drift`, and `rk bind-package` commands.
 *
 * Gates on dist/cli.js existing (built by `npm run build` in
 * `prepublishOnly` / `verify`). If the dist artifact is absent we log a
 * skip and return — the CI harness builds before testing.
 *
 * Tests seed a temporary DB with known published_version rows and known
 * package.json content, then invoke the CLI via spawnSync against an
 * isolated rk.config.json so the production DB is never touched.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import {
  openDb, closeDb, getDb,
  upsertRepo,
  upsertPublishedVersion,
  setRepoPackageNames,
} from '../src/db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = join(ROOT, 'dist', 'cli.js');

let tmpDir: string;
let dbPath: string;
let configPath: string;

function runCli(args: string[], env: Record<string, string> = {}): { code: number | null; stdout: string; stderr: string } {
  const res = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 20000,
    cwd: tmpDir,
    env: { ...process.env, ...env, NO_COLOR: '1' },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

beforeEach(() => {
  tmpDir = mkdtempSync(join(__dirname, '..', '.tmp-cli-publish-'));
  dbPath = join(tmpDir, 'knowledge.db');
  configPath = join(tmpDir, 'rk.config.json');
  writeFileSync(
    configPath,
    JSON.stringify({ dbPath, owners: [], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') }, null, 2),
    'utf-8'
  );
  // Pre-open the DB so the schema is applied (migrations run on first open).
  openDb(dbPath);
  closeDb();
});

afterEach(() => {
  // closeDb is idempotent and may already be closed.
  try { closeDb(); } catch { /* idempotent */ }
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('rk versions / drift / bind-package (F-TS-FT2)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip CLI publish tests', () => {
      // Intentional skip: tests need a built CLI binary.
    });
    return;
  }

  // ─── rk versions ────────────────────────────────────────────────────────

  it('rk versions <slug> displays "No published versions" when the DB is empty for that repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'empty' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/empty']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/no published versions/i);
  });

  it('rk versions <slug> renders rows from the DB when published_versions exist', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.1' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/r']);
    expect(code).toBe(0);
    // Versions should appear in the output
    expect(stdout).toMatch(/1\.0\.0/);
    expect(stdout).toMatch(/1\.0\.1/);
    expect(stdout).toMatch(/2\.0\.0/);
    // Channels should be grouped/shown
    expect(stdout).toMatch(/npm/i);
    expect(stdout).toMatch(/pypi/i);
  });

  it('rk versions --channel npm filters to a single channel', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'pypi', version: '2.0.0' });
    closeDb();

    const { code, stdout } = runCli(['versions', 'o/r', '--channel', 'npm']);
    expect(code).toBe(0);
    expect(stdout).toMatch(/1\.0\.0/);
    // pypi must NOT appear in the filtered output
    expect(stdout).not.toMatch(/2\.0\.0/);
  });

  it('rk versions on a non-existent slug exits non-zero', () => {
    const { code, stderr, stdout } = runCli(['versions', 'no/such-repo']);
    expect(code).not.toBe(0);
    expect(stderr + stdout).toMatch(/not found/i);
  });

  // ─── cli-PH-001: versions --refresh stderr routing + --strict ─────────────
  //
  // The --refresh path used to print its "Refreshing publish state..." progress
  // AND the per-error lines to STDOUT, polluting a stdout pipe. The fix routes
  // all refresh diagnostics to stderr (channel discipline) and adds --strict so
  // CI can fail when the refresh surfaced errors. There is no offline seam to
  // force a refresh *error* (every sync worker is network-graceful and returns
  // [] on failure rather than populating summary.errors), so the forced-error
  // exit is verified by the same exit-2-on-error logic that drift --strict pins.
  // These tests pin the two deterministic offline contracts: (1) the refresh
  // progress never lands on stdout, and (2) a clean refresh with --strict still
  // exits 0 (no false-positive gate).

  it('rk versions --refresh routes progress to stderr, keeping stdout to the dashboard', () => {
    openDb(dbPath);
    // No bindings + no real registry → the refresh is a graceful no-op, but the
    // "Refreshing publish state..." progress line must still appear, and only
    // on stderr. The dashboard rows are the stdout answer.
    const repoId = upsertRepo({ owner: 'o', name: 'r' }) as number;
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    closeDb();

    const { code, stdout, stderr } = runCli(['versions', 'o/r', '--refresh']);
    // Progress is on stderr, NOT stdout.
    expect(stderr).toMatch(/Refreshing publish state/i);
    expect(stdout).not.toMatch(/Refreshing publish state/i);
    // The dashboard (the answer) is still on stdout.
    expect(stdout).toMatch(/1\.0\.0/);
    // A clean refresh (no errors) exits 0 even without --strict.
    expect(code).toBe(0);
  });

  it('rk versions --refresh --strict exits 0 when the refresh surfaced no errors (no false positive)', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'clean' });
    closeDb();

    // No bindings → syncPublishStateForRepo returns { updated: 0, errors: [] }.
    // --strict must NOT turn a clean (error-free) refresh into a non-zero exit.
    const { code, stdout } = runCli(['versions', 'o/clean', '--refresh', '--strict']);
    expect(code).toBe(0);
    // Progress must not have leaked onto stdout (channel discipline).
    expect(stdout).not.toMatch(/Refreshing publish state/i);
  });

  // ─── rk drift ───────────────────────────────────────────────────────────

  it('rk drift reports "no drift" when source version matches registry latest', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'aligned', local_path: join(tmpDir, 'aligned') }) as number;
    setRepoPackageNames('o/aligned', { npm: '@scope/aligned' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.2.3' });
    closeDb();

    // Seed a local package.json with the same version
    mkdirSync(join(tmpDir, 'aligned'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'aligned', 'package.json'),
      JSON.stringify({ name: '@scope/aligned', version: '1.2.3' }),
      'utf-8'
    );

    const { code, stdout } = runCli(['drift', 'o/aligned']);
    expect(code).toBe(0);
    // Output should indicate no drift
    expect(stdout.toLowerCase()).toMatch(/no drift|drift: no/);
  });

  it('rk drift reports drift when source > registry', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'ahead', local_path: join(tmpDir, 'ahead') }) as number;
    setRepoPackageNames('o/ahead', { npm: '@scope/ahead' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    closeDb();

    mkdirSync(join(tmpDir, 'ahead'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'ahead', 'package.json'),
      JSON.stringify({ name: '@scope/ahead', version: '1.0.1' }),
      'utf-8'
    );

    const { code, stdout } = runCli(['drift', 'o/ahead']);
    // Default mode is exit 0 — drift is informational. --strict is required
    // for a non-zero exit, tested below.
    expect(code).toBe(0);
    expect(stdout).toMatch(/1\.0\.0/);
    expect(stdout).toMatch(/1\.0\.1/);
    expect(stdout.toLowerCase()).toMatch(/drift/);
  });

  it('rk drift --strict exits non-zero when drift is detected', () => {
    openDb(dbPath);
    const repoId = upsertRepo({ owner: 'o', name: 'ahead2', local_path: join(tmpDir, 'ahead2') }) as number;
    setRepoPackageNames('o/ahead2', { npm: '@scope/ahead2' });
    upsertPublishedVersion({ repo_id: repoId, channel: 'npm', version: '1.0.0' });
    closeDb();

    mkdirSync(join(tmpDir, 'ahead2'), { recursive: true });
    writeFileSync(
      join(tmpDir, 'ahead2', 'package.json'),
      JSON.stringify({ name: '@scope/ahead2', version: '1.0.1' }),
      'utf-8'
    );

    const { code } = runCli(['drift', 'o/ahead2', '--strict']);
    expect(code).not.toBe(0);
  });

  // ─── rk bind-package ────────────────────────────────────────────────────

  it('rk bind-package --npm sets npm_package_name on the repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code, stdout } = runCli([
      'bind-package', 'o/r', '--npm', '@scope/r',
    ]);
    expect(code).toBe(0);
    expect(stdout.toLowerCase()).toMatch(/bound|set|updated/);

    // Verify the DB was actually updated
    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT npm_package_name FROM repos WHERE slug = ?'
    ).get('o/r') as { npm_package_name: string };
    expect(row.npm_package_name).toBe('@scope/r');
    closeDb();
  });

  it('rk bind-package --publisher-method rejects an invalid enum value (exit 2)', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code, stderr, stdout } = runCli([
      'bind-package', 'o/r', '--publisher-method', 'pypi_bogus',
    ]);
    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/publisher.method|invalid/i);
  });

  it('rk bind-package --pypi sets pypi_package_name on the repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'p' });
    closeDb();

    const { code } = runCli([
      'bind-package', 'o/p', '--pypi', 'p-py',
    ]);
    expect(code).toBe(0);

    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT pypi_package_name FROM repos WHERE slug = ?'
    ).get('o/p') as { pypi_package_name: string };
    expect(row.pypi_package_name).toBe('p-py');
    closeDb();
  });

  it('rk bind-package --publisher-method accepts a valid enum value', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'r' });
    closeDb();

    const { code } = runCli([
      'bind-package', 'o/r', '--publisher-method', 'npm_trusted',
    ]);
    expect(code).toBe(0);

    openDb(dbPath);
    const row = getDb().prepare(
      'SELECT publisher_method FROM repos WHERE slug = ?'
    ).get('o/r') as { publisher_method: string };
    expect(row.publisher_method).toBe('npm_trusted');
    closeDb();
  });

  // ─── cli-A-001: resolveRepoId ambiguity + provenance-on-display ──────────
  //
  // Two overlapping-slug repos (`o/shipcheck` and `o/shipcheck-plugin`) live
  // in the DB. The fragment "shipcheck" is a partial match for BOTH. The old
  // resolveRepoId did an UNORDERED/UNLIMITED `LIKE %shipcheck%` and returned
  // whichever row SQLite handed back first — so `rk note shipcheck ...` would
  // silently mutate an arbitrary one of the two. The fix makes the partial
  // path ambiguity-aware (exit 2 listing the candidates). It also re-resolves
  // the canonical slug from the chosen id so a *unique* partial echoes the
  // full target back, not the user's fragment (cli-A-006).

  it('rk note with an ambiguous partial slug errors-as-ambiguous (exit 2), mutating neither repo', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'shipcheck' });
    upsertRepo({ owner: 'o', name: 'shipcheck-plugin' });
    closeDb();

    const { code, stderr, stdout } = runCli([
      'note', 'shipcheck', '--type', 'thesis', '--content', 'ambiguous target',
    ]);

    // Must refuse to guess: exit 2, and name both candidates so the user can
    // disambiguate.
    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/ambiguous/i);
    expect(stderr + stdout).toMatch(/o\/shipcheck/);
    expect(stderr + stdout).toMatch(/o\/shipcheck-plugin/);

    // Neither repo may have received the note — the ambiguity guard fires
    // before any write.
    openDb(dbPath);
    const noteCount = getDb().prepare(
      'SELECT COUNT(*) AS c FROM repo_notes'
    ).get() as { c: number };
    expect(noteCount.c).toBe(0);
    closeDb();
  });

  it('rk note with a unique partial slug echoes the canonical slug, not the user input', () => {
    openDb(dbPath);
    // Only one repo contains the fragment "uniquely-named" so the partial
    // resolves unambiguously.
    upsertRepo({ owner: 'o', name: 'uniquely-named-repo' });
    upsertRepo({ owner: 'o', name: 'something-else' });
    closeDb();

    const { code, stdout } = runCli([
      'note', 'uniquely-named', '--type', 'thesis', '--content', 'provenance check',
    ]);

    expect(code).toBe(0);
    // The success line must surface the resolved canonical slug, NOT the
    // partial the user typed. The bug echoed back the raw input ("Note added
    // to uniquely-named"), hiding which repo was actually written.
    expect(stdout).toMatch(/Note added to o\/uniquely-named-repo/);

    // And the note really landed on the resolved repo.
    openDb(dbPath);
    const row = getDb().prepare(
      `SELECT r.slug AS slug FROM repo_notes n JOIN repos r ON r.id = n.repo_id`
    ).get() as { slug: string } | undefined;
    expect(row?.slug).toBe('o/uniquely-named-repo');
    closeDb();
  });

  // resolveRepoRow is the sibling of resolveRepoId and backs the MUTATING
  // `bind-package` and `doctor --refresh` commands. It was left on the old
  // `ORDER BY slug LIMIT 1` arbitrary-first-row pick — so `rk bind-package
  // shipcheck --npm ...` could silently write the npm publish identity onto
  // the wrong repo (a supply-chain footgun). The fix makes it ambiguity-aware.
  it('rk bind-package with an ambiguous partial slug exits 2 and binds neither repo (resolveRepoRow)', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'shipcheck' });
    upsertRepo({ owner: 'o', name: 'shipcheck-plugin' });
    closeDb();

    const { code, stderr, stdout } = runCli([
      'bind-package', 'shipcheck', '--npm', '@scope/shipcheck',
    ]);

    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/ambiguous/i);
    expect(stderr + stdout).toMatch(/o\/shipcheck-plugin/);

    // Neither repo got an npm binding — the guard fires before the write.
    openDb(dbPath);
    const bound = getDb().prepare(
      "SELECT COUNT(*) AS c FROM repos WHERE npm_package_name IS NOT NULL"
    ).get() as { c: number };
    expect(bound.c).toBe(0);
    closeDb();
  });

  // ─── cli-PH-005: init-rig hostname-collision warning ──────────────────────
  //
  // resolveRigId falls back to os.hostname() with no uniqueness check, so two
  // rigs sharing a hostname collapse onto one rigs row and their per-rig
  // repo_local_paths collide. init-rig now warns (stderr) when a rig_id is
  // re-registered under a DIFFERENT hostname/primary_root.

  it('rk init-rig warns when a rig_id is re-registered with a different hostname', () => {
    // First registration under an explicit id + hostname A — no warning.
    const first = runCli(['init-rig', '--id', 'shared-rig', '--hostname', 'host-A']);
    expect(first.code).toBe(0);
    expect(first.stderr).not.toMatch(/different hostname/i);

    // Re-register the SAME rig_id with a DIFFERENT hostname → collision warning.
    const second = runCli(['init-rig', '--id', 'shared-rig', '--hostname', 'host-B']);
    expect(second.code).toBe(0); // warning, not a hard failure
    expect(second.stderr).toMatch(/rig_id shared-rig already registered/i);
    expect(second.stderr).toMatch(/RK_RIG_ID/);
    // The warning is diagnostic — it must be on stderr, not the stdout answer.
    expect(second.stdout).not.toMatch(/already registered/i);
    expect(second.stdout).toMatch(/Registered rig: shared-rig/);
  });

  it('rk init-rig does NOT warn when re-registering the SAME rig_id with the SAME hostname/root', () => {
    // Idempotent re-registration (identical hostname + root) must stay quiet.
    const root = join(tmpDir, 'rig-root');
    const first = runCli(['init-rig', '--id', 'stable-rig', '--hostname', 'host-X', '--root', root]);
    expect(first.code).toBe(0);
    const second = runCli(['init-rig', '--id', 'stable-rig', '--hostname', 'host-X', '--root', root]);
    expect(second.code).toBe(0);
    expect(second.stderr).not.toMatch(/different hostname|already registered/i);
  });

  // ─── cli-PH-004: sync empty-owners warning ────────────────────────────────
  //
  // The beforeEach config writes owners: [] / localDirs: []. With no --owners
  // flag, `rk sync` resolves an empty owners list and calls syncGitHub([]) —
  // a silent no-op for the entire GitHub leg (the silent-failure class
  // sync_runs exists to kill). The fix emits a stderr warning while letting
  // the local scan proceed. The isolated cwd (tmpDir) + empty-owners config +
  // isolated DB make this deterministic and keep the production DB untouched.

  it('rk sync with empty owners config warns to stderr that GitHub sync was skipped', () => {
    const { stderr, stdout } = runCli(['sync']);
    expect(stderr).toMatch(/no GitHub owners configured/i);
    expect(stderr).toMatch(/rk owners add|--owners/i);
    // The warning is diagnostic — stderr only, never the stdout result channel.
    expect(stdout).not.toMatch(/no GitHub owners configured/i);
  });
  // Note: the negative case (no warning when --owners is passed) is not tested
  // here — exercising it would fire a real `gh repo list <owner>` network call.
  // The guard condition `!opts.owners && config().owners.length === 0` makes the
  // opt-out behavior obvious from the source; we keep the suite network-free.
});

// ════════════════════════════════════════════════════════════════════════════
// CLI-JSON-CORE: --json on the read commands (list / show)
// ════════════════════════════════════════════════════════════════════════════
//
// The contract: `rk list --json` and `rk show <slug> --json` emit a single
// valid, parseable JSON document on stdout (no human prose mixed in), so a
// `jq` pipeline never has to special-case the text view. We JSON.parse the
// captured stdout — the assertion is "it parses AND has the right shape."

describe('CLI-JSON-CORE: --json output (cli.ts)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip CLI --json tests', () => {});
    return;
  }

  it('rk list --json emits a parseable JSON array of repo rows', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'alpha' });
    upsertRepo({ owner: 'o', name: 'beta' });
    closeDb();

    const { code, stdout } = runCli(['list', '--json']);
    expect(code).toBe(0);

    // The whole stdout must parse as JSON — no leading "N repos:" header.
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    const slugs = parsed.map((r: { slug: string }) => r.slug);
    expect(slugs).toContain('o/alpha');
    expect(slugs).toContain('o/beta');
  });

  it('rk list --json emits an empty array (not a human string) when no repos match', () => {
    // DB is initialized but empty (beforeEach pre-opens an empty schema).
    const { code, stdout } = runCli(['list', '--json', '--owner', 'nobody']);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
  });

  it('rk show <slug> --json emits a parseable repo dump including audit_posture', () => {
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'shown' });
    closeDb();

    const { code, stdout } = runCli(['show', 'o/shown', '--json']);
    expect(code).toBe(0);

    const parsed = JSON.parse(stdout);
    expect(parsed.slug).toBe('o/shown');
    // The aggregate the text renderer shows includes audit posture (null when
    // unaudited) — the JSON mirror carries the same key.
    expect(parsed).toHaveProperty('audit_posture');
    expect(parsed.audit_posture).toBeNull();
    // The child collections getRepo() assembles must be present in the dump.
    expect(parsed).toHaveProperty('notes');
    expect(parsed).toHaveProperty('relationships');
  });

  // Wave-1 verify: a not-found slug in --json mode must STILL emit parseable
  // JSON on stdout (a structured {error:'not_found'}), not empty input that
  // crashes jq, while keeping a non-zero exit. Pins the notFoundJson() fix for
  // show / related / audit posture.
  it.each([
    ['show', ['show', 'no/such-repo', '--json']],
    ['related', ['related', 'no/such-repo', '--json']],
    ['audit posture', ['audit', 'posture', 'no/such-repo', '--json']],
  ])('rk %s --json on a not-found slug emits {error:not_found} JSON + exit 1', (_name, args) => {
    const { code, stdout } = runCli(args);
    expect(code).toBe(1);
    const parsed = JSON.parse(stdout); // must NOT throw on empty input
    expect(parsed.error).toBe('not_found');
    expect(parsed.slug).toBe('no/such-repo');
  });

  // Parametric coverage for the remaining --json read surfaces: each must emit
  // valid parseable JSON (array/object) for the empty/clean case — never empty
  // stdout, never a human string mixed in.
  it.each([
    ['stats', ['stats', '--json'], 'object'],
    ['find', ['find', 'zznomatch', '--json'], 'object'],
    ['audit findings', ['audit', 'findings', '--json'], 'array'],
    ['audit controls', ['audit', 'controls', '--json'], 'array'],
    ['audit unaudited', ['audit', 'unaudited', '--json'], 'array'],
  ])('rk %s --json emits parseable %s JSON', (_name, args, shape) => {
    const { code, stdout } = runCli(args);
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout); // must parse — no empty stdout, no prose
    if (shape === 'array') expect(Array.isArray(parsed)).toBe(true);
    else expect(typeof parsed).toBe('object');
  });

  // Wave-1 verify (LOW-2): an unknown audit domain is a clear error, not a
  // silently-empty result.
  it('rk audit failing <bogus-domain> exits non-zero with a valid-domains hint', () => {
    const { code, stderr } = runCli(['audit', 'failing', 'not-a-real-domain']);
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/unknown audit domain/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CLI-PR-001: backup / restore round-trip
// ════════════════════════════════════════════════════════════════════════════
//
// Round-trip contract: backup, mutate the live DB, restore, assert the
// mutation is gone. This pins that `VACUUM INTO` produced a faithful snapshot
// and `restore` swapped it back atomically.

describe('CLI-PR-001: backup / restore (cli.ts)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip backup/restore tests', () => {});
    return;
  }

  it('backup -> mutate -> restore restores the pre-mutation state', () => {
    // Seed a known repo.
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'original' });
    closeDb();

    // 1. Backup. The written path is the stdout answer.
    const backup = runCli(['backup']);
    expect(backup.code).toBe(0);
    const backupPath = backup.stdout.trim();
    expect(existsSync(backupPath)).toBe(true);

    // 2. Mutate the live DB — add a second repo that is NOT in the backup.
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'added-after-backup' });
    closeDb();

    // Sanity: the mutation is present before restore.
    {
      const { stdout } = runCli(['list', '--json']);
      const slugs = JSON.parse(stdout).map((r: { slug: string }) => r.slug);
      expect(slugs).toContain('o/added-after-backup');
    }

    // 3. Restore from the backup (--yes to skip the confirm prompt).
    const restore = runCli(['restore', backupPath, '--yes']);
    expect(restore.code).toBe(0);
    expect(restore.stdout.toLowerCase()).toMatch(/restored/);

    // 4. The mutation must be gone; the original repo must remain.
    const { code, stdout } = runCli(['list', '--json']);
    expect(code).toBe(0);
    const slugs = JSON.parse(stdout).map((r: { slug: string }) => r.slug);
    expect(slugs).toContain('o/original');
    expect(slugs).not.toContain('o/added-after-backup');
  });

  it('restore refuses a backup whose schema_version is newer than rk head (exit 2)', () => {
    // Snapshot a valid backup, then tamper its schema_version to a far-future
    // value. restore must refuse BEFORE swapping the live DB.
    openDb(dbPath);
    upsertRepo({ owner: 'o', name: 'keepme' });
    closeDb();

    const backup = runCli(['backup']);
    expect(backup.code).toBe(0);
    const backupPath = backup.stdout.trim();

    // Tamper: bump the backup's schema_version to 9999 (a separate connection).
    const tamper = new Database(backupPath);
    tamper.prepare("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', '9999')").run();
    tamper.close();

    const { code, stderr } = runCli(['restore', backupPath, '--yes']);
    expect(code).toBe(2);
    expect(stderr).toMatch(/newer than this rk build/i);

    // The live DB must be untouched — the original repo still present.
    const { stdout } = runCli(['list', '--json']);
    const slugs = JSON.parse(stdout).map((r: { slug: string }) => r.slug);
    expect(slugs).toContain('o/keepme');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CLI-PR-005 + CLI-PR-003: config validate + doctor preflight
// ════════════════════════════════════════════════════════════════════════════

describe('CLI-PR-005: rk config validate (cli.ts)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip config validate tests', () => {});
    return;
  }

  it('exits non-zero when owners still contains the placeholder "your-github-org"', () => {
    // Rewrite the isolated config to hold the placeholder owner. The dbPath
    // dir already exists (tmpDir) so the ONLY problem is the placeholder.
    writeFileSync(
      configPath,
      JSON.stringify(
        { dbPath, owners: ['your-github-org'], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') },
        null,
        2,
      ),
      'utf-8',
    );

    const { code, stdout, stderr } = runCli(['config', 'validate']);
    expect(code).not.toBe(0);
    expect(stdout + stderr).toMatch(/your-github-org/);
  });

  it('exits 0 on a clean config with no problems', () => {
    // beforeEach already wrote owners: [] / localDirs: [] with a real dbPath
    // dir — no placeholder, no unresolvable paths.
    const { code } = runCli(['config', 'validate']);
    expect(code).toBe(0);
  });
});

describe('CLI-PR-003: rk doctor preflight (cli.ts)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip doctor tests', () => {});
    return;
  }

  it('rk doctor --json returns a checks array', () => {
    // Pre-open the DB so schema/rig/runs checks have a real DB to read.
    openDb(dbPath);
    closeDb();

    const { code, stdout } = runCli(['doctor', '--json']);
    // Default (non-strict) exit is 0 regardless of warn/green checks; gh-auth
    // and rig checks degrade to 'warn', never 'red', offline.
    expect(code).toBe(0);

    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed.checks)).toBe(true);
    expect(parsed.checks.length).toBeGreaterThan(0);
    // Each check has the documented shape.
    for (const c of parsed.checks) {
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('status');
      expect(c).toHaveProperty('detail');
      expect(['green', 'red', 'warn']).toContain(c.status);
    }
    // The report carries the aggregate verdict fields.
    expect(parsed).toHaveProperty('ok');
    expect(parsed).toHaveProperty('red');
    expect(parsed).toHaveProperty('warn');
  });

  it('rk doctor --strict exits non-zero when a red check is present (placeholder owner)', () => {
    // A placeholder owner is a config problem → a red config check. --strict
    // gates the exit on any red.
    writeFileSync(
      configPath,
      JSON.stringify(
        { dbPath, owners: ['your-github-org'], localDirs: [], artifactsRoot: join(tmpDir, 'artifacts') },
        null,
        2,
      ),
      'utf-8',
    );
    openDb(dbPath);
    closeDb();

    const { code, stdout } = runCli(['doctor', '--json', '--strict']);
    expect(code).toBe(2);
    const parsed = JSON.parse(stdout);
    expect(parsed.red).toBeGreaterThan(0);
    // The red check is the config:owners placeholder problem.
    const names = parsed.checks.map((c: { name: string }) => c.name);
    expect(names.some((n: string) => n.startsWith('config:'))).toBe(true);
  });
});
