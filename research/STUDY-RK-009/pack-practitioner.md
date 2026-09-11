STUDY-RK-009 Q2 — Practitioner

stop: doctor / fsck / build-health (docs + source).
prerequisite: STUDY-RK-008 done sha=`2dd0bb5`; tip `2dd0bb5`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary src/health docs+source state for doctor/fsck/feed/table/diff reports, DB-only reads vs audit-trail writes?

Eight doc/API sources. I did not invent What. fsck-as-pure-read invented: 0. Do not invent STUDY-RK-021.

1. health/index.ts barrel — mcp-tool-shop-org · tip `2dd0bb5` (2026-09-11) · `/workspace/studio/repo-knowledge/src/health/index.ts` L1–12 — Names feed (change since last sync), doctor (single-repo deep-dive), table (portfolio rollup); fsck = DB-integrity checker that writes an audit row per run; diff = per-repo DB-entry change history.

2. feed.ts buildFeed — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/feed.ts` L1–27, L59 — Default `rk health` surface; emits action-tagged deltas (audit_delta, kev_intersect, ci_streak_broken, action_unpinned_new, toolchain_drift_new) from DB helpers; no insertDbHealthRun.

3. doctor.ts buildRepoDoctor — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/doctor.ts` L1–8, L58 — Single-repo deep read: dep audit/history, workflow actions/permissions, CI, toolchain declared/observed/drift; deepest read; JSON-first.

4. table.ts buildHealthTable — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/table.ts` L1–15, L46 — Portfolio rows with ci_health/dep_health/action_pin_health grades + toolchain_drift; JSON load-bearing; reads getPortfolioHealth (no write trail).

5. fsck.ts runFsck WRITE — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/fsck.ts` L1–36, L324–378 — Composes seven integrity checks then insertDbHealthRun; every invocation writes one db_health_runs row (NOT a pure read).

6. fsck seven checks + subset persist — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/fsck.ts` L9–33, L366–388 — Checks: orphan_rows, broken_relationships, null_local_path_active, stale_local_path, fts_row_count_mismatch, invalid_lifecycle_status, incomplete_sync_runs; persisted row stores four-check subset; full seven logged to stderr.

7. diff.ts getRepoDiff — mcp-tool-shop-org · tip `2dd0bb5` · `src/health/diff.ts` L1–25, L252 — DB-only windowed history (default 7d): notes added, audit_runs, published versions, dep-audit severity deltas; flags untracked sources (facts/relationships/repo fields).

8. README + MCP DB-only vs SIDE EFFECT — mcp-tool-shop-org · tip `2dd0bb5` · `README.md` L113–122 · `src/mcp/server.ts` L819–895 — health_feed/doctor/portfolio = DB-only reads no network refresh; rk fsck / db_fsck SIDE EFFECT writes db_health_runs; repo_diff DB-only read.

On-page: feed/doctor/table/diff read; fsck writes. Invented fsck-pure-read: 0.

✅
