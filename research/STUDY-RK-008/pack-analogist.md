STUDY-RK-008 Q3 Analogist — tip `2cb33c3` · consumer repo-knowledge

stop: FTS5 triggers (migration-005) and query correctness (analogs).
prerequisite: STUDY-RK-007 done sha=`2cb33c3`; tip `2cb33c3`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: migration-005 attaches AFTER INSERT/UPDATE/DELETE triggers so `repo_search` tracks repos/notes/docs between full `rebuildIndex` syncs (F-DB-013 drift fix).

1. PostgreSQL tsvector + GIN + update trigger — PostgreSQL docs — ongoing — https://www.postgresql.org/docs/current/textsearch-tables.html — Hold-with-limit: secondary FTS column/index kept current by BEFORE INSERT/UPDATE trigger; limit: expression must match indexed form or queries miss the GIN path.

2. SQLite FTS5 external-content triggers (official) — SQLite — ongoing — https://www.sqlite.org/fts5.html — Hold-with-limit: docs require user triggers for insert/delete/update (delete-then-insert) so FTS stays consistent with content tables; limit: triggers alone don’t backfill—need rebuild for pre-trigger rows (rk also has `rebuildIndex`).

3. Elasticsearch CDC / outbox projection — Debezium/CQRS practice — ongoing — https://streamkap.com/resources-and-guides/postgresql-to-elasticsearch-cdc — Hold-with-limit: WAL/CDC or outbox maintains search projection vs SoR without dual-write; limit: eventual consistency + idempotent apply, not same-transaction as SQLite triggers.

4. Compiler/clang-repl incremental symbol table update — LLVM clang IncrementalParser — ongoing — https://clang.llvm.org/doxygen/classclang_1_1IncrementalParser.html — Hold-with-limit: incremental inputs update lookup tables; failed PTU cleanup prevents stale/wrong symbols; limit: AST symbols ≠ inverted text index, but same “maintain secondary lookup on change” pattern.

5. ServiceNow AI Search incremental index events — ServiceNow Community — ongoing — https://www.servicenow.com/community/intelligence-ml-articles/define-searchable-content-for-ai-search/ta-p/2307364 — Hold-with-limit: CI create/update/delete enqueues incremental indexing so search tracks SoR; limit: backlog can delay visibility—full reindex still needed for historical rows.

6. CMDB search as secondary to authoritative CI SoR — ServiceNow IRE + AI Search — ongoing — https://www.servicenow.com/docs/r/servicenow-platform/configuration-management-database-cmdb/c_CompsandProcessIDandReconcil.html — Hold-with-limit: search indexes CIs after SoR writes; limit: search lag ≠ license to leave index permanently unsynced.

7. FTS may permanently drift; triggers optional — Fail-transfer: migration-005 exists specifically because sync-only rebuild drifted (F-DB-013); triggers are the incremental correctness path, not optional folklore.

8. Soft folklore that periodic full reindex alone is enough forever — Fail-transfer: rebuild remains for backfill/recovery; continuous correctness needs triggers between syncs; soft folklore: 0.

Soft folklore: 0. Permanent-drift-OK claimed: 0. Did not invent STUDY-RK-021.
✅
