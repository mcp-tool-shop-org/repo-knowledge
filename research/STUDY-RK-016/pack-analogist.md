STUDY-RK-016 Q3 Analogist — tip `057a5e8` · consumer repo-knowledge

stop: vitest gaps which src/ modules lack tests (analogs).
prerequisite: STUDY-RK-015 done sha=`057a5e8`; tip `057a5e8`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: ~32 `src/**/*.ts` modules vs ~38 `test/*.test.ts`; `test:coverage` via vitest+@vitest/coverage-v8. Inventory of untested/under-tested modules is an analog problem — not a claim that every file has a twin. No coding/PR.

1. c8 / Istanbul `--all` full-source coverage inventory — bcoe/c8 — ongoing — https://github.com/bcoe/c8/ — Hold-with-limit: `--all` forces never-executed src files into the report at 0%; limit: line coverage ≠ dedicated module tests.

2. Vitest coverage (V8) module maps — Vitest / @vitest/coverage-v8 — ongoing — https://vitest.dev/guide/coverage.html — Hold-with-limit: coverage reports inventory which `src/` paths ran under tests; limit: executed-via-import ≠ dedicated `*.test.ts` for that module.

3. Stryker Mutator mutation score (surviving mutants) — Stryker Docs / guides — ongoing — https://stryker-mutator.io/ — Hold-with-limit: survivors flag weak or missing tests even when coverage looks green; limit: mutation cost; complements gap inventory.

4. PIT mutation testing (Java) — PITest — ongoing — https://pitest.org/ — Hold-with-limit: targetClasses vs tests expose untested packages; limit: JVM tool, same “inventory survivors” idea for TS via Stryker.

5. Google SRE canarying / critical-path coverage gaps — Google SRE Workbook — ongoing — https://sre.google/workbook/canarying-releases/ — Hold-with-limit: canaries that miss critical paths give false confidence; limit: prod traffic canary ≠ unit test map, same “unexercised critical module” risk.

6. LLVM lit regression suite discovery vs skipped/unsupported — LLVM lit docs — ongoing — https://llvm.org/docs/CommandGuide/lit.html — Hold-with-limit: suites inventory discovered vs executed tests; skipped/unsupported hide gaps; limit: compiler harness ≠ vitest, same need to surface what never ran.

7. all src/ modules have dedicated tests — Fail-transfer: coverage/import fan-in and name-mapping show many `src/` files lack a one-to-one `test/<module>.test.ts`; blanket “all covered” is false.

8. Soft folklore that green `vitest run` implies every module is inventoried and dedicated-tested — Fail-transfer: pass≠gap map; Soft folklore: 0.

Soft folklore: 0. All-src-dedicated-tests claimed: 0. No coding/PR. Did not invent STUDY-RK-021.
✅
