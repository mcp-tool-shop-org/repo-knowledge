STUDY-RK-034 Q3 Analogist — tip `455a6fb` · consumer repo-knowledge coding

stop: adjacent analogs for opt-in vanished archival vs auto-archive-default; name analog + limit.
prerequisite: tip `455a6fb`; STUDY-RK-007 extras.
owner: Analogist
fallback: soft folklore 404=safe-prune / auto-archive-must-default → fail-transfer.

1–6 Hold-with-limit (CubeSandbox soft-delete purge opt-in; BMC CMDB purge job; Micro Focus Purgeable; Docker prune confirm; K8s TTL opt-in; S3 delete-marker≠expire).
7 Fail-transfer: auto-archive must default.
8 Fail-transfer: Soft folklore 404=safe-prune — Soft folklore: 0.

Verifier: Analogist 1–6 Hold-with-limit · 7–8 Fail-transfer. Soft folklore: 0. Do not invent STUDY-RK-051.

✅
