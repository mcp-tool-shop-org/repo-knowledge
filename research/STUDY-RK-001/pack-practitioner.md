STUDY-RK-001 Q2 — Practitioner pack (prerequisite tip `b211fe5`). Eight primary docs/paths for **FTS5 vs embeddings** in repo-knowledge (structured SQLite catalog instead of vector store). On-page claims only. No git write / no execute. Do not invent STUDY-RK-021. Current consumer **repo-knowledge**. Readouts parked.

Seven doc/API sources. I did not invent What.

1. README tagline + Why — mcp-tool-shop-org/repo-knowledge — tip `b211fe5` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/b211fe5/README.md — Local-first on **SQLite and FTS5**; Why: registries/GitHub APIs don’t hold purpose/thesis/relationships/audit — **single local DB** holds those + **full-text search** (no vector-store claim).

2. README Architecture blurb — same README ~L266 — tip `b211fe5` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/b211fe5/README.md — “All data lives in a **single SQLite database with FTS5** full-text search across docs, notes, and repo descriptions.”

3. schema.sql `repo_search` — local — tip `b211fe5` — `/workspace/studio/repo-knowledge/src/db/schema.sql` — `CREATE VIRTUAL TABLE … repo_search USING fts5(slug, source_type, source_id, title, content, tokenize='porter unicode61')` — FTS columns only; **no embedding/vector columns** in base schema.

4. src/search/fts.ts — local — tip `b211fe5` — `/workspace/studio/repo-knowledge/src/search/fts.ts` — Indexes repo/docs/notes into `repo_search`; queries via FTS5 with **quoted literal phrases AND**ed (mcp-A-002/004: no raw FTS syntax; **does NOT append `*` prefix matching**).

5. migration-005-fts-triggers.sql — local — tip `b211fe5` — `/workspace/studio/repo-knowledge/src/db/migration-005-fts-triggers.sql` — Incremental FTS maintenance on repos/notes/docs INSERT/UPDATE/DELETE so search doesn’t drift between full `rebuildIndex()` syncs.

6. KNOWLEDGE-CONTRACT.md — local — tip `b211fe5` — `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md` — Knowledge layer is **typed notes** (thesis/architecture/…) + relationships with why-notes; MCP `search_repos` = **full-text search**; “Do not invent information” — structured catalog enrichment, not embedding retrieval.

7. AUDIT-CONTRACT.md — local — tip `b211fe5` — `/workspace/studio/repo-knowledge/AUDIT-CONTRACT.md` — Audit is **three structured layers** (run metadata / normalized findings / raw artifact refs on disk) + **80-control catalog**; evidence_ref paths — system-of-record tables, not a vector index.

8. Gaps (on-tree contrast) — tip `b211fe5` — `package.json` depends on **`better-sqlite3`**; tree grep finds **no** Chroma/Pinecone/FAISS/embedding-store product path (only incidental “VectorCaliper” repo name / “command-injection vector” wording). **Invent embeddings-as-required → 🛑.**

**Contrast:** On-page architecture is **structured SQLite catalog + FTS5 MATCH**, not a required vector store for thesis/architecture/audit.

✅
