STUDY-RK-068 Q1 (Scholar) — tip `385492b`. Eight papers, all arXiv. Invented doctor-as-write-path: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. No coding PR.

1. ARGUS — Senja, Zadegan, Leitner — 2026 — https://arxiv.org/abs/2608.23084 — MCP RCA under a read-only ClusterRole is advisory: it proposes but never executes fixes. PASS

2. Auditable Graph-Guided RCA — Kuvshinova, Jin — 2026 — https://arxiv.org/abs/2606.08590 — Operational constraints map explicitly to read-only evidence collection plus separate validation, not write-side repair. PASS

3. AOI — Yang, Chen, Zheng — 2026 — https://arxiv.org/abs/2603.03378 — Runtime splits Probe (read-only diagnosis) from Executor (write-gated remediation). PASS

4. OpenPort Protocol — Zhu, Wang, Wang — 2026 — https://arxiv.org/abs/2602.20196 — UNVERIFIED — flag; do not land as verified.

5. Proof-Gated Publication — Khan — 2026 — https://arxiv.org/abs/2608.14643 — Verify-before-commit integrity gates publication separately from atomic table commits. PASS

6. vstash — Steffens — 2026 — https://arxiv.org/abs/2604.15484 — Unknown future on-disk schema versions raise SchemaVersionError rather than silently opening or repairing. PASS

7. EasyScan_HEP 2 — Xiao, Yue, Zhang — 2026 — https://arxiv.org/abs/2606.31214 — easyscan --check validates FS config without launching any scan point (dry-run preflight). PASS

8. Structural Inference (mobile DB forensics) — Khatiwala, Patel, Xu — 2026 — https://arxiv.org/abs/2608.21470 — Schema snapshot acquisition is strictly read-only SQLite introspection to preserve evidential integrity before any query. PASS

Reaffirm: STUDY-RK-039 KEEP dual doctor / default-read (+ --refresh opt-in) / config FS-only / migration VACUUM on openDb — not doctor-as-write. Concrete residual coding gap = no.

Verifier: Scholar 7/8 PASS · #4 UNVERIFIED.

✅
