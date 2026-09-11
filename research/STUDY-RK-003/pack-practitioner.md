STUDY-RK-003 Q2 — Practitioner

stop: MCP server vs rk CLI — which tools must stay deterministic (docs + source).
prerequisite: STUDY-RK-002 done sha=`2d83594`; tip `2d83594`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary repo-knowledge MCP/CLI docs+source state for read-only/repeatable vs mutating/side-effecting tools, and catalog determinism?

Eight doc/API sources. I did not invent What. Non-deterministic-tool invented: 0. Do not invent STUDY-RK-021.

1. MCP server tool inventory header — mcp-tool-shop-org · tip `2d83594` (2026-09-11) · `/workspace/studio/repo-knowledge/src/mcp/server.ts` L7–35 — Lists read surfaces (`get_repo`, `find_repos`, `search_repos`, `related_repos`, `repos_by_stack`, `repos_needing_work`, `repo_summary`, `knowledge_stats`, `repo_diff`, `ops_runs`, `repo_versions`, `suggest_dogfood`, `audit_*` reads) vs writers (`add_repo_note`, `add_relationship`, `sync_repos`, `sync_dogfood`) and flags `db_fsck` as WRITES a `db_health_runs` row plus `archive_repo`/`delete_repo` lifecycle mutation.

2. MCP-001/002 purity comment — mcp-tool-shop-org · tip `2d83594` · `src/mcp/server.ts` L61–65 — States build-health builders are pure/side-effect-free and shared with CLI `rk health`/`rk fsck`/`rk diff`, with one named exception: `runFsck` WRITES a `db_health_runs` audit row.

3. Build-health MCP tools (DB-only) — mcp-tool-shop-org · tip `2d83594` · `src/mcp/server.ts` L819–865 — `health_feed`/`health_doctor`/`health_portfolio` descriptions say DB-only read, no network/registry refresh, reflecting state as of last `rk sync`.

4. `db_fsck` named SIDE EFFECT — mcp-tool-shop-org · tip `2d83594` · `src/mcp/server.ts` L872–879 — Tool text flags every call WRITES one `db_health_runs` row and is NOT a pure read, so LLM clients treat it as mutating hygiene not a repeatable catalog probe.

5. Lifecycle mutators + confirm gate — mcp-tool-shop-org · tip `2d83594` · `src/mcp/server.ts` L937–986 — `archive_repo` is idempotent reversible archive; `delete_repo` is HARD-DELETE/IRREVERSIBLE and refuses unless `confirm` is literally `true` (no interactive prompt over MCP).

6. README CLI Reference — mcp-tool-shop-org · tip `2d83594` · `README.md` L71–123 — Splits read/repeatable (`rk show`/`list`/`find`/`related`/`stats`, health doctor/table, `rk diff`/`runs`) from mutating (`rk sync`/`note`/`relate`/`reindex`/`sync-dogfood`, `rk delete`/`archive`/`prune`, `rk fsck` writes `db_health_runs`); `--json` is the load-bearing contract for core + audit reads.

7. README MCP Tools grouping — mcp-tool-shop-org · tip `2d83594` · `README.md` L193–211 — Groups Knowledge&sync (reads + `add_*`/`sync_*`), Audit (includes mutating `audit_submit`), Build-health (DB-only reads), Operational hygiene (`db_fsck`/`repo_diff`/`ops_runs`), Lifecycle (`archive_repo`/`delete_repo`), Dogfood (`suggest_dogfood`).

8. SECURITY.md stdio MCP — mcp-tool-shop-org · dated 2026-06-22 on tip · `SECURITY.md` L26–30 — MCP server runs locally over stdio with no network endpoints; GitHub sync uses `gh` auth (no credentials stored) — local catalog surface, sync side effects inherit `gh`.

CLI mirrors: `rk delete --yes` / interactive confirm (`src/cli.ts` L808–847); `rk archive` idempotent (`src/cli.ts` L850–877); `rk note`/`relate` mutate; `rk find`/`show` read.

Catalog-determinism (on-page only): JSON load-bearing read contract + DB-only health/search reads over fixed SQLite; sync/`db_fsck`/`add_*`/`audit_submit`/`archive`/`delete` are named side-effecting. Invented non-deterministic-must tool: 0.

✅
