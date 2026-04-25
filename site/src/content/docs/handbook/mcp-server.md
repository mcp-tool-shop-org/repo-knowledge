---
title: MCP Server
description: Configure and use the MCP server to give AI agents access to your repo knowledge.
sidebar:
  order: 3
---

The MCP server exposes 19 tools over stdio, enabling Claude and other AI agents to query, annotate, and audit repos conversationally.

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

## Multi-agent workflows

repo-knowledge is designed for parallel multi-Claude operations. Multiple agents can:

1. **Audit** — claim repos from a worklist, run the 80-control audit, submit via `audit_submit`
2. **Enrich** — add thesis, architecture notes, and relationship mappings
3. **Remediate** — fix findings using a scored workflow

See `templates/claude-games/` in the repo for full playbook templates.
