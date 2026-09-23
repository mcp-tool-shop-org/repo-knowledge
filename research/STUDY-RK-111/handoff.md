# STUDY-RK-111 handoff (Verifier scorecard + land guidance)

# STUDY-RK-111 Verifier scorecard

Tip: `c399182` (=origin/main). Consumer: repo-knowledge.
Thesis: doctor/health ON MAIN (CLI-PR-003 in `test/cli-publish.test.ts` + `test/health-commands.test.ts` buildRepoDoctor/buildFeed/buildHealthTable) vs open #14 dedicated `test/doctor.test.ts`/`feed.test.ts`/`table.test.ts` (+ #13 errors/audit). Dedicated filenames absent on tip = non-blocking if tip coverage holds. KEEP #14 OPEN. NEW coding PR: no. REAFFIRM 039/068 KEEP dual doctor. Soft folklore invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write.

Retrieval-check ALL THREE packs. Opened every cited URL (17/17 HTTP 200 · claim match). Default unverified on 404/paywall/mismatch.

## Tip inventory (Verifier)

| check | result |
| --- | --- |
| HEAD | `c399182` = origin/main |
| CLI-PR-003 | ON MAIN `test/cli-publish.test.ts` L666 `describe('CLI-PR-003: rk doctor preflight (cli.ts)')` · 1 dist-skip + 2 live its |
| health-commands | ON MAIN `test/health-commands.test.ts` · 3 describes / 19 its (buildFeed 7 · buildRepoDoctor 3 · buildHealthTable 9) · 0 skips |
| dedicated doctor/feed/table `.test.ts` | ABSENT on tip (non-blocking) |
| #14 OPEN | head `8fee954` · files `test/doctor.test.ts` · `feed.test.ts` · `table.test.ts` · `health-commands.test.ts` |
| #13 OPEN | head `ce6743a` · files `test/errors.test.ts` · `audit-controls.test.ts` · `audit-queries.test.ts` · zero doctor/health paths |
| research/STUDY-RK-039 · 068 | five-file trees present · KEEP dual doctor |
| research/STUDY-RK-111 · 131 | absent |
| open PRs | #6 #8 #12–#26 #28 (no new beyond #28) |

## Scholar — 8/8 VERIFIED

Word count ~857 — **flag** (over 500–600). Citations not invented; do not fake unverified.

| # | verdict | source |
| --- | --- | --- |
| 1 | VERIFIED | Das, Gary 2025 · https://arxiv.org/abs/2511.02810 · Formalizing Regression Testing for Agile and Continuous Integration Environments |
| 2 | VERIFIED | Alégroth, Feldt, Kolström 2016 · https://arxiv.org/abs/1602.01226 · Maintenance of Automated Test Suites in Industry |
| 3 | VERIFIED | Gu, Mesbah 2024 · https://arxiv.org/abs/2408.13517 · Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning |
| 4 | VERIFIED | Ruland, Lochau 2022 · https://arxiv.org/abs/2207.12733 · On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies |
| 5 | VERIFIED | Wang, Wang, Nie 2024 · https://arxiv.org/abs/2410.21798 · Efficient Incremental Code Coverage Analysis for Regression Test Suites |
| 6 | VERIFIED | Chang et al. 2022 · https://arxiv.org/abs/2210.01661 · Putting Them under Microscope |
| 7 | VERIFIED | Santana et al. 2022 · https://arxiv.org/abs/2207.05539 · Refactoring Assertion Roulette and Duplicate Assert |
| 8 | VERIFIED | Spieker et al. 2017/2018 · https://arxiv.org/abs/1811.04122 · Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration |

Soft folklore invent gates in Scholar pack: **0**.

## Practitioner — 8/8 VERIFIED

| # | verdict | note |
| --- | --- | --- |
| 1 | VERIFIED | tip stamp commit `c399182` · HTTP 200 · STUDY-RK-110 handoff land line |
| 2 | VERIFIED | local tip CLI-PR-003 present (L666 · 1 skip + 2 live) — invent tip-lacks-doctor-coverage: fail |
| 3 | VERIFIED | local tip `test/health-commands.test.ts` · 3 describes / 19 its |
| 4 | VERIFIED | dedicated doctor/feed/table filenames ABSENT · non-blocking given tip coverage |
| 5 | VERIFIED | #14 OPEN · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 · owns dedicated split |
| 6 | VERIFIED | #13 OPEN · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · errors/audit only |
| 7 | VERIFIED | research/STUDY-RK-039 + 068 present · REAFFIRM KEEP dual doctor |
| 8 | VERIFIED | warrant: tip coverage PRESENT + #14 owns residual → **NEW coding PR: no**; do not restack #13/#14 |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold-with-limit · 7–8 Fail-transfer

| # | verdict | source |
| --- | --- | --- |
| 1 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · HTTP 200 · tip describes = SoR; ≠ invent tip-lacks |
| 2 | Hold VERIFIED | GitHub about PRs · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests · #14 owns residual; ≠ invent risk-free merge |
| 3 | Hold VERIFIED | Gauntlet why tests miss bugs · https://gauntletci.com/articles/why-tests-miss-bugs · covered tip ≠ missing splits mean zero coverage |
| 4 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · lit counts landed tests; open patches ≠ tip members |
| 5 | Hold VERIFIED | GitHub status checks · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks · tip checks ≠ invent merge clearance |
| 6 | Hold VERIFIED | Kubernetes deprecation policy · https://kubernetes.io/docs/reference/using-api/deprecation-policy/ · keep tip SoR; leave residual on #14 |
| 7 | Fail-transfer | invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge — correct reject · Soft folklore: 0 |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #14 as tip SoR / Analogist-fake Scholar\|Practitioner — correct reject · NEW coding PR: no |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)

| gate | count |
| --- | --- |
| invent tip-lacks-doctor-coverage | **0** |
| invent restack-#13/#14 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |

## Implications (verified only)

Tip already carries CLI-PR-003 + health-commands doctor/feed/table builder coverage. Dedicated `doctor`/`feed`/`table` filenames absent on tip are non-blocking. #14 owns that dedicated-file residual — KEEP #14 OPEN. #13 owns errors/audit only. Therefore **NEW coding PR: no**; **do not restack #13/#14**. REAFFIRM 039/068 KEEP dual doctor (context only). Soft folklore invent tip-lacks-doctor-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Flags

- Scholar word-count ~857 (over 500–600) — flag only; citations held.
- Invented gates: **0**.
- NEW coding PR: **no**.
- URL retrieval: 17/17 VERIFIED (`url-check.json`).

## Score

Scholar **8/8** · Practitioner **8/8** · Analogist **6 Hold-with-limit · 7–8 Fail-transfer**

✅ Builder may land

Landed five files under research/STUDY-RK-111/ sha=`8ab6be8bb073c64c3f27b3610e13ddd18a570cc2` tip-before-stamp=`c399182`.
