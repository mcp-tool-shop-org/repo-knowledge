# STUDY-RK-111 — pack-practitioner

Tip `c399182`. Eight docs/GH/API/local-tip sources. Soft folklore invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28. REAFFIRM 039/068 KEEP dual doctor. No implications-as-final. Voice: Seven doc/API sources. I did not invent What.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/c39918207606ded045f5e386d1252963812c878b | Finding: short sha `c399182` equals origin/main (“research: stamp STUDY-RK-110 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-110/` five files present; `research/STUDY-RK-111/` absent (stamp residual for Builder, not a coding PR).

2. Tip CLI-PR-003 `rk doctor` PRESENT | org: local tip `c399182` | date: tip tree 2026-09-23 · describe landed 2026-06-20 | path: `test/cli-publish.test.ts` | Finding: tip carries `describe('CLI-PR-003: rk doctor preflight (cli.ts)')` with 1 dist-skip gate + 2 live its (`rk doctor --json` checks array; `rk doctor --json --strict` non-zero on red) — invent tip-lacks-doctor-coverage: fail for the CLI preflight seat.

3. Tip `test/health-commands.test.ts` PRESENT (barrel) | org: local tip `c399182` | date: tip tree 2026-09-23 · lineage 2026-06-20 | path: `test/health-commands.test.ts` | Finding: tip imports `buildFeed` / `buildRepoDoctor` / `buildHealthTable` (+ renderers) from `src/health/index.js` with **3 describes and 19 live its** (7 feed · 3 buildRepoDoctor · 9 buildHealthTable), 0 skips — health doctor/feed/table contract holds on main.

4. Dedicated doctor/feed/table files ABSENT (non-blocking) | org: local tip `c399182` | date: 2026-09-23 | paths: `test/doctor.test.ts` · `feed.test.ts` · `table.test.ts` (missing) · coverage `health-commands` + CLI-PR-003 | Finding: those three filenames are absent on tip; absence ≠ tip lacks doctor/health coverage while the barrel suite and CLI-PR-003 remain, so filename gap alone does not warrant a NEW coding PR.

5. PR #14 owns dedicated split + health-commands | org: mcp-tool-shop-org | date: created 2026-09-12 · OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 · head `8fee954` | Finding: OPEN #14 adds `test/doctor.test.ts` · `feed.test.ts` · `table.test.ts` plus a thin `health-commands` touch; commit keeps health-commands as barrel — residual dedicated paths are **owned by open #14**. Invent restack-#13/#14: fail.

6. PR #13 — no doctor/health paths | org: mcp-tool-shop-org | date: OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · head `ce6743a` | Finding: #13 files only `test/errors.test.ts` · `audit-controls.test.ts` · `audit-queries.test.ts`; zero doctor/feed/table/health-commands/cli-publish doctor paths — do not invent #13 ownership of health coverage.

7. REAFFIRM 039/068 KEEP dual doctor | org: local tip research | date: tip tree 2026-09-23 | paths: `research/STUDY-RK-039/` · `research/STUDY-RK-068/` | Finding: both five-file trees present; grounding keeps dual doctor names (top-level `rk doctor` preflight vs `rk health doctor <slug>`), default-read + `--refresh` opt-in — tip CLI-PR-003 + health-commands pin both seats; do not invent tip-dropped-dual.

8. NEW coding PR gate | org: tip coverage + open #14 | date: 2026-09-23 | path: tip CLI-PR-003 · `test/health-commands.test.ts` · open #14 | Finding: doctor/health vitest is **PRESENT** on tip (CLI-PR-003: 2 live its + skip; health-commands: 3 describes / 19 its) and open #14 owns the dedicated sibling residual, so **NEW coding PR: no**. Invent tip-lacks-doctor-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: fail. 🛑 do not merge #6 #8 #12–#28.

Answer: At tip `c399182`, doctor/health vitest is **PRESENT** on main — CLI-PR-003 in `test/cli-publish.test.ts` (2 live its + skip) and `test/health-commands.test.ts` (3 describes / 19 its). Dedicated `doctor`/`feed`/`table` test files absent but non-blocking. Open #14 (`8fee954`) owns those dedicated files; #13 owns errors/audit only. **NEW coding PR: no** — do not restack #13/#14. REAFFIRM 039/068 KEEP dual doctor. 🛑 do not merge #6 #8 #12–#28.

✅ · 🛑 · 🔧
