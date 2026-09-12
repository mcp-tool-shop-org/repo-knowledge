---
title: Getting Started
description: Install repo-knowledge, initialize the database, and sync your first repos.
sidebar:
  order: 1
---

## Requirements

- **Node.js 20+** — this package's `engines.node` is `>=20`. Locked `better-sqlite3@12.8.0` lists `20.x || 22.x || 23.x || 24.x || 25.x` (vendor majors, not a prebuild-coverage claim).
- **`gh` CLI** (authenticated) for GitHub sync
- C/C++ build tools for `better-sqlite3` when a prebuild misses. The addon install script is dual-path: `prebuild-install || node-gyp rebuild --release`. A matching prebuild is used when one is available; otherwise `node-gyp` compiles from source. That is not universal platform coverage. If install fails, see the [better-sqlite3 troubleshooting guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

## Install

```bash
npm install -g @mcptoolshop/repo-knowledge
```

This package has no product-level install script. npm installs the `better-sqlite3` dependency, whose vendor script is `prebuild-install || node-gyp rebuild --release`.

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

## Configuration

All settings live in `rk.config.json` in your workspace root. Edit this file to change database path, GitHub owners, or local scan directories. See the [Reference](/handbook/reference/) page for the full schema.
