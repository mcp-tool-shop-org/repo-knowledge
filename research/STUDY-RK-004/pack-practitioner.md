STUDY-RK-004 Q2 — Practitioner

stop: dogfood-labs sync / intelligence layer (docs + source). Do not copy `.swarm` sqlite.
prerequisite: STUDY-RK-003 done sha=`09e6122`; tip `09e6122`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary dogfood sync/suggest docs+source state for ingest (repos/facts/enforcement/intelligence/swarm), optional vs required, suggest readers, and local-only control-plane?

Eight doc/API sources. I did not invent What. `.swarm`/control-plane.db copy-into-knowledge.db invented: 0. Do not invent STUDY-RK-021.

1. Dogfood sync header (one-way read model) — mcp-tool-shop-org · tip `09e6122` (2026-09-11) · `/workspace/studio/repo-knowledge/src/sync/dogfood.ts` L1–8 — One-way read from testing-os evidence into `repo_facts`; testing-os remains sole write authority; repo-knowledge is a read model only.

2. Index + enforcement ingest — mcp-tool-shop-org · tip `09e6122` · `src/sync/dogfood.ts` L111–114, L220–338 — Loads `latest-by-repo.json` (local or GitHub raw); per-surface upserts `dogfood` facts (`verified`, `enforcement`, `freshness_days`, `run_id`, `finished_at`) plus rollups `status`/`surfaces`; missing/malformed policy defaults enforcement mode to `required`.

3. Intelligence layer optional — mcp-tool-shop-org · tip `09e6122` · `src/sync/dogfood.ts` L353–363, L382–452 — `syncIntelligence` is optional (catch + stderr skip); loads `.intelligence-export.json` or local `sync-export --json`; remote intelligence export “not yet supported”; upserts `dogfood.finding`/`pattern`/`recommendation`/`doctrine`.

4. Swarm sync local-only (no DB copy) — mcp-tool-shop-org · tip `09e6122` · `src/sync/dogfood.ts` L365–375 — Swarm runs only when `options.localPath` set; comment: “Local-only: the control plane never leaves the dogfood-labs checkout” — calls `syncSwarmControlPlane`, does not copy sqlite into product `knowledge.db`.

5. Swarm control-plane read-only mirror — mcp-tool-shop-org · tip `09e6122` · `src/sync/swarm.ts` L1–17, L64–68 — Opens `swarms/control-plane.db` with `readonly: true`; mirrors latest run per repo into `dogfood.swarm.*` facts; raw swarm ≠ curated intelligence (`dogfood.finding`/…); returns null if DB absent.

6. suggestByRepo / suggestBySurface — mcp-tool-shop-org · tip `09e6122` · `src/sync/dogfood-suggest.ts` L1–5, L48–128 — Reads synced `repo_facts` only (not testing-os); `suggestByRepo` queries `fact_type LIKE 'dogfood.%'`; `suggestBySurface` prefilters `dogfood`/`surfaces` CSV then exact membership.

7. README + handbook sync-dogfood — mcp-tool-shop-org · tip `09e6122` · `README.md` L86–87 · `site/src/content/docs/handbook/usage.md` L154–163 — `rk sync-dogfood` syncs testing-os evidence into repo facts (optional `--local`); one-way read; `rk suggest-dogfood` suggests known findings for repo/surface.

8. CHANGELOG swarm mirror note — mcp-tool-shop-org · tip `09e6122` · `CHANGELOG.md` L34 — `rk sync-dogfood --local` reads `swarms/control-plane.db` read-only and mirrors latest run into `repo_facts` (`dogfood.swarm.finding` + rollups); re-sync replaces; no product-DB sqlite copy stated.

HARD on-page: open control-plane readonly → upsert facts; control plane stays in checkout. Invented copy-`.swarm`-into-knowledge.db: 0.

✅
