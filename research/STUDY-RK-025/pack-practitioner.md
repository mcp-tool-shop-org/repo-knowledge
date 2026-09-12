STUDY-RK-025 Q2 (Practitioner)

stop: docs/source inventory — exact MCP tool count in README vs handbook/mcp-server.md vs src/mcp/server.ts (post STUDY-RK-021 PR #12 state at tip).
prerequisite: STUDY-RK-024 done sha=`f876e30` PR #15; tip `1dd8cb6`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-003 + STUDY-RK-015 + STUDY-RK-021.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator; never invent a tool name not in server.ts.

Eight doc/API sources. I did not invent MCP tools or STUDY-RK-051.

1. src/mcp/server.ts tool count = 30 | org: local | date: tip `1dd8cb6` | path: `/workspace/studio/repo-knowledge/src/mcp/server.ts` | Finding: exactly 30 server.tool registrations — get_repo find_repos search_repos related_repos repos_by_stack repos_needing_work repo_summary add_repo_note add_relationship knowledge_stats sync_repos sync_dogfood audit_posture audit_portfolio audit_findings audit_detail audit_submit audit_controls_list audit_unaudited health_feed health_doctor health_portfolio db_fsck repo_diff ops_runs archive_repo delete_repo repo_versions suggest_dogfood audit_failing.

2. README MCP section = 30 | org: local | date: tip `1dd8cb6` | path: `/workspace/studio/repo-knowledge/README.md` | Finding: prose The MCP server exposes 30 tools; ### MCP Tools lists the same 30 names in six groups; set-diff vs server.ts is empty.

3. handbook mcp-server.md = 19 (still undercount) | org: local | date: tip `1dd8cb6` | path: `/workspace/studio/repo-knowledge/site/src/content/docs/handbook/mcp-server.md` | Finding: prose The MCP server exposes 19 tools; Knowledge+Audit tables list 19 names only — still undercounts vs server.ts at this tip.

4. Exact 11 tools in server/README absent from handbook tables | org: local | date: tip `1dd8cb6` | paths: server.ts + mcp-server.md | Finding: missing from handbook (all present in server.ts): health_feed health_doctor health_portfolio db_fsck repo_diff ops_runs archive_repo delete_repo repo_versions suggest_dogfood audit_failing.

5. STUDY-RK-021 grounding + open PR #12 | org: local / GitHub | date: research on tip; PR open 2026-09-12 | paths: `research/STUDY-RK-021/grounding.md`; https://github.com/mcp-tool-shop-org/repo-knowledge/pull/12 | Finding: grounding already recorded mcp-server.md 19 vs server/README 30; PR #12 state OPEN (not merged) — tip `1dd8cb6` still carries the 19-tool handbook page; branch commit 09bb4b4 is not an ancestor of HEAD.

6. STUDY-RK-015 grounding prior same drift | org: local research | date: tip tree | path: `research/STUDY-RK-015/grounding.md` | Finding: earlier pass already flagged MCP 19 vs README 30 — drift class unchanged at 1dd8cb6 pending #12 merge.

7. STUDY-RK-003 mutator/read inventory (names from server only) | org: local research | date: tip tree | path: `research/STUDY-RK-003/grounding.md` | Finding: catalog reads include health_* / repo_diff / ops_runs; mutators include add_repo_note add_relationship sync_repos audit_submit archive_repo delete_repo; db_fsck WRITES db_health_runs — these names are among the 11 handbook omissions.

8. Do not confuse audit domain count | org: local | date: tip `1dd8cb6` | path: README.md Audit Framework | Finding: README also states audit system covers 19 domains with 80 controls — that 19 is domains, not MCP tools; MCP prose correctly says 30 tools.

Invented tool names: 0 · STUDY-RK-051 invented: 0

✅
