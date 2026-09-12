STUDY-RK-013 Q2 — Practitioner

stop: operational-runs migration-010 (docs + source).
prerequisite: STUDY-RK-012 done sha=`cb1fed6`; tip `cb1fed6`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary migration-010 + fsck/CLI/MCP/sync state for db_health_runs / sync_runs, rk fsck/sync/runs linkage, and incompleteSyncRuns?

Eight doc/API sources. I did not invent What. Sync-omits-run-rows invented: 0. Do not invent STUDY-RK-021.

1. Migration-010 header — mcp-tool-shop-org · tip `cb1fed6` (2026-09-11) · `/workspace/studio/repo-knowledge/src/db/migration-010-operational-runs.sql` L1–25 — Adds append-only `db_health_runs` (per `rk fsck`) and `sync_runs` (per `rk sync`) to close silent-zero-sync observability gap; FK-independent; bumps schema_version to 10 + `operational_runs_added`.

2. db_health_runs schema — mcp-tool-shop-org · tip `cb1fed6` · `migration-010` L35–63 — Columns: run_at, repo_count, fts_entry_count, orphan/broken/null_local/stale counts, exit_code NOT NULL; indexed run_at DESC for `rk runs --db-health`.

3. sync_runs schema — mcp-tool-shop-org · tip `cb1fed6` · `migration-010` L65–103 — started_at/finished_at, owners_json, dirs_scanned_json, add/update/skip counts, errors_json, exit_code; NULL finished_at >24h detected via fsck incompleteSyncRuns.

4. fullSync writes sync_runs — mcp-tool-shop-org · tip `cb1fed6` · `src/sync/index.ts` L1–8, L85–112 — Every fullSync insertSyncRun at start + UPDATE via completeSyncRun at completion/error; closes silent-zero-sync; run rows NOT omitted.

5. runFsck writes db_health_runs + incompleteSyncRuns — mcp-tool-shop-org · tip `cb1fed6` · `src/health/fsck.ts` L1–36, L293–310 — Check 7: sync_runs with NULL finished_at older than 24h; every fsck WRITES one db_health_runs row.

6. CLI rk fsck / rk runs — mcp-tool-shop-org · tip `cb1fed6` · `src/cli.ts` L2269–2352 · `README.md` L121–123 — `rk fsck` writes db_health_runs; `rk runs --db-health|--sync` lists both trails.

7. MCP ops_runs + db_fsck — mcp-tool-shop-org · tip `cb1fed6` · `src/mcp/server.ts` L26–28, L875–931 — db_fsck SIDE EFFECT writes db_health_runs; ops_runs read-only lists fsck and/or sync_runs.

8. insertSyncRun/completeSyncRun API — mcp-tool-shop-org · tip `cb1fed6` · `src/db/init.ts` L2559–2629 — Start INSERT + end UPDATE; listSyncRuns newest-first — sync always records a run row.

On-page: sync records runs. Invented sync-omits-run-rows: 0.

✅
