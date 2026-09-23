# STUDY-RK-107 — pack-practitioner

Tip `b24994b`. Eight docs/GH/API/local-tip sources. Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#28. No implications-as-final. Voice: Seven doc/API sources. I did not invent What.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/b24994bda08ba7329b6994c903d87aee74f10b2a | Finding: short sha `b24994b` equals origin/main (“research: stamp STUDY-RK-106 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-106/` five files present; `research/STUDY-RK-107/` absent (stamp residual for Builder, not a coding PR).

2. Dedicated FTS vitest PRESENT on tip | org: local tip `b24994b` | date: 2026-09-23 | path: `test/fts.test.ts` | Finding: tip carries dedicated suite (`499` lines, `13` `describe` blocks) covering rebuildIndex, MATCH search, multi-term AND, snippets, FTS5 fallback/reserved syntax, Unicode, triggers, literal colon queries, and search-limit clamp/honor paths — soft folklore invent tip-lacks-FTS-suite: fail.

3. Tip FTS implementation module | org: local tip `b24994b` | date: 2026-09-23 | path: `src/search/fts.ts` | Finding: tip also ships the FTS5 layer (rebuildIndex/search exports, MATCH queries) that the dedicated vitest exercises; suite absence is not the tip state; package.json scripts already invoke vitest run for the tip tree.

4. Open hold set includes #28 | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pulls?q=is%3Aopen | Finding: open numbers remain #6 #8 #12–#26 plus #28; 🛑 do not merge any of them; this inventory does not clear or restack those holds.

5. PR #13 file set — no fts | org: mcp-tool-shop-org | date: created 2026-09-12 / still OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 | Finding: OPEN head `ce6743a` title STUDY-RK-022; files only `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts` — zero `fts` paths; invent restack-#13 to carry FTS: fail.

6. PR #14 file set — no fts | org: mcp-tool-shop-org | date: created 2026-09-12 / still OPEN 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 | Finding: OPEN head `8fee954` title STUDY-RK-023; files `test/doctor.test.ts` · `test/feed.test.ts` · `test/table.test.ts` · `test/health-commands.test.ts` — zero `fts` paths; invent restack-#14: fail.

7. PR #28 is HANDBOOK-only (106 leftover) | org: mcp-tool-shop-org | date: created 2026-09-23 / OPEN | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/28 | Finding: OPEN head `c323e8f` files exactly `HANDBOOK.md` (STUDY-RK-106 rk backup/restore leftover docs); does not own `test/fts.test.ts`; docs leftover ≠ FTS coding vehicle.

8. NEW FTS coding PR gate | org: tip presence + open-PR owner scan | date: 2026-09-23 | path: tip `test/fts.test.ts` · open PRs #13/#14/#15/#22/#28 | Finding: because dedicated FTS vitest is **PRESENT** on tip, **NEW coding PR: no** (forbidden as duplicate of tip, not as a restack of #13/#14). No open PR lists `test/fts.test.ts`, so absence-outside-PRs does not apply. Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: fail. Peer vitest holds (#13/#14/#15) stay OPEN for their own modules only; #15 owns dogfood-suggest/github tests, still not fts.

Answer: At tip `b24994b`, dedicated FTS vitest **is present** on main (`test/fts.test.ts`). Open #13/#14 do **not** own that path (errors/audit and doctor/feed/table/health only); #28 owns `HANDBOOK.md` only. **NEW FTS coding PR: no** — suite already on tip; do not restack #13/#14. 🛑 do not merge #6 #8 #12–#28.

✅ · 🛑 · 🔧
