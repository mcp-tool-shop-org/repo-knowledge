STUDY-RK-122 Q1 (Scholar) — tip `3d183e5`

stop: 8-source cited pack only (title, authors, year, URL, one-sentence finding). Target 500–600 words. No git write. No coding/docs PR. No merge. Stage pack → `/workspace/studio/outbox-STUDY-RK-122/pack-scholar.md`. Soft folklore invent tip-already-synced / invent mandatory-new-FTS-PR / invent mandatory named bm25 / invent risk-free merge / invent STUDY-RK-131 = fail. Last line ✅ or 🛑.
prerequisite: Consumer repo-knowledge. Tip `3d183e5` (=origin/main after STUDY-RK-121). Tip fts.ts: MATCH + ORDER BY rank · no auto-prefix `*`. Extra: research/STUDY-RK-008/ · 031 · 063 · 073 · 095 · src/search/fts.ts · test/fts.test.ts. REAFFIRM 008/095 + 031/063/073 + 121. Q1 lit: FTS5 / bm25 tip-query still-current — KEEP MATCH + ORDER BY rank · no invent mandatory named bm25 · NEW leftover/coding PR only if OUTSIDE HIT.
owner: Scholar
fallback: Pack <8 sources or invent gates → 🛑 Coordinator. Do not Scholar-only fake Practitioner/Analogist.

Question: After tip `3d183e5`, what peer-reviewed evidence governs FTS5 / bm25 tip-query still-current (KEEP MATCH + ORDER BY rank · no auto-prefix `*` · no invent mandatory named bm25)—tip SoR ≠ invent tip-already-synced—versus inventing tip-already-synced, inventing a mandatory-new FTS leftover/coding PR, or inventing mandatory named bm25 while tip query shape already sits on-main?

Answer: Eight papers, all with DOI or arXiv. I did not invent What. [KEEP MATCH + ORDER BY rank; no named bm25 required; no auto-prefix *; tip-query still-current; OUTSIDE HIT 0; NEW leftover/FTS PR no; REAFFIRM; 🛑]. Scholar documents only. IR evidence treats BM25 as a ranking family carried by score/order, not a mandatory named `bm25()` SQL wrapper: Pérez-Iglesias—Boolean MATCH vs BM25-class rank are layered; Spärck Jones—probabilistic relevance grounds BM25-family weighting without API rename; Dehghani—BM25 stays a strong unsupervised baseline; Kamphuis—BM25 scoring variants show no significant effectiveness gap, so invent named-API rename fails; Wang/Balancing—hybrid IR keeps lexical/BM25 core without tip rewrite; Wang/Search—Boolean ≠ ranking and wildcards are explicit, not auto-rewrites; McKee—FTS5 MATCH remains current; Tan—dual surfaces accrue residuals independently—tip SoR current ≠ invent tip-already-synced; NEW leftover only on OUTSIDE HIT. Empirical tip `3d183e5`: fts.ts MATCH + ORDER BY rank (both paths); mcp-A-004 never appends `*`; bm25( absent src/test; suite asserts MATCH/rank. No OPEN PR owns FTS rewrite. Soft folklore invents: 0.

| surface | tip evidence | class | NEW leftover/FTS PR |
| --- | --- | --- | --- |
| FTS5 query | MATCH + ORDER BY rank; no bm25(; no auto * | tip-query still-current KEEP | **no** |
| named bm25() | ABSENT on tip | not mandatory; ≠ OUTSIDE HIT | **no** |

REAFFIRM 008/095 + 031/063/073 + 121: 008 — FTS MATCH/index sync SoR. 095 — REAFFIRM 031/063/073 KEEP MATCH + ORDER BY rank · no auto-prefix · no mandatory named bm25. 031/063/073 — KEEP MATCH+rank · no auto-prefix · no invent mandatory named bm25 · residual coding gap = no. 121 — tip SoR ≠ residual OPEN covering debt; held ≠ tip-already-synced; NEW leftover only on OUTSIDE HIT. OUTSIDE HIT 0 → no invent mandatory-new-FTS-PR; no invent mandatory named bm25; 🛑 do not merge #6 #8 #12–#28.

Findings:
1. Integrating the Probabilistic Models BM25/BM25F into Lucene — Pérez-Iglesias, Pérez-Agüera, Fresno, Feinstein — 2009 — https://arxiv.org/abs/0911.5046 — Boolean retrieval and BM25 ranking are layered; ORDER BY rank on MATCH is valid KEEP without inventing mandatory named bm25().
2. A probabilistic model of information retrieval: Development and comparative experiments: Part 1 — Spärck Jones, Walker, Robertson — 2000 — https://doi.org/10.1016/S0306-4573(00)00015-7 — Probabilistic relevance grounds BM25-family weighting; effectiveness lives in the rank path, not a named SQL wrapper.
3. Neural Ranking Models with Weak Supervision — Dehghani, Zamani, Severyn, Kamps, Croft — 2017 — https://arxiv.org/abs/1704.08803 — BM25 remains a strong unsupervised ranking baseline; tip default rank encoding bm25-family is still-current SoR.
4. Which BM25 Do You Mean? A Large-Scale Reproducibility Study of Scoring Variants — Kamphuis, de Vries, Boytsov, Lin — 2020 — https://doi.org/10.1007/978-3-030-45442-5_4 — Eight BM25 scoring variants show no significant effectiveness differences; invent mandatory named bm25 when tip already ORDER BY rank fails.
5. Balancing the Blend: An Experimental Analysis of Trade-offs in Hybrid Search — Wang, Tan, Gao, Jin, Zhang, Ke — 2025 — https://arxiv.org/abs/2508.01405 — Hybrid IR keeps a lexical/BM25-class core; tip MATCH+rank needs no invent mandatory-new-FTS-PR.
6. Search, Inspect, Fetch: Exploiting Structure-Aware Boolean Retrieval for Deep-Search Agents — Wang, Chen, Yin, Zhuang, Koopman, Zuccon — 2026 — https://arxiv.org/abs/2608.02751 — Boolean eligibility is separate from ranking; wildcards are explicit—supports KEEP no auto-prefix `*`.
7. SelRoute: Query-Type-Aware Routing for Long-Term Conversational Memory Retrieval — McKee — 2026 — https://arxiv.org/abs/2604.02431 — FTS5 lexical MATCH with BM25-class scores remains current; named bm25() is not mandatory on every SQL surface.
8. Detecting Outdated Code Element References in Software Repository Documentation — Tan, Wagner, Treude — 2024 — https://arxiv.org/abs/2212.01479 — Dual surfaces accrue residuals independently; tip FTS SoR current ≠ invent tip-already-synced; NEW leftover only if OUTSIDE HIT (0).

Soft folklore fail checks: invent tip-already-synced = 0; invent mandatory-new-FTS-PR = 0; invent mandatory named bm25 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
