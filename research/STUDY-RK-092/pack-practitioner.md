STUDY-RK-092 Q2 (Practitioner)

stop: tip `05bd41c` · #22 OPEN not on tip · `rk note --delete` CLI integration-test debt · tip vs #22 head `863e7fd` · NEW duplicate coding PR yes/no.
prerequisite: tip `05bd41c` on main · #22 OPEN · clone `/workspace/studio/repo-knowledge` · gh as mcp-tool-shop · prior 035/065 handoffs · CLI `src/cli.ts` exports `--delete` on note.
owner: Practitioner
fallback: tip/PR inventory cannot be verified without invent → 🛑 Coordinator; do not invent STUDY-RK-101.

Eight doc/GH/API/tip sources. Soft folklore tip-already-covered / silent-delete-default / risk-free merge #22 / STUDY-RK-101: fail. 🛑 do not merge #22.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/05bd41cf4874235843388e423ac95adb1eff62eb | Finding: tip `05bd41c` is main (STUDY-RK-091 land); inventory used this sha only; no execute and no git write on this job.

2. PR #22 still OPEN (035) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/22 | Finding: state OPEN; head `863e7fd` is not an ancestor of tip; title STUDY-RK-035 note --delete CLI integration tests; files = only `test/cli-note-delete.test.ts` (+144/−0).

3. Tip ABSENT PR-named test path | org: local tip `05bd41c` | date: 2026-09-23 | path: test/cli-note-delete.test.ts | Finding: tip PATH_MISS `test/cli-note-delete.test.ts` (also PATH_MISS note-delete / cli-note alias names). Soft folklore tip-already-covered: fail.

4. Tip CLI surface already has `--delete` | org: local tip | date: 2026-09-23 | path: src/cli.ts | Finding: `note` command description includes Add (or --delete); option `--delete` routes to `deleteNote`; success and not-found messaging present on tip. CLI feature on tip is not the same as CLI integration-test coverage on tip.

5. Tip classify / unit tests ≠ note-delete CLI coverage | org: local tip | date: 2026-09-23 | paths: test/classify.test.ts, test/db.test.ts, test/cli-async.test.ts, test/cli-exit.test.ts, test/cli-publish.test.ts | Finding: tip has classify suite plus other cli-* suites; db.test.ts covers `deleteNote` DB helper only — no process spawn of `rk note … --delete`. Classify set/clear coverage is not note --delete CLI integration debt closure.

6. #22 head pins explicit `--delete` contract | org: git tip…863e7fd | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/22 | Finding: head test header pins success exit 0, not-found exit 1, misuse without --content and without --delete exit 2; keeps explicit `--delete` and rejects silent-delete-default; optional confirm/--yes not added. Contract file still unmerged onto tip.

7. Prior 035/065 hold | org: local research | date: tip tree | paths: research/STUDY-RK-035/handoff.md, research/STUDY-RK-065/handoff.md | Finding: 035 opened #22 for CLI integration tests of `rk note --delete`; 065 is research-only, NEW coding PR no, do not duplicate #22, 🛑 do not merge #22, KEEP explicit --delete. REAFFIRM residual OPEN test debt.

8. Diffstat tip…#22 | org: git | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/22 | Finding: tip…head still shows solely `test/cli-note-delete.test.ts` +144 lines — debt remains open; inventing tip-already-covered or risk-free merge fails.

Answer: After tip `05bd41c`, vendor/docs/GH/tip inventory still shows `rk note --delete` CLI integration-test debt while #22 stays OPEN (REAFFIRM STUDY-RK-035 / STUDY-RK-065). Tip ABSENT `test/cli-note-delete.test.ts`. Tip has classify tests and `deleteNote` unit coverage, which is not note-delete CLI integration coverage. NEW duplicate coding PR: no. 🛑 do not merge #22.

tip-already-covered: 0 · silent-delete-default: 0 · risk-free merge #22: 0 · STUDY-RK-101 invented: 0

✅ · 🛑 · 🔧
