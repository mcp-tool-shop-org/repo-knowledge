STUDY-RK-022 Q3 Analogist — tip `bdfe26f` · consumer repo-knowledge coding

stop: vitest for errors.ts + audit controls/queries (analogs).
prerequisite: STUDY-RK-021 done sha=`4031f1e` PR #12; tip `bdfe26f`; consumer repo-knowledge coding.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: `src/errors.ts` (RkError / RepoKnowledgeError) and `src/audit/controls.ts` + `queries.ts` lack dedicated `test/*.test.ts` (STUDY-RK-016 gaps). Green vitest ≠ dedicated suites; do not invent coverage %.

1. Clang `-verify` diagnostic tests — Clang Internals Manual — ongoing — https://clang.llvm.org/docs/InternalsManual.html — Hold-with-limit: error/warning types get dedicated expected-* tests, not “suite green” folklore.

2. FileCheck on compiler diagnostic output — LLVM FileCheck — ongoing — https://llvm.org/docs/CommandGuide/FileCheck.html — Hold-with-limit: asserts exact error text/codes; parallel to testing `RepoKnowledgeError.code` / `toJSON()`.

3. Typed error unit tests (`errors.As` / contract codes) — go-mizu Contract docs — ongoing — https://docs.go-mizu.dev/contract/testing — Hold-with-limit: dedicated tests assert error type + code + HTTP mapping; limit: Go/HTTP ≠ rk but same pattern for `errors.ts`.

4. API error-response contract suites — API Contract Testing — ongoing — https://www.api-contract-testing.com/schema-design-validation-patterns/designing-robust-error-response-contracts/ — Hold-with-limit: fixtures per error schema; green happy-path ≠ error-contract coverage.

5. CIS/InSpec control-catalog executable checks — CIS + InSpec practice — ongoing — https://aws.amazon.com/what-is/cis-benchmarks/ — Hold-with-limit: each control id needs a runnable check, not a pass from unrelated tests; limit: OS CIS ≠ audit 80-control DB, same dedicated-control-test idea for `controls.ts`/`queries.ts`.

6. LEARN GO WITH TESTS custom error types — quii — ongoing — https://quii.gitbook.io/learn-go-with-tests/questions-and-answers/error-types — Hold-with-limit: assert typed errors, not string-only; holds for `RepoKnowledgeError` shape tests.

7. green vitest = every module has a dedicated suite / invent coverage % — Fail-transfer: suite green can miss `errors.ts` and audit query/control modules entirely; inventing % is forbidden.

8. Soft folklore that import-through-cli/audit-import tests replace dedicated error/control suites — Fail-transfer: indirect touch ≠ dedicated suite; Soft folklore: 0.

Soft folklore: 0. Coverage-% invented: 0. Did not invent STUDY-RK-051.
✅
