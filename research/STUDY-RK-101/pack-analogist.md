STUDY-RK-101 Q3 Analogist — tip `ad5dead` · inventory: modules live on main vs dedicated tests only on #13–#15 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent merge / invent STUDY-RK-131 = fail · “coverage on a branch” ≠ “protected on tip.”
prerequisite: tip `ad5dead` matches `origin/main` (“stamp STUDY-RK-100 patch sha”). Main v2.1.1. Modules live on tip: `src/errors.ts`, `src/health/{doctor,feed,table}.ts`, `src/sync/{github,dogfood-suggest}.ts`, audit controls/queries surfaces. Dedicated vitest files ABSENT on tip: `test/errors.test.ts`, `test/audit-controls.test.ts`, `test/audit-queries.test.ts`, `test/doctor.test.ts`, `test/feed.test.ts`, `test/table.test.ts`, `test/github.test.ts`, `test/dogfood-suggest.test.ts` — present only on OPEN #13/#14/#15 (BEHIND, not on tip). Job 101 = inventory study + table; no merge. Open #6 #8 #12–#26 stay OPEN. REAFFIRM 022/023/024/058/059/086. NEW coding PR default no. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Do not invent STUDY-RK-131. Missing four fields → 🛑 Coordinator.

Inventory table (tip vs open PR):
| Module / surface (on tip) | Dedicated test on tip? | Lives on open PR |
| --- | --- | --- |
| `src/errors.ts` | ABSENT `test/errors.test.ts` | #13 |
| audit controls/queries | ABSENT `test/audit-controls.test.ts` · `test/audit-queries.test.ts` | #13 |
| `src/health/doctor.ts` · feed · table | ABSENT `test/doctor.test.ts` · `test/feed.test.ts` · `test/table.test.ts` | #14 |
| `src/sync/github.ts` · `dogfood-suggest.ts` | ABSENT `test/github.test.ts` · `test/dogfood-suggest.test.ts` | #15 |

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Green-build fallacy — Gauntlet CI — https://gauntletci.com/articles/why-tests-miss-bugs — Hold-with-limit: tip vitest can stay green while dedicated suites for live modules exist only on #13–#15; suite green ≠ tip protected for those modules. Limit: general CI article ≠ rk module map; invent tip-already-covered fails.

2. Code coverage = execution ≠ verification — Pie — https://pie.inc/blog/why-tests-pass-when-app-is-broken/ — Hold-with-limit: coverage on a PR head does not credit tip for files not in tip tree; invent tip coverage-% from open-PR suites fails. Limit: product E2E framing ≠ vitest unit debt inventory.

3. LLVM lit / FileCheck discovers only landed tests — LLVM Testing Guide — https://llvm.org/docs/TestingGuide.html — Hold-with-limit: discovery runs against the checked-out tree; open PR patches are not tip suite members until merge. Limit: LLVM prefer-add guidance ≠ rk dedicated-file ABSENT list.

4. Default-branch / tip authority vs PR-head checks — GitHub required status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks — Hold-with-limit: green checks on #13/#14/#15 prove those heads, not that tip `ad5dead` already contains the dedicated suites. Limit: branch-protection mechanics ≠ invent merge.

5. Stryker mutation score needs tests on the scored tree — Stryker Mutator — https://stryker-mutator.io/blog/typescript-coverage-analysis-support/ — Hold-with-limit: mutation/coverage analysis only sees tests present on the branch under score; open dedicated PRs do not raise tip mutation evidence. Limit: tooling ≠ invent coverage-%.

6. Stacked open-PR debt / open ≠ tip (REAFFIRM 059/086) — CLOSED Is Not MERGED — https://netsujo.jp/en/blog/pull-request-closed-not-merged — Hold-with-limit: #13–#15 OPEN with mergedAt=null are inventory debt, not tip protection. Limit: evidence ladder ≠ auto-merge; 🛑 do not merge; NEW coding PR default no.

7. Soft folklore invent tip-already-covered / invent merge of #13–#15 / invent coverage-% / all-done — Fail-transfer: eight dedicated files ABSENT on tip; branch coverage fails to transfer as tip protection. Soft folklore count: 0.

8. Invent STUDY-RK-131 / treat open #13–#15 as tip authority / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; job 101 = inventory study + table only; no merge.

Soft folklore invent merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-101/pack-analogist.md`.
🛑 do not merge #13–#15 (or #6 #8 #12–#26); branch coverage ≠ tip protection; NEW coding PR default no.

✅ · 🛑 · 🔧
