STUDY-RK-074 Q1 Scholar — tip `c358380`. Eight papers, all arXiv. Invented empty=success: 0. Invented relatedness: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. Do not merge PR #17.

1. Do Data Agents Need Semantic Metadata? — Chen, Alrashed, Halevy, Noy — 2026 — https://arxiv.org/abs/2605.28787 — Fail-fast empty over probabilistic guess. PASS
2. No Edges, No Verdict (SBOM graphs) — Zięba-Kozarzewski — 2026 — https://arxiv.org/abs/2607.22140 — Orphan-heavy graphs leave components isolated; edge-less ≠ relatedness success. PASS
3. TraceBound Diagnostics — Purkayastha — 2026 — https://arxiv.org/abs/2607.24800 — Zero-result / empty-neighborhood = retrieval failure signal, not silent completion. PASS
4. Knowledge Graphs Querying — Khan — 2023 — https://arxiv.org/abs/2305.14485 — Open-world: emptiness ≠ closed-world no related entities. PASS
5. LinkQ — Li, Appleby, Suh — 2024 — https://arxiv.org/abs/2406.06621 — Empty query results should surface what went wrong. PASS
6. You Don't Know Search (AQE) — van Tonder — 2022 — https://arxiv.org/abs/2212.03459 — UNVERIFIED (Verifier: related UX ≠ stated zero-hit first-class framing) — do not land as verified.
7. Generate-on-Graph — Xu, He, Chen et al. — 2024 — https://arxiv.org/abs/2404.14741 — Missing one-hop = incompleteness, not approved isolation. PASS
8. Approximate Answering of Graph Queries — Cochez et al. — 2023 — https://arxiv.org/abs/2308.06585 — Incomplete KGs → incomplete answer sets; missing edges expected. PASS

Tip check: rk related sentinel + --json []; MCP related_repos {relationships:[]}. Empty = engine state. PR #17 OPEN — do not invent merge.
Reaffirm: STUDY-RK-026; STUDY-RK-060 KEEP #17 OPEN.
Verifier: Scholar 7/8 · #6 UNVERIFIED.
