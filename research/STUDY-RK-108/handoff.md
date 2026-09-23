# STUDY-RK-108 handoff (Verifier scorecard + land guidance)

# STUDY-RK-108 Verifier scorecard
Tip `046fae3` (= `046fae3e7e9c7bb2702afaefdef16e8e25adad5a` = origin/main after STUDY-RK-107 land). Consumer repo-knowledge. Job: classify dedicated vitest ON MAIN vs open #13/#14 (do not restack).

Retrieval-check ALL THREE packs. Opened every URL. Default unverified on 404/paywall/mismatch. No git write. No code. No merge. Do not invent STUDY-RK-131.

## Tip stamp (local + gh)
- HEAD == `046fae3` == origin/main · subject `research: stamp STUDY-RK-107 handoff land line` · commit URL HTTP 200.
- `research/STUDY-RK-107/` five files present · `research/STUDY-RK-108/` **absent** · `research/STUDY-RK-131/` **absent**.
- Tip `test/classify.test.ts`: **101** lines · **1** `describe` · **8** `it` · ON MAIN · subject `setRepoClassification`.
- Tip writer: `src/db/init.ts` exports `setRepoClassification` · `REPO_STATUSES` · `REPO_CATEGORIES` (suite imports match).
- Open PR file-set union: **zero** paths containing `classify` across #6 #8 #12–#26 #28.
- #13 OPEN head `ce6743a` — errors/audit only (zero classify).
- #14 OPEN head `8fee954` — doctor/feed/table/health only (zero classify).
- #22 OPEN head `863e7fd` — `test/cli-note-delete.test.ts` only (STUDY-RK-035 context; **do not merge #22**).
- #28 OPEN head `c323e8f` — `HANDBOOK.md` only (106 leftover docs; not classify vehicle).
- Soft folklore invent tip-lacks-classify-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0**.

## Thesis adjudication
Tip already carries the dedicated classify vitest suite. #13/#14/#22/#28 do not own `classify` paths. Therefore **NEW coding PR: no**; **do not restack #13/#14**. REAFFIRM 035/065/#22 as context only — **do not merge #22**. Soft folklore invent tip-lacks-classify-suite / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Scholar — 8/8 VERIFIED
| # | Verdict | Source | Note |
| --- | --- | --- | --- |
| 1 | VERIFIED | Das, Gary — 2025 — arXiv:2511.02810 · HTTP 200 | Continuous regression rides with the landed suite on main. |
| 2 | VERIFIED | Alégroth, Feldt, Kolström — 2016 — arXiv:1602.01226 · HTTP 200 | Cost is maintaining existing automated suites, not a duplicate track. |
| 3 | VERIFIED | Gu, Mesbah — 2024 — arXiv:2408.13517 · HTTP 200 | Prune redundant cases; do not open parallel covering PRs. |
| 4 | VERIFIED | Ruland, Lochau — 2022 — arXiv:2207.12733 · HTTP 200 | RTS inherits prior suite; do not restack landed classify onto unrelated open work. |
| 5 | VERIFIED | Wang, Wang, Nie — 2024 — arXiv:2410.21798 · HTTP 200 | CI coverage monitors the suite already on tip. |
| 6 | VERIFIED | Chang et al. — 2022 — arXiv:2210.01661 · HTTP 200 | Parallel testing yields redundancy; detect it rather than invent another classify vitest PR. |
| 7 | VERIFIED | Santana et al. — 2022 — arXiv:2207.05539 · HTTP 200 | Duplicate Assert is a smell inside the existing suite — not a restack warrant. |
| 8 | VERIFIED | Spieker, Gotlieb, Marijan, Mossige — 2017 — arXiv:1811.04122 · HTTP 200 | CI selects from the existing suite; does not invent a second when coverage lives on main. |

Soft folklore invent gates in Scholar pack: **0**.
**Process flag:** Scholar pack word count **831** exceeds 500–600 cap — flagged; findings still retrieval-checked; do not invent citations.

## Practitioner — 8/8 VERIFIED
| # | Verdict | Claim check |
| --- | --- | --- |
| 1 | VERIFIED | Commit `046fae3` = origin/main; stamp STUDY-RK-107; research/STUDY-RK-107 five files; STUDY-RK-108 absent. |
| 2 | VERIFIED | `test/classify.test.ts` 101 lines / 1 describe / 8 it ON MAIN — invent tip-lacks-classify-suite: fail (correct). |
| 3 | VERIFIED | `src/db/init.ts` exports `setRepoClassification` + enum constants; vitest wired. |
| 4 | VERIFIED | Open set #6 #8 #12–#26 + #28; 🛑 do not merge. |
| 5 | VERIFIED | #13 OPEN `ce6743a` errors/audit only — zero classify; invent restack-#13: fail. |
| 6 | VERIFIED | #14 OPEN `8fee954` doctor/feed/table/health — zero classify; invent restack-#14: fail. |
| 7 | VERIFIED | #22 OPEN note-delete CLI only (KEEP OPEN / do not merge); #28 OPEN HANDBOOK-only — neither owns classify. |
| 8 | VERIFIED | Warrant: classify suite PRESENT on tip → **NEW coding PR: no**; do not restack #13/#14; invent risk-free merge / STUDY-RK-131: fail. |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold VERIFIED · 7–8 Fail-transfer
| # | Verdict | Analog | Note |
| --- | --- | --- | --- |
| 1 | Hold VERIFIED | GitHub status checks · docs.github.com …/about-status-checks · HTTP 200 | Checks prove checked-out tree; tip already has classify suite. Limit: ≠ invent restack. |
| 2 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · HTTP 200 | Discovery walks tip tree; landed classify file is membership. Limit: ≠ invent tip-lacks-classify-suite. |
| 3 | Hold VERIFIED | Kubernetes deprecation policy · https://kubernetes.io/docs/reference/using-api/deprecation-policy/ · HTTP 200 | Authoritative surface present → reaffirm KEEP. Limit: NEW coding PR: no. |
| 4 | Hold VERIFIED | Gauntlet why-tests-miss-bugs · https://gauntletci.com/articles/why-tests-miss-bugs · HTTP 200 | #13/#14 orthogonal modules; absent classify ownership ≠ tip gap. Limit: ≠ invent merge as classify clearance. |
| 5 | Hold VERIFIED | GitHub about pull requests · docs.github.com …/about-pull-requests · HTTP 200 | Each PR owns its file set; restacking classify into #13/#14 widens unrelated reviews. Limit: ≠ invent risk-free merge. |
| 6 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · HTTP 200 | Runner picks up tip `test/classify.test.ts` without open-PR heads. Limit: ≠ invent second classify suite PR. |
| 7 | Fail-transfer | invent tip-lacks-classify-suite / invent restack-#13/#14 / invent risk-free merge | Correct reject. Soft folklore: 0. |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #13/#14 as classify authority / Analogist-fake Scholar\|Practitioner | Correct reject. NEW coding PR: no. |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)
| Gate | Count |
| --- | --- |
| invent tip-lacks-classify-suite | **0** |
| invent restack-#13/#14 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |
| NEW coding PR while classify suite ON MAIN | **no** (thesis holds) |

## Implications (verified only)
- Tip inventory — `test/classify.test.ts` ON MAIN; open #13/#14/#22/#28 omit classify; no open PR owns classify.
- Study land only · five files under `research/STUDY-RK-108/` · preserve Soft folklore invent 0 · flag Scholar word-count overage.
- NEW coding PR: **no**. Do not restack #13/#14 for classify.
- REAFFIRM 035/065/#22 context only — **do not merge #22**.
- 🛑 do not merge #6 #8 #12–#28 (includes #28 HANDBOOK leftover).
- Do not invent STUDY-RK-131.

## Land guidance (Builder)
- Study land: copy five files under `research/STUDY-RK-108/` from `/workspace/studio/outbox-STUDY-RK-108/` (pack-scholar · pack-practitioner · pack-analogist · grounding · handoff). Include this scorecard summary in handoff.
- Coding row: **none** for classify. NEW coding PR: **no**.

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework
