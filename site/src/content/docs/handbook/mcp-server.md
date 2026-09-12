---
title: MCP Server
description: Configure and use the MCP server to give AI agents access to your repo knowledge.
sidebar:
  order: 3
---

The MCP server exposes 30 tools over stdio, enabling Claude and other AI agents to query, annotate, and audit repos conversationally.

## Configuration

### Claude Code (project-scoped)

Add to `.claude.json`:

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

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"]
    }
  }
}
```

The MCP server reads `rk.config.json` from the working directory at startup. Ensure the config file exists in the directory where the server process runs.

## Knowledge tools

| Tool | Description |
|------|-------------|
| `get_repo` | Full knowledge dump for a repo |
| `find_repos` | Filter repos by owner, status, language, framework, shape |
| `search_repos` | Full-text search across all indexed content |
| `related_repos` | Show repos related to a given repo |
| `repos_by_stack` | Find repos using a specific tech stack combination |
| `repos_needing_work` | Find repos that need attention: stale, unaudited, warnings |
| `repo_summary` | One-paragraph summary of a repo |
| `add_repo_note` | Add a typed knowledge note to a repo |
| `add_relationship` | Record a relationship between two repos |
| `knowledge_stats` | Database statistics |
| `sync_repos` | Trigger a full sync cycle |
| `sync_dogfood` | Sync dogfood evidence from dogfood-lab/testing-os into repo facts |

## Audit tools

| Tool | Description |
|------|-------------|
| `audit_submit` | Submit audit results for a repo |
| `audit_posture` | Get audit posture for one repo |
| `audit_portfolio` | Portfolio-wide audit posture grouped by health |
| `audit_findings` | List open findings, filterable by severity and domain |
| `audit_detail` | Full audit report for a repo |
| `audit_controls_list` | List canonical controls by domain |
| `audit_unaudited` | List repos with no audit runs |

## Build-health tools

DB-only reads, no network refresh — the same grouping as the README MCP Tools list.

| Tool | Description |
|------|-------------|
| `health_feed` | Build-health change feed across the whole portfolio: audit deltas, newly-unpinned actions, broken CI streaks, toolchain drift. DB-only read (no registry/network refresh) — reflects state as of the last `rk sync`. |
| `health_doctor` | Single-repo build-health deep dive: CI, declared/observed toolchain + drift, dep-audit (with CVE IDs) and history, workflow actions + permissions. DB-only read (no network refresh). |
| `health_portfolio` | Portfolio health rollup — one row per repo with CI / dep / action-pin health grades + toolchain-drift flag and inline detail. DB-only read (no network refresh). |

## Operational hygiene tools

| Tool | Description |
|------|-------------|
| `db_fsck` | Run the DB-integrity checker: orphan rows, broken relationships, missing local paths, FTS row-count mismatch, invalid lifecycle status, incomplete sync runs. SIDE EFFECT: writes one db_health_runs audit row per call. |
| `repo_diff` | Per-repo DB-entry change history within a time window: notes added, audit runs, dep-audit severity deltas, published versions. Default window is the last 7 days. DB-only read. |
| `ops_runs` | List recent operational run rows: db_health_runs (fsck) and/or sync_runs. Read-only audit trail. Use kind to scope to one table. |

## Lifecycle and publish tools

| Tool | Description |
|------|-------------|
| `archive_repo` | Mark a repo archived (lifecycle_status=archived). Preserves all notes/findings — the reversible alternative to delete_repo. If reason is given it is recorded as a warning note. |
| `delete_repo` | HARD-DELETE a repo and all related rows (notes, facts, docs, relationships, audit runs — FK cascade). IRREVERSIBLE. `confirm` MUST be literally true to proceed. Prefer archive_repo when you only want to mark a repo dead. |
| `repo_versions` | List published versions recorded for a repo, grouped per channel (npm / pypi / github-release). READ-ONLY — the MCP variant does NOT hit registries; it reports the rows already in the DB as of the last sync. |

## Dogfood and audit-drill tools

| Tool | Description |
|------|-------------|
| `suggest_dogfood` | Get dogfood intelligence suggestions (findings, patterns, recommendations, doctrine) for a repo OR a product surface. Specify EXACTLY ONE of repo / surface. |
| `audit_failing` | List repos whose LATEST audit has failing controls in a given domain. Returns each failing control id + title + notes per repo. |

## Multi-agent workflows

repo-knowledge is designed for parallel multi-Claude operations. Multiple agents can:

1. **Audit** — claim repos from a worklist, run the 80-control audit, submit via `audit_submit`
2. **Enrich** — add thesis, architecture notes, and relationship mappings
3. **Remediate** — fix findings using a scored workflow

See `templates/claude-games/` in the repo for full playbook templates.
