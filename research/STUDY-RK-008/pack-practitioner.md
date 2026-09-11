STUDY-RK-008 Q2 — Practitioner

stop: FTS5 triggers (migration-005) and query correctness (docs + source).
prerequisite: STUDY-RK-007 done sha=`2cb33c3`; tip `2cb33c3`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary migration-005 + fts.ts + schema state for `repo_search` triggers, DELETE-then-INSERT, rebuildIndex/MATCH, and query correctness?

Eight doc/API sources. I did not invent What. Triggers-optional/drift-OK invented: 0. Do not invent STUDY-RK-021.

1. Migration-005 drift problem/fix — mcp-tool-shop-org · tip `2cb33c3` (2026-09-11) · `/workspace/studio/repo-knowledge/src/db/migration-005-fts-triggers.sql` L1–8 — States `repo_search` previously rebuilt only by `rebuildIndex()` on full-sync; between syncs edits to repos/notes/docs **silently drift**; fix = AFTER INSERT/UPDATE/DELETE triggers on the three source tables.

2. DELETE-then-INSERT strategy — mcp-tool-shop-org · tip `2cb33c3` · `migration-005` L11–15 — INSERT and UPDATE both DELETE-then-INSERT (comment: FTS5 contentless-style tables don’t support UPDATE in same shape; delete keeps index deduplicated vs prior rebuild leftovers); DELETE removes by `source_type` + `source_id`.

3. Nine triggers on repos/notes/docs — mcp-tool-shop-org · tip `2cb33c3` · `migration-005` L33–158 — `trg_repo_search_repos_{insert,update,delete}`, `…_notes_*`, `…_docs_*`; repos UPDATE also rewrites slug on existing note/doc FTS rows on rename; CREATE TRIGGER IF NOT EXISTS (idempotent re-run).

4. schema.sql `repo_search` — mcp-tool-shop-org · tip `2cb33c3` · `src/db/schema.sql` L184–194 — `CREATE VIRTUAL TABLE … repo_search USING fts5(slug, source_type, source_id, title, content, tokenize='porter unicode61')` — FTS5 index across docs, notes, repo metadata.

5. `rebuildIndex()` — mcp-tool-shop-org · tip `2cb33c3` · `src/search/fts.ts` L25–88 — Clears `repo_search` then INSERT from repos (description/purpose), docs (content truncated 50K), notes — full corpus rebuild path complementary to incremental triggers.

6. `search()` MATCH quoting — mcp-tool-shop-org · tip `2cb33c3` · `src/search/fts.ts` L98–128 — Splits terms, wraps each in double quotes (escape `"`→`""`), AND-joins; `WHERE repo_search MATCH ?`; **no prefix `*`** (literal phrases only — mcp-A-004).

7. Fallback query correctness — mcp-tool-shop-org · tip `2cb33c3` · `src/search/fts.ts` L129–180 — On FTS syntax failure, Unicode-safe strip + per-token quotes (not one phrase wrap); nested try returns `[]` rather than throw — degrade to no matches, not crash.

8. Meta stamp (no schema bump) — mcp-tool-shop-org · tip `2cb33c3` · `migration-005` L161–164 — Sets `fts_triggers_added`; does **not** bump `schema_version` — additive trigger layer; drift prevention is mandatory via triggers, not optional.

On-page: triggers required for freshness; invent triggers-optional/drift-OK: 0.

✅
