STUDY-RK-001 Q1 — Scholar pack (tip b211fe5)

Q1 — What peer sources support a structured SQLite/FTS5 catalog over a vector store for thesis/architecture/audit knowledge?

Consumer repo-knowledge Why: a local SQLite+FTS5 catalog for thesis notes, architecture docs, audit evidence, and inter-repo relationships — not a hosted embedding service or mandatory vector store. These eight peer sources support lexical/structured catalogs as sufficient for thesis/architecture/audit knowledge (hybrid optional; vector store not required). Pack is papers/arXiv only; no execute; no implications as final for Verifier.

1. SQLite is Enough. Lexical, Semantic, and Hybrid Search with scrydb — Timo Breuer — 2026 — https://arxiv.org/abs/2608.24060 — scrydb places lexical search on SQLite FTS5 inside one database file and treats sqlite-vec semantic search plus hybrid fusion as optional add-ons, not as a separate vector-store prerequisite for usable retrieval.

2. vstash: Local-First Hybrid Retrieval with Adaptive Fusion for LLM Agents — Jayson Steffens — 2026 — https://arxiv.org/abs/2604.15484 — local-first agent memory stores keyword FTS5 and optional ANN together in a single SQLite file with RRF and adaptive IDF fusion, making the structured file the system of record rather than an external vector database.

3. Storage Is Not Memory: A Retrieval-Centered Architecture for Agent Recall — Joshua Adler, Guy Zehavi — 2026 — https://arxiv.org/abs/2605.04897 — True Memory runs as one SQLite file on commodity CPU with no external database, vector index, or graph store required, arguing retrieval over verbatim preserved events beats extraction-into-embeddings at ingest.

4. SpareCodeSearch: Searching for Code Context When You Have No Spare GPU — Minh Nguyen — 2025 — https://arxiv.org/abs/2510.12948 — for lightweight code RAG where embedding hosts are infeasible, keyword search is shown to supply useful context, supporting FTS-style catalogs when vector infrastructure is optional rather than mandatory.

5. BEIR: A Heterogenous Benchmark for Zero-shot Evaluation of Information Retrieval Models — Nandan Thakur, Nils Reimers, Andreas Rücklé, Abhishek Srivastava, Iryna Gurevych — 2021 — https://arxiv.org/abs/2104.08663 — on eighteen heterogeneous zero-shot IR datasets, BM25 remains a strong, reproducible lexical baseline against which dense models are measured, so lexical catalog search is not an obsolete fallback.

6. Do Static Embeddings Add Value to Hybrid Dutch Retrieval? — António Pereira Barata — 2026 — https://arxiv.org/abs/2608.02112 — controlled MTEB-NL hybrids show that once BM25 lexical retrieval is already fused with stronger retrievers, low-cost static embeddings often add little complementary ranking signal, tempering always-add-a-vector-index defaults.

7. Structure Over Scale: Schema-Constrained Causal Graphs for RAG — Marc Saouda, Rajprakash Bale, Eren Aldis, Cloves Almeida — 2026 — https://arxiv.org/abs/2607.22592 — schema-constrained typed knowledge outperforms open-ended corpus-scale extraction whose cost tracks length rather than query needs, aligning with fixed SQLite schemas for thesis, architecture, and audit fields.

8. Auditable by Construction: An Ontology-Driven Framework for Trustworthy LLM Analytics in Enterprise Finance — Sergiy Lunyakin — 2026 — https://arxiv.org/abs/2608.20661 — regulated FP&A answers are usable only when traceable and auditable to authoritative structured sources after the fact, prioritizing ontology-backed catalogs over fluency from similarity search alone.

Recipes invented: 0. Metrics invented: 0. Vector-store-as-required invented: 0.
Tip: b211fe5. Extra reads: README Why, KNOWLEDGE-CONTRACT.md, AUDIT-CONTRACT.md, src/db/schema.sql, src/search/fts.ts.

✅