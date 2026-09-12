STUDY-RK-025 Q1 (Scholar) — tip `1dd8cb6`. stop: documentation drift / API surface inventory mismatch (stated inventory vs implementation; docs as contract). Eight papers, all arXiv. Invented MCP tool names/counts: 0. Invented STUDY-RK-051: 0. Word count ~580.

1. APISENSOR: Robust Discovery of Web API from Runtime Traffic Logs — Yang, Zhong, Han, Cheng, Xu, Zhou, et al., 2026 — https://arxiv.org/abs/2603.23852 — Rapid evolution yields incomplete/inconsistent API docs; runtime discovery finds callable interfaces missing from the documented inventory (shadow / out-of-sync reference).

2. RESTCov: A Tool for Structural Coverage Analysis of REST APIs — Bardakci, Demeyer, 2026 — https://arxiv.org/abs/2608.28114 — Traffic unmatched to an OpenAPI inventory signals specification–implementation drift (undocumented or changed operations), so stated surface counts cannot be trusted without reconciliation.

3. You Can REST Now: Automated REST API Documentation and Testing via LLM-Assisted Request Mutations — Decrop, Devroey, Papadakis, Schobbens, Perrouin, 2024 — https://arxiv.org/abs/2402.05102 — Published API docs are often incomplete, inaccessible, or outdated; inferred OAS exposes routes/parameters omitted from the stated documentation surface.

4. CASCADE: Detecting Inconsistencies between Code and Documentation with Automatic Test Generation — Kiecker, Sparka, Reuter, Ziegler, Grunske, 2026 — https://arxiv.org/abs/2604.19400 — Code–doc mismatches confuse API users and raise maintenance cost; evidence-gated detection treats inventory/behaviour divergence as actionable, not free.

5. READU: Inconsistency-Driven Just-in-Time Detection and Repair of README Bugs — Baek, Krampf, Pradel, 2026 — https://arxiv.org/abs/2607.15780 — Classes include implementation–documentation drift and missing API/feature documentation when the stated surface under-reports what the code exposes.

6. DocPrism: Multi-lingual Detection of Incorrectness Inconsistencies between Code and Documentation — Xu, Wahab, Holmes, Lemieux, 2025 — https://arxiv.org/abs/2511.00215 — Over-promise and direct mismatches between documented behaviour and code are incorrectness defects — handbook inventory claims vs implementation are first-class.

7. Detecting Outdated Code Element References in Software Repository Documentation — Tan, Wagner, Treude, 2022 — https://arxiv.org/abs/2212.01479 — Docs go stale silently after surface change; outdated README/wiki references survive with no crash, so inventory drift persists until detected.

8. Towards identifying and minimizing customer-facing documentation debt — Silva, Unterkalmsteiner, Wnuk, 2024 — https://arxiv.org/abs/2402.11048 — Customer-facing defects concentrate in incorrect/outdated/incomplete docs; lack of doc testing lets stated surfaces lag the product contract.

Read-only context (not citations): tip `1dd8cb6` — README states MCP tool inventory count; handbook `mcp-server.md` historically undercounts; `src/mcp/server.ts` registrations are source of truth (count checked, names not listed). Extras STUDY-RK-015/021 grounding. No tool name list invented. No git. No execute.

✅
