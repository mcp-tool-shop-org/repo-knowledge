STUDY-RK-067 Q2 (Practitioner)
Eight doc/API sources. NEW --json core test PR: **no**. Drift since 038: **no**.

1. Tip + paths present | tip `f2e6d01` | Finding: research/STUDY-RK-038/, src/cli.ts, test/cli-publish.test.ts exist. PASS

2. STUDY-RK-038 KEEP | grounding.md | Finding: KEEP dual human+`--json`; text default; concrete gap = no; json-as-only-output do not land. PASS

3. tip --json flags | src/cli.ts | Finding: 19 `.option('--json')` registrations; rendering switch; text paths remain. PASS

4. CLI-JSON-CORE suite | test/cli-publish.test.ts | Finding: Dedicated describe present — list/show/not-found/stats/find/audit/doctor --json coverage. PASS

5. Drift since 038 tip `e9716ad` | Finding: git log empty on cli.ts + cli-publish.test.ts through f2e6d01. Drift: no. PASS

6. Text default still present | Finding: --json default false; human formatters remain. PASS

7. Residual NEW --json core test PR? | Finding: **no**. PASS

8. Invent gates | STUDY-RK-081: 0 · json-as-only-output: 0 · NEW mandatory --json core PR: 0. PASS

Verifier: Practitioner 8/8 PASS. NEW --json core test PR: no. Drift since 038: no.

✅
