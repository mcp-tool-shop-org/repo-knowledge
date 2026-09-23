# STUDY-RK-095 — Practitioner Q2 pack

**Owner:** Practitioner  
**Tip:** `1169f6f` (main; `research: stamp STUDY-RK-094 land sha`)  
**Paths:** `src/search/fts.ts` · `test/fts.test.ts`  
**Prior:** STUDY-RK-031 / 063 / 073 (073 tip was `6ca036c`)  
**Residual coding/test gap:** no  
**NEW coding/test PR:** no  
**Do not invent STUDY-RK-101.**

## Answer

After tip `1169f6f`, tip inventory of `src/search/fts.ts` + `test/fts.test.ts` REAFFIRMS STUDY-RK-073 (and 031/063): no auto-prefix `*`; `MATCH` + `ORDER BY rank`; no mandatory named `bm25()`; quote/colon/diacritic/fallback and mcp-A-002..004 edge coverage present on tip. `git log` / blob drift since `6ca036c` on those two paths is empty (identical blobs). Residual coding/test gap: **no**. NEW coding/test PR: **no**. Soft fails rejected: invent prefix=* / mandatory bm25 / tip-already-broken / STUDY-RK-101.

## Findings (8)

1. **Tip pin (GH/local).** Clone `/workspace/studio/repo-knowledge` HEAD = `1169f6f63914d387d6030fef23a8bc7f89f603ab`. `merge-base --is-ancestor 1169f6f HEAD` → tip_ok. Tip subject stamps STUDY-RK-094 land. Tip tree includes `research/STUDY-RK-031/`, `research/STUDY-RK-063/`, and `research/STUDY-RK-073/` five-file packs; no `research/STUDY-RK-095/` yet (Builder land later). Prerequisite tip holds.

2. **No auto-prefix `*` (tip `src/search/fts.ts`).** Line-level contract mcp-A-004 states this layer does not do prefix matching and never appends `*`. The search path splits on whitespace, double-quotes every term (embedded `"` doubled per FTS5 escaping), and joins into literal phrases. Product code does not synthesize prefix tokens. Soft-fail invent prefix=* = fail.

3. **`MATCH` + `ORDER BY rank` (tip `fts.ts`).** Both the primary try path and the sanitized fallback prepare `WHERE repo_search MATCH ?` followed by `ORDER BY rank`, selecting the FTS5 `rank` column alongside snippet metadata. Ranking authority on tip is that column order, not a separate scorer API.

4. **No mandatory named `bm25()`.** Tip `rg -i bm25` over `src/search/fts.ts` and `test/fts.test.ts` returns no hits. Tip does not require a named `bm25(...)` call in every SQL surface. Soft-fail invent mandatory bm25 = fail. Schema note (supporting, not a code change): `tokenize='porter unicode61'` on the virtual table remains documentation context from 073, not a prefix/trigram mandate.

5. **Edge suites present (tip `test/fts.test.ts`, 499 lines).** Present describes include fallback reserved syntax (`*`, AND/OR/NOT, parentheses); mcp-PH-006 fallback self-guard returning `[]` instead of throw; Unicode JP + café/diacritic paths (including queries that force fallback); mcp-A-002 colon/quote/star treated as literal input (not column filters); mcp-A-003 fallback preserves per-term AND rather than one adjacent phrase. mcp-A-004 is the tip `fts.ts` never-append-`*` contract, covered by unconditional quoting plus star/fallback tests (no product auto-prefix). REAFFIRM 073’s quote/colon/diacritic/fallback/mcp-A-002..004 inventory.

6. **Git log drift since `6ca036c` on those paths.** `git log --oneline 6ca036c..1169f6f -- src/search/fts.ts test/fts.test.ts` is empty; rev-list count is **0**; diffstat is empty. Blob oid for `src/search/fts.ts` at tip equals `6ca036c` (`35abdfc9…`); blob oid for `test/fts.test.ts` likewise equals (`4bf30423…`). Drift since 073’s tip: **no**. Soft-fail invent tip-already-broken = fail.

7. **Prior handoff alignment (research stubs).** STUDY-RK-073 handoff: land research five files only; concrete residual coding gap = no; NEW test PR = no; coding PR none; tip then `6ca036c`. STUDY-RK-031/063 KEEP MATCH+rank, no auto-prefix, no mandatory named bm25. Tip `1169f6f` still carries that same FTS surface byte-for-byte. Open PR search touching fts/search does not show a dedicated FTS rewrite PR on these two paths.

8. **Gap / NEW PR calls.** Because tip already KEEP MATCH+rank, refuses auto-prefix, omits mandatory named bm25, keeps the named edge suites, and shows zero commits/diff on `fts.ts`/`fts.test.ts` since `6ca036c`, **residual coding/test gap: no** and **NEW coding/test PR: no**. Do not invent STUDY-RK-101. Fallback unused: tip/PR inventory verified without invent.

## Word note

Docs/GH/API/local tip only. No git write. No execute. No implications-as-final.

Seven doc/API sources. I did not invent What.

✅ · 🛑 · 🔧
