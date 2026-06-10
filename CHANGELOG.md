# Changelog

## [Unreleased]

### Added

- `src/sync/swarm.ts` — swarm control-plane sync. `rk sync-dogfood --local <path>` now also reads `swarms/control-plane.db` (the dogfood-labs swarm coordination DB, opened read-only) and mirrors the LATEST run per repo into `repo_facts`: one `dogfood.swarm.finding` fact per finding (severity, category, file/line, description, recommendation, status, run_id) plus eight `dogfood.swarm` rollup facts (`run:id/status/created_at/commit_sha`, `findings:total/open/fixed/open_by_severity`). Re-sync replaces a repo's swarm facts rather than accumulating stale ones. Raw swarm findings deliberately live in their own fact namespace — the curated intelligence layer (`dogfood.finding` / `dogfood.pattern` / …) stays accepted-artifacts-only. On rigs where the YAML intelligence store was never populated, this is the only dogfood intelligence source; before this change sync-dogfood reported zeros while hundreds of verified findings sat in the control plane.
- CLI `sync-dogfood` output gains a `Swarm control-plane:` section (runs, findings + open count, facts upserted, skipped repos).

### Fixed

- `loadIntelligenceExport` — the `sync-export` child process's stderr is now captured instead of inherited, so a crashing legacy exporter (e.g. `ajv` not installed in `tools/findings`) degrades to a one-line `sync-export skipped (…)` message instead of dumping two full stack traces. An `ERR_MODULE_NOT_FOUND` failure adds a `run npm ci in <dir>` hint, and a failed layout candidate now falls through to the next one instead of aborting the intelligence sync.

## [2.0.0] - 2026-05-21

Dogfood-swarm release. Schema head advanced **v4 → v11** across 7 additive migrations; 14 new CLI commands; new MCP-discoverable `rk health` surface grounded in 24 cited 2022–2026 findings (study-swarm dispatched 2026-05-20). Tests **74 → 370**. No breaking changes — every callsite from v1.0.5 continues to work; the major bump reflects schema shape rather than API removal.

### Migration from v1.x

- **Drop-in**: existing databases auto-migrate on first `openDb`. Migrations 006–011 are gated on `schema_version` and apply in order; partial-schema fixtures (e.g. v1 baseline created before audit tables) are handled via defensive table-presence guards.
- **New commands** are additive — none replace existing surfaces.
- **MCP server** loads from the same `./mcp` export path (no consumer change).
- **Release pipeline**: `release.yml` switched to OIDC Trusted Publisher (no `NPM_TOKEN` required at publish time; npm package settings must have Trusted Publisher configured for `mcp-tool-shop-org/repo-knowledge/.github/workflows/release.yml`).

### Hardening highlights (Stage A+B+C — included in 2.0.0)

- Fix: `program.parseAsync()` instead of `program.parse()` so async-action rejections surface (was the ROADMAP-flagged silent-exit-0 regression).
- Fix: `migration-002` schema_version now stamps `'2'` (was `'3'`), unbreaking the version state machine.
- Fix: `sync/github.ts` uses `execFileSync` argv form — closes command-injection vector through the `--owners` flag.
- Fix: `scripts/postbuild.js` dynamically globs SQL files — `migration-004` and later were silently missing from the npm tarball.
- Fix: `src/db/init.ts` resolves SQL assets across all bundled layouts (dev / dist/cli.js / dist/mcp/server.js).
- Migration-005 — FTS5 triggers keep `repo_search` in sync without manual rebuilds.

### Added (FT-5 — cross-tool vocabulary + sync gap closure, 2026-05-21)

Three threads land together in FT-5: the cross-tool relationship vocabulary the ROADMAP cited (so MCP servers can declare what they wrap and Role OS missions can leave structured collaboration evidence), the rk.config.json owners-fallback that was supposed to work since Stage A but didn't (sync's resolveConfig override path clobbered file-supplied owners through an undefined-spread bug), and the recursive `--local` auto-scan that ROADMAP FT-5 paired with the GitHub 404 → archived archival path. All additive; no breaking changes to schema, CLI flags, or MCP tool shapes.

- migration-011 — additive schema extension (schema_version 10 → 11):
  - `repo_relationships.relation_type` CHECK enum extended with two new values: `'wraps'` and `'collaborated_in_mission'`. SQLite cannot extend a CHECK constraint via ALTER TABLE; the migration uses the canonical "create new table → INSERT...SELECT → DROP → RENAME" pattern with `PRAGMA foreign_keys = OFF` for the swap. Every existing row is copied byte-identically; the three indexes (`idx_rel_from`, `idx_rel_to`, `idx_rel_unique`) are recreated on the new table.
  - `repos.forge_vault_path` (TEXT, nullable) — game repos point at their forge-vault wing (the offline narrative / asset registry that lives outside the repo itself); non-game repos leave it NULL.
  - Gated at both the schema_version level AND the `cross_tool_vocab_added` meta marker so a manual operator backfill that bumped the version directly doesn't double-apply the table-swap. Minimal-fixture path (tests that lack `repo_relationships`) applies only the additive ADD COLUMN + version bump.
- New strict-migration helper `execMigrationStrict` (does NOT swallow duplicate-column errors, used for table-recreate migrations that must either fully apply or fully reject).
- `RELATION_TYPES` tuple in `src/index.ts` extended to 8 values (6 originals + `wraps`, `collaborated_in_mission`). MCP server's Zod enum + CLI `rk relate` validator + DB CHECK constraint all read from the same tuple; adding new values requires bumping all three in lockstep.
- DB helpers: `setRepoForgeVaultPath(slug, path)` (atomic UPDATE, accepts null to clear), `getRepoForgeVaultPath(slug)` (returns null for unknown slug or NULL column). `getRepo()` already returns `SELECT *` so the column appears automatically.
- `src/sync/github.ts` — vanished-repo archival. Before each owner's fetch, snapshot the set of (slug, repo_id) for `lifecycle_status='active'` repos under that owner. After the fetch, any prior-active repo NOT in the seen set is flipped to `archived` via `archiveRepoBySlug` AND acquires a `warning` note: "GitHub returned 404 at <ISO timestamp>; repo may be deleted, private, or renamed. Investigate or run `rk delete <slug>` to remove." Defense against false positives: archive only fires when the owner-fetch produced at least one result — empty fetch is treated as ambient failure (rate-limit / auth / network blip), not signal. Scoped per-owner so syncing one org never archives repos in another.
- `src/sync/local.ts` — recursive `scanDirectory(dir, { maxDepth })`. Default 4 levels covers the common F:/AI / E:/AI workspace tree. Any subdirectory containing a `.git` is treated as a repo candidate; the scanner does NOT descend INTO a found repo (no double-counting of vendored sub-repos or submodules). Pruned directories (literal denylist + all dot-prefixed names): `node_modules`, `dist`, `build`, `target`, `vendor`, `out`, `__pycache__`, `.venv`, `.next`, `.astro`, `.svelte-kit`, `.turbo`, `.cache`, `.nuxt`, `.parcel-cache`, `.pnpm-store`, `coverage`, and anything starting with `.`. `maxDepth=0` preserves the legacy single-level behavior.
- `src/config.ts` — undefined-override fix. The pre-FT-5 `{ ...config, ...overrides }` spread clobbered file-provided owners when CLI sync forwarded `owners: undefined` through SyncConfig. The fix iterates overrides and skips undefined fields so the file value wins; this is what closes the owners-in-config gap the ROADMAP cited.
- `src/config.ts` — owners-in-config helpers: `readRkConfigFile()` (raw read, returns `{}` on missing/malformed), `writeRkConfigFile(partial)` (atomic write-to-tmp + rename so a crash mid-write cannot corrupt the original; preserves unknown keys for forward compatibility), `listOwners()`, `addOwner(name)` (returns `{ added, owners }`, idempotent), `removeOwner(name)` (returns `{ removed, owners }`, idempotent).
- `rk owners list / add / remove` CLI subcommands — manage the rk.config.json owners list in-place. `rk owners list` prints one owner per line for shell-piping; `rk owners add <owner>` validates the GitHub-identifier shape (A-Z/a-z/0-9/.-_) before writing; `rk owners remove <owner>` exits 2 if the owner is absent so scripts can branch.
- `rk sync` CLI: `--owners` and `--local` no longer have empty-string defaults — omitting them falls back to `rk.config.json` (was supposed to work since Stage A; the config.ts fix makes it actually work). New `--local-depth <N>` (default 4) caps the recursive `--local` scan depth.
- `SyncConfig.localDepth?: number` propagated through `fullSync` into `scanDirectory({ maxDepth })`.
- Public API additions (re-exported from `@mcptoolshop/repo-knowledge`): `setRepoForgeVaultPath`, `getRepoForgeVaultPath`, `readRkConfigFile`, `writeRkConfigFile`, `listOwners`, `addOwner`, `removeOwner`.

### Added (FT-4 — operational hygiene CLI, 2026-05-21)

Operational observability for the silent-failure regression the ROADMAP cited as the originating motivation for FT-4: `rk sync` could complete with zero repos added/updated and leave nothing behind to look at. FT-4 adds two append-only run-history tables plus three CLI surfaces (`rk fsck`, `rk diff`, `rk runs`) that turn the DB into a self-auditing system.

- migration-010 — additive schema extension (schema_version 9 → 10):
  - `db_health_runs` table — one row per `rk fsck` invocation. Records the seven integrity-check counts plus a final `exit_code`. Indexed by `run_at DESC`. The audit-trail counterpart to the live check report; "when was the last clean fsck?" is now a single SELECT.
  - `sync_runs` table — one row per `rk sync` invocation. Records `owners_json` + `dirs_scanned_json` + `repos_added/updated/skipped` counts + `errors_json` + `exit_code`. `started_at` lands at INSERT (in-progress row), `finished_at` lands at the matching UPDATE on completion (or thrown-error catch path). Indexed by `started_at DESC`. Closes the silent-zero-sync regression — the operator now has a permanent record of every sync attempt regardless of whether it added work.
  - Both tables are FK-independent from `repos` — operator-grain audit, not repo-grain. They survive a portfolio that goes to zero repos.
- DB helpers: `insertDbHealthRun`, `listDbHealthRuns(limit=20)`, `getLatestDbHealthRun`, `insertSyncRun`, `completeSyncRun`, `listSyncRuns(limit=20)`. All transactional; the count fields are individually nullable so a caller that opts out of a particular check can pass undefined.
- `src/health/fsck.ts` — seven-check integrity scan composed by `runFsck(opts?)`:
  - `orphan_rows` — child rows whose `repo_id` doesn't exist in `repos` (legacy data pre-dating FK enforcement). Covers `repo_facts`, `repo_docs`, `repo_notes`, `repo_audits`, `repo_releases`, `repo_tech`, `repo_topics`, `repo_local_paths`, `audit_runs`, `audit_findings`, `audit_exceptions`, `repo_published_versions`, `repo_dep_audit_state`, `repo_dep_audit_history`, `repo_workflow_actions`, `repo_workflow_permissions`, `repo_observed_toolchain`.
  - `broken_relationships` — `repo_relationships` rows with `from_repo_id` or `to_repo_id` missing from `repos`.
  - `null_local_path_active` — `lifecycle_status='active'` AND `local_path IS NULL` (sync gap per F-DB-007 Stage A).
  - `stale_local_path` — `local_path` set but `existsSync` is false on the current rig (informational — `repo_local_paths` is the multi-rig authority).
  - `fts_row_count_mismatch` — `repo_search` FTS5 row count vs sum of indexable sources (repos with description/purpose + docs + notes).
  - `invalid_lifecycle_status` — any value outside `LIFECYCLE_STATUSES`.
  - `incomplete_sync_runs` — `sync_runs` with `NULL finished_at` older than 24h (sync crashed without completing the row).
  - Every check returns `{ count, samples (≤5), description }`. Composed report writes one `db_health_runs` row per invocation, returns the report so the CLI can render.
- `src/health/diff.ts` — `getRepoDiff(slug, opts?)` answers "what changed for this repo's DB entry between two timestamps?" Tracked sources: `repo_notes.created_at`, `audit_runs.started_at`, `repo_dep_audit_history.taken_at` (with delta computation across the window's first and last snapshots), `repo_published_versions.synced_at`. Untracked sources surface in the report footer with explicit reasons (`repo_facts` lacks a history table; `repo_relationships` lacks a timestamp; repo-level fields are not snapshotted — see git log). Default window is the last 7 days; `--since` / `--until` override.
- `rk fsck [--strict] [--json]` — runs the seven checks, writes the audit row, prints summary. `--strict` exits non-zero if any check returns count > 0 (CI gates); default is informational (exit 0). `--json` emits the structured `FsckReport`.
- `rk diff <slug> [--since <date>] [--until <date>] [--json]` — structured DB-entry change history for one repo across the resolved window. Pretty text by default, grouped by source.
- `rk runs [--db-health|--sync] [--limit N] [--json]` — lists recent `db_health_runs` and/or `sync_runs` rows. Default shows both with last 10 each. JSON-first per Stage A doctrine.
- `fullSync` now writes a `sync_runs` row at start + UPDATEs at completion (or on thrown error). Transparent wrap — the `FullSyncResult` shape is unchanged. Error path embeds `{message, stack}` in `errors_json` before re-throwing so the audit row is complete even when the run crashes.
- Public API re-exports: `runFsck`, `renderFsckText`, `getRepoDiff`, `renderRepoDiffText`, plus all FT-4 DB helpers and row/insert types from `@mcptoolshop/repo-knowledge`.

### Added (FT-3.5 — research-grounded build health, 2026-05-21)

Research arc: 5-agent study-swarm dispatched 2026-05-20 produced 24 cited findings (2022-2026). Every column, table, and grading threshold below traces back to a named study; citations appear inline at each load-bearing code-decision site.

- migration-009 — additive schema extension (schema_version 8 → 9):
  - `repo_dep_audit_state.critical_cve_ids` + `high_cve_ids` (JSON arrays) — per Pu et al. 2026 (NDSS, "Reachability Analysis of Vulnerabilities in JavaScript Programs"): 68.28% of npm audit findings are unreachable noise; storing CVE IDs (not just counts) lets downstream tools EPSS-join (Jacobs et al. 2021, ACM 10.1145/3436242, ROC AUC 0.838) and KEV-intersect (CISA KEV: 0.004% of CVEs actually exploited).
  - `repo_dep_audit_state.audit_omit_dev` (BOOL) — per Latendresse et al. 2022 (arXiv:2207.14711): <1% of installed deps reach production.
  - `repo_dep_audit_history` table (append-only snapshot timeline) — per VulnCheck Q1 2025: 28.3% of exploited CVEs hit within 24h; deltas matter more than levels.
  - `repo_workflow_actions.resolved_sha` + `pin_quality` + `immutable_publisher` — per CISA Mar 2025 (CVE-2025-30066 tj-actions tag-rewrite — SHA-pinned consumers immune); per OpenSSF 2024 (SHA is the only immutable reference); per GitHub Immutable Actions (2025) (publisher-opt-in flips @v5 risk).
  - `repo_workflow_permissions` table — per Beyer 2016 (SRE Workbook Ch.5): permissions: blocks limit blast radius.
  - `repo_observed_toolchain` table — per JetBrains 2025: drift = declared (toolchain_pin) - observed (per-rig).
- `PIN_QUALITIES` closed enum: `'sha' | 'immutable-semver' | 'mutable-semver' | 'major' | 'branch'` (per OpenSSF 2024 hierarchy). `upsertWorkflowAction` validates and throws on out-of-enum.
- `appendDepAuditHistory(args)` + `getDepAuditHistory(repo_id, limit)` — atomic history insert with state projection refresh.
- `upsertWorkflowPermissions` + `listWorkflowPermissions`, `upsertObservedToolchain` + `listObservedToolchain`, `getToolchainDrift(repo_id)` (declared-vs-observed comparison).
- `getPortfolioHealth()` extended: now surfaces `critical_cve_ids`, `high_cve_ids`, `audit_omit_dev`, `last_ci_run_at`, `last_ci_url`, `toolchain_pin`.
- `src/sync/build-health.ts` — five research-grounded sync workers, all network-graceful (never throw, log to stderr on failure per Tidelift 2024's 62% notification-fatigue finding):
  - `syncNpmAudit(localPath, { omitDev })` — captures CVE IDs from `via[].url`/`.name` (CVE preferred over GHSA per EPSS keyspace).
  - `scanWorkflowActions(localPath, { resolveShas })` — regex-scans `.github/workflows/*.yml`, classifies pin_quality, optionally resolves to 40-char SHA via `gh api repos/<owner>/<name>/commits/<ref>`; probes Immutable Releases via `gh api releases/latest --jq .immutable`. Per Alvarez 2025 (7/100 OSS projects pin everything): grade, recommend, don't auto-fail.
  - `syncCiStatus(owner, repo)` — `gh run list --branch main --limit 10`, derives `pass_rate_last_10`, `consecutive_failures`, `runs_in_last_30d`. Per Memon 2017 (ICSE-SEIP, 84% of pass→fail at Google is flake): status='failing' requires ≥2 consecutive failures, not single red. Per Rehman 2023 (arXiv:2308.10078, 58% of retried failed builds are real): 2 consecutive is the threshold. Per DORA 2024 (elite tier 0-15% change failure rate): pass_rate < 0.7 is red.
  - `scanWorkflowPermissions(localPath)` — captures top-level `permissions:` block (inline or block form), reports `"default"` when absent (the riskiest configuration per Beyer 2016).
  - `observeToolchain(localPath, rigId)` — runs `node --version` / `tsc --version` / `python --version` / `rustc --version` from localPath cwd.
  - `syncBuildHealthForRepo(repo_id, repo, opts)` — orchestrator; partial-result-preserving (never throws).
- `rk health` CLI subcommand (three primitives per Treude & Storey 2010 ICSE'10 feeds-vs-dashboards dichotomy + McIlroy 1978 / jq design):
  - `rk health [feed]` (default) — change-feed since last sync; emits `audit_delta`, `kev_intersect`, `ci_streak_broken` (post-flake threshold), `action_unpinned_new`, `toolchain_drift_new`. `--refresh` re-runs syncBuildHealthForRepo per repo first. `--json` switches to structured output. Per Beyer 2016 ("if a page merely merits a robotic response, it shouldn't be a page") + He 2022 (arXiv:2206.07230, 11.3% Dependabot deprecation from notification fatigue): flake-shaped events deliberately suppressed.
  - `rk health doctor <slug>` — single-repo deep-dive (decision moment per Dowding et al. 2025 IS 20:1: 28% dashboard open rate). Shows latest dep audit (with critical+high CVE IDs + dev-vs-prod scope), workflow actions (with pin_quality grades + resolved SHAs + immutable_publisher flag), CI signal, toolchain declared-vs-observed-per-rig, workflow permissions per file.
  - `rk health table` — portfolio rollup. JSON-first per McIlroy/jq design; `--text` for pretty rendering. Each row carries computed health grades: `ci_health` (red/yellow/green per Memon 2017 / DORA 2024 thresholds), `dep_health` (red only when critical > 0 AND CVE IDs captured — yellow without IDs because counts alone are 68.28%-unreachable per Pu 2026), `action_pin_health` (red for any 'branch' pin per CISA Mar 2025; yellow for any 'major' or non-immutable-publisher 'mutable-semver' per OpenSSF 2024), `toolchain_drift` (bool per JetBrains 2025).

### Added

- `rk delete <slug>` — cascade-delete a repo and all child rows (notes, facts, docs, relationships, audit runs). `--yes` skips the confirmation prompt; default flow requires typing `yes` to confirm. Exits 2 on not-found or user abort.
- `rk archive <slug> [--reason <text>]` — flip `lifecycle_status` to `archived` without deleting (preserves notes/findings). `--reason` is persisted as a `warning` note. Idempotent: archiving an already-archived repo is a no-op.
- `rk verify-local [--rig <id>] [--strict]` — verify each repo's `local_path` exists on the current rig and update `repo_local_paths` with a fresh timestamp. Rig defaults to `RK_RIG_ID` env or `os.hostname()`. `--strict` exits non-zero if any drift detected.
- `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` — one-shot registration of the current rig in the `rigs` table. Idempotent; safe to re-run.
- `rk prune [--dry-run] [--apply] [--days <N>]` — hard-delete repos archived longer than N days (default 30). Dry-run by default; `--apply` requires a single batch confirmation listing all candidates. GitHub-404 probe deferred to Feature 2.
- `rk versions <slug>` — cross-channel published-version dashboard (npm / pypi / github_release / vsce). `--refresh` syncs from registries first (network); `--channel <name>` filters to one channel.
- `rk drift <slug>` — compare source-of-truth version (local `package.json` / `pyproject.toml`) against the latest registry version recorded in `repo_published_versions`. `--strict` exits non-zero if any drift detected.
- `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` — manual binding of npm / PyPI package names and publisher method. Validates `--publisher-method` against the enum (`pypi_trusted` | `pypi_token` | `npm_token` | `npm_trusted` | `github_release_only` | `none`); exits 2 on bad enum.
- migration-007: `repos.npm_package_name`, `repos.pypi_package_name`, `repos.publisher_method` columns; new `repo_published_versions` table with composite index `idx_published_versions_repo_channel`.

### Changed

- CLI now uses `parseAsync()` so unhandled rejections from async action handlers surface (and exit non-zero) instead of being swallowed.

## [1.0.5] - 2026-03-25

### Added

- 4 version consistency tests (semver, >= 1.0.0, CHANGELOG, --version flag)

### Fixed

- CLI `--version` was hardcoded to 1.0.1 — now reads dynamically from package.json

## [1.0.0] - 2026-03-18

### Added
- SQLite-backed repo knowledge catalog with FTS5 full-text search
- CLI (`rk`) with 25+ commands for repo management and audit
- MCP server with 20 tools for AI-integrated workflows
- 80-control audit framework across 19 security/quality domains
- Structured audit evidence: runs, controls, findings, metrics
- GitHub sync via `gh` CLI
- Local filesystem scanning with multi-language tech detection
- Multi-agent orchestration templates (The Claude Games)
- Config system: `rk.config.json` for portable workspaces
