# STUDY-RK-109 handoff (Verifier scorecard + land guidance)

# STUDY-RK-109 Verifier scorecard
Tip `8299e8b` (= `8299e8b68c54e1c2ab3c0d9bf9c38af307e58988` = origin/main after STUDY-RK-108 land). Consumer repo-knowledge. Job: backup/restore coverage ON MAIN (CLI-PR-001 in `test/cli-publish.test.ts`) vs open #13/#14 (do not restack).

Retrieval-check ALL THREE packs. Opened every URL. Default unverified on 404/paywall/mismatch. No git write. No code. No merge. Do not invent STUDY-RK-131.

## Tip stamp (local + gh)
- HEAD == `8299e8b` == origin/main · subject `research: stamp STUDY-RK-108 handoff land line` · commit URL HTTP 200.
- `research/STUDY-RK-108/` five files present · `research/STUDY-RK-109/` **absent** · `research/STUDY-RK-131/` **absent**.
- Tip backup/restore coverage: `test/cli-publish.test.ts` describe `CLI-PR-001: backup / restore (cli.ts)` at L560 · 1× `it.skip` + 2× live `it` (round-trip; newer-schema refuse) · comment block from L553 · ON MAIN.
- Tip CLI: `src/cli.ts` registers `.command('backup')` (L2471) and `.command('restore <path>')` (L2516).
- `test/backup.test.ts`: **absent** (filename not required; coverage is CLI-PR-001).
- Open PR backup/restore **test** path ownership across #13/#14/#23/#28: **0**.
- #13 OPEN head `ce6743a` — errors/audit tests only.
- #14 OPEN head `8fee954` — doctor/feed/table/health only.
- #23 OPEN head `d56c5ed` — `CHANGELOG.md` + `site/src/content/docs/handbook/operations.md` only (REAFFIRM 037/066; **do not merge #23**).
- #28 OPEN head `c323e8f` — `HANDBOOK.md` only (106 leftover docs; not backup vitest vehicle).
- Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0**.

## Thesis adjudication
Tip already carries CLI-PR-001 backup/restore vitest inside `test/cli-publish.test.ts`. No required standalone `test/backup.test.ts`. #13/#14/#23/#28 do not own backup test paths (#23/#28 docs only). Therefore **NEW coding PR: no**; **do not restack #13/#14**. REAFFIRM 037/066/#23 context only — **do not merge #23**. Soft folklore invent tip-lacks-backup-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Scholar — 8/8 VERIFIED
| # | Verdict | Source | Note |
| --- | --- | --- | --- |
| 1 | VERIFIED | Das, Gary — 2025 — arXiv:2511.02810 · HTTP 200 | Continuous regression rides with the landed suite on main (CLI-PR-001). |
| 2 | VERIFIED | Alégroth, Feldt, Kolström — 2016 — arXiv:1602.01226 · HTTP 200 | Cost is maintaining existing automated suites, not a duplicate dedicated-test track. |
| 3 | VERIFIED | Gu, Mesbah — 2024 — arXiv:2408.13517 · HTTP 200 | Prune redundant cases; do not open parallel covering PRs. |
| 4 | VERIFIED | Ruland, Lochau — 2022 — arXiv:2207.12733 · HTTP 200 | RTS inherits prior suite; do not restack landed backup onto unrelated open work. |
| 5 | VERIFIED | Wang, Wang, Nie — 2024 — arXiv:2410.21798 · HTTP 200 | CI coverage monitors the suite already on tip. |
| 6 | VERIFIED | Chang et al. — 2022 — arXiv:2210.01661 · HTTP 200 | Detect redundancy rather than invent another backup vitest PR. |
| 7 | VERIFIED | Santana et al. — 2022 — arXiv:2207.05539 · HTTP 200 | Duplicate Assert is a smell inside the existing suite — not a restack warrant. |
| 8 | VERIFIED | Spieker, Gotlieb, Marijan, Mossige — 2017 — arXiv:1811.04122 · HTTP 200 | CI selects from the existing suite; does not invent a second when coverage lives on main. |

Soft folklore invent gates in Scholar pack: **0**.
**Process flag:** Scholar pack word count **834** exceeds 500–600 cap — flagged; findings still retrieval-checked; do not invent citations.

## Practitioner — 8/8 VERIFIED
| # | Verdict | Claim check |
| --- | --- | --- |
| 1 | VERIFIED | Commit `8299e8b` = origin/main; stamp STUDY-RK-108; research/STUDY-RK-108 five files; STUDY-RK-109 absent. |
| 2 | VERIFIED | `src/cli.ts` registers `backup` + `restore <path>` on tip. |
| 3 | VERIFIED | `test/cli-publish.test.ts` CLI-PR-001 describe ON MAIN (1 skip + 2 live) — invent tip-lacks-backup-coverage: fail (correct). |
| 4 | VERIFIED | `test/backup.test.ts` absent and non-blocking; coverage path is cli-publish CLI-PR-001. |
| 5 | VERIFIED | #13 OPEN `ce6743a` errors/audit only; #14 OPEN `8fee954` doctor/feed/table/health — zero backup test paths; invent restack: fail. |
| 6 | VERIFIED | #23 OPEN `d56c5ed` docs-only (CHANGELOG + handbook operations) — REAFFIRM 037/066; do not merge #23. |
| 7 | VERIFIED | #28 OPEN `c323e8f` HANDBOOK-only — no backup test path. |
| 8 | VERIFIED | Warrant: CLI-PR-001 PRESENT on tip → **NEW coding PR: no**; do not restack #13/#14; invent risk-free merge / STUDY-RK-131: fail. |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold VERIFIED · 7–8 Fail-transfer
| # | Verdict | Analog | Note |
| --- | --- | --- | --- |
| 1 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · HTTP 200 | Settled coverage is the landed describe, not a required filename. Limit: ≠ invent mandatory `test/backup.test.ts`. |
| 2 | Hold VERIFIED | GitHub status checks · docs.github.com …/about-status-checks · HTTP 200 | Tip checks prove checked-out tree with CLI-PR-001. Limit: ≠ invent restack. |
| 3 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · HTTP 200 | Discovery walks tip tree; CLI-PR-001 is membership. Limit: ≠ invent tip-lacks-backup-coverage. |
| 4 | Hold VERIFIED | Gauntlet why-tests-miss-bugs · https://gauntletci.com/articles/why-tests-miss-bugs · HTTP 200 | #13/#14 orthogonal modules; absent backup ownership ≠ tip gap. Limit: ≠ invent risk-free merge. |
| 5 | Hold VERIFIED | Diátaxis · https://diataxis.fr/ · HTTP 200 | #23 handbook how-to ≠ test SoR; tip CLI-PR-001 already protects CLI. Limit: ≠ invent merge #23 as test clearance. |
| 6 | Hold VERIFIED | GitHub about pull requests · docs.github.com …/about-pull-requests · HTTP 200 | Each PR owns its file set; restacking backup into #13/#14 widens unrelated reviews. Limit: ≠ invent tip gap from missing filename. |
| 7 | Fail-transfer | invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge | Correct reject. Soft folklore: 0. |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #13/#14 as backup authority / Analogist-fake Scholar\|Practitioner | Correct reject. NEW coding PR: no. |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)
| Gate | Count |
| --- | --- |
| invent tip-lacks-backup-coverage | **0** |
| invent restack-#13/#14 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |
| NEW coding PR while CLI-PR-001 ON MAIN | **no** (thesis holds) |

## Implications (verified only)
- Tip inventory — CLI-PR-001 ON MAIN in `test/cli-publish.test.ts`; open #13/#14/#23/#28 omit backup test paths; no open PR owns backup vitest.
- Study land only · five files under `research/STUDY-RK-109/` · preserve Soft folklore invent 0 · flag Scholar word-count overage.
- NEW coding PR: **no**. Do not restack #13/#14 for backup.
- REAFFIRM 037/066/#23 context only — **do not merge #23**.
- 🛑 do not merge #6 #8 #12–#28 (includes #28 HANDBOOK leftover).
- Do not invent STUDY-RK-131.

## Land guidance (Builder)
- Study land: copy five files under `research/STUDY-RK-109/` from `/workspace/studio/outbox-STUDY-RK-109/` (pack-scholar · pack-practitioner · pack-analogist · grounding · handoff). Include this scorecard summary in handoff.
- Coding row: **none** for backup/restore. NEW coding PR: **no**.

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework

Landed five files under research/STUDY-RK-109/ sha=`96cf8c47116335371f59867da4ae8ca5ff1b46db` tip-before-stamp=`8299e8b`.
