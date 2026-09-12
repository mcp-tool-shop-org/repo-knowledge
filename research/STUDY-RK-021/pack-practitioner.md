STUDY-RK-021 Q2 (Practitioner)

stop: handbook usage.md vs CLI drift (docs + source).
prerequisite: Pass 1 done sha=`cb1803b`; tip `cb1803b`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent commands absent from cli.ts or STUDY-RK-051.

1. Prior STUDY-RK-015 practitioner + grounding | org: local research | date: tip cb1803b (landed under research/) | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-015/pack-practitioner.md` (+ grounding.md) | Finding: prior pass already recorded usage omits v2 surfaces, sync --prune-vanished missing from usage, MCP handbook 19 vs README 30 — same drift class still present at cb1803b.

2. handbook usage.md command surface | org: local | date: tip cb1803b (file last touched in 9612965 era; tree tip) | path: `/workspace/studio/repo-knowledge/site/src/content/docs/handbook/usage.md` | Finding: documents only init, sync (--owners/--local/--releases/--forks), scan, show, list, find, related, note, relate, stats, reindex, audit seed/import/posture/findings/controls/unaudited/failing, sync-dogfood, games score — no on-page v2 string; no prune/delete/archive/versions/health/fsck/etc.

3. src/cli.ts sync --prune-vanished | org: local | date: tip cb1803b | path: `/workspace/studio/repo-knowledge/src/cli.ts` L235–236 | Finding: sync registers --prune-vanished (default false; archive absent GitHub listing; warn-only without flag) — usage.md sync examples omit this flag.

4. README v2 command sections vs usage | org: local | date: tip cb1803b | path: `/workspace/studio/repo-knowledge/README.md` L91–142 | Finding: README labels Lifecycle/Publish-State/Health/Operational as v2.0.0 and Backup/doctor as v2.1.0 / classify as v2.1.1 — those command families exist in cli.ts but are absent from usage.md headings.

5. src/cli.ts registered families present (not invented) | org: local | date: tip cb1803b | path: `src/cli.ts` | Finding: besides usage-covered core/audit/games, cli registers owners, suggest-dogfood, delete, archive, verify-local, init-rig, prune, versions, drift, bind-package, classify, health feed/doctor/table, fsck, diff, runs, config show/validate, backup, restore, doctor — concrete omission list for usage, not invented names.

6. MCP tool count: server.ts = 30 | org: local | date: tip cb1803b | path: `/workspace/studio/repo-knowledge/src/mcp/server.ts` | Finding: exactly 30 server.tool registrations: knowledge/sync 12 + audit 7 + health 3 + ops 3 + lifecycle/publish 3 + suggest_dogfood + audit_failing.

7. README MCP Tools list = 30 | org: local | date: tip cb1803b | path: `README.md` ### MCP Tools | Finding: README enumerates the same 30 tool names as server.ts (knowledge, audit, build-health, operational, lifecycle, dogfood/audit-drill groups).

8. handbook mcp-server.md = 19 (undercount) | org: local | date: tip cb1803b | path: `/workspace/studio/repo-knowledge/site/src/content/docs/handbook/mcp-server.md` | Finding: page claims The MCP server exposes 19 tools and tables only knowledge+audit (19 names); omits health_feed, health_doctor, health_portfolio, db_fsck, repo_diff, ops_runs, archive_repo, delete_repo, repo_versions, suggest_dogfood, audit_failing (11 tools present in server.ts/README).

Also: usage sync documents --owners/--local/--releases/--forks but not cli.ts --local-depth (default 4) or --prune-vanished.

Invented-commands-absent-from-cli: 0 · STUDY-RK-051 invented: 0

✅
