STUDY-RK-005 Q2 — Practitioner

stop: audit 80-control framework + findings idempotency (docs + source).
prerequisite: STUDY-RK-004 done sha=`57c4319`; tip `57c4319`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary AUDIT-CONTRACT + audit/ + migration-004 state for control catalog shape, findings idempotency, enums, and unknown-domain/malformed handling?

Eight doc/API sources. I did not invent What. Non-idempotent findings-insert-as-required invented: 0. Do not invent STUDY-RK-021.

1. Canonical control catalog — mcp-tool-shop-org · tip `57c4319` (2026-09-11) · `/workspace/studio/repo-knowledge/src/audit/controls.ts` L1–35 — States **19 domains, 80 controls**; fixed IDs stable across repos; never rename/reuse; only append; `DOMAINS` + `CONTROLS` arrays (on-page count at tip: **80** unique ids).

2. README audit framework — mcp-tool-shop-org · tip `57c4319` · `README.md` L215 — “The audit system covers 19 domains with 80 controls” — matches catalog header (do not invent a different total).

3. AUDIT-CONTRACT enums + metrics shape — mcp-tool-shop-org · tip `57c4319` · `AUDIT-CONTRACT.md` L79–81, L122–168, L183–200 — `overall_status` (`pass`/`pass_with_findings`/`fail`/`incomplete`); `overall_posture` (`healthy`/`needs_attention`/`critical`/`unknown`); control `result` six-way; finding `severity`/`confidence`/`status` enums; metrics include severity counts + `controls_passed/failed/warned/skipped/total` (example `controls_total`: 56 is sample run metrics, not catalog size).

4. Domains fixed enum + unknown-domain policy — mcp-tool-shop-org · tip `57c4319` · `AUDIT-CONTRACT.md` L230–246 — Lists 19 domain strings; unknown-but-present domain **normalized to `code_quality`** with warning (not rejected); **missing** domain remains hard error (malformed).

5. import.ts normalizeFindingDomains — mcp-tool-shop-org · tip `57c4319` · `src/audit/import.ts` L198–237, L442–448 — `FALLBACK_DOMAIN = 'code_quality'`; present-out-of-enum remapped + warning; missing/empty/non-string left for validate hard-error; pure remap (no caller mutation).

6. Migration 004 findings idempotency — mcp-tool-shop-org · tip `57c4319` · `src/db/migration-004-findings-idempotent.sql` — Canonical identity `(audit_run_id, domain, title, severity)`; dedupe keep MIN(id); `UNIQUE INDEX idx_findings_canonical`; prevents duplicate findings inflating posture counts on re-import.

7. import ON CONFLICT DO UPDATE — mcp-tool-shop-org · tip `57c4319` · `src/audit/import.ts` L504–540 — Findings insert uses `ON CONFLICT(audit_run_id, domain, title, severity) DO UPDATE` (preserves row id; not `INSERT OR REPLACE`); scoped to same run id — retries reuse runId; fresh import creates new `audit_runs` row (append-only history).

8. queries posture open counts — mcp-tool-shop-org · tip `57c4319` · `src/audit/queries.ts` L218–255 — `getAuditPosture` reads latest run + open findings by severity (`status = 'open'`) into `open_findings` map — posture counts depend on non-duplicated findings.

On-page control total at tip: **80** (controls.ts + README). Invented non-idempotent-insert-required: 0.

✅
