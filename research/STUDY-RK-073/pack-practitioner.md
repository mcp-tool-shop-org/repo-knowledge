STUDY-RK-073 Q2 Practitioner — tip `6ca036c`. Eight doc/API sources. Invented STUDY-RK-081 / prefix=* mandatory: 0.

1. Tip + paths present | tip `6ca036c` | Present — src/search/fts.ts, test/fts.test.ts, research/STUDY-RK-031/, research/STUDY-RK-063/, CLI rk find → search entrée.
2. KEEP authority | RK-031 + RK-063 grounding | KEEP MATCH + ORDER BY rank; KEEP no auto-prefix; no mandatory named bm25(); residual coding gap: no.
3. tip fts.ts no auto-prefix / quoting | src/search/fts.ts | mcp-A-004 never appends `*`; terms double-quoted; fallback Unicode sanitize.
4. Tokenizer note | src/db/schema.sql | tokenize='porter unicode61'; fts.test documents CJK limits — not mandate prefix/trigram.
5. tip edge tests | test/fts.test.ts | reserved */AND/OR; mcp-PH-006; Unicode JP + café*; colon literal; non-adjacent AND; no product auto-prefix.
6. rk find wiring | src/cli.ts | find → search entrée; no separate CLI prefix tokenizer.
7. Drift since 063 tip c1d5eb9 | empty (0) on fts.ts/fts.test.ts. Drift: no.
8. Residual NEW test PR | no. Edge coverage already on tip; 031/063 coding gap = no.

Answers: tip edge coverage present · Drift since 063 no · NEW test PR no.
