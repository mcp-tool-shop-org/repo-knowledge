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

Install C/C++ build tools:
- **Ubuntu:** `sudo apt install build-essential`
- **macOS:** `xcode-select --install`
- **Windows:** Install Visual Studio Build Tools

Prebuilt binaries are used automatically on many platforms.

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
