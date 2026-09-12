STUDY-RK-019 Q3 Analogist — tip `afcc9b7` · consumer repo-knowledge

stop: relationship graph vs isolated entries (analogs).
prerequisite: STUDY-RK-018 done sha=`afcc9b7`; tip `afcc9b7`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: KNOWLEDGE-CONTRACT — “repos don't exist in isolation”; enrichment records relationships; isolated catalog nodes are not acceptable finished product state.

1. ServiceNow CMDB Health orphan rules (no relationships) — ServiceNow Docs — ongoing — https://www.servicenow.com/docs/r/washingtondc/servicenow-platform/configuration-management-database-cmdb/t_CreateCMDBHealthOrphanRule.html — Hold-with-limit: CIs with no required edges count as orphans in correctness health; limit: CMDB classes ≠ repo notes.

2. CMDB Relationship Health Dashboard (orphan/duplicate edges) — ServiceNow CMDB Health overview — ongoing — https://www.servicenow.com/docs/bundle/zurich-servicenow-platform/page/product/configuration-management/concept/overview-cmdb-health.html — Hold-with-limit: relationship topology is a first-class health KPI, not optional decoration; limit: enterprise CMDB vs local SQLite.

3. Madge `--orphans` / dependency graph isolates — madge — ongoing — https://www.npmjs.com/package/madge — Hold-with-limit: modules with zero dependents surface as orphans in the import graph; limit: file-level graph ≠ org-level repo edges.

4. dependency-cruiser orphan rules — dependency-cruiser — ongoing — https://www.npmjs.com/package/dependency-cruiser — Hold-with-limit: CI can fail on unreachable/orphan modules; isolation is a gate; limit: JS module graph vs portfolio relationships.

5. Fragmented citation networks need edges for structure — arXiv:2605.12263 — 2026 — https://arxiv.org/abs/2605.12263 — Hold-with-limit: disconnected components weaken graph indicators; reconnecting edges restores usable structure; limit: bibliometrics ≠ rk relate types.

6. LLVM LazyCallGraph / GlobalDCE (unreachable functions) — LLVM docs — ongoing — https://www.llvm.org/doxygen/LazyCallGraph_8h.html — Hold-with-limit: call-graph reachability defines live vs dead units; isolated nodes are removed or flagged; limit: IR functions ≠ catalog repos.

7. isolated entries are acceptable product state — Fail-transfer: contract text rejects isolation; enrichment without relationships leaves a metadata dump, not a knowledge graph.

8. Soft folklore that thesis+architecture alone finish enrichment — Fail-transfer: Phase/README enrichment pass includes relationship mappings; Soft folklore: 0.

Soft folklore: 0. Isolated-OK claimed: 0. Did not invent STUDY-RK-021.
✅
