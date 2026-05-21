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

  it('exits 0 for --help (sanity: error path is the regression, success path is not)', () => {
    const { code } = runCli(['--help']);
    expect(code).toBe(0);
  });

  it('exits 0 for --version', () => {
    const { code, stdout } = runCli(['--version']);
    expect(code).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
