# Changelog

## [Unreleased]

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
