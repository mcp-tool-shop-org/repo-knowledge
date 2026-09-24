# repo-knowledge Handbook

Operational guide for running and maintaining the repo-knowledge system.

## Branch Protection & CI Policy

The `main` branch is the release branch. All changes should follow these rules:

- **Required checks:** CI must pass (build, typecheck, lint, test) before merging
- **Direct push:** Allowed for maintainers (single-maintainer project)
- **Force push:** Never force-push to `main`
- **Release flow:** Version bump in `package.json` → commit → push → `npm publish`
- **CI matrix:** tests run on Node 20 + 22 on `ubuntu-latest`; the build, typecheck and lint run on Node 22 in both cells, because tsdown requires Node >=22.18. Building from source needs Node 22.18+; running the published package still needs only Node 20+.
- **Dependency audit:** `npm audit --audit-level=moderate` runs in CI (non-blocking)

If CI fails on push, fix immediately before any further work.

## Daily Operations

```bash
# Sync repos from GitHub orgs and local directories, rebuild FTS index
rk sync --owners my-org --local /path/to/repos

# Rebuild the full-text search index (if search results seem stale)
rk reindex

# Check database statistics
rk stats
```

## Database Backup

The knowledge database is a local SQLite file (default: `data/knowledge.db`). Snapshot and restore it with the first-class CLI — `rk backup` writes a vacuumed copy; do not treat a live-file `cp` or a manual WAL checkpoint as the primary path.

```bash
# Vacuumed snapshot under data/backups/
rk backup

# Or write the snapshot to an explicit path
rk backup --out /path/to/knowledge-backup.db
```

`rk backup [--out <path>]` uses SQLite `VACUUM INTO` to write a consistent single-file snapshot under `data/backups/` (or `--out`).

```bash
# Schema-validated restore (confirm-gated; --yes skips the prompt)
rk restore data/backups/<timestamp>.db
rk restore data/backups/<timestamp>.db --yes
```

`rk restore <path> [--yes]` schema-validates the snapshot, is confirm-gated, swaps the live database atomically (temp-then-rename), and clears WAL sidecars so a stale WAL cannot replay over the restored file. It refuses a backup whose `schema_version` is newer than this rk build.

## Disaster Recovery

**Critical state:** `data/knowledge.db` (SQLite database). This is the only stateful artifact. Everything else is reconstructable.

**Recovery time:** ~5 minutes for a full re-sync of 176 repos.

**Data loss risk:** Manual notes, relationships, and audit evidence are lost if no backup exists. GitHub metadata and local repo scans are fully reconstructable.

If you have a snapshot, restore it with `rk restore <path>` (see Database Backup above). If the database becomes corrupt and you have no snapshot, or you need a fresh start:

```bash
# 1. Delete the corrupt database
rm data/knowledge.db data/knowledge.db-wal data/knowledge.db-shm

# 2. Re-initialize and seed controls
rk init

# 3. Re-sync from GitHub and local repos
rk sync --owners my-org --local /path/to/repos
```

All data is reconstructable from GitHub metadata and local repo scans. Notes and relationships added manually will need to be re-entered unless you have a backup.

## Migration

Migrations run automatically when `openDb()` is called (on any CLI command or MCP server start). The current schema version is tracked in the `meta` table.

If a migration fails:

1. Check the `meta` table: `sqlite3 data/knowledge.db "SELECT * FROM meta WHERE key = 'schema_version';"`
2. Review the migration files in `src/db/migrations/`
3. If stuck, delete the database and re-sync (see Recovery above)

## MCP Server

The MCP server communicates over stdio. Configure it in your MCP client:

**claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "rk",
      "args": ["mcp"],
      "env": {}
    }
  }
}
```

If the server hangs or becomes unresponsive, restart it by restarting your MCP client. The server holds no state beyond the SQLite connection.

## Troubleshooting

### `gh` not authenticated
```
Error: gh auth status failed
```
Run `gh auth login` and follow the prompts. The `gh` CLI must be authenticated for GitHub sync to work.

### `better-sqlite3` build fails
```
Error: Could not locate the bindings file
```
You need C/C++ build tools installed. On Ubuntu: `sudo apt install build-essential`. On macOS: `xcode-select --install`. On Windows: install Visual Studio Build Tools. Alternatively, prebuilt binaries are used automatically on supported platforms.

### Database locked
```
Error: SQLITE_BUSY: database is locked
```
Another process has the database open. Close other `rk` CLI sessions or MCP server instances. If the lock persists after all processes are closed, delete the `-wal` and `-shm` files and retry.

### FTS index out of date
If search results don't match expected content, rebuild the index:
```bash
rk reindex
```
