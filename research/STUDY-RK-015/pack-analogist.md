STUDY-RK-015 Q3 Analogist — tip `66d57a5` · consumer repo-knowledge

stop: handbook vs CLI drift (analogs).
prerequisite: STUDY-RK-014 done sha=`66d57a5`; tip `66d57a5`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: three surfaces — Astro handbook (`site/.../handbook/`), README command tables, Commander `src/cli.ts` — can list different commands/flags/relation vocab; drift is a real operator cost.

1. GNU coreutils man pages vs `--help` (help2man generation) — GNU/coreutils + man-pages discussion — ongoing — https://lists.nongnu.org/archive/html/coreutils/2025-09/msg00183.html — Hold-with-limit: generated man from `--help` stays thin vs full manuals; dual surfaces diverge unless curated; limit: troff/info stack ≠ Astro handbook, same dual-doc risk.

2. OpenAPI as contract vs hand-maintained SDKs/docs — Fern / spec-first practice — 2026 — https://buildwithfern.com/post/stopping-schema-drift-coupling-sdks-documentation-claude — Hold-with-limit: when docs/SDKs are not generated/validated from one contract, schema drift is expected; limit: rk has no OpenAPI — CLI definition in `cli.ts` is the closest contract.

3. Click help strings + sphinx-click docs — Pallets Click / sphinx-click — ongoing — https://click.palletsprojects.com/en/stable/documentation/ — Hold-with-limit: single-source help→Sphinx prevents silent doc/CLI split; limit: Commander lacks sphinx-click; handbook is hand-written Markdown.

4. kubectl reference vs SRE runbook kubectl snippets — Kubernetes docs + runbook-drift practice — ongoing — https://kubernetes.io/docs/reference/kubectl/introduction/ — Hold-with-limit: official CLI reference and operational runbooks diverge when only one is updated; limit: cluster ops ≠ local rk, same runbook-vs-binary problem.

5. Runbook-as-code / CI freshness gates on stale commands — Doc Holiday / SRE ops writing — ongoing — https://doc.holiday/blog/keep-runbooks-up-to-date-after-incident — Hold-with-limit: stale kubectl in runbooks fails at 2am; treat doc updates as PR cost; limit: incident runbooks ≠ product handbook, same “doc must track CLI” pressure.

6. API contract testing / OpenAPI diff in CI — SpecDrift guides — ongoing — https://specdrift.dev/guides/api-contract-testing-ci — Hold-with-limit: CI makes divergence visible and fail-closed; limit: rk would need analogous checks (handbook/README vs `cli.ts` command list), not yet assumed.

7. handbook and CLI may silently diverge without operator cost — Fail-transfer: divergence misleads operators (missing commands, stale relation types); cost is real even if CI is absent.

8. Soft folklore that README alone is the live contract and handbook can lag forever — Fail-transfer: handbook/tutorial readers follow stale paths; Soft folklore: 0.

Soft folklore: 0. Silent-divergence-is-free claimed: 0. Did not invent STUDY-RK-021.
✅
