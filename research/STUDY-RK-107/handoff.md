# STUDY-RK-107 handoff (Verifier scorecard + land guidance)

# STUDY-RK-107 Verifier scorecard
Tip `b24994b` (= `b24994bda08ba7329b6994c903d87aee74f10b2a` = origin/main after STUDY-RK-106 land). Consumer repo-knowledge. Job: FTS dedicated tests ON MAIN vs open #13/#14 (do not restack).

Retrieval-check ALL THREE packs. Opened every URL. Default unverified on 404/paywall/mismatch. No git write. No code. No merge. Do not invent STUDY-RK-131.

## Tip stamp (local + gh)
- HEAD == `b24994b` == origin/main · subject `research: stamp STUDY-RK-106 handoff land line` · commit URL HTTP 200.
- `research/STUDY-RK-106/` five files present · `research/STUDY-RK-107/` **absent** · `research/STUDY-RK-131/` **absent**.
- Tip `test/fts.test.ts`: **499** lines · **13** `describe(` blocks · ON MAIN (landed long before 106).
- Tip `src/search/fts.ts`: present (228 lines). `package.json` script `"test": "vitest run"`.
- Open PR file-set union: **zero** paths containing `fts` across #6 #8 #12–#26 #28.
- #13 OPEN head `ce6743a` — `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts` only.
- #14 OPEN head `8fee954` — `test/doctor.test.ts` · `test/feed.test.ts` · `test/table.test.ts` · `test/health-commands.test.ts` only.
- #28 OPEN — `HANDBOOK.md` only (106 leftover docs).
- Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0**.

## Thesis adjudication
Tip already carries the dedicated FTS vitest suite. #13/#14/#28 do not own `fts` paths. Therefore **NEW coding PR: no**; **do not restack #13/#14**. Soft folklore invent tip-lacks-FTS-suite / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Scholar — 8/8 VERIFIED
| # | Verdict | Source | Note |
| --- | --- | --- | --- |
| 1 | VERIFIED | Das, Gary — 2025 — arXiv:2511.02810 · HTTP 200 | Continuous regression rides with the landed suite on main. |
| 2 | VERIFIED | Alégroth, Feldt, Kolström — 2016 — arXiv:1602.01226 · HTTP 200 | Cost is maintaining existing automated suites, not a duplicate track. |
| 3 | VERIFIED | Gu, Mesbah — 2024 — arXiv:2408.13517 · HTTP 200 | Prune redundant cases; do not open parallel covering PRs. |
| 4 | VERIFIED | Ruland, Lochau — 2022 — arXiv:2207.12733 · HTTP 200 | RTS inherits prior suite; do not restack landed FTS onto unrelated open work. |
| 5 | VERIFIED | Wang, Wang, Nie — 2024 — arXiv:2410.21798 · HTTP 200 | CI coverage monitors the suite already on tip. |
| 6 | VERIFIED | Chang et al. — 2022 — arXiv:2210.01661 · HTTP 200 | Parallel testing yields redundancy; detect it rather than invent another FTS vitest PR. |
| 7 | VERIFIED | Santana et al. — 2022 — arXiv:2207.05539 · HTTP 200 | Duplicate Assert is a smell inside the existing suite — not a restack warrant. |
| 8 | VERIFIED | Spieker, Gotlieb, Marijan, Mossige — 2017 — arXiv:1811.04122 · HTTP 200 | CI selects from the existing suite; does not invent a second when coverage lives on main. |

Soft folklore invent gates in Scholar pack: **0**. (Process note: pack word count above 500–600 cap; findings still retrieval-checked.)

## Practitioner — 8/8 VERIFIED
| # | Verdict | Claim check |
| --- | --- | --- |
| 1 | VERIFIED | Commit `b24994b` = origin/main; stamp STUDY-RK-106; research/STUDY-RK-106 five files; STUDY-RK-107 absent. |
| 2 | VERIFIED | `test/fts.test.ts` 499 lines / 13 describe ON MAIN — invent tip-lacks-FTS-suite: fail (correct). |
| 3 | VERIFIED | `src/search/fts.ts` present; vitest run wired in package.json. |
| 4 | VERIFIED | Open set #6 #8 #12–#26 + #28; 🛑 do not merge. |
| 5 | VERIFIED | #13 OPEN `ce6743a` errors/audit only — zero fts; invent restack-#13: fail. |
| 6 | VERIFIED | #14 OPEN `8fee954` doctor/feed/table/health — zero fts; invent restack-#14: fail. |
| 7 | VERIFIED | #28 OPEN HANDBOOK-only — not an FTS coding vehicle. |
| 8 | VERIFIED | Warrant: FTS suite PRESENT on tip → **NEW coding PR: no**; do not restack #13/#14; invent risk-free merge / STUDY-RK-131: fail. |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold VERIFIED · 7–8 Fail-transfer
| # | Verdict | Analog | Note |
| --- | --- | --- | --- |
| 1 | Hold VERIFIED | GitHub status checks · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks · HTTP 200 (redirects to status-checks reference) | Checks prove checked-out tree; tip already has FTS suite. Limit: ≠ invent restack. |
| 2 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · HTTP 200 | Discovery walks tip tree; landed FTS file is membership. Limit: ≠ invent tip-lacks-FTS-suite. |
| 3 | Hold VERIFIED | Kubernetes deprecation policy · https://kubernetes.io/docs/reference/using-api/deprecation-policy/ · HTTP 200 | Authoritative surface present → reaffirm KEEP, no fresh coding debt. Limit: NEW coding PR: no. |
| 4 | Hold VERIFIED | Gauntlet why-tests-miss-bugs · https://gauntletci.com/articles/why-tests-miss-bugs · HTTP 200 | #13/#14 orthogonal modules; absent fts ownership ≠ tip FTS gap. Limit: ≠ invent merge as FTS clearance. |
| 5 | Hold VERIFIED | GitHub about pull requests · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests · HTTP 200 | Each PR owns its file set; restacking FTS into #13/#14 widens unrelated reviews. Limit: ≠ invent risk-free merge. |
| 6 | Hold VERIFIED | SQLite FTS5 · https://www.sqlite.org/fts5.html · HTTP 200 | Tip pairs `src/search/fts.ts` with `test/fts.test.ts`. Limit: ≠ invent second FTS vitest PR. |
| 7 | Fail-transfer | invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge | Correct reject. Soft folklore: 0. |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #13/#14 as FTS authority / Analogist-fake Scholar\|Practitioner | Correct reject. NEW coding PR: no. |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)
| Gate | Count |
| --- | --- |
| invent tip-lacks-FTS-suite | **0** |
| invent restack-#13/#14 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |
| NEW coding PR while FTS suite ON MAIN | **no** (thesis holds) |

## Implications (verified only)
- Tip inventory — `test/fts.test.ts` ON MAIN; open #13/#14/#28 omit fts; no open PR owns fts.
- Study land only · five files under `research/STUDY-RK-107/` · preserve Soft folklore invent 0.
- NEW coding PR: **no**. Do not restack #13/#14 for FTS.
- 🛑 do not merge #6 #8 #12–#28 (includes #28 HANDBOOK leftover).
- Do not invent STUDY-RK-131.

## Land guidance (Builder)
- Study land: copy five files under `research/STUDY-RK-107/` from `/workspace/studio/outbox-STUDY-RK-107/` (pack-scholar · pack-practitioner · pack-analogist · grounding · handoff). Include this scorecard summary in handoff.
- Coding row: **none** for FTS. NEW coding PR: **no**.

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework

Landed five files under research/STUDY-RK-107/ sha=`5c9ab11ef7f52e1619138a3872c791361328339f` tip-before-stamp=`b24994b`.
