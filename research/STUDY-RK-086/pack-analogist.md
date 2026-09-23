# STUDY-RK-086 — pack-analogist

Tip `835652e` · REAFFIRM 058/059 · #13/#14/#15 OPEN · Soft folklore: 0 · Coverage-% invented: 0 · STUDY-RK-101: 0.

Six Hold-with-limit; two Fail-transfer.

1. Green-build fallacy (suite green ≠ missing dedicated suites) — Gauntlet CI — https://gauntletci.com/articles/why-tests-miss-bugs — Hold-with-limit: tip vitest can stay green while `src/errors.ts`, health doctor/feed/table, sync github/dogfood-suggest lack dedicated files that live only on #13/#14/#15; limit: article is general CI, not rk modules.

2. Code coverage = execution ≠ verification — Pie — https://pie.inc/blog/why-tests-pass-when-app-is-broken/ — Hold-with-limit: inventing a tip coverage-% from open-PR suites fails; coverage on tip cannot credit files not in tip tree; limit: product E2E framing ≠ vitest unit debt.

3. LLVM lit / FileCheck discovery only counts landed tests — LLVM Testing Guide — https://llvm.org/docs/TestingGuide.html — Hold-with-limit: lit discovers files in the checked-out tree; open PR patches are not tip suite members until merge; limit: prefer-add-to-existing-file guidance ≠ rk’s dedicated-file inventory gaps.

4. Stryker mutation score ≠ line-coverage % — Stryker Mutator — https://stryker-mutator.io/blog/typescript-coverage-analysis-support/ — Hold-with-limit: mutation/coverage analysis still needs tests present on the branch under score; open dedicated PRs do not raise tip mutation evidence; limit: TS coverageAnalysis tooling ≠ claim of invent-%.

5. Default-branch / tip authority vs PR-head checks — GitHub required status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks — Hold-with-limit: green checks on #13/#14/#15 heads prove those heads, not that tip `835652e` already contains the dedicated suites; limit: branch-protection mechanics ≠ merge recommendation.

6. Stacked open-PR debt / open ≠ tip (REAFFIRM 059) — merge-queue / canary freeze pattern — reaffirm STUDY-RK-059 pack + SRE freeze until debt lands — Hold-with-limit: three open dedicated-vitest PRs are inventory debt, not tip clearance; REAFFIRM 058 floors without invent-%; limit: queue analogy does not invent merge order.

7. Soft folklore invent tip-already-covered / risk-free merge / invent coverage-% / all-done — Fail-transfer: tip still ABSENT the eight dedicated files above; open PRs ≠ tip; inventing % or all-done is forbidden.

8. Invent STUDY-RK-101 / treat open #13/#14/#15 as tip authority — Fail-transfer: do not invent 101; do not Analogist-fake Scholar/Practitioner; do not merge as tip clearance.

🛑 do not invent merge of #13/#14/#15 as tip clearance.
