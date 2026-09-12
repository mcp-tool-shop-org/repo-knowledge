STUDY-RK-016 Q1 · tip `057a5e8` · consumer repo-knowledge

Eight papers, all with arXiv. I did not invent coverage % or STUDY-RK-021.

Context (read-only): `package.json` verify = typecheck ∧ lint ∧ vitest ∧ test:scripts; `test` / `test:coverage` via vitest + `@vitest/coverage-v8`. `src/` layers include cli, mcp/server, db, audit, health, search/fts, sync, games; `test/` holds matching `*.test.ts` files. No coverage numbers invented.

1. PILOT: Command-line Interface Fuzzing via Path-Guided, Iterative Large Language Model Prompting — Shiraishi, Cao, Shinagawa — 2025 — https://arxiv.org/abs/2511.20555 — Call-graph centrality selects CLI targets; coverage feedback redirects after failed trials on hard functions.
2. RESTCov: A Tool for Structural Coverage Analysis of REST APIs — Bardakci, Demeyer — 2026 — https://arxiv.org/abs/2608.28114 — Spec+log structural map (paths/ops/params/status) exposes API test-suite gaps without source instrumentation.
3. SAINT: Service-level Integration Test Generation with Program Analysis and LLM-based Agents — Pan et al. — 2025 — https://arxiv.org/abs/2511.13305 — Endpoint tests prioritize covering database-interaction lines; coverage-augmentation agent iterates toward unreached service code.
4. DBcover: A White-box SQL Test Generation Framework for Coverage Improvement — Rong et al. — 2026 — https://arxiv.org/abs/2608.25573 — SQL-to-path context plus seeds near uncovered functions to raise RDBMS white-box coverage.
5. LLM-Guided Issue Generation from Uncovered Code Segments — Pressato, Tan, Elmoazen, Tan — 2026 — https://arxiv.org/abs/2604.26118 — Localizes uncovered segments from an existing suite as the residual untested surface (even when line % looks high).
6. Characterizing Structural Testability in JavaScript: An Empirical Study — Mirzaei, Alimadadi — 2026 — https://arxiv.org/abs/2607.24965 — Async/event/closure structure impedes JS coverage; Jest-era projects need structural testability beyond line %.
7. A Brief Survey on Oracle-based Test Adequacy Metrics — Hossain, Dwyer — 2022 — https://arxiv.org/abs/2212.06118 — Structural coverage alone misses C3/C4; oracle-based adequacy reframes “covered but unchecked” as a gap class.
8. Ticket Coverage: Putting Test Coverage into Context — Rott, Niedermayr, Juergens, Pagano — 2018 — https://arxiv.org/abs/1804.07599 — Ticket/change-scoped coverage reveals which changed methods remain untested (module-relevant gaps).

Coverage % invented: 0 · STUDY-RK-021 invented: 0

✅
