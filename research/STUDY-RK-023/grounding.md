# STUDY-RK-023 — Research grounding (verified — copy)

STUDY-RK-023 Research grounding · tip `55fcc39`

Verifier: Scholar 8/8 · Practitioner 8/8 · Analogist 1–3/5–6 hold-with-limit; #4 SRE monitoring → unverified; 7–8 fail-transfer. Invented gates: 0. Flag Analogist #4.

Thesis (coding, not coverage %): shared health-commands.test.ts ≠ dedicated doctor/feed/table suites (siblings already have diff.test.ts / fsck.test.ts). Land dedicated vitest locking builders+renderers; keep or migrate health-commands asserts. Thin locks: feed action_sha_rewritten; doctor malformed toolchain_pin → null; table gradeCi no_workflow/unknown. DB-read surfaces only — fsck stays write-path. Floors remain thresholds only.

**Unverified / do not land as verified:** Analogist #4; Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Coverage % · STUDY-RK-051.

stop: dedicated vitest for health doctor/feed/table. Do not merge. Do not invent STUDY-RK-051.
