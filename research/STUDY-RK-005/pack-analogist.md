STUDY-RK-005 Q3 Analogist — tip `57c4319` · consumer repo-knowledge

stop: audit 80-control framework + findings idempotency (analogs).
prerequisite: STUDY-RK-004 done sha=`57c4319`; tip `57c4319`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: AUDIT-CONTRACT fixed 80-control catalog (`seedControls` INSERT OR REPLACE); findings upsert `ON CONFLICT(audit_run_id, domain, title, severity) DO UPDATE` (migration-004).

1. NIST SP 800-53 Rev. 5 / OSCAL fixed control catalog — NIST CSRC — 2020–25 — https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final — Hold-with-limit: versioned fixed control IDs (machine-readable OSCAL) are the assessment vocabulary; limit: catalog evolves by revision, findings still bind to stable control IDs within a revision.

2. CIS Controls v8 / IG1 fixed safeguard catalog — Center for Internet Security — 2021–24 — https://www.cisecurity.org/controls/v8-1 — Hold-with-limit: fixed Safeguard IDs + IG subsets mirror a seeded control table; limit: IG filtering ≠ inventing new control IDs per audit run.

3. SARIF 2.1 fingerprints / partialFingerprints — OASIS — 2020 — https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html — Hold-with-limit: result-management systems dedupe findings across runs via stable fingerprints; limit: fingerprint key choice is SoR-defined (here: run+domain+title+severity), not “append every scan row.”

4. SBOM vulnerability finding dedupe (CVE/PURL aliases) — DevGuard docs — ongoing — https://docs.devguard.org/explanations/vulnerability-management/vulnerability-matching/ — Hold-with-limit: matched vulns are deduplicated before counting; limit: alias collapse ≠ discarding distinct (path/component) instances when the key says they differ.

5. CMDB/incident correlation_id + UNIQUE upsert — ServiceNow practice — ongoing — https://www.servicenow.com/docs/r/washingtondc/api-reference/rest-apis/c_TableAPI.html — Hold-with-limit: idempotent create/update keyed by correlation_id prevents duplicate tickets; limit: UNIQUE alone fails closed on conflict—needs ON CONFLICT/update path like audit import.

6. Clang DiagnosticGroups.td / diagtool fixed diagnostic catalog — LLVM/Clang — ongoing — https://clang.llvm.org/docs/CommandGuide/diagtool.html — Hold-with-limit: diagnostics are a fixed ID/group catalog; compilers emit against known IDs, not invent groups per TU; limit: warning enablement ≠ expanding the catalog ad hoc in the SoR.

7. Findings may be inserted non-idempotently / duplicates are fine — Fail-transfer: AUDIT-CONTRACT import uses UNIQUE + ON CONFLICT DO UPDATE; migration-004 exists specifically for findings idempotency; duplicates-are-fine does not transfer.

8. Soft folklore that auditors may invent open-ended control IDs without the seeded catalog — Fail-transfer: controls are fixed (`CONTROLS` 80 IDs, `INSERT OR REPLACE` seed); unknown control_id is rejected; soft folklore: 0.

Soft folklore: 0. Non-idempotent-insert claimed: 0. Did not invent STUDY-RK-021.
✅
