# STUDY-RK-022 — Research grounding (verified — copy)

STUDY-RK-022 Research grounding · tip `bdfe26f`

Verifier: Scholar 6/8 (#2 Hora/Fraser · #5 Hossain/Dwyer → unverified) · Practitioner 8/8 · Analogist 1–6 hold-with-limit; 7–8 fail-transfer. Invented gates: 0. Flag Scholar #2/#5.

Thesis (coding, not coverage %): green vitest ≠ dedicated suite. Land dedicated tests for `src/errors.ts` (orphan: RkError/RepoKnowledgeError shape + toJSON + retryable default), `src/audit/controls.ts` (DOMAINS=19 / CONTROLS=80 / unique ids / seedControls / getApplicableControls null+match+malformed F-AG-012), `src/audit/queries.ts` (keep audit-import coverage; add getExceptions + any still-indirect surfaces). Floors in vitest.config stay thresholds only — do not invent module %.

**Unverified / do not land as verified:** Scholar #2/#5; Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Coverage % · Suite-green-as-coverage folklore · STUDY-RK-051.

stop: dedicated vitest for errors.ts + audit controls/queries. Do not merge. Do not invent STUDY-RK-051.
