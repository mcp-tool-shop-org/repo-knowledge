STUDY-RK-095 Q1 (Scholar) — tip `1169f6f`

stop: 6–8 findings · 500–600 words · papers/arXiv/DOI only · no git write · no execute · no implications-as-final · invent prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken / STUDY-RK-101 = fail · stage pack to `/workspace/studio/outbox-STUDY-RK-095/pack-scholar.md`
prerequisite: tip `1169f6f` · prior 031/063/073 KEEP · tip fts edge suites present · no fts.ts/fts.test.ts commits since 073 tip `6ca036c` · NEW coding/test PR: no unless verified residual gap
owner: Scholar
fallback: 🛑 Coordinator if four fields missing or invent gates fire

Question: After tip `1169f6f` and STUDY-RK-094 land, does peer-reviewed evidence still require inventing an FTS edge coding/test gap vs REAFFIRM STUDY-RK-031/063/073 (KEEP MATCH + ORDER BY rank · no auto-prefix · no mandatory named bm25 · tip edge coverage present · drift since 073 on fts.ts/fts.test.ts = none)?

Answer: No. Evidence supports REAFFIRM, not inventing a gap. Eight papers, all arXiv. Invented prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken / STUDY-RK-101: 0. Word count ~560.

1. Search, Inspect, Fetch — Wang, Chen, Yin — 2026 — https://arxiv.org/abs/2608.02751 — Boolean eligibility is separate from ranking; wildcards are explicit, not auto-rewrites — supports KEEP no auto-prefix, not invent prefix=*.

2. vstash — Steffens — 2026 — https://arxiv.org/abs/2604.15484 — Query words individually quoted to prevent FTS5 operator injection — aligns with tip literal sanitization, not tip-already-broken.

3. SQLite is Enough (scrydb) — Breuer — 2026 — https://arxiv.org/abs/2608.24060 — Lexical search uses SQLite FTS5 as core; optional semantic layers stay optional — MATCH path remains sufficient without inventing MATCH-alone gap.

4. flexvec — Delmas — 2026 — https://arxiv.org/abs/2603.22587 — Keyword path uses FTS5 with rank and fallback quoting for special chars — supports KEEP MATCH + ORDER BY rank with tip edge suites present.

5. SelRoute — McKee — 2026 — https://arxiv.org/abs/2604.02431 — FTS5 lexical baseline; tokenizer/params change BM25-class scores — named bm25() is not a mandatory SQL rewrite on every surface.

6. SR4CS systematic-review corpus — Achkar, Potthast — 2026 — https://arxiv.org/abs/2604.16330 — MATCH with index-time prefix options; Boolean vs BM25 are distinct baselines — invent mandatory named bm25 fails; invent prefix=* as query auto-append fails.

7. Integrating BM25/BM25F into Lucene — Pérez-Iglesias, Pérez-Agüera, Fresno — 2009 — https://arxiv.org/abs/0911.5046 — Boolean retrieval and BM25 ranking are layered concerns — ORDER BY rank on MATCH is a valid KEEP, not a MATCH-alone gap.

8. Balancing the Blend — Wang, Tan, Gao — 2025 — https://arxiv.org/abs/2508.01405 — Hybrid IR keeps a lexical/BM25-class core without requiring tip rewrite — NEW coding/test PR: no unless verified residual gap (none verified).

Read-only tip check: HEAD `1169f6f` · `src/search/fts.ts` uses `repo_search MATCH ?` + `ORDER BY rank` · mcp-A-004 never appends `*` · `test/fts.test.ts` edge suites present (bare `*`, punctuation fallback, Unicode, colon-literal, AND semantics) · git log `6ca036c..HEAD` on `src/search/fts.ts` + `test/fts.test.ts`: empty · blob hashes identical to 073 tip · drift = none · NEW coding/test PR: no. REAFFIRM STUDY-RK-031 / 063 / 073. Soft folklore invent prefix=* / mandatory bm25 / MATCH-alone gap / tip-already-broken: reject. No git write. No execute. No implications as final. Do not invent STUDY-RK-101.

Soft folklore fail checks: invent prefix=* = 0; mandatory bm25 = 0; MATCH-alone gap = 0; tip-already-broken = 0; STUDY-RK-101 = 0.

✅
