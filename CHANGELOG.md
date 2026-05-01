# Changelog

## [1.0.6] - 2026-05-01

### Fixed

- `rk sync` silent-failure bug: in v1.0.5 and earlier, `rk sync` would exit 0 while the underlying full-sync routine actually crashed. The CLI passed an override object containing `dbPath: undefined` into `resolveConfig`, which clobbered the default and caused `path.resolve(undefined)` to throw inside an async action. Because the CLI used `program.parse()` (not `parseAsync`), the rejection was never awaited and the process exited 0 — anyone running `rk sync` saw "success" with no DB mutation. Three changes ensure this can't recur:
  1. `resolveConfig` now strips `undefined` values from overrides and from `rk.config.json` before merging, so callers can safely forward optional flags without erasing defaults.
  2. `resolveConfig` validates required fields (`dbPath`, `artifactsRoot`, `localDirs`) and throws a clear, named error if anything is missing — the failure surfaces at the config layer with a useful message instead of a generic `path.resolve` stack.
  3. The CLI now uses `parseAsync().catch(...)` so async action rejections actually propagate to a non-zero exit.
- Postbuild: `migration-004-findings-idempotent.sql` was missing from the `dist/db/` copy list, causing `openDb` to ENOENT on any fresh database. Same exit-0 silent-failure family — added to the copy manifest.

### Tests

- 3 new `resolveConfig` tests covering the undefined-override, null-from-config-file, and empty-string-override regression cases.

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
