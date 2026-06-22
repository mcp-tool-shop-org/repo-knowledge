/**
 * needsShellFor — the win32-only shell predicate for `.cmd` shim CLIs.
 *
 * The shell gate is platform-dependent, so we assert the invariant that holds
 * on EVERY platform (real binaries never need a shell) plus the platform-gated
 * behaviour for the shim names (true iff win32).
 */
import { describe, it, expect } from 'vitest';
import { needsShellFor } from '../src/sync/exec-bin.js';

const isWin = process.platform === 'win32';

describe('needsShellFor', () => {
  it('never shells out for real executables (node/gh/python/rustc/git)', () => {
    for (const cmd of ['node', 'gh', 'python', 'python3', 'rustc', 'git']) {
      expect(needsShellFor(cmd)).toBe(false);
    }
  });

  it('shells out for npm/npx/yarn/pnpm/corepack iff on Windows', () => {
    for (const cmd of ['npm', 'npx', 'yarn', 'pnpm', 'corepack']) {
      expect(needsShellFor(cmd)).toBe(isWin);
    }
  });

  it('treats unknown names as no-shell', () => {
    expect(needsShellFor('definitely-not-a-shim')).toBe(false);
  });
});
