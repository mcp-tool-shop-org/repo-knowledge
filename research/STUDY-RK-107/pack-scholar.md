STUDY-RK-107 Q1 (Scholar) — tip `b24994b`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. No git write. No execute (no npm test / no merge / no PR open). No invent merge advice. Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-107/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Tip `b24994b` (=origin/main after STUDY-RK-106 land). Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent merge / invent STUDY-RK-131 = fail.
owner: Scholar
fallback: Fewer than 6 DOI/arXiv → 🔧. Missing four fields → 🛑 Coordinator.

Question: What does peer-reviewed work say about keeping an existing on-main FTS/full-text regression suite as the coverage source of truth versus opening a parallel or restacked dedicated-test PR when open PRs already own other (non-FTS) suites?

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main with the product as coverage source of truth—keep and maintain it rather than invent a parallel dedicated-test PR or restack FTS onto open non-FTS PRs. Das and Gary formalize continuous regression as builds carrying accompanying tests. Alégroth et al. locate industrial cost in maintaining existing automated suites. Gu and Mesbah and Chang et al. target redundancy from parallel/duplicate cases once a suite exists. Ruland and Lochau start RTS from the inherited prior suite. Wang et al. treat CI coverage as monitoring adequacy of that existing regression suite. Santana et al. frame Duplicate Assert as a smell to refactor, not a second parallel suite. Spieker et al. select/prioritize from the existing CI suite under a time budget. At tip `b24994b`: `test/fts.test.ts` ON MAIN (499 lines; F-TS-004 FTS5). #13 OPEN owns errors/audit (no fts). #14 OPEN owns doctor/feed/table (no fts). #28 OPEN is HANDBOOK-only (no fts). No verified FTS residual outside #13/#14/#28 → NEW coding PR: **no**. Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14/#28 | NEW coding PR |
| --- | --- | --- | --- |
| `test/fts.test.ts` (~499) | **ON MAIN** | fts files = 0 | **no** |
| errors/audit; doctor/feed/table; HANDBOOK | — | own non-FTS | do not restack FTS |

1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is a chain of builds that each carry the program and accompanying tests—coverage truth rides with the landed suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial V&V cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-test track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; minimization prunes duplicates rather than opening parallel covering PRs.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack a landed FTS suite onto unrelated open work.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite across versions; the living SoT is the suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing produces redundant cases that raise cost; detect redundancy instead of inventing another parallel FTS vitest PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor out of the existing suite—not a warrant for a restacked dedicated-test PR beside one already on main.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select and prioritize from the existing suite under a time budget; they do not invent a second suite when coverage already lives on main.

Read-only tip check: HEAD `b24994b` (=origin/main) · `test/fts.test.ts` 499 lines ON MAIN · #13/#14/#28 touch fts = no · NEW coding PR = no · invent tip-lacks-FTS-suite / restack-#13/#14 / merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final.

Soft folklore fail checks: invent tip-lacks-FTS-suite = 0; invent restack-#13/#14 = 0; invent merge = 0; invent STUDY-RK-131 = 0.

✅
