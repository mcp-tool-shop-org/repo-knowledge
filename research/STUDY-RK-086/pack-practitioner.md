# STUDY-RK-086 — pack-practitioner

Tip `835652e`. Eight doc/GH/API/tip sources. Coverage-% invented: 0 · STUDY-RK-101 invented: 0 · Soft folklore tip-already-covered / risk-free merge: 0. 🛑 do not merge #13/#14/#15.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/835652ef998c11b7357d713172c3b576dba87e34 | Finding: tip `835652e` is main (STUDY-RK-085 land); read-only inventory used this sha only.

2. PR #13 still OPEN (022) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 | Finding: state OPEN; head `ce6743a` is not an ancestor of tip; title scopes STUDY-RK-022 dedicated vitest for errors + audit controls/queries; changedFiles=3.

3. PR #14 still OPEN (023) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 | Finding: state OPEN; head `8fee954` is not an ancestor of tip; title scopes STUDY-RK-023 dedicated vitest for health doctor/feed/table; changedFiles=4.

4. PR #15 still OPEN (024) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/15 | Finding: state OPEN; head `e75f703` is not an ancestor of tip; title scopes STUDY-RK-024 dedicated vitest for sync/github + dogfood-suggest; changedFiles=2.

5. Tip vs #13 file presence (counts only) | org: local tip `835652e` | date: 2026-09-23 | path: test/ | Finding: PR head adds 3 files — audit-controls.test.ts, audit-queries.test.ts, errors.test.ts — tip MISS 3/3; tip still has src/errors.ts + src/audit/controls.ts + src/audit/queries.ts (HIT modules, MISS dedicated suites).

6. Tip vs #14 file presence (counts only) | org: local tip `835652e` | date: 2026-09-23 | path: test/ | Finding: PR head lists 4 files — doctor/feed/table/health-commands — tip MISS doctor.test.ts, feed.test.ts, table.test.ts (3); tip HIT health-commands.test.ts (1); tip still has src/health/{doctor,feed,table}.ts; dedicated 023 debt not on tip.

7. Tip vs #15 file presence (counts only) | org: local tip `835652e` | date: 2026-09-23 | path: test/ | Finding: PR head adds 2 files — github.test.ts, dogfood-suggest.test.ts — tip MISS 2/2; tip still has src/sync/github.ts + src/sync/dogfood-suggest.ts; tip test/*.test.ts count=38; vitest include remains test/**/*.test.ts with floors 50/40/50 (thresholds only, not measured %).

8. Prior 058/059 hold still applies | org: local research | date: tip tree | paths: research/STUDY-RK-058/handoff.md, research/STUDY-RK-059/handoff.md | Finding: both handoffs landed coding-PR-none with 🛑 do not merge #13/#14/#15; residual stays open dedicated vitest debt on those PRs — not a tip-covered folklore wipe.

Answer: At tip `835652e`, #13/#14/#15 are still OPEN and not on tip. Dedicated vitest debt for STUDY-RK-022/023/024 remains (tip MISS 8 of 9 PR-named dedicated test files; only health-commands HIT). NEW duplicate coding PR: no. 🛑 do not merge #13/#14/#15.
