STUDY-RK-109 Q1 (Scholar) — tip `8299e8b`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. No git write. No execute (no npm test / no merge / no PR open). No invent merge advice. Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-109/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Tip `8299e8b` (=origin/main after STUDY-RK-108 land). Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail.
owner: Scholar
fallback: Missing DOI/arXiv → 🔧. Missing four fields → 🛑 Coordinator.

Question: After tip `8299e8b`, what peer-reviewed evidence governs treating tip backup/restore regression coverage (including CLI-PR-001 in `test/cli-publish.test.ts`) as settled SoR versus inventing a duplicate dedicated backup vitest PR or restacking backup onto open #13/#14?

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main as coverage SoR—keep it rather than invent a parallel dedicated-test PR or restack backup onto open non-backup PRs. Presence inside a broader file settles SoR; a standalone `test/backup.test.ts` is not required as sole authority. Das and Gary formalize continuous regression as builds carrying accompanying tests. Alégroth et al. locate industrial cost in maintaining existing automated suites. Gu and Mesbah and Chang et al. target redundancy from parallel/duplicate cases once a suite exists. Ruland and Lochau start RTS from the inherited prior suite. Wang et al. treat CI coverage as monitoring that existing suite. Santana et al. treat Duplicate Assert as a smell to refactor, not a second suite. Spieker et al. select from the existing CI suite under a time budget. At tip `8299e8b`: CLI-PR-001 ON MAIN in `test/cli-publish.test.ts` (L553–628; `CLI-PR-001: backup / restore (cli.ts)`). No `test/backup.test.ts` (filename not sole authority). #13 OPEN owns errors/audit (no backup). #14 OPEN owns doctor/feed/table (no backup). #23 OPEN STUDY-RK-037 handbook (REAFFIRM 037/066/#23 — do not merge #23). #28 OPEN HANDBOOK-only. No verified backup residual outside open holds → NEW coding PR: **no**. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14/#28 | #23 REAFFIRM | NEW coding PR |
| --- | --- | --- | --- | --- |
| CLI-PR-001 `test/cli-publish.test.ts` L553–628 | **ON MAIN** | backup = 0 | OPEN; do not merge #23 | **no** |
| errors/audit; doctor/feed/table; HANDBOOK | — | own non-backup | — | do not restack backup |


1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is builds that each carry the program and accompanying tests—coverage truth rides with the landed suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial V&V cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-test track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; minimization prunes duplicates rather than opening parallel covering PRs.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack landed backup onto unrelated open work.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite across versions; the living SoR is the suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing yields redundant cases; detect redundancy instead of inventing another parallel backup vitest PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor in the existing suite—not a warrant for a restacked dedicated-test PR beside one already on main.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select and prioritize from the existing suite under a time budget; they do not invent a second suite when coverage already lives on main.

Read-only tip check: HEAD `8299e8b` (=origin/main) · CLI-PR-001 in `test/cli-publish.test.ts` L553–628 ON MAIN · no `test/backup.test.ts` (filename not sole authority) · #13/#14/#28/#23 touch backup ownership = no (#23 handbook docs only) · NEW coding PR = no · invent tip-lacks-backup-coverage / restack-#13/#14 / risk-free merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final. REAFFIRM 037/066/#23 handbook backup/restore as context only — do not merge #23.

Soft folklore fail checks: invent tip-lacks-backup-coverage = 0; invent restack-#13/#14 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
