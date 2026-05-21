# Changelog

## [Unreleased]

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
