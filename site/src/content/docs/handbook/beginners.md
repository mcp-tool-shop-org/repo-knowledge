---
title: Beginner's Guide
description: A step-by-step introduction to repo-knowledge for first-time users.
sidebar:
  order: 99
---

This guide walks you through repo-knowledge from zero to a working knowledge catalog. No prior experience with knowledge systems or audit frameworks is required.

## What is repo-knowledge?

repo-knowledge is a local tool that builds a searchable catalog of all your GitHub repositories. It stores everything in a single SQLite database on your machine: repo metadata, tech stack fingerprints, documentation, typed notes, inter-repo relationships, and audit evidence.

Think of it as a personal database that answers questions like:
- What repos do I have and what tech stack does each one use?
- Which repos depend on each other?
- Which repos have never been audited?
- Where did I document the architecture decision for that auth service?

It has two interfaces: a CLI (`rk`) for terminal use, and an MCP server that lets AI assistants like Claude query and annotate your repos conversationally.

## Prerequisites

Before installing, make sure you have:

1. **Node.js 20 or later** -- check with `node --version`
2. **GitHub CLI (`gh`)** -- install from [cli.github.com](https://cli.github.com/) and authenticate with `gh auth login`
3. **A GitHub org or user account** with repositories to catalog

The `gh` CLI is needed to fetch repository metadata from GitHub. repo-knowledge never reads source code from GitHub -- only names, descriptions, topics, stars, and similar metadata.

## Installation and first sync

Install repo-knowledge globally so the `rk` command is available everywhere:

```bash
npm install -g @mcptoolshop/repo-knowledge
```

Then initialize a workspace. Navigate to the directory where you want the database to live and run:

```bash
mkdir my-knowledge && cd my-knowledge
rk init
```

This creates two things:
- `rk.config.json` -- your workspace configuration
- `data/knowledge.db` -- the SQLite database (with the 80-control audit catalog already seeded)

Edit `rk.config.json` to point at your GitHub org:

```json
{
  "owners": ["your-github-org"],
  "localDirs": ["/path/to/your/repos"],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

Now sync your repos:

```bash
rk sync --owners your-github-org
```

You should see dots printing as each repo is fetched. When it finishes, verify with:

```bash
rk stats
```

This shows the number of repos, notes, docs, and other entities in your database.

## Core workflows

### Browsing your catalog

```bash
# List all repos
rk list

# Filter by language
rk list --language TypeScript

# Filter by app shape (cli, desktop, web, library, mcp-server, etc.)
rk list --shape cli

# View full details for a repo
rk show your-org/your-repo
```

The `rk show` command displays everything known about a repo: metadata, tech stack, notes, relationships, releases, and audit posture.

### Searching across everything

repo-knowledge maintains a full-text search index (FTS5) across all READMEs, changelogs, notes, and descriptions:

```bash
rk find "authentication middleware"
```

Results are grouped by repo, with snippets showing where the match was found.

### Adding knowledge

You can attach typed notes to any repo:

```bash
# Record what a repo is for
rk note your-org/auth-service --type thesis --content "Central auth service for all org APIs"

# Document a known issue
rk note your-org/legacy-api --type warning --content "Rate limiting is hardcoded, needs config migration"

# Record what should happen next
rk note your-org/data-pipeline --type next_step --content "Migrate from cron to event-driven triggers"
```

Available note types: `thesis`, `architecture`, `convention`, `warning`, `next_step`, `drift_risk`, `release_summary`, `command`, `pain_point`, `general`.

### Mapping relationships

Record how repos relate to each other:

```bash
rk relate your-org/api-gateway depends_on your-org/auth-service
rk relate your-org/web-app related_to your-org/mobile-app
rk relate your-org/new-api supersedes your-org/legacy-api
```

Available relationship types: `depends_on`, `related_to`, `supersedes`, `shares_domain_with`, `shares_package_with`, `companion_to`.

View relationships for a repo:

```bash
rk related your-org/auth-service
```

## Understanding the data model

All data lives in a single SQLite database. Here is how it fits together:

```
repos                         -- one row per repository
 +-- repo_tech                -- language, framework, shape, runtime
 +-- repo_topics              -- tags from GitHub or manual
 +-- repo_notes               -- typed knowledge (thesis, architecture, etc.)
 +-- repo_docs                -- indexed READMEs, changelogs, docs
 +-- repo_facts               -- detected dependencies, config keys, endpoints
 +-- repo_relationships       -- connections between repos
 +-- repo_releases            -- version history from GitHub
 +-- audit_runs               -- structured audit evidence
      +-- audit_control_results   -- per-control pass/fail/warn
      +-- audit_findings          -- concrete issues with severity
      +-- audit_metrics           -- aggregate numbers (pass rate, counts)
```

The **knowledge catalog** layer (repos, tech, notes, docs, facts, relationships) is populated by `rk sync` and `rk scan`. The **audit evidence** layer is populated by `rk audit import` or the MCP `audit_submit` tool.

## Running your first audit

The audit system has 80 controls across 19 domains (security, testing, dependencies, CI/CD, and more). You can browse them:

```bash
# List all controls
rk audit controls

# List controls for a specific domain
rk audit controls --domain testing
```

Each control has a fixed ID like `TST-001` (testing domain, control 1) or `SEC-002` (security SAST domain, control 2).

To run an audit, you create JSON files describing the results and import them:

```bash
mkdir my-audit

# Create run.json (required)
cat > my-audit/run.json << 'EOF'
{
  "slug": "your-org/your-repo",
  "overall_status": "pass_with_findings",
  "overall_posture": "needs_attention",
  "auditor": "manual",
  "scope_level": "core",
  "domains_checked": ["testing", "code_quality"]
}
EOF

# Create controls.json (required)
cat > my-audit/controls.json << 'EOF'
[
  { "control_id": "QUA-001", "result": "pass", "notes": "ESLint passes" },
  { "control_id": "TST-001", "result": "pass", "notes": "Vitest suite passes" },
  { "control_id": "TST-002", "result": "warn", "notes": "Coverage at 45%" }
]
EOF

# Import
rk audit import my-audit/
```

After importing, view the results:

```bash
# See posture for one repo
rk audit posture your-org/your-repo

# See portfolio-wide posture
rk audit posture

# See open findings
rk audit findings

# See repos that have never been audited
rk audit unaudited
```

## Connecting AI assistants

repo-knowledge includes an MCP server that gives AI assistants like Claude direct access to your knowledge catalog. This means Claude can look up repos, search your notes, check audit posture, and even submit audit results -- all conversationally.

### Setup for Claude Code

Add to your project's `.claude.json`:

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

### Setup for Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "repo-knowledge": {
      "command": "node",
      "args": ["node_modules/@mcptoolshop/repo-knowledge/dist/mcp/server.js"],
      "env": {
        "RK_DB_PATH": "/path/to/data/knowledge.db"
      }
    }
  }
}
```

Once connected, Claude can use tools like `get_repo`, `search_repos`, `audit_posture`, and `add_repo_note` to interact with your catalog. Ask Claude things like:

- "What repos use React and TypeScript?"
- "Show me the audit posture for my-org/auth-service"
- "Which repos need attention?"
- "Add a thesis note to my-org/data-pipeline explaining it handles ETL for the analytics stack"

## Common questions

**Where is the data stored?**
Everything lives in a single SQLite file at the path set in `rk.config.json` (default: `data/knowledge.db`). No data is sent to external services.

**Does it read my source code from GitHub?**
No. It only reads metadata via the `gh` CLI: repo names, descriptions, topics, stars, languages, and license info. Local scanning reads manifest files (package.json, Cargo.toml, etc.) and documentation files (README, CHANGELOG) from your disk.

**What if my search results are stale?**
Run `rk reindex` to rebuild the full-text search index from current data.

**Can multiple people use the same database?**
SQLite supports concurrent reads but only one writer at a time. For team use, each person typically maintains their own local database. The data is cheap to regenerate with `rk sync`.

**What is the audit framework for?**
It provides a structured way to track security and quality evidence across your portfolio. You can run audits manually, import results from other tools, or let AI agents perform audits via the MCP server. The 80 controls cover 19 domains from code quality to supply chain security.

**How do I back up my database?**
Copy the `.db` file. For a clean backup, first run `sqlite3 data/knowledge.db "PRAGMA wal_checkpoint(FULL);"` to flush the write-ahead log, then copy the file.
