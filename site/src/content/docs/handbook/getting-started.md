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

`rk init` bootstraps the workspace. It:

- Creates `rk.config.json` in the current directory when missing (prints `Already exists` if the file is already there)
- Ensures the `data/` directory exists (same create / `Already exists` path)
- Opens the database via `openDb` at the resolved `dbPath` (default `data/knowledge.db`), which applies migrations
- Seeds the canonical audit control catalog

The command is idempotent: a re-run is safe. Existing config and `data/` stay in place; the database is opened again and controls are re-seeded.

```bash
rk init
```

A fresh `rk.config.json` looks like:

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
