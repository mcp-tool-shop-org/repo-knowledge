---
title: Security
description: Security model, data handling, and threat model for repo-knowledge.
sidebar:
  order: 7
---

## Data handling

**Data touched:**
- Local SQLite database (created and managed by repo-knowledge)
- GitHub API metadata via `gh` CLI: repo names, descriptions, topics, stars, languages, license info
- Local filesystem: reads READMEs, CHANGELOGs, package manifests for indexing

**Data NOT touched:**
- No source code is read from GitHub (only metadata)
- No credentials are stored in the database
- No data is sent to external services beyond `gh` CLI calls

## Permissions

- Requires `gh` CLI authenticated for GitHub sync
- All data stays local — no phone-home, no analytics, no telemetry
- The MCP server communicates over stdio only (no network listeners)

## Threat model

| Threat | Mitigation |
|--------|------------|
| Database tampering | WAL mode with integrity checks; backup and re-sync if corrupt |
| Credential leakage | No credentials stored; `gh` CLI handles auth separately |
| Network exposure | MCP server uses stdio only; no HTTP/TCP listeners |
| Supply chain | Dependencies audited in CI; `npm audit` runs on every build |
| Data exfiltration | No outbound network calls; all data stays on local disk |

## Reporting vulnerabilities

See [SECURITY.md](https://github.com/mcp-tool-shop-org/repo-knowledge/blob/main/SECURITY.md) for the full security policy and reporting instructions.
