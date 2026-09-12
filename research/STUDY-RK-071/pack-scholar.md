STUDY-RK-071 Q1 (Scholar) — tip `1a51052`. Eight papers, all arXiv. Invented auto-archive-vanished-default: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. No coding PR.

1. Ghost Vectors — Chakraborttii, Alvarado, Abdulofizova — 2026 — https://arxiv.org/abs/2606.18497 — Soft-delete marks records deleted at the API while embeddings remain physically unchanged on disk. PASS

2. Data-CASE — Chakraborty, Ann-Elvy, Mehrotra — 2023 — https://arxiv.org/abs/2308.07501 — Logical deletes (tombstones) differ from physical reclamation and can retain bytes after API disappearance. PASS

3. Resilient ELT / Phantom Zero — Agrawal, Jain — 2026 — https://arxiv.org/abs/2602.21568 — Sensors pause when fetch volume collapses ~90% vs baseline so silent API failure is not treated as true zero. PASS

4. Lifecycle-Aware Archival — Manek — 2026 — https://arxiv.org/abs/2608.12367 — Settled rows leave the hot table only after an archival window via a scheduled purge job. PASS

5. Revoked but Still Authoritative — Shen, Toyoda, Leung — 2026 — https://arxiv.org/abs/2609.08258 — Soft revocation marks facts invalid and retains them rather than hard-deleting. PASS

6. Inference-Aware Deletion — Chakraborty, Kaminsky, Dhariya, Mehrotra — 2026 — https://arxiv.org/abs/2604.00326 — Distinguishes Logical Delete from Physical Delete (byte reclamation / tombstones until compaction). PASS (authors corrected)

7. Governed Persistent Memory — Xu — 2026 — https://arxiv.org/abs/2608.12476 — Fail-closed structured release with non-revival after retraction or deletion. PASS

8. Chaff from the Wheat — Correa, Sureka — 2014 — https://arxiv.org/abs/1401.0480 — Stack Overflow deleted questions can be voted undeleted; deletion is reversible soft lifecycle. PASS

Tip check: prune-vanished defaults false. Reaffirm STUDY-RK-034. Concrete residual coding bug = no.

Verifier: Scholar 8/8 PASS (#6 authors corrected).

✅
