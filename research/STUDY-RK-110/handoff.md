# STUDY-RK-110 handoff (Verifier scorecard + land guidance)

# STUDY-RK-110 Verifier scorecard
Tip `96b4e42` (= `96b4e428a7abfac55fa2aa6050bf224dbafc4bef` = origin/main after STUDY-RK-109 land). Consumer repo-knowledge. Job: `--json` / CLI-JSON-CORE ON MAIN vs open #13/#14 (do not restack).

Retrieval-check ALL THREE packs. Opened every URL. Default unverified on 404/paywall/mismatch. No git write. No code. No merge. Do not invent STUDY-RK-131.

## Tip stamp (local + gh)
- HEAD == `96b4e42` == origin/main · subject `research: stamp STUDY-RK-109 handoff land line` · commit URL HTTP 200.
- `research/STUDY-RK-109/` five files present · `research/STUDY-RK-110/` **absent** · `research/STUDY-RK-131/` **absent**.
- Tip `--json` coverage: `test/cli-publish.test.ts` describe `CLI-JSON-CORE: --json output (cli.ts)` at L459 · 1× `it.skip` + 3 direct `it` + `it.each`×3 not-found + `it.each`×5 read surfaces = **11 live --json cases** · ON MAIN.
- `test/json.test.ts`: **absent** (filename not required; coverage is CLI-JSON-CORE).
- `research/STUDY-RK-038/` and `research/STUDY-RK-067/` five-file trees present (REAFFIRM KEEP dual human+`--json`).
- Open PR `--json` / `cli-publish` / `json.test` path ownership across #13/#14/#23/#28: **0**.
- #13 OPEN head `ce6743a` — errors/audit tests only.
- #14 OPEN head `8fee954` — doctor/feed/table/health only.
- Soft folklore invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0**.

## Thesis adjudication
Tip already carries CLI-JSON-CORE `--json` vitest inside `test/cli-publish.test.ts`. No required standalone `test/json.test.ts`. #13/#14 do not own `--json` test paths. Therefore **NEW coding PR: no**; **do not restack #13/#14**. REAFFIRM 038/067 KEEP dual human+`--json` (context only). Soft folklore invent tip-lacks-json-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Scholar — 8/8 VERIFIED
| # | Verdict | Source | Note |
| --- | --- | --- | --- |
| 1 | VERIFIED | Das, Gary — 2025 — arXiv:2511.02810 · HTTP 200 | Continuous regression rides with the landed CLI-JSON-CORE suite on main. |
| 2 | VERIFIED | Alégroth, Feldt, Kolström — 2016 — arXiv:1602.01226 · HTTP 200 | Cost is maintaining existing automated suites, not a duplicate dedicated-json track. |
| 3 | VERIFIED | Gu, Mesbah — 2024 — arXiv:2408.13517 · HTTP 200 | Prune redundant cases; do not open parallel covering PRs for `--json` already on tip. |
| 4 | VERIFIED | Ruland, Lochau — 2022 — arXiv:2207.12733 · HTTP 200 | RTS inherits prior suite; do not restack landed `--json` onto unrelated open work. |
| 5 | VERIFIED | Wang, Wang, Nie — 2024 — arXiv:2410.21798 · HTTP 200 | CI coverage monitors the suite already on tip. |
| 6 | VERIFIED | Chang et al. — 2022 — arXiv:2210.01661 · HTTP 200 | Detect redundancy rather than invent another dedicated json vitest PR. |
| 7 | VERIFIED | Santana et al. — 2022 — arXiv:2207.05539 · HTTP 200 | Duplicate Assert is a smell inside the existing suite — not a restack warrant. |
| 8 | VERIFIED | Spieker, Gotlieb, Marijan, Mossige — 2017 — arXiv:1811.04122 · HTTP 200 | CI selects from the existing suite; does not invent a second when `--json` coverage lives on main. |

Soft folklore invent gates in Scholar pack: **0**.
**Process flag:** Scholar pack word count **828** exceeds 500–600 cap — flagged; findings still retrieval-checked; do not invent citations.

## Practitioner — 8/8 VERIFIED
| # | Verdict | Claim check |
| --- | --- | --- |
| 1 | VERIFIED | Commit `96b4e42` = origin/main; stamp STUDY-RK-109; research/STUDY-RK-109 five files; STUDY-RK-110 absent. |
| 2 | VERIFIED | `test/cli-publish.test.ts` CLI-JSON-CORE describe ON MAIN (1 skip + 11 live `--json` cases) — invent tip-lacks-json-coverage: fail (correct). |
| 3 | VERIFIED | Related tip `--json` surfaces outside that describe (doctor under CLI-PR-003; colors/cli-async) — coverage not limited to a missing dedicated file. |
| 4 | VERIFIED | `test/json.test.ts` absent and non-blocking; coverage path is cli-publish CLI-JSON-CORE. |
| 5 | VERIFIED | #13 OPEN `ce6743a` errors/audit only; #14 OPEN `8fee954` doctor/feed/table/health — zero `--json` test paths; invent restack: fail. |
| 6 | VERIFIED | Open set #6 #8 #12–#26 + #28; no OPEN PR owns `test/json.test.ts` or CLI-JSON-CORE edits. |
| 7 | VERIFIED | `research/STUDY-RK-038/` + `research/STUDY-RK-067/` present — REAFFIRM KEEP dual human+`--json`. |
| 8 | VERIFIED | Warrant: CLI-JSON-CORE PRESENT on tip → **NEW coding PR: no**; do not restack #13/#14; invent risk-free merge / STUDY-RK-131: fail. |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold VERIFIED · 7–8 Fail-transfer
| # | Verdict | Analog | Note |
| --- | --- | --- | --- |
| 1 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · HTTP 200 | Settled coverage is the landed describe, not a required filename. Limit: ≠ invent mandatory `test/json.test.ts`. |
| 2 | Hold VERIFIED | GitHub status checks · docs.github.com …/about-status-checks · HTTP 200 | Tip checks prove checked-out tree with CLI-JSON-CORE. Limit: ≠ invent restack. |
| 3 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · HTTP 200 | Discovery walks tip tree; CLI-JSON-CORE is membership. Limit: ≠ invent tip-lacks-json-coverage. |
| 4 | Hold VERIFIED | Gauntlet why-tests-miss-bugs · https://gauntletci.com/articles/why-tests-miss-bugs · HTTP 200 | #13/#14 orthogonal modules; absent `--json` ownership ≠ tip gap. Limit: ≠ invent risk-free merge. |
| 5 | Hold VERIFIED | CLIG output · https://clig.dev/#output · HTTP 200 | `--json` is a CLI output contract; embedding CLI-JSON-CORE beside other CLI describes is coherent SoR (REAFFIRM 038/067). Limit: ≠ invent tip gap from missing filename. |
| 6 | Hold VERIFIED | GitHub about pull requests · docs.github.com …/about-pull-requests · HTTP 200 | Each PR owns its file set; restacking `--json` into #13/#14 widens unrelated reviews. Limit: ≠ invent tip gap from missing filename. |
| 7 | Fail-transfer | invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge | Correct reject. Soft folklore: 0. |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #13/#14 as `--json` authority / Analogist-fake Scholar\|Practitioner | Correct reject. NEW coding PR: no. |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)
| Gate | Count |
| --- | --- |
| invent tip-lacks-json-coverage | **0** |
| invent restack-#13/#14 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |
| NEW coding PR while CLI-JSON-CORE ON MAIN | **no** (thesis holds) |

## Implications (verified only)
- Tip inventory — CLI-JSON-CORE ON MAIN in `test/cli-publish.test.ts` (11 live `--json` cases); open #13/#14 omit `--json` test paths; no open PR owns json vitest.
- Study land only · five files under `research/STUDY-RK-110/` · preserve Soft folklore invent 0 · flag Scholar word-count overage.
- NEW coding PR: **no**. Do not restack #13/#14 for `--json`.
- REAFFIRM 038/067 KEEP dual human+`--json` (context only).
- 🛑 do not merge #6 #8 #12–#28.
- Do not invent STUDY-RK-131.

## Land guidance (Builder)
- Study land: copy five files under `research/STUDY-RK-110/` from `/workspace/studio/outbox-STUDY-RK-110/` (pack-scholar · pack-practitioner · pack-analogist · grounding · handoff). Include this scorecard summary in handoff.
- Coding row: **none** for `--json` / CLI-JSON-CORE. NEW coding PR: **no**.

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework
