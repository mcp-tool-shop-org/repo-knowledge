STUDY-RK-031 Q3 Analogist — tip `0a5885c` · consumer repo-knowledge coding

stop: adjacent analogs for FTS5 rank/bm25/prefix vs mandatory rename or embeddings; name analog + limit.
prerequisite: tip `0a5885c`; STUDY-RK-001/008 extras.
owner: Analogist
fallback: soft folklore MATCH-alone / embeddings-required → fail-transfer.

1–6 Hold-with-limit (FTS5 bm25/rank; prefix; Lucene/ES; ES bool; Postgres; BEIR).
7 Fail-transfer: embeddings required.
8 Fail-transfer: Soft folklore MATCH-alone — Soft folklore: 0.

Verifier: Analogist 1–6 Hold-with-limit · 7–8 Fail-transfer. Soft folklore: 0. Do not invent STUDY-RK-051.

✅
