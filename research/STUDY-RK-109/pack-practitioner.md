# STUDY-RK-109 — pack-practitioner

Tip `8299e8b`. Eight docs/GH/API/local-tip sources. Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28. REAFFIRM 037/066/#23 — do not merge #23. No implications-as-final. Voice: Seven doc/API sources. I did not invent What.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/8299e8b68c54e1c2ab3c0d9bf9c38af307e58988 | Finding: short sha `8299e8b` equals origin/main (“research: stamp STUDY-RK-108 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-108/` five files present; `research/STUDY-RK-109/` absent (stamp residual for Builder, not a coding PR).

2. Tip CLI `rk backup` / `rk restore` | org: local tip `8299e8b` | date: 2026-09-23 | path: `src/cli.ts` | Finding: tip registers `.command('backup')` (VACUUM INTO snapshot under data/backups or `--out`) and `.command('restore <path>')` (confirm-gated swap with newer-schema refusal); CLI surface is on main, not missing.

3. Tip backup/restore vitest PRESENT (CLI-PR-001) | org: local tip `8299e8b` | date: 2026-09-23 | path: `test/cli-publish.test.ts` | Finding: tip carries `describe('CLI-PR-001: backup / restore (cli.ts)')` with 3 `it` entries (1 build-skip gate + 2 live cases: backup→mutate→restore round-trip; restore refuses newer `schema_version` with exit 2) — soft folklore invent tip-lacks-backup-coverage: fail.

4. Dedicated `test/backup.test.ts` ABSENT (non-blocking) | org: local tip `8299e8b` | date: 2026-09-23 | path: `test/backup.test.ts` (missing) · coverage path `test/cli-publish.test.ts` | Finding: no standalone `test/backup.test.ts` / `test/restore*.test.ts` on tip; coverage lives inside `cli-publish` CLI-PR-001, so absence of a dedicated filename ≠ tip lacks backup coverage and does not alone warrant a NEW coding PR.

5. PR #13 / #14 — no backup test paths | org: mcp-tool-shop-org | date: created 2026-09-12 / still OPEN 2026-09-23 | URLs: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · /14 | Finding: #13 OPEN head `ce6743a` files only errors + audit-controls/queries tests; #14 OPEN head `8fee954` files doctor/feed/table + health-commands tests — zero backup/restore test paths; invent restack-#13/#14 to carry backup suite: fail.

6. PR #23 docs-only (REAFFIRM 037/066) | org: mcp-tool-shop-org | date: still OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/23 | Finding: OPEN head `d56c5ed` title STUDY-RK-037 handbook ops rk backup/restore; files `CHANGELOG.md` + `site/src/content/docs/handbook/operations.md` only — docs vehicle, not vitest; `research/STUDY-RK-037/` and `research/STUDY-RK-066/` five-file trees present on tip; 🛑 do not merge #23.

7. PR #28 HANDBOOK leftover only | org: mcp-tool-shop-org | date: created 2026-09-23 / OPEN | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/28 | Finding: OPEN head `c323e8f` files exactly `HANDBOOK.md` (STUDY-RK-106 leftover docs); owns no test path; docs leftover ≠ backup coding PR.

8. NEW coding PR gate | org: tip coverage + open-PR owner scan | date: 2026-09-23 | path: tip `test/cli-publish.test.ts` CLI-PR-001 · open #13/#14/#23/#28 | Finding: because backup/restore vitest is **PRESENT** on tip (1 describe / 2 live its in CLI-PR-001) and open holds do not own a competing backup test path that would force restack, **NEW coding PR: no**. Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: fail. Open holds stay OPEN (#6 #8 #12–#28).

Answer: At tip `8299e8b`, backup/restore vitest coverage is **PRESENT** on main in `test/cli-publish.test.ts` (`CLI-PR-001`: 1 describe, 2 live its + 1 skip gate). `test/backup.test.ts` is absent but non-blocking. Open #13/#14/#23/#28 own no backup test paths (#23/#28 are docs). **NEW coding PR: no** — do not restack #13/#14; REAFFIRM do not merge #23. 🛑 do not merge #6 #8 #12–#28.

✅ · 🛑 · 🔧
