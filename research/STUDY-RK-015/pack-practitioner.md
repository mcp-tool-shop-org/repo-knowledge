STUDY-RK-015 Q2 — Practitioner

stop: handbook vs CLI drift (docs + source).
prerequisite: STUDY-RK-014 done sha=`66d57a5`; tip `66d57a5`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary handbook + README CLI + src/cli.ts state for command/flag match vs drift?

Eight doc/API sources. I did not invent What. Invented-commands invented: 0. Do not invent STUDY-RK-021.

1. README CLI Reference (full surface) — mcp-tool-shop-org · tip `66d57a5` (2026-09-11) · `/workspace/studio/repo-knowledge/README.md` L71–160 — Documents core, lifecycle, publish-state, health, operational (fsck/diff/runs), backup/restore/doctor/config, classify, audit, games score — matches commands registered in `src/cli.ts`.

2. src/cli.ts command registry — mcp-tool-shop-org · tip `66d57a5` · `src/cli.ts` — Registers init/sync/owners/scan/dogfood/show/list/find/related/note/relate/stats/reindex/delete/archive/verify-local/init-rig/prune/versions/drift/bind-package/classify/audit/*/health/*/fsck/diff/runs/config/backup/restore/doctor/games score.

3. MATCH: handbook usage core + audit — mcp-tool-shop-org · tip `66d57a5` · `site/src/content/docs/handbook/usage.md` L10–175 — Documents init/sync(--owners/--local/--releases/--forks)/scan/show/list/find(--limit default 10)/related/note/relate/stats/reindex/audit/*/sync-dogfood/games score — aligns with cli.ts for those commands.

4. MATCH: find --limit default 10 — mcp-tool-shop-org · tip `66d57a5` · `usage.md` L61–65 · `src/cli.ts` L534–536 — Both state `-n/--limit` default 10.

5. DRIFT: usage.md omits v2 surfaces — mcp-tool-shop-org · tip `66d57a5` · `usage.md` (ends ~games) vs `README.md` L91–142 · `cli.ts` — Handbook usage lacks delete/archive/prune/versions/drift/bind-package/health/fsck/diff/runs/backup/restore/doctor/config/classify/suggest-dogfood on-page.

6. DRIFT: sync --prune-vanished — mcp-tool-shop-org · tip `66d57a5` · `src/cli.ts` L235 vs `usage.md` L14–29 — CLI has `--prune-vanished`; usage sync examples omit it.

7. DRIFT: MCP tool count — mcp-tool-shop-org · tip `66d57a5` · `handbook/mcp-server.md` L8 (19 tools, lists knowledge+audit only) vs `README.md` L164 (30 tools, includes health/ops/lifecycle) — handbook MCP page undercounts vs README/server.

8. MATCH: security handbook vs README Security — mcp-tool-shop-org · tip `66d57a5` · `handbook/security.md` L17–31 · `README.md` L39–45 — No credentials stored; no telemetry/phone-home; local data — aligned claims (not a command list).

On-page: invent commands not present: 0. Drift is omission/count, not invented flags.

✅
