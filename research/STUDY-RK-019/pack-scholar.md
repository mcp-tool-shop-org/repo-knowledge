STUDY-RK-019 Q1 · tip `afcc9b7` · consumer repo-knowledge

Eight papers, all with arXiv. I did not invent that isolated entries are acceptable product state, nor STUDY-RK-021.

Context (read-only): `KNOWLEDGE-CONTRACT` relationships section + quality rules; schema/`RELATION_TYPES` = depends_on|related_to|supersedes|shares_domain_with|shares_package_with|companion_to|wraps|collaborated_in_mission; MCP `add_relationship` / `related_repos`; fsck brokenRelationships.

1. No Edges, No Verdict: A Large-Scale Empirical Study of Declared Dependency Graphs in 78K SBOMs in the Wild — Zięba-Kozarzewski — 2026 — https://arxiv.org/abs/2607.22140 — Edge-less and orphan-heavy inventories fail NTIA dependency-relationship minima; treating isolates as independent is an unsound closed-world read.
2. Challenges of Producing Software Bill Of Materials for Java — Balliu et al. — 2023 — https://arxiv.org/abs/2303.11102 — SBOM producers often emit incomplete dependency trees (missed transitive edges), so inventory-without-graph understates relationships.
3. DepsRAG: Towards Agentic Reasoning and Planning for Software Dependency Management — Alhanahnah, Boshmaf — 2024 — https://arxiv.org/abs/2405.20455 — Dependency management is framed as constructing and querying a dependency knowledge graph (paths/depth), not a bag of packages.
4. Promises and Perils of Mining Software Package Ecosystem Data — Kula, Inoue, Treude — 2023 — https://arxiv.org/abs/2306.10021 — Missing dependency links break chains and bias ecosystem samples; incomplete edges distort conclusions about the network.
5. CCCE: A Continuous Code Calibration Engine … via Knowledge Graph Traversal … — Parimi — 2026 — https://arxiv.org/abs/2604.13102 — Enterprise software KG uses typed edges for impact radius; effectiveness depends on dependency-edge completeness (dynamic/missing edges limit it).
6. Comprehensive and Comprehensible Data Catalogs … — Subramaniam et al. — 2021 — https://arxiv.org/abs/2103.07532 — Catalog mental model treats Relationships as a first-class partition alongside Why/What — isolates omit that partition.
7. Better Together: Enhancing Generative Knowledge Graph Completion with Language Models and Neighborhood Information — Chepurova et al. — 2023 — https://arxiv.org/abs/2311.01326 — Real-world KGs are incomplete; completion exists because missing edges degrade downstream utility.
8. Web Test Dependency Detection — Biagiola et al. — 2019 — https://arxiv.org/abs/1905.00357 — Validation can leave disconnected/isolated nodes; recovery algorithms specifically target missing dependencies among isolates.

Isolated-entries-acceptable invented: 0 · STUDY-RK-021 invented: 0

✅
