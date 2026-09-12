STUDY-RK-021 Q1 · tip `cb1803b` · consumer repo-knowledge coding

Eight papers, all with arXiv. I did not invent that undocumented flags are product-approved, nor STUDY-RK-051.

Context (read-only, STUDY-RK-015 drifts still present): handbook `mcp-server.md` says 19 tools; README MCP = 30; `cli.ts` has `--prune-vanished`; handbook `usage.md` core paths omit many v2 surfaces. Coding row targets those drifts.

1. READU: Inconsistency-Driven Just-in-Time Detection and Repair of README Bugs — Baek, Krampf, Pradel — 2026 — https://arxiv.org/abs/2607.15780 — Classes include implementation–documentation drift (CLI defaults diverge) and missing API/feature documentation (new params/tools omitted).
2. CASCADE: Detecting Inconsistencies between Code and Documentation with Automatic Test Generation — Kiecker et al. — 2026 — https://arxiv.org/abs/2604.19400 — Code–doc mismatches confuse API users and raise maintenance cost; evidence-gated detection treats divergence as actionable.
3. You Can REST Now: Automated REST API Documentation and Testing via LLM-Assisted Request Mutations — Decrop et al. — 2024 — https://arxiv.org/abs/2402.05102 — Incomplete API docs omit routes/parameters; inferred specs expose undocumented and inconsistent surfaces vs implementation.
4. Towards identifying and minimizing customer-facing documentation debt — Silva, Unterkalmsteiner, Wnuk — 2024 — https://arxiv.org/abs/2402.11048 — Customer-facing defects concentrate in incorrect/outdated command syntax and missing steps; lack of doc testing lets drift persist.
5. Problem Reductions at Scale: Agentic Integration of Computationally Hard Problems — Pan, An, Liu — 2026 — https://arxiv.org/abs/2604.11535 — CLI help text can drift from actual behaviour; users (and agents) propagate that false surface into later decisions.
6. Detecting Outdated Code Element References in Software Repository Documentation — Tan, Wagner, Treude — 2022 — https://arxiv.org/abs/2212.01479 — Docs go stale silently (no crash); outdated README/wiki references survive after code-surface change.
7. DocPrism: Multi-lingual Detection of Incorrectness Inconsistencies between Code and Documentation — Xu, Wahab, Holmes, Lemieux — 2025 — https://arxiv.org/abs/2511.00215 — Over-promise and direct mismatches between documented behaviour and code are first-class incorrectness, not harmless under-documentation.
8. DocSync: Agentic Documentation Maintenance via Critic-Guided Reflexion — Badrinarayan, Parthasarathy — 2026 — https://arxiv.org/abs/2605.02163 — Frames docs as co-evolving with code so handbook/API tables do not lag the implementation surface.

Undocumented-flags-product-approved invented: 0 · STUDY-RK-051 invented: 0

✅
