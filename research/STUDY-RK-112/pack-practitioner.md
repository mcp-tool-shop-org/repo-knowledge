# STUDY-RK-112 — pack-practitioner

Tip `48141a1`. Eight docs/GH/API/local-tip sources. Soft folklore invent tip-lacks-errors-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28. REAFFIRM 022/058. No implications-as-final. Voice: Seven doc/API sources. I did not invent What.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/48141a1174c6810815e44449cde250c67c57c1bf | Finding: short sha `48141a1` equals origin/main (“research: stamp STUDY-RK-111 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-111/` five files present; `research/STUDY-RK-112/` absent (stamp residual for Builder, not a coding PR).

2. Dedicated errors/audit test files ABSENT on tip | org: local tip `48141a1` | date: 2026-09-23 | paths: `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts` (missing) | Finding: none of the three dedicated filenames exist on tip; filename absence alone does not authorize invent tip-lacks-errors-coverage as a NEW coding PR while open #13 already owns those paths.

3. Tip audit coverage via `test/audit-import.test.ts` | org: local tip `48141a1` | date: tip tree 2026-09-23 | path: `test/audit-import.test.ts` | Finding: tip suite imports `seedControls` from `src/audit/controls.js` and `getLatestAudit` / `getAuditPosture` / `getOpenFindings` / `getPortfolioPosture` / `findByAuditStatus` / `compareRuns` from `src/audit/queries.js`, with **30 live its** across import + audit-queries describes — controls/queries are exercised on main without dedicated sibling files.

4. Related tip paths (mcp / cli) | org: local tip `48141a1` | date: 2026-09-23 | paths: `test/mcp-server.test.ts` · `test/cli-publish.test.ts` | Finding: mcp-server also imports `seedControls` + `importAuditInline`; cli-publish exercises audit JSON surfaces (`audit_posture`, findings/controls/unaudited `--json`, failing-domain hint) — orthogonal CLI/MCP seats, not a substitute for dedicated `errors.test.ts`.

5. Tip `src/errors.ts` has no tip test importer | org: local tip `48141a1` | date: 2026-09-23 | path: `src/errors.ts` · tip `test/**` | Finding: tip exports `RkError` / `RepoKnowledgeError` with zero `test/` or `src/` importers of that module on tip (orphan shape) — residual matches STUDY-RK-022 plan and is **owned by open #13**, not a free-floating NEW coding PR. Invent tip-lacks-errors-coverage → NEW PR: fail.

6. PR #13 owns dedicated errors + audit controls/queries | org: mcp-tool-shop-org | date: created 2026-09-12 · OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · head `ce6743a` | Finding: OPEN #13 files are exactly `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts` — residual dedicated gap is owned here. Invent restack-#13/#14/#15: fail.

7. PR #14 / #15 orthogonal | org: mcp-tool-shop-org | date: OPEN 2026-09-23 | URLs: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 · /15 | Finding: #14 head `8fee954` is doctor/feed/table + health-commands; #15 head `e75f703` is `test/github.test.ts` + `test/dogfood-suggest.test.ts` — zero overlap with errors/audit dedicated paths; do not invent cross-ownership.

8. REAFFIRM 022/058 + NEW coding PR gate | org: local tip research + open #13 | date: 2026-09-23 | paths: `research/STUDY-RK-022/` · `research/STUDY-RK-058/` · open #13 | Finding: 022 planned dedicated vitest for orphan `errors.ts` + controls/queries (reuse audit-import); 058 KEEP #13/#14 OPEN unmerged. Because residual dedicated files are **owned by open #13**, **NEW coding PR: no**. Invent tip-lacks-errors-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131: fail. 🛑 do not merge #6 #8 #12–#28.

Answer: At tip `48141a1`, dedicated `test/errors.test.ts` / `audit-controls.test.ts` / `audit-queries.test.ts` are **ABSENT**. Tip still covers audit controls/queries via `test/audit-import.test.ts` (30 its) plus mcp/cli-publish seats; `src/errors.ts` remains an unimported orphan on tip. Open #13 (`ce6743a`) owns those three dedicated files; #14/#15 are orthogonal. **NEW coding PR: no** — do not restack #13/#14/#15. REAFFIRM 022/058. 🛑 do not merge #6 #8 #12–#28.

✅ · 🛑 · 🔧
