STUDY-RK-023 Q1 (Scholar) — tip `55fcc39`. stop: dedicated tests for health doctor/feed/table-style CLI (suite-green ≠ module adequacy; probe vs deep-dive vs portfolio). Eight papers, all arXiv. Invented coverage %: 0. Invented STUDY-RK-051: 0. Word count ~580.

1. Making Deployments Safe at Meta: Health Checks for Continuous Change-Safety — KL, Korenkov, Thakore, Hegre, 2026 — https://arxiv.org/abs/2608.20513 — Deployment-time health checks are a dedicated prevention surface with per-service probes and verdicts; adequacy is judged per check, not by an unrelated suite going green.

2. ClusterBench: A Framework for Cluster-Wide Continuous Benchmarking and Regression Testing — Ujeniya, Eitzinger, Gruber, Hager, Wellein, 2026 — https://arxiv.org/abs/2608.10956 — Separates component-level benchmark collections from cluster-wide continuous rollups, aligning with probe vs portfolio diagnostic layers.

3. SWE-Doctor: Guiding Software Engineering Agents with Runtime Diagnosis from Multi-Faceted Bug Reproduction Tests — Guo, Liu, Zhang, Ma, Lou, Chen, 2026 — https://arxiv.org/abs/2607.00990 — Multi-faceted reproduction tests supply runtime diagnosis signals; each facet needs its own dedicated cases rather than one aggregate pass/fail.

4. AOI: Turning Failed Trajectories into Training Signals for Autonomous Cloud Diagnosis — Yang, Chen, Zheng, Li, Li, Tu, Xiao, 2026 — https://arxiv.org/abs/2603.03378 — Read-write separation splits observation/diagnosis trajectories from mutating actions, matching DB-read doctor/feed/table vs write-path fsck contracts.

5. Test Coverage Analysis of Agentic Pull Requests — Dipongkor, Baral, Lam, Moran, 2026 — https://arxiv.org/abs/2607.18057 — Agentic PRs can look suite-green while still lacking adequate tests for the modules they change; coverage analysis is not module-dedicated adequacy.

6. Beyond Coverage and Kill Scores: Empirically Measuring Test Suite Behavioural Gaps — Paul, Holmes, 2026 — https://arxiv.org/abs/2606.10417 — Coverage and mutation scores are implementation-centric and miss behavioural gaps on expected CLI-facing behaviour; dedicated behavioural cases are required.

7. LLM-Guided Issue Generation from Uncovered Code Segments — Pressato, Tan, Elmoazen, Tan, 2026 — https://arxiv.org/abs/2604.26118 — Uncovered segments of layered surfaces remain invisible under aggregate suite success; they need targeted tests, not reliance on suite-green alone.

8. Ticket Coverage: Putting Test Coverage into Context — Rott, Niedermayr, Juergens, Pagano, 2018 — https://arxiv.org/abs/1804.07599 — Aggregate coverage hides untested changed methods in a ticket/context; contextual coverage is the analogue of dedicated suites for doctor/feed/table.

Read-only context: `src/health/{doctor,feed,table,fsck,diff,index}.ts`; `test/health-commands.test.ts` seeds buildFeed/buildRepoDoctor/buildHealthTable; STUDY-RK-009 (DB-only reads; fsck writes); STUDY-RK-016 named gap (dedicated vitest for doctor/feed/table via health-commands). No git. No execute. No coverage % invented.

✅
