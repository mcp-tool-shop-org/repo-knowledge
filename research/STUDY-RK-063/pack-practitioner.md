STUDY-RK-063 Q2 (Practitioner)
Eight doc/API sources. Residual coding gap: no · Drift since 031: none on fts.ts/tests.

1. Tip + paths present | org: mcp-tool-shop-org/repo-knowledge | date: tip `c1d5eb9` | paths: `research/STUDY-RK-031/`, `src/search/fts.ts`, `test/fts.test.ts`, `src/db/schema.sql` | Finding: All load-bearing paths exist. No 🛑 for missing FTS surfaces. PASS

2. STUDY-RK-031 KEEP (authority) | path: `research/STUDY-RK-031/grounding.md` | Finding: Thesis study-land only: KEEP MATCH + ORDER BY rank; KEEP no auto-prefix; optional docs only; concrete coding bug held = no. Do not invent prefix=* or named bm25() as mandatory. PASS

3. tip search() SQL shape | path: `src/search/fts.ts` `search()` | Finding: Primary + fallback both `WHERE repo_search MATCH ?` then `ORDER BY rank` then `LIMIT ?`; select includes `rank` and `snippet(...)`. No `bm25(...)` call by name — uses FTS5 default rank column. Matches 031 KEEP. PASS

4. No auto-prefix | path: `src/search/fts.ts` mcp-A-004 | Finding: Terms split on whitespace, each wrapped in double quotes; layer never appends `*`. User-supplied `*` neutralized as literal. Matches 031 KEEP no auto-prefix. PASS

5. Drift since 031 tip `0a5885c` | Finding: `git log 0a5885c..HEAD -- src/search/fts.ts test/fts.test.ts` → empty. No post-031 commits on those paths through `c1d5eb9`. PASS

6. schema + tests still align | paths: `src/db/schema.sql` `repo_search` fts5; `test/fts.test.ts` | Finding: Virtual table still FTS5. Tests cover rebuild, hits, reserved syntax, colon-literal, fallback AND, Unicode — not a requirement to rename rank→bm25() or add prefix indexes. PASS

7. Residual coding gap | Finding: **no**. Do not invent mandatory named bm25(), auto-prefix *, or MATCH-alone as tip bugs. Prerequisite STUDY-RK-031 concrete bug = no still holds. PASS

8. Invent gates | Finding: STUDY-RK-081 invented: 0 · universal-bm25-required: 0 · prefix=*: 0 · bug-to-force-coding: 0. No coding PR. PASS

Verifier: Practitioner 8/8 PASS. Residual coding gap: NO.

✅
