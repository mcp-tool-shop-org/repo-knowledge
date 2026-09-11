# STUDY-RK-005 — Research grounding (verified — copy)

1. Lit. OSCAL/control catalogs, finding dedupe/clustering, fail-closed import (Cilla; EMERALD; Lee SSMF; AspisAI; TRACE-CTI; Schneider; Khan; Zhu/Wang).
2. Docs. Fixed catalog 19 domains / 80 controls; append-only IDs. Findings idempotent: migration-004 UNIQUE `(audit_run_id, domain, title, severity)` + `ON CONFLICT DO UPDATE`. Unknown-present domain → `code_quality` warn; missing domain hard error. On-page controls: **80**.
3. Analogs hold-with-limit: NIST 800-53; CIS v8; SARIF fingerprints; SBOM vuln dedupe; Clang diag catalog. Analogist #5 ServiceNow Table API: unverified.

**Unverified / do not land as verified:** Analogist #5 (ServiceNow Table API); Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Non-idempotent-insert-required · Universal-80-from-papers · Invent open-ended control IDs.

Verifier: Scholar 8/8 · Practitioner 8/8 (on-page **80**) · Analogist 1–4,6 hold; #5 unverified; 7–8 fail-transfer.

Do not invent STUDY-RK-021.
