STUDY-RK-066 Q1 (Scholar) — tip `7a8871a`. Eight papers, all arXiv. Invented backup=publish: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. Do not merge #23.

1. Systematic Evaluation of Forensic Data Acquisition using Smartphone Local Backup — Geus, Ottmann, Freiling — 2024 — https://arxiv.org/abs/2404.12808 — Systematic evaluation comparing local-backup contents to original storage shows backups are often but not always faithful snapshots (backup correctness must be checked, not assumed). PASS

2. Crash-Consistent Checkpointing for AI Training on macOS/APFS — Jeon — 2025 — https://arxiv.org/abs/2511.18323 — Checkpoint install protocols escalate from unsafe (no fsync) to file/dir fsync atomic modes with checksum integrity guards and automatic rollback (durable install ≠ naive overwrite). PASS

3. Unix Tools and the FITO Category Mistake: Crash Consistency and the Protocol Nature of Persistence — Borrill — 2026 — https://arxiv.org/abs/2603.01384 — UNVERIFIED — flag; do not land as verified.

4. SquirrelFS: using the Rust compiler to check file-system crash consistency — LeBlanc, Taylor, Bornholt — 2024 — https://arxiv.org/abs/2406.09649 — UNVERIFIED — flag; do not land as verified.

5. Rollbaccine: Herd Immunity against Storage Rollback Attacks in TEEs — Chu, Balasubramanian, Bao et al. — 2025 — https://arxiv.org/abs/2505.04014 — Restoring disk consistency from backups is the mechanism for rollback resistance after storage reversion (restore-from-backup as integrity recovery, not publish). PASS

6. Proof-Gated Publication: Verify-Before-Commit Content Integrity for Serverless Data-Mesh Lakehouses — Khan — 2026 — https://arxiv.org/abs/2608.14643 — Atomic commit alone does not guarantee correct content; a verify-before-commit gate is required so invalid staged data never becomes the visible snapshot. PASS

7. The Impact of Documentation on Test Engagement in Pull Requests in OSS — Amore, Berman, Jiang — 2026 — https://arxiv.org/abs/2604.23048 — UNVERIFIED — flag; do not land as verified.

8. Exceptional Behaviors: How Frequently Are They Tested? — Hora, Fraser — 2026 — https://arxiv.org/abs/2602.05123 — Good suites should exercise normal and exceptional paths; refuse/confirm-failure surfaces are exceptional behaviors worth testing when suites exist. PASS

Context: tip has rk backup/restore; open PR #23 docs-only; STUDY-RK-037 optional CLI negatives not required that docs PR.

Verifier: Scholar 5/8 PASS · #3/#4/#7 UNVERIFIED.

✅
