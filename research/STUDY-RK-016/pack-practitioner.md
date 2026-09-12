STUDY-RK-016 Q2 (Practitioner)

stop: vitest gaps which src/ modules lack tests (docs + source).
prerequisite: STUDY-RK-015 done sha=`057a5e8`; tip `057a5e8`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent coverage numbers or STUDY-RK-021.

1. package.json verify/test scripts | org: local repo-knowledge | date: 2026-06-22 (git log a301d0e on file; tree tip 057a5e8) | path: `/workspace/studio/repo-knowledge/package.json` | Finding: `pretest` runs build; `test`=`vitest run`; `test:coverage` / `test:watch`; `test:scripts` selftests gen-audit-report + gen-worklist; `verify`=typecheck+lint+test+test:scripts.

2. vitest.config.ts include + thresholds | org: local | date: 2026-05-20 (bfdcd11) | path: `/workspace/studio/repo-knowledge/vitest.config.ts` @ `057a5e8` | Finding: include `test/**/*.test.ts`, coverage include `src/**/*.ts`, thresholds lines 50 / branches 40 / functions 50; comment notes games was previously coverage-excluded until `games.test.ts` — no measured % reported here.

3. src/ vs test/ inventory at tip | org: local | date: 2026-09-12 (tip 057a5e8) | paths: `src/`, `test/` | Finding: 32 `src/**/*.ts` files and 38 `test/*.test.ts` files; clear named pairs include colors, config, cli-exit, fts, mcp-server, fsck, diff, exec-bin, audit-import, build-health / sync-build-health, publish-state / sync-publish.

4. src/errors.ts lacks a corresponding test file | org: local | date: 2026-03-19 (last commit touching file) | path: `/workspace/studio/repo-knowledge/src/errors.ts` | Finding: defines `RkError` + `RepoKnowledgeError`; at tip no `test/*.test.ts` imports it and no other `src/*.ts` import path references it.

5. audit/controls.ts + audit/queries.ts — indirect only | org: local | date: tip `057a5e8` | paths: `src/audit/controls.ts`, `src/audit/queries.ts`, `test/audit-import.test.ts`, `test/mcp-server.test.ts` | Finding: no `controls.test.ts` / `queries.test.ts`; `seedControls` imported by audit-import + mcp-server; query helpers (`getAuditPosture`, etc.) exercised inside audit-import.test.ts.

6. health doctor/feed/table vs dedicated suites | org: local | date: tip `057a5e8` | paths: `src/health/{doctor,feed,table,index}.ts`, `test/health-commands.test.ts`, `test/diff.test.ts`, `test/fsck.test.ts` | Finding: no doctor/feed/table-named test files; health-commands imports buildFeed / buildRepoDoctor / buildHealthTable via `health/index.js`; dedicated files exist only for diff and fsck.

7. sync/github.ts + sync/dogfood-suggest.ts — no module-named tests | org: local | date: tip `057a5e8` | paths: `src/sync/github.ts`, `src/sync/dogfood-suggest.ts`, `test/sync-404-archived.test.ts`, `test/sync.test.ts`, `test/dogfood-intelligence-sync.test.ts`, `test/dogfood-swarm-sync.test.ts` | Finding: no `github.test.ts` / `dogfood-suggest.test.ts`; github exercised via sync-404-archived (mocked `gh`) and sync.test; dogfood-suggest imported by dogfood-intelligence-sync and dogfood-swarm-sync.

8. cli.ts / db/init.ts / barrels — split / indirect coverage | org: local | date: tip `057a5e8` | paths: `src/cli.ts`, `src/db/init.ts`, `src/{games,health,sync}/index.ts`, `src/index.ts`, matching `test/cli-*.test.ts`, `test/db.test.ts`, migrations, classify/rigs/security/forge-vault-path, `test/games.test.ts`, `test/relation-types.test.ts` | Finding: no `cli.test.ts` or `init.test.ts`; games.test imports parser/scorer/render (not games/index by path); RELATION_TYPES covered via relation-types importing `src/index.js`; large surfaces lack a single file-named suite.

Named lack of corresponding test file (or only indirect): errors.ts; audit/controls.ts; audit/queries.ts; health/doctor.ts; health/feed.ts; health/table.ts; health/index.ts; sync/github.ts; sync/dogfood-suggest.ts; sync/index.ts; games/index.ts; db/init.ts; cli.ts; src/index.ts.

✅
