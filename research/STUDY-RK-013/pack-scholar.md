STUDY-RK-013 Q1 — Scholar pack (papers/arXiv/DOI only). Tip `cb1fed6`. Consumer: repo-knowledge `migration-010-operational-runs.sql` / fsck `incompleteSyncRuns` (`db_health_runs` + `sync_runs`; start/finish split; NULL `finished_at` >24h). stop: operational-runs migration-010 (peer lit). Sync-omit-run-rows invented: 0. Do not invent STUDY-RK-021.

Eight papers, all with DOI or arXiv. I did not invent What.

1. Agrawal, Jain (2026). From Ad-Hoc Scripts to Orchestrated Pipelines: Architecting a Resilient ELT Framework for Developer Productivity Metrics. arXiv:2602.21568 / https://arxiv.org/abs/2602.21568 — Names Phantom Zero: successful runs that process zero records look like legitimate empty days; volume/run observability is required so silent-zero sync is not invisible.

2. Tu, He, Cui, Ge, Zhang, Shi, Zhang (2023). Auto-Validate by-History: Auto-Program Data Quality Constraints to Validate Recurring Data Pipelines. arXiv:2306.02421 / https://arxiv.org/abs/2306.02421 — Silent DQ failures throw no exception yet pollute downstream products; recurring pipelines need history-backed checks beyond crash-only monitoring.

3. Khan (2026). Operational Memory Architecture for Kubernetes: Preserving Causal Context Across the Evidence Horizon. arXiv:2605.18755 / https://arxiv.org/abs/2605.18755 — Append-only operational store retains StartedAt/FinishedAt-style termination evidence after ephemeral status is overwritten; incomplete runs stay queryable.

4. Pakhomov, Nijkamp (2026). Parsing the Stream: A Live Trace Model for Long-Horizon Agents and Their Observers. arXiv:2609.01466 / https://arxiv.org/abs/2609.01466 — Append-only typed event ledger folded into RunState; interrupted/open turns are detected when terminal events never arrive (hindsight incompleteness).

5. Beshane (2026). The Acknowledgment Point Is the System: Durable Policy-Decision Receipts for AI Audit Evidence. arXiv:2608.17176 / https://arxiv.org/abs/2608.17176 — Durable append of receipts; incomplete tail/gap is fail-stopped and rejected rather than silently accepted as a finished run.

6. Bountris, Thamsen, Leser (2025). HyProv: Hybrid Provenance Management for Scientific Workflows. arXiv:2511.07574 / https://arxiv.org/abs/2511.07574 — Execution DAG nodes carry start/end timestamps and status (queued/running/succeeded/failed); live enrichment distinguishes unfinished from completed tasks.

7. Nakrani (2026). AuditWeave: A Tamper-Evident, Auditor-Navigable Evidence Layer for AI-Assisted and Data-Transformation Workflows. arXiv:2607.09682 / https://arxiv.org/abs/2607.09682 — Append-only hash-chained event trails as the operational evidence layer for data-transformation workflows (history reconstructible without rewriting past steps).

8. Campanella et al. (2026). STEP: A Modular Silent Trial Engine for Operational Evaluation of Digital Pathology AI in Routine Workflow. arXiv:2608.28708 / https://arxiv.org/abs/2608.28708 — Persists jobs/results plus audit events and exposes run-history queries so operators can see what was submitted, completed, or failed across silent trial runs.

Gates: Sync-omit-run-rows invented: 0. STUDY-RK-021 invented: 0. Findings: 8. Tip `cb1fed6`.

URLs:
https://arxiv.org/abs/2602.21568
https://arxiv.org/abs/2306.02421
https://arxiv.org/abs/2605.18755
https://arxiv.org/abs/2609.01466
https://arxiv.org/abs/2608.17176
https://arxiv.org/abs/2511.07574
https://arxiv.org/abs/2607.09682
https://arxiv.org/abs/2608.28708

✅
