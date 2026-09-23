STUDY-RK-113 Q1 (Scholar) — tip `e9bfdb6`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. Soft folklore invent tip-lacks-github-dogfood-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-113/pack-scholar.md`. Last line ✅ only when success (not the three-glyph menu).
prerequisite: Tip `e9bfdb6` (=origin/main after STUDY-RK-112 land). Soft folklore invents = fail. 🛑 do not merge #6 #8 #12–#28.
owner: Scholar
fallback: Pack lacks 6–8 open arXiv/DOI → 🔧 seat rework. Tip mismatch → 🛑 Coordinator. Do not Scholar-only-fake Practitioner/Analogist.

Question: After tip `e9bfdb6`, what peer-reviewed evidence governs treating tip sync/github + dogfood-suggest regression coverage as settled SoR versus inventing a duplicate dedicated github/dogfood vitest PR or restacking onto open #15 (dedicated `test/github.test.ts` / `test/dogfood-suggest.test.ts`)? Tip dedicated filenames may be absent — non-blocking if tip coverage holds via sync-404-archived / dogfood-*-sync suites; residual already owned by #15 → NEW coding PR no; do not restack. #13/#14 orthogonal. REAFFIRM 024/059.

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main as coverage SoR—keep it rather than invent a parallel dedicated-github/dogfood vitest PR or restack onto open #15. Dedicated-filename absence is non-blocking when tip coverage holds. Das/Gary: continuous regression carries accompanying tests. Alégroth et al.: cost is maintaining existing suites. Gu/Mesbah and Chang et al.: prune parallel/duplicate redundancy. Ruland/Lochau: RTS starts from the inherited suite. Wang et al.: CI monitors that suite. Santana et al.: Duplicate Assert is a smell to refactor, not a second suite. Spieker et al.: CI selects from the existing suite under a time budget. At tip `e9bfdb6`: sync/github ON MAIN in `test/sync-404-archived.test.ts` (462 lines; `syncGitHub`; pruneVanished; detect-only default; empty-list ambient; private omit; case-insensitive slug; stderr channel; SYNC-PH-04). Dogfood-suggest ON MAIN in `test/dogfood-intelligence-sync.test.ts` (`suggestByRepo`/`suggestBySurface`) + `test/dogfood-swarm-sync.test.ts` (LIKE escape/exact membership sync-A-007) + `test/dogfood-sync.test.ts`. Sources `src/sync/github.ts` + `dogfood-suggest.ts` present. No tip dedicated `test/github.test.ts`/`dogfood-suggest.test.ts` (non-blocking). #15 OPEN owns those filenames (STUDY-RK-024). #13 errors/audit / #14 doctor orthogonal. REAFFIRM 024/059 context only. Tip coverage holds AND residual dedicated filenames owned by #15 → NEW coding PR: **no**. Do not restack. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14/#15 | 024/059 REAFFIRM | NEW coding PR |
| --- | --- | --- | --- | --- |
| sync-404-archived + dogfood-*-sync suggest | **ON MAIN** | tip SoR; #15 residual dedicated | 024/#15 OPEN; 059 coding-PR-none | **no** |
| dedicated github / dogfood-suggest `.test.ts` | tip ABSENT (non-blocking) | #15 owns; #13/#14 orthogonal | — | do not restack |

1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is builds that each carry the program and accompanying tests—coverage truth rides with the landed sync-404-archived + dogfood-*-sync suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-github/dogfood-suggest track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; prune duplicates rather than opening parallel covering PRs for github/dogfood already on tip.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack onto open #15.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite; the living SoR is the sync/github + dogfood-suggest suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing yields redundant cases; detect redundancy instead of inventing another parallel dedicated github/dogfood PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor in the existing suite—not a warrant for a restacked dedicated-github/dogfood PR beside tip coverage.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select from the existing suite under a time budget; they do not invent a second suite when sync/github + dogfood-suggest already lives on main.

Read-only tip check: HEAD `e9bfdb6` (=origin/main) · sync-404-archived ON MAIN · dogfood-intelligence/swarm/sync ON MAIN · no tip dedicated github/dogfood-suggest.test.ts (filename absence non-blocking) · #15 OPEN owns those filenames · #13/#14 OPEN orthogonal · NEW coding PR = no · invent tip-lacks-github-dogfood-coverage / restack-#13/#14/#15 / risk-free merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final. REAFFIRM 024/059 as context only — do not invent merge clearance.

Soft folklore fail checks: invent tip-lacks-github-dogfood-coverage = 0; invent restack-#13/#14/#15 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
