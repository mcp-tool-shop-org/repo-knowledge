# STUDY-RK-122 Practitioner pack
Tip: `3d183e5` (Coordinator-named; FTS blobs identical on current `origin/main` `d7c3031`). Owner: Practitioner. Q2: tip FTS surface vs residual gap · OUTSIDE HIT · NEW leftover/coding PR yes/no. Soft folklore invent tip-already-synced / invent mandatory-new-FTS-PR / invent mandatory named bm25 / invent risk-free merge / invent STUDY-RK-131 = fail. No git write. No coding/docs PR. No merge. Paths only: fts.ts, migration-005, fts.test.ts (+ research 008/095).

## Eight cited sources

1. Tip `src/search/fts.ts` primary query — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/3d183e5/src/search/fts.ts — `WHERE repo_search MATCH ?` then `ORDER BY rank` (lines ~128–129); same MATCH + ORDER BY rank on the fallback prepare (~173–174).
2. Tip `src/search/fts.ts` mcp-A-004 — same blob — comment states the layer does not do prefix matching and never appends `*`; terms are quote-wrapped literals (no auto-prefix).
3. Tip `src/db/migration-005-fts-triggers.sql` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/3d183e5/src/db/migration-005-fts-triggers.sql — Migration 005 AFTER INSERT/UPDATE/DELETE triggers keep `repo_search` in sync with repos/notes/docs (contentless DELETE-then-INSERT).
4. Tip `test/fts.test.ts` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/3d183e5/test/fts.test.ts — covers rebuildIndex idempotency, basic hits, multi-term AND, snippets, reserved-syntax fallback (including bare `*`), Unicode, triggers (F-DB-013), mcp-A-002 colon literals, mcp-A-003 fallback AND semantics.
5. Tip bm25 absence on FTS paths — `rg bm25` over `src/search/fts.ts`, `test/fts.test.ts`, `src/db/migration-005-fts-triggers.sql` at tip → empty; ranking uses FTS5 `rank` column via `ORDER BY rank`, not a mandatory named `bm25()` call.
6. Prior grounding `research/STUDY-RK-008/grounding.md` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/3d183e5/research/STUDY-RK-008/grounding.md — stop on FTS5 triggers (migration-005) and query correctness; MATCH quoted literals (no `*`).
7. Prior grounding `research/STUDY-RK-095/grounding.md` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/3d183e5/research/STUDY-RK-095/grounding.md — REAFFIRM KEEP MATCH + ORDER BY rank · no auto-prefix · no mandatory named bm25; residual coding/test gap: no; NEW coding/test PR: no.
8. Tip blob identity `3d183e5`↔`d7c3031` — `git diff 3d183e5..d7c3031 -- src/search/fts.ts test/fts.test.ts src/db/migration-005-fts-triggers.sql` is empty (same blob ids); main moved only by STUDY-RK-121 research flag-patch, not FTS code.

## Classification

Tip FTS surface already holds MATCH + ORDER BY rank with no auto-prefix. Tests cover quote/fallback/trigger/Unicode edges. Named `bm25()` is absent by design while `ORDER BY rank` holds — inventing mandatory named bm25 = fail. No open FTS coding PR is required to close a tip gap. Inventing mandatory-new-FTS-PR or tip-already-synced folklore against a non-existent residual = fail.


## Residual note

Tip already implements the KEEP shape from STUDY-RK-095: MATCH with quoted literals, ORDER BY rank, and mcp-A-004 refusal to append `*`. Migration-005 trigger coverage is present on tip and exercised by the F-DB-013 tests. Because residual coding/test gap is no, claiming a mandatory new FTS coding PR or a mandatory named bm25() rewrite would be folklore. STUDY-RK-131 is absent under research/ and must not be invented from this pack.

## Answers

- Tip FTS surface: **MATCH + ORDER BY rank · no auto-prefix · no named bm25**.
- Residual FTS coding/test gap: **no**.
- OUTSIDE HIT count: **0**.
- NEW leftover/coding PR: **no**.
- Invented tip-already-synced / mandatory-new-FTS-PR / mandatory named bm25 / risk-free merge / STUDY-RK-131: **0**. Open hold set #6 #8 #12–#26 #28 remains; do not merge. Open PRs that touch fts.ts / fts.test.ts / migration-005: none observed for this residual question.

Eight doc/API sources. I did not invent mandatory named bm25.
✅
