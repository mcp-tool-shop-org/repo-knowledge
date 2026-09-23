STUDY-RK-103 Q1 (Scholar) — tip `e50aeeb`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL, one-sentence finding each. Papers/arXiv/DOI only. No git write. No execute. No merge. Soft folklore invent merge / invent green⇒merge / invent STUDY-RK-131 = fail. Stage `/workspace/studio/outbox-STUDY-RK-103/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Tip `e50aeeb`. Job: one-page CI red/green for each open PR #6 #8 #12–#26. No merge. Open holds stay OPEN.
owner: Scholar
fallback: Fewer than 6 DOI/arXiv → 🔧. Missing four fields → 🛑 Coordinator.

Question: What does peer-reviewed work say about treating continuous-integration status (red/green/pending) on open pull requests as board evidence without treating green as merge authority?

Answer: Peer-reviewed CI work treats open-PR build status as board evidence — a quality/review signal — and refuses green-as-merge authority. GitHub/Travis studies link CI to PR productivity and cast checks as a silent helper for reviewers, not an autopilot merge. Flaky-test and CI-misuse papers show red/green can be wrong or misleading; continuous-delivery work separates a green pipeline from deployment authority. For STUDY-RK-103: inventory GREEN/RED/PENDING/NONE beside mergeability; keep open holds OPEN; do not invent merge or invent green⇒merge. Tip `e50aeeb`. Eight Crossref/arXiv-verified papers. Soft folklore invent merge / invent green⇒merge / invent STUDY-RK-131: 0.

CI board (tip `e50aeeb`; statusCheckRollup + mergeable; no merge; open holds stay OPEN):

| PR | CI | mergeable | note |
|---|---|---|---|
| #6 | GREEN | CONFLICTING | SUCCESS×2; green ≠ mergeable |
| #8 | RED | MERGEABLE | Node22 FAILURE; Node20 CANCELLED |
| #12 #16 #18 #19 #20 #21 #23 #24 #25 | NONE | MERGEABLE | empty rollup; absence ≠ green |
| #13 #14 #15 #17 #22 #26 | GREEN | MERGEABLE | head SUCCESS; #26 Pages SKIPPED |

Counts: GREEN 7 · RED 1 · NONE 9 · PENDING 0. Document colors; do not invent merge. Open #6 #8 #12–#26 stay OPEN.

1. Usage, costs, and benefits of continuous integration in open-source projects — Michael Hilton, Timothy Tunnell, Kai Huang, Darko Marinov, Danny Dig — 2016 — https://doi.org/10.1145/2970276.2970358 — CI build outcomes are tracked as cost/quality board signals; green is not framed as automatic merge authority.

2. Quality and productivity outcomes relating to continuous integration in GitHub — Bogdan Vasilescu, Yue Yu, Huaimin Wang, Premkumar Devanbu, Vladimir Filkov — 2015 — https://doi.org/10.1145/2786805.2786850 — Travis CI raises pull-request productivity without replacing human acceptance with green-check merge rules.

3. Continuous integration in a social-coding world: Empirical evidence from GitHub — Bogdan Vasilescu, Stef van Schuylenburg, Jules Wulms, Alexander Serebrenik, Mark G. J. van den Brand — 2015 — https://arxiv.org/abs/1512.01862 — PR builds fail more than push builds, so CI status remains evidence needing review rather than green-as-merge.

4. The Silent Helper: The Impact of Continuous Integration on Code Reviews — Nathan Cassee, Bogdan Vasilescu, Alexander Serebrenik — 2020 — https://doi.org/10.1109/SANER48275.2020.9054818 — CI is a silent helper for reviewers; status informs discussion and does not enact merge.

5. Measuring the cost of regression testing in practice: a study of Java projects using continuous integration — Adriaan Labuschagne, Laura Inozemtseva, Reid Holmes — 2017 — https://doi.org/10.1145/3106237.3106288 — About 13% of CI test failures are flaky, so red/green cells are noisy evidence and cannot be sole merge authority.

6. An empirical analysis of flaky tests — Qingzhou Luo, Farah Hariri, Lamyaa Eloussi, Darko Marinov — 2014 — https://doi.org/10.1145/2635868.2635920 — Flaky tests create false failures and false confidence, blocking folklore that one green rollup clears merge.

7. An Empirical Study of Architecting for Continuous Delivery and Deployment — Mojtaba Shahin, Mansooreh Zahedi, Muhammad Ali Babar, Liming Zhu — 2018 — https://arxiv.org/abs/1808.08796 — Continuous delivery readiness differs from continuous deployment; green pipelines support release decisions without automatic deploy/merge authority.

8. Use and Misuse of Continuous Integration Features: An Empirical Study of Projects That (Mis)Use Travis CI — Keheliya Gallaba, Shane McIntosh — 2020 — https://doi.org/10.1109/TSE.2018.2838131 — CI feature misuse can mislead status checks, so boards need human ownership of red/green/pending rather than invent green⇒merge.

Read-only tip check: HEAD `e50aeeb` · open #6 CONFLICTING GREEN · #8 MERGEABLE RED · #12–#26 OPEN · GREEN 7 / RED 1 / NONE 9 · invent merge: no · invent green⇒merge: no · invent STUDY-RK-131: no. No git write. No execute. No merge. No implications as final.

Soft folklore fail checks: invent merge = 0; invent green⇒merge = 0; invent STUDY-RK-131 = 0.

✅
