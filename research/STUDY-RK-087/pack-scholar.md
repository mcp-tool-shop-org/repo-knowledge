# STUDY-RK-087 — pack-scholar

Tip `cc6f079`. Eight papers, all arXiv. Invented handbook-19-as-authority / tip-already-aligned / risk-free merge #16 / invent tools / STUDY-RK-101: 0. REAFFIRM STUDY-RK-025 / STUDY-RK-059 / STUDY-RK-075. Word count ~560.

Question: After tip `cc6f079`, what peer-reviewed evidence still requires treating handbook MCP tool-count drift vs server.ts authority as held unmerged debt while #16 stays OPEN?

1. APISENSOR — Yang, Zhong, Han, Cheng, Xu, Zhou, et al. — 2026 — https://arxiv.org/abs/2603.23852 — Rapid API evolution yields incomplete or inconsistent published inventories; runtime discovery finds callable surfaces missing from the stated reference (shadow / under-counted docs).

2. RESTCov — Bardakci, Demeyer — 2026 — https://arxiv.org/abs/2608.28114 — Traffic unmatched to a published OpenAPI inventory signals specification–implementation drift; undocumented operations mean stated surface counts cannot be trusted until reconciled to the live registration authority.

3. You Can REST Now — Decrop, Devroey, Papadakis, Schobbens, Perrouin — 2024 — https://arxiv.org/abs/2402.05102 — Published API documentation is often incomplete, inaccessible, or outdated; inferred surfaces expose routes and parameters omitted from the handbook inventory.

4. CASCADE — Kiecker, Sparka, Reuter, Ziegler, Grunske — 2026 — https://arxiv.org/abs/2604.19400 — Code–documentation mismatches confuse API users and raise maintenance cost; inventory divergence is an actionable defect class, not a free or self-healing state.

5. READU — Baek, Krampf, Pradel — 2026 — https://arxiv.org/abs/2607.15780 — README / handbook bug classes include implementation–documentation drift and missing API or feature documentation when the stated surface under-reports what code exposes.

6. DocPrism — Xu, Wahab, Holmes, Lemieux — 2025 — https://arxiv.org/abs/2511.00215 — Incorrectness defects include over-promise and direct mismatches between documented behaviour and code; handbook tool-count claims vs server registration are first-class inconsistency, not soft folklore.

7. Detecting Outdated Code Element References in Software Repository Documentation — Tan, Wagner, Treude — 2022 — https://arxiv.org/abs/2212.01479 — Documentation goes stale silently after surface change; outdated README and wiki references survive with no crash, so inventory drift persists until an align change lands.

8. Registry Descriptions Go Stale Unevenly (MCP drift) — Bharti — 2026 — https://arxiv.org/abs/2608.00997 — MCP registry descriptions go stale unevenly as the tool and server surface grows; description-level text ages while registrations expand, so leaving description align work unclosed leaves audited counts lag the live MCP surface.

Read-only tip context (not citations): tip `cc6f079` — `src/mcp/server.ts` has 30 `server.tool` registrations; README states 30 MCP tools; handbook `site/.../mcp-server.md` still claims 19 tools (audit-domain table count must not be conflated with MCP tool count). PR #16 OPEN (STUDY-RK-025 handbook 19→30 align to server.ts). No tool names invented beyond names already listed in tip handbook tables. No git. No execute. No implications as final.

Soft folklore fail checks: handbook-19-as-authority = 0; tip-already-aligned = 0; risk-free merge #16 = 0; invent tools = 0; STUDY-RK-101 = 0.
