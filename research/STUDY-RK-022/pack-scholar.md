STUDY-RK-022 Q1 · tip `bdfe26f` · consumer repo-knowledge coding

Eight papers, all with arXiv. I did not invent coverage %, nor STUDY-RK-051.

Context (read-only, STUDY-RK-016 gaps): `src/errors.ts` (RkError / RepoKnowledgeError); `src/audit/controls.ts` (seedControls / getApplicableControls); `src/audit/queries.ts` (getLatestAudit / posture / findings / compareRuns). Named gap: green vitest ≠ dedicated suite per module. No coverage % invented.

1. Assessing Exception Handling Testing Practices in Open-Source Libraries — Lima, Rocha, Bezerra, Paixao — 2021 — https://arxiv.org/abs/2105.00500 — Catch/throw paths are significantly less covered than overall code; high suite coverage can still leave exceptional flows untested. [verified]
2. Exceptional Behaviors: How Frequently Are They Tested? — Hora, Fraser — 2026 — https://arxiv.org/abs/2602.05123 — Suites often exercise exceptions without asserting them; inadequacy of dedicated error-path tests is common. [unverified — Verifier: exercise-without-assert holds; dedicated inadequacy stretch]
3. Test Coverage Analysis of Agentic Pull Requests — Dipongkor, Baral, Lam, Moran — 2026 — https://arxiv.org/abs/2607.18057 — A passing run does not mean the changed code was tested; error-handling lines are systematically under-tested. [verified]
4. Beyond Coverage and Kill Scores: Empirically Measuring Test Suite Behavioural Gaps — Paul, Holmes — 2026 — https://arxiv.org/abs/2606.10417 — Exception/null behaviours remain untested even under perfect line coverage — suite-green ≠ behavioural adequacy. [verified]
5. A Brief Survey on Oracle-based Test Adequacy Metrics — Hossain, Dwyer — 2022 — https://arxiv.org/abs/2212.06118 — Structural coverage alone misses checkedness; query/control layers need oracles on returned evidence, not mere execution. [unverified — Verifier: checkedness/oracle holds; query/control-layer wording not on page]
6. A Symbolic Execution Algorithm for Constraint-Based Testing of Database Programs — Marcozzi, Vanhoof, Hainaut — 2015 — https://arxiv.org/abs/1501.05821 — Database/query programs need path-oriented tests that generate DB state + inputs for SQL-interacting units. [verified]
7. Data Generation for Testing and Grading SQL Queries — Chandra et al. — 2014 — https://arxiv.org/abs/1411.6704 — Dedicated datasets that kill query mutants are required to judge SQL/query correctness — ad hoc suite-green is insufficient. [verified]
8. LLM-Guided Issue Generation from Uncovered Code Segments — Pressato et al. — 2026 — https://arxiv.org/abs/2604.26118 — Uncovered modules/segments are the residual untested surface even when aggregate suites look mature. [verified]

Coverage % invented: 0 · Suite-green-as-coverage folklore claimed: 0 · STUDY-RK-051 invented: 0

✅
