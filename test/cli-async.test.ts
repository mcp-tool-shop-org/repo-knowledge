/**
 * F-TS-003: CLI async error surfacing regression test.
 *
 * The CLI uses commander's .action(async (...) => ...) pattern, which by
 * default swallows promise rejections — async errors bubble out of the
 * Node event loop as UnhandledPromiseRejection and (depending on Node
 * version) may exit 0. The backend agent's fix in this wave wraps async
 * actions so that thrown errors propagate to a non-zero exit code AND
 * surface a stack/message on stderr.
 *
 * These tests gate on dist/cli.js existing (built by `npm run build` in
 * `prepublishOnly` / `verify`). If the dist artifact is absent we log a
 * skip and return — the CI harness builds before testing.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = join(ROOT, 'dist', 'cli.js');

function runCli(args: string[], env: Record<string, string> = {}): { code: number | null; stdout: string; stderr: string } {
  const res = spawnSync('node', [CLI, ...args], {
    encoding: 'utf-8',
    timeout: 15000,
    env: { ...process.env, ...env, NO_COLOR: '1' },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

describe('CLI async error surfacing (F-TS-003)', () => {
  if (!existsSync(CLI)) {
    it.skip('dist/cli.js not built — skip CLI async tests', () => {
      // Intentional skip: tests need a built CLI binary.
    });
    return;
  }

  it('exits non-zero when an async action throws (sync-dogfood with bad --local path)', () => {
    // sync-dogfood --local <bad-path> tries to read indexes/latest-by-repo.json,
    // which throws ENOENT inside an async action. The fix ensures the error
    // is caught and produces a non-zero exit + stderr message.
    const badPath = join(ROOT, 'does-not-exist-' + Date.now());
    const { code, stderr, stdout } = runCli(['sync-dogfood', '--local', badPath]);

    // Either the process must exit non-zero, OR (less ideal but acceptable
    // pre-backend-fix) stderr must have a clear error message. Once the
    // backend fix lands, both conditions hold.
    const exitedNonZero = code !== 0;
    const erroredOnStderr = /ENOENT|no such file|Failed|Error/i.test(stderr + stdout);
    expect(exitedNonZero || erroredOnStderr).toBe(true);

    // The hard contract that the backend fix introduces: non-zero exit.
    // If this assertion fails before the fix lands, it documents the bug.
    expect(code).not.toBe(0);
  });

  it('exits non-zero when scan is given a missing path', () => {
    // scan <path> calls ingestLocalRepo, which throws if path doesn't exist.
    // This is a sync action but covers the same error-surfacing contract.
    const badPath = join(ROOT, 'definitely-not-a-repo-' + Date.now());
    const { code, stderr, stdout } = runCli(['scan', badPath]);

    expect(code).not.toBe(0);
    expect(stderr + stdout).toMatch(/Path not found|ENOENT|Error/i);
  });

  // cli-PH-002: a typo'd scan path now gets a friendly remedy hint (matching
  // the note/delete not-found pattern) emitted to STDERR with exit 2, BEFORE
  // the DB is opened — instead of a bare structured throw from ingestLocalRepo.
  // (cli-PH-004's empty-owners warning is tested in cli-publish.test.ts, which
  // isolates cwd + config + DB so the assertion is deterministic.)
  it('scan of a nonexistent path exits 2 with a path-not-found hint on stderr', () => {
    const badPath = join(ROOT, 'cli-ph-002-missing-' + Date.now());
    const { code, stderr } = runCli(['scan', badPath]);

    expect(code).toBe(2);
    expect(stderr).toMatch(/path not found/i);
    // The actionable remedy hint must be present.
    expect(stderr).toMatch(/\.git repo/i);
  });

  it('exits 0 for --help (sanity: error path is the regression, success path is not)', () => {
    const { code } = runCli(['--help']);
    expect(code).toBe(0);
  });

  it('exits 0 for --version', () => {
    const { code, stdout } = runCli(['--version']);
    expect(code).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  // cli-A-005: parsePositiveInt used parseInt, which truncates partial
  // numbers: parseInt('10x') → 10. A typo'd limit would silently degrade into
  // a valid-looking value instead of being rejected. `rk runs --limit <n>`
  // coerces during commander arg parsing (before any DB open), so it's a
  // clean vehicle. The fix requires String(n) === trimmed input.
  it('rejects a partially-numeric --limit ("10x") with exit 2', () => {
    const { code, stderr, stdout } = runCli(['runs', '--limit', '10x']);
    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/Invalid --limit|positive integer/i);
  });

  it('rejects scientific-notation --limit ("1e2") with exit 2', () => {
    const { code } = runCli(['runs', '--limit', '1e2']);
    expect(code).toBe(2);
  });

  it('rejects a fractional --limit ("10.9") with exit 2', () => {
    const { code } = runCli(['runs', '--limit', '10.9']);
    expect(code).toBe(2);
  });

  it('still accepts a clean positive integer --limit', () => {
    // Sanity: the digits-only guard must not reject legitimate input. `runs`
    // with a valid --limit exits 0 (it queries operational-run tables, which
    // are empty/harmless on the production DB).
    const { code } = runCli(['runs', '--limit', '5', '--json']);
    expect(code).toBe(0);
  });

  // cli-A-003: `rk prune --apply --dry-run` previously took the destructive
  // --apply branch because --dry-run was never read. The two flags are
  // contradictory; pairing them must error (exit 2), not silently delete.
  // This guard runs before openDb so it doesn't touch the production DB.
  it('rejects contradictory `prune --apply --dry-run` with exit 2', () => {
    const { code, stderr, stdout } = runCli(['prune', '--apply', '--dry-run']);
    expect(code).toBe(2);
    expect(stderr + stdout).toMatch(/only one of --dry-run or --apply|not both/i);
  });
});
