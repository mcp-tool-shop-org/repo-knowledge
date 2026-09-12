STUDY-RK-053 Q3 Analogist — tip `cf0d832` · consumer repo-knowledge coding

stop: adjacent analogs for FTS/index delete maintenance vs orphan/rebuild folklore; name analog + limit.
prerequisite: tip `cf0d832`.
owner: Analogist
fallback: soft folklore rebuild-someday excuses → fail-transfer.

1–6 Hold-with-limit: FTS5 external-content DELETE triggers; FTS5 delete cmd; Lucene deleteDocuments; ES DELETE doc; SQLite CASCADE; MySQL CASCADE.
7 Fail-transfer: primary delete may leave FTS orphans OK by default.
8 Fail-transfer: Soft folklore rebuild-someday excuses — Soft folklore: 0.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0. Do not invent STUDY-RK-081.

✅
