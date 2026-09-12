STUDY-RK-026 Q1 (Scholar) — tip `4331f8b`. stop: empty-result / zero-hit UX for graph/related queries (empty ≠ success folklore; honest empty states; incomplete relationship graphs). Eight papers, all arXiv. Invented empty=success folklore: 0. Invented STUDY-RK-051: 0. Word count ~590.

1. You Don't Know Search: Helping Users Find Code by Automatically Evaluating Alternative Queries — van Tonder, 2022 — https://arxiv.org/abs/2212.03459 — When original queries yield no results, Automated Query Evaluation surfaces alternatives that raise non-empty result rates — zero-hit is a first-class UX failure mode, not a silent success.

2. Think outside the search box: A comparative study of visual and form-based query builders — Svarre, Russell-Rose, 2022 — https://arxiv.org/abs/2205.04212 — Visual query builders cite fewer zero-hit queries as a benefit; users with sudden zero results cannot tell misspell vs truly empty without better feedback.

3. Generate-on-Graph: Treat LLM as both Agent and KG in Incomplete Knowledge Graph Question Answering — Xu, He, Chen, Wang, Song, Tong, Liu, Liu, 2024 — https://arxiv.org/abs/2404.14741 — Under incomplete KGs, even a correct structural query may retrieve no answer — empty traversal is incompleteness, not proof the relation is absent in the world.

4. Knowledge Graphs Querying — Khan, 2023 — https://arxiv.org/abs/2305.14485 — KGs follow an open-world assumption: stored edges are a subset of reality, so query emptiness cannot be read as a closed-world “no related entities” verdict.

5. Approximate Answering of Graph Queries — Cochez, Alivanistos, Arakelyan, Berrendorf, Daza, et al., 2023 — https://arxiv.org/abs/2308.06585 — Incomplete KGs mean exact-match graph queries may return incomplete answer sets; systems must treat missing edges as expected, not as success-by-empty.

6. LinkQ: An LLM-Assisted Visual Interface for Knowledge Graph Question-Answering — Li, Appleby, Suh, 2024 — https://arxiv.org/abs/2406.06621 — When query results are empty, the UI should diagnose what went wrong rather than present a bare empty payload as a finished answer.

7. Do Data Agents Need Semantic Metadata? A Comparative Study in Agentic Data Retrieval — Chen, Alrashed, Halevy, Noy, 2026 — https://arxiv.org/abs/2605.28787 — Prefer an honest empty state over a probabilistic false hit (“fail-fast”); empty is safer than inventing relatedness.

8. No Edges, No Verdict: A Large-Scale Empirical Study of Declared Dependency Graphs in 78K SBOMs in the Wild — Zięba-Kozarzewski, 2026 — https://arxiv.org/abs/2607.22140 — Edge-less / orphan-heavy graphs fail relationship minima; treating isolates as independent closed-world success is unsound.

Read-only context: `getRelated` returns row arrays (possibly empty); CLI human path prints `No relationships recorded for: <slug>`; JSON serializes `[]`; MCP `related_repos` returns `{relationships:[]}`; KNOWLEDGE-CONTRACT: repos don’t exist in isolation; STUDY-RK-019: empty getRelated is engine state not approved folklore. No git. No execute.

✅
