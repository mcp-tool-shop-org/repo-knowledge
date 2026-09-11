STUDY-RK-008 Q1 — Scholar pack (tip 2cb33c3)

Q1 — Peer literature on FTS5/full-text index maintenance via SQL triggers (incremental sync with content tables), contentless FTS5 DELETE-then-INSERT patterns, MATCH query correctness, and drift between base tables and inverted indexes.

Consumer context (not citations): migration-005 AFTER INSERT/UPDATE/DELETE triggers on repos/notes/docs; contentless DELETE-then-INSERT; rebuildIndex still available; MATCH over repo_search. Pack is papers/arXiv/DOI only. Did not invent a paper that says FTS indexes may safely drift from base tables without triggers/rebuild.

1. SelRoute: Query-Type-Aware Routing for Long-Term Conversational Memory Retrieval — Matthew McKee — 2026 — https://arxiv.org/abs/2604.02431 — Stores sessions in a primary table with an associated FTS5 virtual table maintained by insert/update triggers, so BM25 MATCH stays tied to content-table writes rather than a separately stale lexical store.

2. Efficient Immediate-Access Dynamic Indexing — Alistair Moffat, Joel Mackenzie — 2022 — https://arxiv.org/abs/2211.06030 — Designs inverted indexes that remain continuously queryable while documents are added, treating incremental postings maintenance as the path to fresh retrieval instead of accepting long windows of index–collection drift.

3. Join Indices for Search Engines: a Prunable Parallel Semijoin over Lucene Segments — Mikhail Khludnev — 2026 — https://arxiv.org/abs/2608.01173 — States that in Lucene an update is a deletion followed by an append (with tombstones/live-docs filters), matching contentless FTS DELETE-then-INSERT so obsolete postings do not remain live matches.

4. On Using Non-Volatile Memory in Apache Lucene — Ramdoot Pydipaty, Amit Saha — 2018 — https://arxiv.org/abs/1804.04343 — Explains immutable segments where deletes are filtered at search time and updates require new segment materialization—without delete/replace discipline, prior document versions would still appear in MATCH results.

5. FoundationDB Record Layer: A Multi-Tenant Structured Datastore — Christos Chrysafis, Ben Collins, Scott Dugas, Jay Dunkelberger, Moussa Ehsan, et al. — 2019 — https://arxiv.org/abs/1901.04452 — Maintains indexes in the same transaction as record insert/update/delete so indexes stay consistent with base data; save paths remove/update old index entries before inserting new ones.

6. Indexing Join Inputs for Fast Queries and Maintenance — Wenhui Lyu, Goetz Graefe — 2025 — https://arxiv.org/abs/2502.10874 — Contrasts costly join IVM with secondary-index maintenance that reflects each ΔR one-to-one and notes updates are expressed as deletions followed by insertions, keeping indexes strictly consistent with base tables.

7. Incremental View Maintenance with Triple Lock Factorization Benefits — Milos Nikolic, Dan Olteanu — 2017 — https://arxiv.org/abs/1703.07484 — Builds per-relation trigger procedures that apply delta maintenance when base relations change, so derived structures are refreshed by DML-side triggers rather than left to silent drift until a full rebuild.

8. Fast, Incremental Inverted Indexing in Main Memory for Web-Scale Collections — Nima Asadi, Jimmy Lin — 2013 — https://arxiv.org/abs/1305.0699 — Presents incremental inverted-index construction that continuously absorbs new documents into compressed postings, arguing for online index maintenance over batch-only rebuilds that leave queryable indexes stale between rebuilds.

Papers inventing safe FTS drift without triggers/rebuild: 0.
Tip: 2cb33c3. Extra context only: migration-005-fts-triggers.sql, src/search/fts.ts.

✅
