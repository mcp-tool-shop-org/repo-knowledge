<p align="center">
  <img src="assets/logo.png" alt="repo-knowledge" width="120" />
</p>

<h1 align="center">@mcptoolshop/repo-knowledge</h1>

<p align="center">
  Local-first repo knowledge system built on SQLite and FTS5. Catalogs repositories with structured metadata, thesis notes, architecture docs, audit evidence, and inter-repo relationships — then exposes everything through a CLI and MCP server for AI-integrated workflows.
</p>

---

## Why

Package registries and GitHub APIs tell you what a repo _is_. They don't tell you what it's _for_, how it relates to your other repos, what its architectural thesis is, or whether it passed your last security audit. repo-knowledge fills that gap: a single local database that holds thesis, architecture, audit evidence, relationships, and full-text search across all of it.

## Install

```bash
npm install -g @mcptoolshop/repo-knowledge
```

**Requirements:**
- Node.js 20+
- `gh` CLI (authenticated) for GitHub sync
- C/C++ build tools for `better-sqlite3`, or prebuild binaries will be used automatically on supported platforms

## Quick Start

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Inspect a specific repo
rk show my-org/my-repo

# Search across everything
rk find "authentication middleware"

# Seed the 80-control audit framework
rk audit seed-controls
```

## CLI Reference

### Core Commands

| Command | Description |
|---------|-------------|
| `rk init` | Initialize config, database, and seed audit controls |
| `rk sync` | Full sync: GitHub orgs + local repos + FTS index |
| `rk scan <path>` | Scan a single local repo directory |
| `rk show <slug>` | Show full repo knowledge with audit posture |
| `rk list` | List all repos (filterable by status, language, shape) |
| `rk find <query>` | Full-text search across all indexed content |
| `rk related <slug>` | Show repos related to a given repo |
| `rk note <slug>` | Add a typed note (thesis, architecture, warning, etc.) |
| `rk relate <from> <type> <to>` | Record a relationship between repos |
| `rk stats` | Show database statistics |
| `rk reindex` | Rebuild the FTS index |

### Audit Commands

| Command | Description |
|---------|-------------|
| `rk audit seed-controls` | Seed/update the 80-control canonical catalog |
| `rk audit import <dir>` | Import audit results from JSON contract files |
| `rk audit posture [slug]` | Show audit posture for one repo or full portfolio |
| `rk audit findings` | List open findings across the portfolio |
| `rk audit controls` | List canonical controls by domain |
| `rk audit unaudited` | List repos with no audit runs |
| `rk audit failing <domain>` | List repos failing a specific audit domain |

## MCP Server

The MCP server exposes 20 tools for AI-integrated workflows. Add it to your MCP client config:

**claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"],
      "env": {
        "RK_DB_PATH": "/path/to/knowledge.db"
      }
    }
  }
}
```

**.claude.json (project-scoped):**
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

### MCP Tools

`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

## Audit Framework

The audit system covers 19 domains with 80 controls:

| Domain | Controls |
|--------|----------|
| inventory | Repo metadata, ownership, classification |
| code_quality | Linting, formatting, complexity |
| security_sast | Static analysis, injection, auth |
| dependencies_sca | Vulnerability scanning, currency |
| licenses | License compliance, compatibility |
| secrets | Secret detection, rotation |
| config_iac | Infrastructure-as-code hygiene |
| containers | Image security, scanning |
| runtime | Error handling, resilience |
| performance | Profiling, optimization |
| observability | Logging, tracing, metrics |
| testing | Coverage, types, CI integration |
| cicd | Pipeline security, gates |
| deployment | Release process, rollback |
| backup_dr | Backup plans, recovery |
| monitoring | Alerting, uptime |
| compliance_privacy | Data handling, GDPR |
| supply_chain | SBOM, provenance |
| integrations | API contracts, versioning |

Each audit run produces structured evidence: control results (pass/fail/warn/not_applicable), findings with severity and remediation, and aggregate metrics. Posture is derived automatically: **healthy**, **needs_attention**, or **critical**.

## Multi-Agent Orchestration: The Claude Games

repo-knowledge includes templates for parallel multi-Claude operations across large portfolios. The Claude Games coordinate multiple AI agents through a shared worklist:

1. **Audit Pass** — Each agent claims repos from the worklist, runs the 80-control audit, and submits structured results
2. **Enrichment Pass** — Agents add thesis, architecture notes, and relationship mappings
3. **Remediation Pass** — Agents fix findings using a scored 8-step workflow

See [`templates/claude-games/`](templates/claude-games/) for the full playbook.

## Data Model

```
repos
 +-- tech (language, framework, shape, runtime)
 +-- notes (thesis, architecture, warning, convention, ...)
 +-- docs (README, CHANGELOG, indexed content)
 +-- facts (dependencies, config keys, endpoints)
 +-- relationships (depends_on, related_to, supersedes, ...)
 +-- audit_runs
      +-- audit_control_results (per-control pass/fail)
      +-- audit_findings (title, severity, remediation)
      +-- audit_metrics (pass_rate, coverage, counts)
```

All data lives in a single SQLite database with FTS5 full-text search across docs, notes, and repo descriptions.

## Configuration

Create `rk.config.json` in your workspace root (or run `rk init`):

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["."],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Environment variables: `RK_DB_PATH`, `RK_OWNERS`, `RK_LOCAL_DIRS`.

## License

[MIT](LICENSE)
