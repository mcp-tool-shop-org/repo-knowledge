---
title: CLI Usage
description: Complete guide to using the rk command-line interface.
sidebar:
  order: 2
---

## Core commands

### `rk init`

Initialize the workspace: creates config file, database directory, and seeds the 80-control audit catalog.

### `rk sync`

Full sync cycle: fetches GitHub org metadata, scans local directories, and rebuilds the FTS index.

```bash
# Sync a single org
rk sync --owners my-org

# Sync multiple orgs with local scanning
rk sync --owners org1,org2 --local /path/to/repos

# Include release history (slower)
rk sync --owners my-org --releases

# Include forked repos
rk sync --owners my-org --forks
```

### `rk scan <path>`

Scan a single local repository directory for tech fingerprints, docs, and facts.

```bash
rk scan /path/to/my-project
```

### `rk show <slug>`

Display full knowledge for a repo: metadata, tech stack, notes, relationships, and audit posture.

```bash
rk show my-org/my-repo
```

### `rk list`

List all repos with optional filters:

```bash
rk list                              # all repos
rk list --language typescript        # filter by language
rk list --shape mcp-server           # filter by app shape
rk list --status active              # filter by status
```

### `rk find <query>`

Full-text search across all indexed content: READMEs, changelogs, notes, descriptions.

```bash
rk find "authentication middleware"
rk find "react component testing"
```

### `rk related <slug>`

Show repos related to a given repo via mapped relationships.

```bash
rk related my-org/my-repo
```

### `rk note <slug>`

Add a typed note to a repo. Note types: `thesis`, `architecture`, `convention`, `warning`, `next_step`, `drift_risk`, `release_summary`, `command`, `pain_point`, `general`.

```bash
rk note my-org/my-repo --type thesis --content "Core auth service for all org APIs"
```

### `rk relate <from> <type> <to>`

Record a relationship between two repos. Types: `depends_on`, `related_to`, `supersedes`, `shares_domain_with`, `shares_package_with`, `companion_to`.

```bash
rk relate my-org/api-gateway depends_on my-org/auth-service
```

### `rk stats`

Show database statistics: repo count, notes, docs, facts, relationships, audit runs.

### `rk reindex`

Rebuild the FTS5 full-text search index. Use when search results seem stale.

## Audit commands

### `rk audit seed-controls`

Seed or update the 80-control canonical audit catalog. Safe to run multiple times.

### `rk audit import <dir>`

Import audit results from a directory containing JSON contract files (`run.json`, `controls.json`, `findings.json`, `metrics.json`).

### `rk audit posture [slug]`

Show audit posture for one repo or the full portfolio. Posture levels: **healthy**, **needs_attention**, **critical**.

```bash
rk audit posture                     # portfolio overview
rk audit posture my-org/my-repo      # single repo
```

### `rk audit findings`

List open findings across the portfolio:

```bash
rk audit findings                    # all open findings
rk audit findings --severity critical
rk audit findings --domain secrets
```

### `rk audit controls`

List canonical controls, optionally filtered by domain:

```bash
rk audit controls
rk audit controls --domain security_sast
```

### `rk audit unaudited`

List repos that have never been audited.

### `rk audit failing <domain>`

List repos that have failing controls in a specific domain.

## Sync commands

### `rk sync-dogfood`

Sync dogfood evidence from dogfood-labs into repo facts. One-way read — dogfood-labs remains the write authority.

```bash
# Fetch from GitHub raw URLs (default)
rk sync-dogfood

# Use a local dogfood-labs checkout
rk sync-dogfood --local /path/to/dogfood-labs
```

## Games commands

### `rk games score <worklist>`

Score a REMEDIATION-WORKLIST.md file and display a leaderboard. The scoring engine parses the markdown table and awards points for fixed findings.

```bash
rk games score REMEDIATION-WORKLIST.md
rk games score REMEDIATION-WORKLIST.md --json
rk games score REMEDIATION-WORKLIST.md --markdown
```
