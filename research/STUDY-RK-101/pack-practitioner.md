# STUDY-RK-101 Q2 · Practitioner pack
Tip: `ad5dead` · clone `/workspace/studio/repo-knowledge` · gh as mcp-tool-shop · docs/GH/API + local tip · no invent merge / invent STUDY-RK-131 · 🛑 do not merge #6 #8 #12–#26

Seven doc/API sources. I did not invent merge clearance or STUDY-RK-131.

## Answer
On origin/main tip `ad5dead` (full `ad5dead8745b0aad308d56077f2300be72c15fc8`, package **v2.1.1**), eight `src/**/*.ts` modules lack dedicated `test/*.test.ts` counterparts carried only on OPEN PRs #13–#15; `src/index.ts` is a public barrel with no dedicated test (outside those PRs). `test/health-commands.test.ts` is already on main (#14 also touches it). NEW coding PR: **no**. 🛑 do not merge #6 #8 #12–#26.

### Table — src lacking dedicated counterpart on main

| src module | expected dedicated test | on main? | open PR |
|------------|-------------------------|----------|---------|
| `src/audit/controls.ts` | `test/audit-controls.test.ts` | no | #13 |
| `src/audit/queries.ts` | `test/audit-queries.test.ts` | no | #13 |
| `src/errors.ts` | `test/errors.test.ts` | no | #13 |
| `src/health/doctor.ts` | `test/doctor.test.ts` | no | #14 |
| `src/health/feed.ts` | `test/feed.test.ts` | no | #14 |
| `src/health/table.ts` | `test/table.test.ts` | no | #14 |
| `src/sync/dogfood-suggest.ts` | `test/dogfood-suggest.test.ts` | no | #15 |
| `src/sync/github.ts` | `test/github.test.ts` | no | #15 |
| `src/index.ts` | (barrel / none) | n/a | — |

### Table — dedicated tests only on #13–#15 (not on main)

| test file | PR | on main? |
|-----------|-----|----------|
| `test/audit-controls.test.ts` | #13 | no |
| `test/audit-queries.test.ts` | #13 | no |
| `test/errors.test.ts` | #13 | no |
| `test/doctor.test.ts` | #14 | no |
| `test/feed.test.ts` | #14 | no |
| `test/table.test.ts` | #14 | no |
| `test/dogfood-suggest.test.ts` | #15 | no |
| `test/github.test.ts` | #15 | no |

## Findings (8)

1. **Tip + version** — Title: stamp STUDY-RK-100. Org: mcp-tool-shop-org/repo-knowledge. Date: 2026-09-23. Path: tip `ad5dead8745b0aad308d56077f2300be72c15fc8` = origin/main; `package.json` v2.1.1. Finding: Tip matches origin/main at v2.1.1.

2. **Corpus sizes** — Title: tip src/test counts. Org: local tip. Date: tip `ad5dead`. Path: `/workspace/studio/repo-knowledge/{src,test}`. Finding: 32 `src/**/*.ts` and 38 `test/*.test.ts` on tip; size ≠ dedicated coverage for the eight gaps.

3. **PR #13** — Title: STUDY-RK-022 dedicated vitest errors + audit controls/queries. Org: mcp-tool-shop-org. Date: 2026-09-12. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13. Finding: OPEN; files `test/audit-controls.test.ts`, `test/audit-queries.test.ts`, `test/errors.test.ts` — all ABSENT on main.

4. **PR #14** — Title: STUDY-RK-023 dedicated vitest health doctor/feed/table. Org: mcp-tool-shop-org. Date: 2026-09-12. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14. Finding: OPEN; doctor/feed/table ABSENT on main; `test/health-commands.test.ts` already ON main and listed in PR files.

5. **PR #15** — Title: STUDY-RK-024 dedicated vitest sync/github + dogfood-suggest. Org: mcp-tool-shop-org. Date: 2026-09-12. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/15. Finding: OPEN; `test/dogfood-suggest.test.ts` and `test/github.test.ts` ABSENT on main.

6. **KNOWLEDGE-CONTRACT** — Title: KNOWLEDGE-CONTRACT.md. Org: local tip. Date: tip `ad5dead`. Path: `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md`. Finding: Contract requires reading code, package files, docs, tests, and CI — src↔test inventory is contract-aligned, not blog SEO.

7. **AUDIT-CONTRACT** — Title: AUDIT-CONTRACT.md. Org: local tip. Date: tip `ad5dead`. Path: `/workspace/studio/repo-knowledge/AUDIT-CONTRACT.md`. Finding: Schema lists `testing` in `domains_checked` and includes `test_count` — dedicated-suite gaps are audit-relevant without inventing coverage %.

8. **Holds + anti-invent** — Title: open PR hold set. Org: mcp-tool-shop-org. Date: 2026-09-23. URL: open #6 #8 #12–#26. Finding: #13–#15 stay OPEN for this debt; 🛑 do not merge; inventing merge or STUDY-RK-131 fails.

## Four fields
| Field | Value |
|-------|--------|
| src lacking dedicated test on main | controls, queries, errors, doctor, feed, table, dogfood-suggest, github (+ index barrel) |
| dedicated tests only on #13–#15 | eight files in second table |
| tip SHA / version | `ad5dead8745b0aad308d56077f2300be72c15fc8` / v2.1.1 |
| NEW coding PR | no |

✅ · 🛑 · 🔧
