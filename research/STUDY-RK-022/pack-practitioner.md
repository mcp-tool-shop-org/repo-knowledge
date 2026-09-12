STUDY-RK-022 Q2 (Practitioner)

stop: vitest for errors.ts + audit controls/queries (docs + source).
prerequisite: STUDY-RK-021 done sha=`4031f1e` PR #12; tip `bdfe26f`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent coverage % or STUDY-RK-051.

1. STUDY-RK-016 grounding named gaps | org: local research | date: tip lineage (e7ba934 research land; present at bdfe26f) | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-016/grounding.md` | Finding: verified gaps include errors.ts (unreferenced) and audit/controls+queries (indirect only); green vitest ≠ dedicated suite per module; Invented coverage % gate: 0.

2. src/errors.ts still orphan | org: local | date: tip `bdfe26f` | path: `/workspace/studio/repo-knowledge/src/errors.ts` | Finding: exports RkError + RepoKnowledgeError (constructor opts hint/cause/retryable default false; toJSON); no test/*.test.ts and no other src/*.ts import it at tip — still no dedicated or consumer coverage.

3. Behaviors tests should lock for errors.ts | org: local | date: tip `bdfe26f` | path: src/errors.ts | Finding: lockable without inventing % — name=RepoKnowledgeError; code/message set; retryable defaults false and opts override; toJSON returns {code,message,hint,cause,retryable}; instanceof Error.

4. src/audit/controls.ts surface | org: local | date: tip `bdfe26f` | path: `/workspace/studio/repo-knowledge/src/audit/controls.ts` | Finding: exports Domain, Control, DOMAINS (19), CONTROLS (80 fixed ids), seedControls (INSERT OR REPLACE, returns CONTROLS.length), getApplicableControls (JSON applicable_to filter + malformed-JSON fallback to all).

5. controls.ts vs tests | org: local | date: tip `bdfe26f` | paths: test/audit-import.test.ts, test/mcp-server.test.ts | Finding: no controls.test.ts; only seedControls imported as setup; no dedicated asserts on DOMAINS.length===19, CONTROLS.length===80, unique ids, or getApplicableControls shape/malformed-JSON path.

6. Behaviors tests should lock for controls.ts | org: local | date: tip `bdfe26f` | path: src/audit/controls.ts (+ public reexport src/index.ts) | Finding: lock DOMAINS=19 / CONTROLS=80 / unique control ids; seedControls return value and row count; getApplicableControls includes null applicable_to as all; includes matching appShape; malformed applicable_to treated as all (F-AG-012).

7. src/audit/queries.ts vs audit-import tests | org: local | date: tip `bdfe26f` | paths: src/audit/queries.ts, test/audit-import.test.ts | Finding: no queries.test.ts; audit-import exercises getLatestAudit, getAuditPosture, getOpenFindings (+unfiltered), getPortfolioPosture, findByAuditStatus variants, compareRuns null-vs-0 (F-AG-013); getExceptions has zero test references.

8. package.json verify + vitest.config | org: local | date: tip `bdfe26f` | paths: package.json, vitest.config.ts | Finding: verify=typecheck+lint+test+test:scripts; test=vitest run; coverage include src/**/*.ts with floors lines 50 / branches 40 / functions 50 — floors are thresholds only, not measured module %; 38 test files / 32 src ts files unchanged inventory shape.

Coverage % invented: 0 · STUDY-RK-051 invented: 0

✅
