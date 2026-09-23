STUDY-RK-110 Q1 (Scholar) — tip `96b4e42`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. No git write. No execute (no npm test / no merge / no PR open). No invent merge advice. Soft folklore invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-110/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Tip `96b4e42` (=origin/main after STUDY-RK-109 land). Soft folklore invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail.
owner: Scholar
fallback: Missing DOI/arXiv → 🔧. Missing four fields → 🛑 Coordinator.

Question: After tip `96b4e42`, what peer-reviewed evidence governs treating tip CLI-JSON-CORE / --json regression coverage as settled SoR versus inventing a duplicate dedicated json vitest PR or restacking --json onto open #13/#14?

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main as coverage SoR—keep it rather than invent a parallel dedicated-json-test PR or restack --json onto open PRs that do not own CLI-JSON-CORE. Presence inside a broader file settles SoR; a standalone `test/json.test.ts` is not sole authority. Das and Gary: continuous regression carries accompanying tests. Alégroth et al.: industrial cost is maintaining existing suites. Gu/Mesbah and Chang et al.: prune parallel/duplicate redundancy. Ruland/Lochau: RTS starts from the inherited suite. Wang et al.: CI monitors that suite. Santana et al.: Duplicate Assert is a smell to refactor, not a second suite. Spieker et al.: CI selects from the existing suite under a time budget. At tip `96b4e42`: CLI-JSON-CORE ON MAIN in `test/cli-publish.test.ts` (L459–550; `CLI-JSON-CORE: --json output (cli.ts)`). Other tip --json surfaces: backup/restore and doctor asserts in the same file. No `test/json.test.ts` (filename not sole authority). #13 OPEN owns errors/audit (no --json CLI). #14 OPEN owns doctor/feed/table (no CLI-JSON-CORE). #28 OPEN HANDBOOK-only. REAFFIRM 038/067 KEEP dual human+--json (context only). No verified --json residual outside open holds → NEW coding PR: **no**. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14/#28 | 038/067 REAFFIRM | NEW coding PR |
| --- | --- | --- | --- | --- |
| CLI-JSON-CORE `test/cli-publish.test.ts` L459–550 | **ON MAIN** | --json CLI = 0 | KEEP dual human+--json | **no** |
| errors/audit; doctor/feed/table; HANDBOOK | — | own non-CLI-JSON | — | do not restack --json |


1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is builds that each carry the program and accompanying tests—coverage truth rides with the landed CLI-JSON-CORE suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial V&V cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-json-test track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; minimization prunes duplicates rather than opening parallel covering PRs for --json already on tip.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack landed --json onto unrelated open work.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite across versions; the living SoR is the CLI-JSON-CORE suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing yields redundant cases; detect redundancy instead of inventing another parallel dedicated json vitest PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor in the existing suite—not a warrant for a restacked dedicated-json PR beside CLI-JSON-CORE already on main.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select and prioritize from the existing suite under a time budget; they do not invent a second suite when --json coverage already lives on main.

Read-only tip check: HEAD `96b4e42` (=origin/main) · CLI-JSON-CORE in `test/cli-publish.test.ts` L459–550 ON MAIN · no `test/json.test.ts` (filename not sole authority) · #13/#14/#28 touch --json CLI ownership = no · NEW coding PR = no · invent tip-lacks-json-coverage / restack-#13/#14 / risk-free merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final. REAFFIRM 038/067 KEEP dual human+--json as context only — do not invent merge clearance.

Soft folklore fail checks: invent tip-lacks-json-coverage = 0; invent restack-#13/#14 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
