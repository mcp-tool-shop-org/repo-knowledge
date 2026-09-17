---
title: Operations
description: Day-to-day operations, backup, recovery, and troubleshooting.
sidebar:
  order: 5
---

## Daily operations

```bash
# Sync repos and rebuild FTS index
rk sync --owners my-org --local /path/to/repos

# Rebuild full-text search if results seem stale
rk reindex

# Check database health
rk stats
```

## Database backup

The database is a single SQLite file running in WAL mode.

```bash
# Flush the WAL to the main database file
sqlite3 data/knowledge.db "PRAGMA wal_checkpoint(FULL);"

# Copy the database file
cp data/knowledge.db data/knowledge-backup-$(date +%Y%m%d).db
```

Only the `.db` file is needed — the `-wal` and `-shm` files are transient and will be recreated.

## Recovery

If the database becomes corrupt or you need a fresh start:

```bash
# Delete the corrupt database
rm data/knowledge.db data/knowledge.db-wal data/knowledge.db-shm

# Re-initialize and seed controls
rk init

# Re-sync from GitHub and local repos
rk sync --owners my-org --local /path/to/repos
```

All data is reconstructable from GitHub metadata and local repo scans. Manually-added notes and relationships will need to be re-entered unless you have a backup.

## Migrations

Schema migrations run automatically when any CLI command or MCP server starts. The current version is tracked in the `meta` table.

If a migration fails:

1. Check the schema version: `sqlite3 data/knowledge.db "SELECT * FROM meta WHERE key = 'schema_version';"`
2. Review migration SQL files in `src/db/`
3. If unrecoverable, delete the database and re-sync

## Troubleshooting

### `gh` not authenticated

```
Error: gh auth status failed
```

Run `gh auth login` and follow the prompts. The `gh` CLI must be authenticated for GitHub sync.

### `better-sqlite3` build fails

```
Error: Could not locate the bindings file
```

`better-sqlite3@12.8.0` installs via the vendor dual path `prebuild-install || node-gyp rebuild --release`: use a matching prebuild when one is available, otherwise compile from source. A prebuild miss (unsupported Node ABI, arch, or runtime) is expected to fall through to `node-gyp`. That is not a claim that prebuilds cover every platform.

This package's `engines.node` is `>=20`. The locked addon lists `20.x || 22.x || 23.x || 24.x || 25.x` (vendor majors, not a coverage table).

Install C/C++ build tools when the compile path runs:
- **Ubuntu:** `sudo apt install build-essential`
- **macOS:** `xcode-select --install`
- **Windows:** Install Visual Studio Build Tools

See the [better-sqlite3 troubleshooting guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

### Database locked

```
Error: SQLITE_BUSY: database is locked
```

Another process has the database open. Close other `rk` CLI sessions or MCP server instances. If the lock persists, delete the `-wal` and `-shm` files and retry.

### FTS index out of date

If search results don't match expected content:

```bash
rk reindex
```
