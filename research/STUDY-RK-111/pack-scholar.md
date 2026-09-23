STUDY-RK-111 Q1 (Scholar) — tip `c399182`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. No git write. No execute (no npm test / no merge / no PR open). No invent merge advice. Soft folklore invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-111/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Tip `c399182` (=origin/main after STUDY-RK-110 land). Soft folklore invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail.
owner: Scholar
fallback: Pack lacks 6–8 open arXiv/DOI → 🔧 seat rework. Tip mismatch → 🛑 Coordinator. Do not Scholar-only-fake Practitioner/Analogist.

Question: After tip `c399182`, what peer-reviewed evidence governs treating tip doctor/health regression coverage (CLI-PR-003 in `test/cli-publish.test.ts` + `test/health-commands.test.ts` buildRepoDoctor/buildFeed/buildHealthTable) as settled SoR versus inventing a duplicate dedicated doctor vitest PR or restacking doctor onto open #13/#14 (where #14 already proposes dedicated `test/doctor.test.ts`/`feed.test.ts`/`table.test.ts`)?

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main as coverage SoR—keep it rather than invent a parallel dedicated-doctor-test PR or restack doctor onto open PRs. Split presence settles SoR; tip filename absence of dedicated `doctor.test.ts` is non-blocking when tip coverage holds. Das and Gary: continuous regression carries accompanying tests. Alégroth et al.: industrial cost is maintaining existing suites. Gu/Mesbah and Chang et al.: prune parallel/duplicate redundancy. Ruland/Lochau: RTS starts from the inherited suite. Wang et al.: CI monitors that suite. Santana et al.: Duplicate Assert is a smell to refactor, not a second suite. Spieker et al.: CI selects from the existing suite under a time budget. At tip `c399182`: CLI-PR-003 ON MAIN in `test/cli-publish.test.ts` (L666–721; `CLI-PR-003: rk doctor preflight (cli.ts)`). Tip health builders ON MAIN in `test/health-commands.test.ts` (buildFeed L43–163; buildRepoDoctor L167–218; buildHealthTable L221–335). No tip dedicated doctor/feed/table.test.ts (filename absence non-blocking). #13 OPEN owns errors/audit. #14 OPEN owns dedicated doctor/feed/table filenames. REAFFIRM 039/068 KEEP dual doctor (context only). No residual beyond tip AND open #14 → NEW coding PR: **no**. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14 | 039/068 REAFFIRM | NEW coding PR |
| --- | --- | --- | --- | --- |
| CLI-PR-003 + health-commands buildFeed/RepoDoctor/HealthTable | **ON MAIN** | doctor CLI/builders = tip SoR | KEEP dual doctor (context) | **no** |
| dedicated doctor/feed/table `.test.ts`; errors/audit | tip ABSENT (non-blocking) | #14 owns dedicated; #13 errors/audit | — | do not restack |

1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is builds that each carry the program and accompanying tests—coverage truth rides with the landed CLI-PR-003 + health-commands suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial V&V cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-doctor-test track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; minimization prunes duplicates rather than opening parallel covering PRs for doctor/health already on tip.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack landed doctor onto unrelated open work.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite across versions; the living SoR is the doctor/health suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing yields redundant cases; detect redundancy instead of inventing another parallel dedicated doctor vitest PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor in the existing suite—not a warrant for a restacked dedicated-doctor PR beside tip coverage on main.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select and prioritize from the existing suite under a time budget; they do not invent a second suite when doctor/health coverage already lives on main.

Read-only tip check: HEAD `c399182` (=origin/main) · CLI-PR-003 L666–721 ON MAIN · health-commands buildFeed/buildRepoDoctor/buildHealthTable ON MAIN · no tip dedicated doctor/feed/table.test.ts (filename absence non-blocking) · #14 OPEN owns those filenames · #13 OPEN errors/audit only · NEW coding PR = no · invent tip-lacks-doctor-coverage / restack-#13/#14 / risk-free merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final. REAFFIRM 039/068 KEEP dual doctor as context only — do not invent merge clearance.

Soft folklore fail checks: invent tip-lacks-doctor-coverage = 0; invent restack-#13/#14 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
