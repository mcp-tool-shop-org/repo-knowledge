STUDY-RK-096 Q3 Analogist — tip `ccee3c7` · REAFFIRM STUDY-RK-033 / STUDY-RK-056 / STUDY-RK-072 · #6 OPEN · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · inventing merge of #6 or a new sync coding PR vs REAFFIRM; invent silent-zero-is-success / risk-free merge #6 / tip-already-fixed-by-#6 / STUDY-RK-101 = fail.
prerequisite: tip `ccee3c7` matches `origin/main`. #6 OPEN (“fix(sync): rk sync exited 0 while crashing — propagate failures (1.0.6)”) — mergeStateStatus DIRTY / CONFLICTING; head `fix/sync-silent-failure` is NOT an ancestor of tip (`#6_NOT_ON_TIP`). Tip already KEEP defenses: `program.parseAsync().catch(...)` at CLI bottom (F-BE-FT1), `resolveConfig` skips undefined overrides and resolves `dbPath` (`src/config.ts`), config regression tests in `test/config.test.ts`. Historical #6 also bundled workflow/deps churn — conflicted process gap, not tip SoR. Prior KEEP tip defenses; NEW coding PR default no (process gap ≠ merge license). No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Fail-closed / Errors as golden signal — Google SRE Book — https://sre.google/sre-book/monitoring-distributed-systems/ — Hold-with-limit: exit 0 with crash or no work is false success; tip `parseAsync` catch keeps async-action rejections non-zero. Limit: distributed monitoring ≠ Commander CLI; invent silent-zero-is-success fails.

2. OWASP fail securely — https://owasp.org/www-community/Fail_securely — Hold-with-limit: on error fail closed; do not present success after failure. Limit: web appsec ≠ rk sync; same anti-silent-success discipline for CLI exit codes.

3. TypeScript noImplicitReturns — https://www.typescriptlang.org/tsconfig/#noImplicitReturns — Hold-with-limit: incomplete control flow must not look like a successful return path. Limit: TS compiler flag ≠ runtime `process.exit`; supports fail-closed CLI shape.

4. Kubernetes Job Failed / backoffLimit — https://kubernetes.io/docs/concepts/workloads/controllers/job/ — Hold-with-limit: failed pods mark the Job Failed; the controller does not claim success after crash. Limit: cluster Jobs ≠ local `rk sync`; same non-zero-on-failure contract.

5. Dirty/conflicting open PR ≠ tip clearance — github/gh-aw stale-pr-cleanup — https://github.com/github/gh-aw/blob/main/.github/workflows/stale-pr-cleanup.md — Hold-with-limit: #6 stays review-only while DIRTY; tip already carries fail-closed defenses without #6 landed. Limit: stale bot ≠ invent risk-free merge #6 or tip-already-fixed-by-#6 folklore.

6. Process gap ≠ merge license (conflicted / path-churn head) — playsrc/pr-tracker-action — https://github.com/playsrc/pr-tracker-action/blob/main/README.md — Hold-with-limit: an open historical fix PR with conflicts is inventory, not authority to invent merge or a duplicate NEW sync coding PR. Limit: Action comments ≠ auto-merge; NEW coding PR default no (REAFFIRM 072).

7. Soft folklore invent silent-zero-is-success / risk-free merge #6 / tip-already-fixed-by-#6 — Fail-transfer: tip defenses present without #6 on tip; #6 CONFLICTING is not tip SoR; invent merge or “#6 already fixed tip” fails (REAFFIRM 033/056/072). Soft folklore count: 0. Concrete residual sync coding gap on tip: no.

8. Invent STUDY-RK-101 / treat process-gap as tip coding hole requiring NEW sync coding PR / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; tip KEEP defenses; NEW coding PR default no.

Soft folklore invent silent-zero-is-success / risk-free merge #6 / tip-already-fixed-by-#6: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-096/pack-analogist.md`.
🛑 do not invent merge of #6; tip KEEP fail-closed defenses; NEW coding PR default no.

✅ · 🛑 · 🔧
