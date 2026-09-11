STUDY-RK-005 Q1 — Scholar pack (tip 57c4319)

Q1 — Peer literature on fixed-size control frameworks (security/compliance control catalogs) and idempotent findings ingestion: upsert/dedupe of audit findings, control-result normalization, evidence graphs over control IDs, fail-closed import of malformed findings.

Consumer context (not citations): AUDIT-CONTRACT three-layer import; migration-004 unique `(audit_run_id, domain, title, severity)`; local catalog documents fixed control IDs. Pack is papers/arXiv only. Did not invent an 80-control count from peer sources (catalog sizes differ across papers). Did not invent a paper that requires non-idempotent finding inserts.

1. Making AI Compliance Evidence Machine-Readable — Rodrigo Cilla Ugarte, Miguel Ángel Patricio Guisado, Antonio Berlanga de Jesús, José Manuel Molina López — 2026 — https://arxiv.org/abs/2604.13767 — Emits NIST-schema-validated OSCAL Assessment Results with per-control Findings (satisfied/not-satisfied) keyed to control IDs, Observations, and linked Risks/POA&M; enforcement_mode `block` raises on failing controls, so malformed or failing outcomes do not silently pass as success.

2. EMERALD: Evidence Management for Continuous Certification as a Service in the Cloud — Christian Banse, Björn Fanta, Juncal Alonso, Cristina Martinez — 2025 — https://arxiv.org/abs/2502.07330 — Centers a machine-readable repository of controls/metrics (OSCAL-oriented catalogs) and builds AssessmentResults from evidence queried over a certification graph, then scopes evaluations to catalog controls under an audit scope.

3. Software Security Mapping Framework: Operationalization of Security Requirements — Sung Une Lee, Liming Dong, Zhenchang Xing, Muhammad Ejaz Ahmed, Stefan Avgoustakis — 2025 — https://arxiv.org/abs/2506.11051 — Operationalizes hierarchical security requirements into an OSCAL Catalog model (groups → fixed controls with structured operations), treating the catalog as a stable control framework rather than ad-hoc finding lists.

4. AspisAI: A Canonical, Machine-Interpretable Governance Framework for Automated Multi-Standard Compliance Monitoring — Tsafac Nkombong Regine Cyrille, Hasan Dag, Reiner Creutzburg, Knut Haufe — 2026 — https://arxiv.org/abs/2609.10881 — Maps heterogeneous standards into one canonical, bounded control model and evaluates submitted evidence with condition-based rules and full traceability; the evaluated scope is 26 representative requirements (not a universal fixed count shared by all frameworks).

5. TRACE-CTI: Auditable Post-Extraction Governance of TTP Claims with Knowledge Graphs — Federico Valletta, Giacomo Longo, Enrico Russo, Alessio Merlo — 2026 — https://arxiv.org/abs/2607.24563 — Incrementally ingests run-level Predictions into GraphAssertions with setup-deduplicated ConsensusAssertions across graph versions, preserving provenance and non-destructive revocation so re-ingestion corroborates rather than blindly duplicating trusted claims.

6. Semantic Similarity-Based Clustering of Findings From Security Testing Tools — Phillip Schneider, Markus Voggenreiter, Abdullah Gulraiz, Florian Matthes — 2022 — https://arxiv.org/abs/2211.11057 — Normalizes heterogeneous tool-report schemas and clusters semantically duplicate findings across scanners so multi-tool audit imports collapse to one logical issue rather than inflating counts from schema-different duplicates.

7. Proof-Gated Publication: Verify-Before-Commit Content Integrity for Serverless Data-Mesh Lakehouses — Viquar Khan — 2026 — https://arxiv.org/abs/2608.14643 — Fail-closes publication until an independent content proof PASSes; discusses idempotent/exactly-once writes as necessary but insufficient alone, and refuses consumer-visible commit of dropped, duplicated, or schema-drifted payloads.

8. Explanation-Bound Tool Execution for AI Agents: Server-Verified Action Claims Without Trusting Model Rationales — Genliang Zhu, Chu Wang — 2026 — https://arxiv.org/abs/2607.25364 — Mediates imports/actions with typed claims checked against server-held schema/policy/provenance facts: conflicts deny, incomplete or uncertain claims go to review, and only matching claims remain eligible — a fail-closed pattern for malformed structured submissions.

Papers invented requiring non-idempotent finding inserts: 0. Invented universal 80-control count: 0.
Tip: 57c4319. Extra context only: AUDIT-CONTRACT.md, src/audit/, migration-004-findings-idempotent.sql.

✅
