STUDY-RK-063 Q3 Analogist — tip `c1d5eb9`
Six hold-with-limit; two fail-transfer. Soft folklore invent coding-gap / mandatory-bm25: 0. STUDY-RK-081 invented: 0. No coding PR.

1. FTS5 `rank` defaults to bm25; `ORDER BY rank` preferred — SQLite FTS5 — ongoing — https://www.sqlite.org/fts5.html — Hold-with-limit: tip MATCH+ORDER BY rank already uses default relevance; named bm25() is optional/slower for sort. Limit: SQLite-only docs; still rejects invent mandatory-bm25 rename.

2. FTS5 prefix tokens need prefix= indexes / cost tradeoff — SQLite FTS5 — ongoing — https://www.sqlite.org/fts5.html — Hold-with-limit: auto-append `*` expands term ranges; tip correctly refuses silent prefix. Limit: prefix= option ≠ product requirement to invent auto-prefix.

3. Elasticsearch prefix query is expensive; index_prefixes costs size — Elastic 8.19 — ongoing — https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl-prefix-query.html — Hold-with-limit: engines treat prefix as costlier than term; may gate via allow_expensive_queries. Limit: ES cluster ≠ local FTS5; same prefix-cost discipline.

4. Lucene PrefixQuery = multi-term expansion — Lucene 10.5 — ongoing — https://lucene.apache.org/core/10_5_0/core/org/apache/lucene/search/PrefixQuery.html — Hold-with-limit: prefix is a MultiTermQuery rewrite, not free boolean MATCH. Limit: Java Lucene ≠ better-sqlite3; supports KEEP no auto-*.

5. Postgres ts_rank / @@ relevance without inventing FTS5 bm25() rename — PostgreSQL 17 — ongoing — https://www.postgresql.org/docs/17/textsearch-controls.html — Hold-with-limit: rank-after-match is standard; engine-native rank function suffices. Limit: ts_rank ≠ BM25 IDF; still rejects “must call bm25() or gap.”

6. Search engines default relevance ranking (BM25-family) as ORDER BY, not a missing feature flag — FTS5 rank≡bm25 default — ongoing — https://www.sqlite.org/fts5.html — Hold-with-limit: default relevance already present via `rank`; inventing a coding gap because SQL says `rank` not `bm25()` fails. Limit: blog hybrid-RAG pitches ≠ tip bug.

7. Soft folklore invent coding-gap / invent mandatory named bm25() / invent auto-prefix=* — Fail-transfer: Soft folklore: 0. Concrete coding bug = no. KEEP MATCH+rank; KEEP no auto-prefix. No coding PR.

8. invent STUDY-RK-081 or treat boolean MATCH-alone as requiring embeddings/rename — Fail-transfer: do not invent STUDY-RK-081; tip already ranks; STUDY-RK-031 stands.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
