STUDY-RK-023 Q2 (Practitioner)

stop: docs/source inventory — vitest already covers vs missing for src/health/doctor.ts + feed.ts + table.ts (and health-commands/cli touch points).
prerequisite: STUDY-RK-022 done sha=`53e8137` PR #13; tip `55fcc39`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-009 + STUDY-RK-016.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator; do not invent coverage %.

Eight doc/API sources. I did not invent coverage % or STUDY-RK-051.

1. STUDY-RK-016 grounding named gap | org: local research | date: present at tip 55fcc39 | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-016/grounding.md` | Finding: named gaps include health doctor/feed/table (via health-commands); green vitest ≠ dedicated suite per module; Invented coverage %: 0.

2. STUDY-RK-009 grounding surfaces | org: local research | date: 3873079 era / tip tree | path: `research/STUDY-RK-009/grounding.md` | Finding: feed/doctor/table/diff are DB-only reads; fsck writes db_health_runs — doctor/feed/table are read renderers distinct from fsck.

3. No module-named test files | org: local | date: tip `55fcc39` | paths: `src/health/{doctor,feed,table}.ts`, `test/` | Finding: no doctor.test.ts / feed.test.ts / table.test.ts; contrast dedicated test/diff.test.ts and test/fsck.test.ts for sibling modules.

4. test/health-commands.test.ts already covers builders via barrel | org: local | date: tip `55fcc39` | path: `/workspace/studio/repo-knowledge/test/health-commands.test.ts` | Finding: imports buildFeed/renderFeedText, buildRepoDoctor/renderDoctorText, buildHealthTable/renderHealthTableText from health/index.js — indirect module coverage without file-named suites (F-TS-FT3.5 header).

5. Lockable behaviors already exercised in health-commands | org: local | date: tip `55fcc39` | path: test/health-commands.test.ts | Finding: feed — audit_delta, first-snapshot HIGH, kev_intersect, action_unpinned_new, ci_streak_broken, toolchain_drift_new, empty renderFeedText; doctor — null unknown slug, aggregate report, renderDoctorText sections; table — dep_health red/unknown/green/yellow grades, action_pin red/green, toolchain_drift, render header/No repos.

6. Still-thin / missing lock targets (no %) | org: local | date: tip `55fcc39` | paths: src/health/feed.ts, doctor.ts, table.ts | Finding: FeedEvent kind action_sha_rewritten not named in health-commands its; doctor malformed toolchain_pin JSON -> declared null path unasserted; table gradeCi branches for no_workflow/unknown not named in its — candidates for dedicated suites without inventing measured %.

7. CLI rk health wiring | org: local | date: tip `55fcc39` | path: `/workspace/studio/repo-knowledge/src/cli.ts` | Finding: health feed (default) / doctor <slug> / table call buildFeed / buildRepoDoctor / buildHealthTable (+ text/JSON renderers); --refresh / --strict / --rig sit beside builders — CLI integration not substituted by health-commands unit file.

8. MCP + package/vitest floors | org: local | date: tip `55fcc39` | paths: src/mcp/server.ts, package.json, vitest.config.ts | Finding: MCP health_feed / health_doctor / health_portfolio call the same builders; verify=typecheck+lint+test+test:scripts; coverage floors lines 50 / branches 40 / functions 50 are thresholds only — not module %.

Exports to lock in dedicated suites: buildRepoDoctor+renderDoctorText; buildFeed(+kevList)+renderFeedText; buildHealthTable+renderHealthTableText; keep health-commands as integration or migrate asserts into doctor/feed/table-named files.

Coverage % invented: 0 · STUDY-RK-051 invented: 0

✅
