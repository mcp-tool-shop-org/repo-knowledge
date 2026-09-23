---
title: Getting Started
description: Install repo-knowledge, initialize the database, and sync your first repos.
sidebar:
  order: 1
---

## Requirements

- **Node.js 20+** — this package's `engines.node` is `>=20`. The locked `better-sqlite3` addon's own `engines` list is vendor majors, not a prebuild-coverage claim.
- **`gh` CLI** (authenticated) for GitHub sync
- C/C++ build tools for `better-sqlite3` when a prebuild misses. The addon install script is dual-path: `prebuild-install || node-gyp rebuild --release`. A matching prebuild is used when one is available; otherwise `node-gyp` compiles from source. That is not universal platform coverage. If install fails, see the [better-sqlite3 troubleshooting guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

## Install

```bash
npm install -g @mcptoolshop/repo-knowledge
```

This package has no product-level install script. npm installs the `better-sqlite3` dependency, whose vendor script is `prebuild-install || node-gyp rebuild --release`.

## Initialize

`rk init` bootstraps the workspace. It:

- Creates `rk.config.json` in the current directory when missing (prints `Already exists` if the file is already there)
- Ensures the `data/` directory exists (same create / `Already exists` path)
- Opens the database via `openDb` at the resolved `dbPath` (default `data/knowledge.db`), which applies migrations
- Seeds the canonical audit control catalog

The command is idempotent: a re-run is safe. Existing config and `data/` stay in place; the database is opened again and controls are re-seeded.

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

This fetches repo metadata via the `gh` CLI: names, descriptions, topics, stars, license info, and the repo's primary language (`primaryLanguage` on the `gh` listing; stored as `primary_language`). GitHub sync does not populate a language-bytes map — it stores `languages` as an empty stub (`{}`). No source code is read from GitHub.

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

## Configuration

All settings live in `rk.config.json` in your workspace root. Edit this file to change database path, GitHub owners, or local scan directories. See the [Reference](/handbook/reference/) page for the full schema.
