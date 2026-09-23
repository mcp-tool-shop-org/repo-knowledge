# STUDY-RK-110 — pack-practitioner

Tip `96b4e42`. Eight docs/GH/API/local-tip sources. Soft folklore invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28. REAFFIRM 038/067 KEEP dual human+`--json`. No implications-as-final. Voice: Seven doc/API sources. I did not invent What.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/96b4e428a7abfac55fa2aa6050bf224dbafc4bef | Finding: short sha `96b4e42` equals origin/main (“research: stamp STUDY-RK-109 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-109/` five files present; `research/STUDY-RK-110/` absent (stamp residual for Builder, not a coding PR).

2. Tip CLI-JSON-CORE describe PRESENT | org: local tip `96b4e42` | date: 2026-09-23 | path: `test/cli-publish.test.ts` | Finding: tip carries `describe('CLI-JSON-CORE: --json output (cli.ts)')` with 1 dist-skip gate + 3 direct its (`list --json` array, empty `list --json`, `show --json` with `audit_posture`) + `it.each` 3 not-found cases + `it.each` 5 read-surface cases (stats/find/audit findings|controls|unaudited) = **11 live --json its** in-block — soft folklore invent tip-lacks-json-coverage: fail.

3. Related tip --json its outside that describe | org: local tip `96b4e42` | date: 2026-09-23 | path: `test/cli-publish.test.ts` (`CLI-PR-003`) · also `test/colors.test.ts` · `test/cli-async.test.ts` · sync health tests | Finding: tip also has `rk doctor --json` under CLI-PR-003 and scattered `--json` mentions in colors/cli-async/sync tests; coverage is not limited to a missing dedicated file.

4. Dedicated `test/json.test.ts` ABSENT (non-blocking) | org: local tip `96b4e42` | date: 2026-09-23 | path: `test/json.test.ts` (missing) · coverage path `test/cli-publish.test.ts` | Finding: no standalone `test/json.test.ts` on tip; `--json` contract lives in CLI-JSON-CORE inside `cli-publish`, so filename absence ≠ tip lacks json coverage and does not alone warrant a NEW coding PR.

5. PR #13 / #14 — no --json test paths | org: mcp-tool-shop-org | date: created 2026-09-12 / still OPEN 2026-09-23 | URLs: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · /14 | Finding: #13 OPEN head `ce6743a` files only `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts`; #14 OPEN head `8fee954` files doctor/feed/table + health-commands tests — zero `cli-publish` / `json.test` / `--json` paths; invent restack-#13/#14: fail.

6. Open-PR owner scan for json test paths | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pulls?q=is%3Aopen | Finding: open set remains #6 #8 #12–#26 plus #28; no OPEN PR lists `test/json.test.ts` or edits CLI-JSON-CORE in `test/cli-publish.test.ts`; 🛑 do not merge any hold.

7. REAFFIRM 038/067 dual human+`--json` | org: local tip research | date: tip tree 2026-09-23 | paths: `research/STUDY-RK-038/` · `research/STUDY-RK-067/` | Finding: both five-file trees present on tip; prior board KEEP dual human and `--json` surfaces — tip CLI-JSON-CORE pins the machine side while human text paths remain separate; do not invent tip-already-dropped-dual.

8. NEW coding PR gate | org: tip coverage + #13/#14 file sets | date: 2026-09-23 | path: tip `test/cli-publish.test.ts` CLI-JSON-CORE · open #13/#14 | Finding: because `--json` / CLI-JSON-CORE vitest is **PRESENT** on tip (1 describe, 11 live its + skip gate) and open #13/#14 own no competing json test path, **NEW coding PR: no**. Soft folklore invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: fail.

Answer: At tip `96b4e42`, `--json` / CLI-JSON-CORE vitest coverage is **PRESENT** on main in `test/cli-publish.test.ts` (1 describe; 11 live its + 1 skip). `test/json.test.ts` absent but non-blocking. Open #13/#14 own no `--json` test paths. **NEW coding PR: no** — do not restack #13/#14. REAFFIRM 038/067 KEEP dual human+`--json`. 🛑 do not merge #6 #8 #12–#28.

✅ · 🛑 · 🔧
