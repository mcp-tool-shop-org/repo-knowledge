/**
 * Cross-platform spawn helpers for the sync workers.
 *
 * On Windows, npm / npx / yarn / pnpm / corepack are `.cmd` shims, NOT real
 * executables. child_process spawn / execFile cannot launch them without a
 * shell:
 *
 *   - a bare `npm` throws ENOENT — PATHEXT resolution (`npm` -> `npm.cmd`) only
 *     happens through the shell, so even an installed-and-on-PATH npm fails;
 *   - naming the shim explicitly (`npm.cmd`) throws EINVAL under the Node
 *     CVE-2024-27980 mitigation (Node >= 18.20.2 / 20.12.2 / 21.7.2 / 22),
 *     which refuses to spawn `.bat` / `.cmd` files without a shell.
 *
 * Running these through the platform shell is the supported path. We gate the
 * shell ON only for win32 AND only for these specific shim names, so POSIX
 * keeps the injection-proof no-shell behaviour the surrounding code relies on.
 * Call sites that opt in must pass only validated or static arguments.
 */
const WINDOWS_CMD_SHIMS = new Set(['npm', 'npx', 'yarn', 'pnpm', 'corepack']);

/**
 * True when `cmd` must be spawned through a shell on the current platform.
 * Pass the result as `execFileSync(cmd, args, { shell: needsShellFor(cmd) })`.
 */
export function needsShellFor(cmd: string): boolean {
  return process.platform === 'win32' && WINDOWS_CMD_SHIMS.has(cmd);
}
