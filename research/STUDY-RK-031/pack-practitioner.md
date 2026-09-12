STUDY-RK-031 Q2 (Practitioner)

stop: docs/source inventory — FTS5 MATCH / rank / bm25 / prefix in schema + fts.ts + MCP; concrete coding bug or study-only.
prerequisite: tip `0a5885c`; STUDY-RK-030 done sha=`8461d81` PR #21; STUDY-RK-001/008 extras.
owner: Practitioner
fallback: inventing mandatory bm25() rename or prefix=* → 🛑.

Eight doc/API sources. All Verifier PASS. Coding: none (no concrete bug). Do not invent STUDY-RK-051.

1. STUDY-RK-001 + 008 grounding | paths: research/STUDY-RK-001/, research/STUDY-RK-008/ | Finding: FTS5 MATCH; no auto-prefix `*`.

2. schema repo_search | path: src/db/schema.sql | Finding: fts5 with porter + unicode61.

3. fts.ts MATCH + rank | path: src/search/fts.ts | Finding: MATCH quoted literals + ORDER BY rank; no bm25() by name.

4. mcp-A-004 | Finding: never appends `*`.

5. migration-005 | Finding: DELETE-then-INSERT triggers for FTS sync.

6. SQLite FTS5 docs | url: https://www.sqlite.org/fts5.html | Finding: rank defaults to bm25().

7. Gaps | Finding: no explicit bm25 weights / no prefix indexes / operators neutralized by quoting — design omissions, not broken rank.

8. test/fts.test.ts | Finding: no concrete coding bug; optional docs only.

Invented universal-bm25-required: 0. Soft folklore: 0.

✅
