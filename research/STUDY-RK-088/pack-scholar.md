# STUDY-RK-088 — pack-scholar

Tip `ea985f1`. Eight papers, all arXiv. Invented empty=success / invent relatedness / tip-already-fixed / risk-free merge #17 / STUDY-RK-101: 0. REAFFIRM STUDY-RK-026 / STUDY-RK-060 / STUDY-RK-074. NEW duplicate coding PR: no. Word count ~560.

Question: After tip `ea985f1`, what peer-reviewed evidence still requires treating empty getRelated / empty-result honesty as held unmerged debt while PR #17 stays OPEN?

1. Do Data Agents Need Semantic Metadata? — Chen, Alrashed, Halevy, Noy — 2026 — https://arxiv.org/abs/2605.28787 — Prefer an honest empty retrieval state over a probabilistic false hit (fail-fast); empty is safer than inventing relatedness that the store does not hold.

2. No Edges, No Verdict — Zięba-Kozarzewski — 2026 — https://arxiv.org/abs/2607.22140 — Edge-less and orphan-heavy graphs fail relationship minima; treating isolates as closed-world “Independent / Isolated-OK” success is unsound — no edges is incompleteness, not a positive verdict.

3. TraceBound Diagnostics — Purkayastha — 2026 — https://arxiv.org/abs/2607.24800 — Zero-result / empty-neighborhood calls are observable retrieval-failure symptoms that must be logged and diagnosed, not silently read as successful completion.

4. Knowledge Graphs Querying — Khan — 2023 — https://arxiv.org/abs/2305.14485 — KGs follow an open-world assumption: stored edges are a subset of reality, so query emptiness cannot be read as a closed-world “no related entities” verdict.

5. LinkQ — Li, Appleby, Suh — 2024 — https://arxiv.org/abs/2406.06621 — When KG query results are empty, the interface should surface what went wrong rather than present a bare empty payload as a finished answer.

6. Generate-on-Graph — Xu, He, Chen, Wang, Song, Tong, Liu, Liu — 2024 — https://arxiv.org/abs/2404.14741 — Under incomplete KGs, a correct structural query may retrieve no answer; empty one-hop traversal is incompleteness, not approved isolation.

7. Approximate Answering of Graph Queries — Cochez, Alivanistos, Arakelyan, Berrendorf, Daza, et al. — 2023 — https://arxiv.org/abs/2308.06585 — Incomplete KGs mean exact-match graph queries may return incomplete answer sets; missing edges are expected engine state, not success-by-empty.

8. Think outside the search box — Svarre, Russell-Rose — 2022 — https://arxiv.org/abs/2205.04212 — Sudden zero-hit results leave users unable to tell misspecification from truly empty without explicit empty-state feedback; silent omission of the relatedness section is a first-class UX failure mode.

Read-only tip context (not citations): tip `ea985f1` — `rk related` text sentinel `No relationships recorded for: <slug>` and `--json []` present; MCP `related_repos` returns `{ relationships: [] }`; `formatRepo` / `rk show` still gates Relationships on `repo.relationships?.length` (omits section when empty); `test/related-empty.test.ts` ABSENT on tip. PR #17 OPEN (STUDY-RK-026 empty getRelated UX honesty) — branch not on tip. Other OPEN PRs do not duplicate this coding fix → NEW duplicate coding PR: no. No invent edges. No git. No execute. No implications as final.

Soft folklore fail checks: empty=success = 0; invent relatedness = 0; tip-already-fixed = 0; risk-free merge #17 = 0; STUDY-RK-101 = 0.
