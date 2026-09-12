STUDY-RK-021 Q3 Analogist — tip `cb1803b` · consumer repo-knowledge coding

stop: handbook usage.md vs CLI drift (analogs).
prerequisite: Pass 1 done sha=`cb1803b`; tip `cb1803b`; consumer repo-knowledge coding.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: handbook `usage.md` (~184 lines) vs Commander `src/cli.ts` (~2870) — tool/flag count and docs lag; coding fix must treat CLI as source of truth for flags, handbook as synced surface.

1. GNU manuals must document all CLI args; man pages lag — GNU Coding Standards — ongoing — https://www.gnu.org/prep/standards/html_node/GNU-Manuals.html — Hold-with-limit: authoritative docs must cover every invocation option; secondary pages drift if not maintained with the binary.

2. help2man / `--help` vs curated man — coreutils/man-pages practice — ongoing — https://lists.nongnu.org/archive/html/coreutils/2025-09/msg00183.html — Hold-with-limit: generated help≠full handbook; flag surface still belongs in `--help`/binary first.

3. kubectl reference vs overview docs lag — Kubernetes kubectl docs — ongoing — https://kubernetes.io/docs/reference/kubectl/ — Hold-with-limit: complete flags live in reference/`--help`; overview pages omit many flags by design — those omissions are not “approved undocumented.”

4. OpenAPI vs SDK/docs schema drift — Fern schema-drift guide — 2026 — https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude — Hold-with-limit: undocumented implementation fields are drift, not product approval; couple docs to one contract.

5. OpenAPI/runtime undocumented status/fields — QASkills OpenAPI drift — ongoing — https://qaskills.sh/blog/api-testing-openapi-spec-drift-detection — Hold-with-limit: runtime surfaces absent from the contract fail validation; same for CLI flags absent from handbook/`--help`.

6. Click + sphinx-click single-source help — Pallets Click docs — ongoing — https://click.palletsprojects.com/en/stable/documentation/ — Hold-with-limit: generate handbook from CLI definitions to kill count mismatches; limit: rk uses Commander — same single-source intent for the coding fix.

7. undocumented flags are approved product surface — Fail-transfer: flags in `cli.ts` without handbook/`rk --help` coverage are drift debt for STUDY-RK-021, not blessed API.

8. Soft folklore that README tables alone license omitting usage.md updates — Fail-transfer: coding consumer must sync handbook usage with CLI; Soft folklore: 0.

Soft folklore: 0. Undocumented-flags-approved claimed: 0. Did not invent STUDY-RK-051.
✅
