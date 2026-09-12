STUDY-RK-025 Q3 Analogist — tip `1dd8cb6` · consumer repo-knowledge coding

stop: adjacent analogs for docs vs implementation surface-count drift (handbook undercount vs README/server); name analog + limit.
prerequisite: STUDY-RK-024 done sha=`f876e30` PR #15; tip `1dd8cb6`; extras STUDY-RK-003 + STUDY-RK-015 + STUDY-RK-021.
owner: Analogist
fallback: soft folklore or invent tool names/counts → fail-transfer; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context (on-page only): README “exposes 30 tools”; `site/.../handbook/mcp-server.md` “exposes 19 tools” (+19 named rows); `src/mcp/server.ts` has 30 `server.tool(` registrations — server is authority. Docs PR to align. Do not invent MCP tools or counts.

1. OpenAPI live-routes vs spec count drift — fissible/drift — ongoing — https://github.com/fissible/drift — Hold-with-limit: compares implemented route count to documented OpenAPI paths (added/removed). Limit: HTTP routes ≠ MCP tools; same count-diff gate idea.

2. CI OpenAPI drift checker (live_count vs spec_count) — Chimera check_openapi_drift.py — ongoing — https://github.com/atlas-crew/Chimera/blob/main/apps/vuln-api/scripts/check_openapi_drift.py — Hold-with-limit: fails CI when code and docs disagree on surface cardinality. Limit: Flask/Starlette ≠ MCP stdio.

3. man page undercount vs `--help` — Unix.SE groupdel — ongoing — https://unix.stackexchange.com/questions/671360/why-through-man-page-does-not-show-the-complete-list-of-options-and-through-hel — Hold-with-limit: handbook/man lags binary help; undercount is a real operator trap. Limit: shadow-utils ≠ Astro handbook.

4. help2man: generate docs from live help — GNU help2man — ongoing — https://www.gnu.org/software/help2man/ — Hold-with-limit: regenerate docs from implementation to kill undercount drift. Limit: `--help` text ≠ MCP tool tables; still argues impl-as-authority.

5. Protobuf IDL vs generated stubs drift CI — grafana/sigil-sdk development.md — ongoing — https://github.com/grafana/sigil-sdk/blob/main/docs/development.md — Hold-with-limit: canonical impl/schema wins; docs/codegen must regenerate or CI fails. Limit: protoc ≠ handbook Markdown. [note — Verifier: URL→agento11y path caveat]

6. docguard OpenAPI vs code route undercount — mrzadexinho/docguard — ongoing — https://github.com/mrzadexinho/docguard — Hold-with-limit: reports undocumented routes (code > docs) and stale docs; undercount is an Error-class drift. Limit: OpenAPI paths ≠ MCP tool names.

7. invent MCP tool names / invent counts / soft folklore that handbook 19 is authority — Fail-transfer: server.ts + README 30 are the live surface; inventing tools or treating 19 as truth is forbidden.

8. Soft folklore: README alone can stay ahead forever while handbook lags without cost — Fail-transfer: Soft folklore: 0. Tutorial readers follow the undercount.

Soft folklore: 0. Invented tool names: 0. Invented counts: 0. Did not invent STUDY-RK-051.
✅
