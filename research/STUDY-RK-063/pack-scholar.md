STUDY-RK-063 Q1 (Scholar) — tip `c1d5eb9`. Eight papers, all arXiv (mostly 2025–2026). Invented coding gap: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. No coding PR.

1. SQLite is Enough. Lexical, Semantic, and Hybrid Search with scrydb — Breuer — 2026 — https://arxiv.org/abs/2608.24060 — Lexical search over SQLite FTS5 remains a current, sufficient path alongside optional semantic/hybrid layers in a single SQLite file. PASS

2. Balancing the Blend: An Experimental Analysis of Trade-offs in Hybrid Search — Wang, Tan, Gao, Jin — 2025 — https://arxiv.org/abs/2508.01405 — Hybrid IR still treats lexical retrieval (BM25-class) as a core paradigm to combine with semantic and re-ranking components, not as obsolete. PASS

3. BM25 Wins at Scale: A Scaling Study of Retrieval-Augmented Generation Paradigms — Wang, Xu, Wang, Du — 2026 — https://arxiv.org/abs/2607.26497 — Controlled corpus-size scaling finds lexical BM25 remains competitive for RAG-style retrieval accuracy/cost, supporting continued use of BM25-class ranking. PASS

4. Hierarchical BM25: Lexical Search at Billion-Document Scale — Deshpande, Sundararaman — 2026 — https://arxiv.org/abs/2608.00229 — Billion-doc lexical retrieval research still centers BM25 ranking (with hierarchy for latency/memory), showing BM25-class rank is actively maintained at scale. PASS

5. Integrating the Probabilistic Models BM25/BM25F into Lucene — Pérez-Iglesias, Pérez-Agüera, Fresno, Feinstein — 2009 — https://arxiv.org/abs/0911.5046 — BM25/BM25F are ranking models layered into a search engine; hit filtering and probabilistic ranking are distinct concerns (boolean-style match ≠ ranked relevance alone). PASS

6. Search, Inspect, Fetch: Exploiting Structure-Aware Boolean Retrieval for Deep-Search Agents — Wang, Chen, Yin, Zhuang — 2026 — https://arxiv.org/abs/2608.02751 — Structure-aware Boolean retrieval is used to filter/constrain before deeper fetch; Boolean match stages remain first-class and separate from later ranking/inspection. PASS

7. vstash: Local-First Hybrid Retrieval with Adaptive Fusion for LLM Agents — Steffens — 2026 — https://arxiv.org/abs/2604.15484 — Local SQLite stack uses FTS5 for keyword matching (with careful term handling) fused with vectors; FTS5 keyword path is current practice, not replaced by embeddings alone. PASS

8. InsertRank: LLMs can reason over BM25 scores to Improve Listwise Reranking — Seetharaman, Dhole, Bansal — 2025 — https://arxiv.org/abs/2506.14086 — BM25 scores remain useful inputs to optional listwise reranking PASS on first clause; “no mandatory named bm25() in every SQL surface” has no on-page text → UNVERIFIED overlay. Do not land overlay as verified.

Reaffirm: STUDY-RK-031 thesis still holds — KEEP MATCH + ORDER BY rank; no auto-prefix; no mandatory named bm25(). Concrete coding bug = no.

Verifier: Scholar 7/8 PASS · #8 UNVERIFIED overlay.

✅
