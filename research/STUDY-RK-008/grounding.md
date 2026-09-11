# STUDY-RK-008 — Research grounding (verified — copy)

STUDY-RK-008 Research grounding · tip `2cb33c3`

stop: FTS5 triggers (migration-005) and query correctness.
prerequisite: Verifier ✅ · Scholar 7/8 (#4 Pydipaty/Saha unverified) · Practitioner 8/8 · Analogist 2–5 hold-with-limit; #1 PostgreSQL unverified; #6 CMDB IRE unverified; 7–8 fail-transfer.
owner: Coordinator → Builder
fallback: Land Scholar #4, Analogist #1/#6 flagged unverified, not as verified.

Hold:
- migration-005 AFTER I/U/D on repos/notes/docs; contentless DELETE-then-INSERT; slug rewrite on repo rename.
- fts.ts rebuildIndex full wipe+fill; MATCH quoted literals (no `*`).
- Lit: trigger/incremental inverted index maintenance (SelRoute; Moffat; Khludnev; FoundationDB; Lyu/Graefe; Nikolic; Asadi/Lin).
- Analogs hold-with-limit: SQLite FTS5 external-content; ES CDC; clang incremental; ServiceNow AI Search.

Fail-transfer / invented: 0
- Triggers optional / permanent drift OK · Reindex alone forever · Safe-drift-without-triggers.

Builder: land five files under `/workspace/studio/repo-knowledge/research/STUDY-RK-008/`. Do not invent STUDY-RK-021

Invented gates: 0 — Triggers-optional/drift-OK · Safe-drift · Permanent-drift-OK.

Verifier: Scholar 7/8 (#4 unverified) · Practitioner 8/8 · Analogist 2–5 hold; #1,#6 unverified; 7–8 fail-transfer.
