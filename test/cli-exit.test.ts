/**
 * cli-PH-001 (Stage-C verify): the --strict refresh/drift exit gate.
 *
 * The sync workers are network-graceful (return [] on failure, never throw),
 * so forcing a real refresh error end-to-end offline is not deterministic.
 * The substantive risk the verifier named is a LOGIC slip in the gate itself
 * (inverted condition, wrong variable, `>= 0` boundary). We pin that directly
 * against the extracted pure predicate — this FAILS if the gate is inverted,
 * widened to >= 0, or stops requiring strict.
 */
import { describe, it, expect } from 'vitest';
import { shouldFailStrict } from '../src/cli-exit.js';

describe('shouldFailStrict — the --strict exit gate (cli-PH-001)', () => {
  it('fails (exit-nonzero) only when strict AND there is at least one error', () => {
    expect(shouldFailStrict(true, 1)).toBe(true);
    expect(shouldFailStrict(true, 5)).toBe(true);
  });

  it('does NOT fail a clean refresh, even with --strict (no false positive)', () => {
    expect(shouldFailStrict(true, 0)).toBe(false);
  });

  it('does NOT fail when --strict is absent, regardless of error count', () => {
    expect(shouldFailStrict(false, 0)).toBe(false);
    expect(shouldFailStrict(false, 3)).toBe(false);
  });

  it('boundary: zero errors is never a failure (guards against a >= 0 slip)', () => {
    expect(shouldFailStrict(true, 0)).toBe(false);
  });
});
