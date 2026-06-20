<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/repo-knowledge/readme.png" alt="repo-knowledge" width="500" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/repo-knowledge/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/repo-knowledge"><img src="https://img.shields.io/npm/v/@mcptoolshop/repo-knowledge" alt="npm version" /></a>
  <a href="https://github.com/mcp-tool-shop-org/repo-knowledge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/repo-knowledge/"><img src="https://img.shields.io/badge/docs-landing%20page-34d399" alt="Landing Page" /></a>
</p>

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

## Security Model

**Data touched:** local SQLite database, GitHub API metadata via `gh` CLI (repo names, descriptions, topics, stars — no source code content).

**Data NOT touched:** no source code is read from GitHub, no credentials are stored, no data is sent to external services.

**Permissions:** requires `gh` CLI authenticated for GitHub sync; all data stays local.

**No telemetry, no analytics, no phone-home.**

## Quick Start

```bash
# Initialize workspace — creates config, database, seeds audit controls
rk init

# Sync repos from your GitHub org
rk sync --owners my-org

# Include forked repos
rk sync --owners my-org --forks

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
| `rk note <slug>` | Add a typed note (thesis, architecture, warning, etc.) with `--type` and `--content` (optional `--title`) |
| `rk relate <from> <type> <to>` | Record a relationship between repos (optional `--note`) |
| `rk stats` | Show database statistics |
| `rk reindex` | Rebuild the FTS index |
| `rk sync-dogfood` | Sync dogfood evidence from dogfood-lab/testing-os into repo facts |
| `rk suggest-dogfood --repo <slug>` | Suggest known dogfood findings for a repo or surface |

> **`--json` everywhere it matters.** `list`, `find`, `show`, `related`, and `stats` — plus the five audit reads (`posture`, `findings`, `controls`, `unaudited`, `failing`) — all accept `--json` for machine-readable output. JSON is the load-bearing contract across the core commands: pipe any of them straight into `jq`.

### Lifecycle Commands (v2.0.0)

| Command | Description |
|---------|-------------|
| `rk delete <slug> [--yes]` | Cascade-delete a repo and all child rows |
| `rk archive <slug> [--reason <text>]` | Flip `lifecycle_status` to `archived` (preserves notes/findings) |
| `rk verify-local [--rig <id>] [--strict]` | Verify `local_path` exists per rig; updates `repo_local_paths` |
| `rk init-rig [--id <id>] [--hostname <h>] [--root <path>]` | Register the current rig |
| `rk prune [--dry-run] [--apply] [--days <N>]` | Hard-delete repos archived longer than N days (default 30) |

### Publish-State Commands (v2.0.0)

| Command | Description |
|---------|-------------|
| `rk versions <slug> [--refresh] [--channel <name>]` | Cross-channel published-version dashboard (npm/pypi/github_release) |
| `rk drift <slug> [--strict]` | Compare source-of-truth version vs latest registry |
| `rk bind-package <slug> [--npm <name>] [--pypi <name>] [--publisher-method <method>]` | Manual binding setter |

### Health Commands (v2.0.0 — research-grounded)

| Command | Description |
|---------|-------------|
| `rk health` (default = feed) | Change feed: deltas since last sync, KEV intersection, CI streak breaks, action-pin drift |
| `rk health doctor <slug>` | Single-repo deep-dive (dep audit, workflow actions, CI signal, toolchain) |
| `rk health table [--json\|--text]` | Portfolio health table; JSON is the load-bearing contract |

### Operational Commands (v2.0.0)

| Command | Description |
|---------|-------------|
| `rk fsck [--strict] [--json]` | DB integrity check; writes audit row to `db_health_runs` |
| `rk diff <slug> [--since <date>] [--until <date>] [--json]` | Entry change history for one repo |
| `rk runs [--db-health\|--sync] [--limit <N>] [--json]` | List recent `db_health_runs` / `sync_runs` entries |
| `rk owners list` | List configured GitHub owners |
| `rk owners add <owner>` | Append to `rk.config.json` owners |
| `rk owners remove <owner>` | Remove from `rk.config.json` owners |

### Backup, Restore & Preflight (v2.1.0)

| Command | Description |
|---------|-------------|
| `rk backup [--out <path>]` | Snapshot the knowledge DB to a vacuumed copy (`VACUUM INTO`) under `data/backups/` or `--out` |
| `rk restore <path> [--yes]` | Restore the DB from a snapshot — schema-validated, atomic swap, confirm-gated (refuses a newer-schema backup) |
| `rk doctor [--json] [--strict]` | Environment preflight: config, DB, schema version, `gh` auth, current rig, recent sync/fsck runs |
| `rk config [--json]` | Show the resolved effective config with per-field provenance |
| `rk config validate [--json]` | Validate `rk.config.json` — exits non-zero on placeholder owners, bad shapes, or unresolvable paths |

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

### Games Commands

| Command | Description |
|---------|-------------|
| `rk games score <worklist>` | Score a REMEDIATION-WORKLIST.md and show leaderboard |

## MCP Server

The MCP server exposes 30 tools for AI-integrated workflows. Add it to your MCP client config:

**Claude Code (project-scoped `.claude.json`):**
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

**Claude Desktop (`claude_desktop_config.json`):**
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

The server reads `rk.config.json` from the working directory at startup. Make sure `rk.config.json` exists in the directory where the server runs.

### MCP Tools

**Knowledge & sync:**
`get_repo` `find_repos` `search_repos` `related_repos` `repos_by_stack` `repos_needing_work` `repo_summary` `add_repo_note` `add_relationship` `knowledge_stats` `sync_repos` `sync_dogfood`

**Audit:**
`audit_posture` `audit_portfolio` `audit_findings` `audit_detail` `audit_submit` `audit_controls_list` `audit_unaudited`

**Build-health** (DB-only reads, no network refresh):
`health_feed` `health_doctor` `health_portfolio`

**Operational hygiene:**
`db_fsck` `repo_diff` `ops_runs`

**Lifecycle & publish:**
`archive_repo` `delete_repo` `repo_versions`

**Dogfood & audit-drill:**
`suggest_dogfood` `audit_failing`

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

All settings come from `rk.config.json` (created by `rk init`). The MCP server also reads config from the working directory.

## License

[MIT](LICENSE)

---

Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
