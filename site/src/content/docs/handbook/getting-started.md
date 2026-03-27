---
title: Getting Started
description: Install repo-knowledge, initialize the database, and sync your first repos.
sidebar:
  order: 1
---

## Requirements

- **Node.js 20+**
- **`gh` CLI** (authenticated) for GitHub sync
- C/C++ build tools for `better-sqlite3`, or prebuilt binaries will be used automatically on supported platforms

## Install

```bash
npm install -g @mcptoolshop/repo-knowledge
```

## Initialize

Create a workspace config and seed the audit control catalog:

```bash
rk init
```

This creates `rk.config.json` in the current directory with default settings:

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

## Sync repos

Pull repository metadata from GitHub:

```bash
rk sync --owners my-org
```

This fetches repo names, descriptions, topics, stars, languages, and license info via the `gh` CLI. No source code is read from GitHub.

To also scan local directories for tech fingerprints and docs:

```bash
rk sync --owners my-org --local /path/to/repos
```

## Verify

```bash
# Check database statistics
rk stats

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication"
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `RK_DB_PATH` | Path to the SQLite database file |
| `RK_OWNERS` | Comma-separated list of GitHub org owners |
| `RK_LOCAL_DIRS` | Comma-separated list of local directories to scan |
