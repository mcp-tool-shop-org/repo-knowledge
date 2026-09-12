STUDY-RK-073 Q1 Scholar — tip `6ca036c`. Eight papers, all arXiv. Invented auto-prefix=*: 0. Invented mandatory named bm25(): 0. Invented coding-gap: 0. STUDY-RK-081 invented: 0. No coding PR.

1. Search, Inspect, Fetch (Boolean / Sieve) — Wang, Chen, Yin — 2026 — https://arxiv.org/abs/2608.02751 — Boolean eligibility separate from ranking; quoted phrases exact; word* wildcards explicit not auto-rewrites. PASS
2. vstash — Steffens — 2026 — https://arxiv.org/abs/2604.15484 — Each query word individually double-quoted and OR-joined; prevents FTS5 Boolean-operator injection. PASS
3. SQLite is Enough (scrydb) — Breuer — 2026 — https://arxiv.org/abs/2608.24060 — Lexical search uses SQLite FTS5; semantic/hybrid optional. PASS
4. flexvec — Delmas — 2026 — https://arxiv.org/abs/2603.22587 — Keyword path FTS5 with rank; special chars via fallback quoting. PASS
5. SelRoute — McKee — 2026 — https://arxiv.org/abs/2604.02431 — FTS5 lexical baseline; tokenizer/params change BM25-class results. PASS
6. SR4CS systematic-review corpus — Achkar, Potthast — 2026 — https://arxiv.org/abs/2604.16330 — MATCH; prefix indexing index-time; Boolean vs BM25 distinct baselines. PASS
7. Integrating BM25/BM25F into Lucene — Pérez-Iglesias, Pérez-Agüera, Fresno — 2009 — https://arxiv.org/abs/0911.5046 — Lucene Boolean + separate BM25 ranking layers. PASS
8. Balancing the Blend — Wang, Tan, Gao — 2025 — https://arxiv.org/abs/2508.01405 — Hybrid IR keeps lexical/BM25-class core. PASS

Tip check: fts.ts quotes terms into literals, never appends `*`; MATCH + ORDER BY rank; no auto-prefix.
Reaffirm: STUDY-RK-031/063 KEEP MATCH + ORDER BY rank · no auto-prefix · no mandatory named bm25(). Concrete coding bug = no.
Verifier: Scholar 8/8 PASS.
