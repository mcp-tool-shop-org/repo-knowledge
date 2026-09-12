STUDY-RK-073 Q3 Analogist — tip `6ca036c`. Six Hold-with-limit; two Fail-transfer. Soft folklore invent prefix=* / mandatory bm25: 0. STUDY-RK-081 invented: 0.

1. FTS5 prefix tokens need prefix= indexes / cost — https://www.sqlite.org/fts5.html — Hold-with-limit: auto-* expands ranges; tip refuses silent prefix.
2. FTS5 rank defaults to bm25; named bm25() optional — https://www.sqlite.org/fts5.html — Hold-with-limit: KEEP ORDER BY rank; invent mandatory named bm25 fails.
3. Elasticsearch prefix query expensive/gated — https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl-prefix-query.html — Hold-with-limit: prefix costlier than term. Limit: ES ≠ FTS5.
4. Lucene PrefixQuery multi-term expansion — https://lucene.apache.org/core/10_5_0/core/org/apache/lucene/search/PrefixQuery.html — Hold-with-limit: prefix is rewrite work. Limit: Lucene ≠ better-sqlite3.
5. Quote/escape user tokens — https://www.sqlite.org/fts5.html — Hold-with-limit: tip quotes so */:/" stay literals.
6. Exceptional-path / reserved-token suites — local test/fts.test.ts — Hold-with-limit: edge coverage without inventing auto-prefix=* or mandatory bm25 rename.
7. Soft folklore invent prefix=* / mandatory bm25 / MATCH-alone gap — Fail-transfer: Soft folklore 0. KEEP no auto-prefix; KEEP MATCH+rank.
8. invent STUDY-RK-081 or treat edge tests as license to change default ranking/prefix — Fail-transfer: do not invent 081; 031/063 stand.
