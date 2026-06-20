/**
 * CLI exit-gate helpers.
 *
 * Pure, side-effect-free so they are unit-testable WITHOUT importing cli.ts
 * (which runs program.parseAsync() at module load). The actual process.exit
 * stays at the call site; this module only owns the DECISION.
 */

/**
 * cli-PH-001: a `--strict` refresh/drift command fails the build (exit non-zero)
 * when the operation surfaced any errors/drift, so CI can gate on it.
 *
 * The sync workers are intentionally network-graceful (they return [] + log on
 * failure rather than throwing), so `count` is rarely > 0 in practice — which
 * makes this gate hard to exercise end-to-end and is exactly why the decision
 * is extracted here and unit-tested directly. The risk this guards against is a
 * logic slip (inverted condition, wrong variable, `>= 0` boundary), not a
 * network outcome.
 */
export function shouldFailStrict(strict: boolean, count: number): boolean {
  return strict === true && count > 0;
}
