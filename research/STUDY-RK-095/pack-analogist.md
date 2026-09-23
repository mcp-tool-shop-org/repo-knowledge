STUDY-RK-095 Q3 Analogist — tip `1169f6f` · REAFFIRM STUDY-RK-031 / STUDY-RK-063 / STUDY-RK-073 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · inventing a new FTS edge gap vs REAFFIRM when no drift; invent prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken / STUDY-RK-101 = fail.
prerequisite: tip `1169f6f` matches `origin/main`. Tip `src/search/fts.ts` KEEP: quote-every-term (never auto-append `*`), `WHERE repo_search MATCH ?` + `ORDER BY rank`, Unicode `\p{L}\p{N}` fallback sanitizer, mcp-A-002/003/004 comments present. Tip `test/fts.test.ts` edge coverage present (reserved syntax, colon-literal, fallback guard, triggers). Blob identity check: `src/search/fts.ts` and `test/fts.test.ts` are byte-identical to STUDY-RK-073 tip `6ca036c` (`git diff 6ca036c..HEAD` empty on those paths). Prior 031/063/073 KEEP; tip edge coverage; no fts path drift since 073; NEW coding/test PR default no (reaffirm-when-no-drift). No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. FTS5 prefix tokens need prefix= indexes / cost tradeoff — SQLite FTS5 — https://www.sqlite.org/fts5.html — Hold-with-limit: auto-* expands term ranges; tip refuses silent prefix (mcp-A-004). Limit: vendor `prefix=` option ≠ invent product auto-prefix=*.

2. FTS5 `rank` defaults to bm25; named `bm25()` is optional/slower for sort — https://www.sqlite.org/fts5.html — Hold-with-limit: tip `ORDER BY rank` already uses default relevance; invent mandatory named bm25 fails (REAFFIRM 063/073). Limit: SQL keyword `rank` ≠ a missing feature flag.

3. Elasticsearch prefix query expensive/gated — Elastic 8.19 — https://www.elastic.co/guide/en/elasticsearch/reference/8.19/query-dsl-prefix-query.html — Hold-with-limit: engines treat prefix as costlier than term and may gate it. Limit: ES cluster ≠ local FTS5; same no-auto-prefix discipline.

4. Lucene PrefixQuery = multi-term rewrite — Lucene 10.5 — https://lucene.apache.org/core/10_5_0/core/org/apache/lucene/search/PrefixQuery.html — Hold-with-limit: prefix is expansion work, not free boolean MATCH. Limit: Java Lucene ≠ better-sqlite3; supports KEEP no auto-*.

5. Quote/escape user tokens into literals — SQLite FTS5 — https://www.sqlite.org/fts5.html — Hold-with-limit: tip quotes terms so `*` / `:` / `"` stay literals; colon/column and reserved-syntax suites already live in tip `test/fts.test.ts`. Limit: query hygiene ≠ invent MATCH-alone gap or tip-already-broken.

6. Reaffirm-when-no-drift (authoritative surface unchanged → no new gap) — Kubernetes deprecation policy — https://kubernetes.io/docs/reference/using-api/deprecation-policy/ — Hold-with-limit: when the SoR paths are byte-identical to the last cleared study tip, reaffirm KEEP rather than invent a fresh coding debt or tip-already-broken folklore. Limit: k8s API calendar ≠ SQLite FTS; same no-drift → NEW coding/test PR default no.

7. Soft folklore invent prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken — Fail-transfer: tip still MATCH+rank, no auto-prefix, edge tests present, fts paths unchanged since 073 (REAFFIRM 031/063/073). Soft folklore count: 0. Concrete residual FTS coding gap: no. NEW coding/test PR default no.

8. Invent STUDY-RK-101 / treat reaffirm studies as license for a new FTS coding PR / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; 031/063/073 stand; Analogist stays adjacent-domain only.

Soft folklore invent prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-095/pack-analogist.md`.
🛑 no new FTS edge gap; KEEP no auto-prefix; KEEP MATCH+rank; NEW coding/test PR default no.

✅ · 🛑 · 🔧
