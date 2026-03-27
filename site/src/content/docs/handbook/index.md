---
title: Welcome
description: Introduction to repo-knowledge — a local-first knowledge catalog for your repo portfolio.
sidebar:
  order: 0
---

repo-knowledge is a local-first knowledge system built on SQLite and FTS5. It catalogs every repository in your portfolio with structured metadata — thesis notes, architecture docs, audit evidence, inter-repo relationships — and exposes everything through a CLI and an MCP server for AI-integrated workflows.

## What it does

- **Catalogs repos** from GitHub orgs and local directories with tech fingerprints, topics, and docs
- **Stores knowledge** as typed notes: thesis, architecture, conventions, warnings, next steps
- **Maps relationships** between repos: depends_on, related_to, supersedes, shares_domain_with
- **Runs audits** with 80 controls across 19 domains, tracking findings, metrics, and posture over time
- **Searches everything** with FTS5 full-text search across READMEs, changelogs, notes, and descriptions
- **Serves AI agents** via 19 MCP tools that let Claude query, annotate, and audit repos conversationally

## Who it's for

Teams and solo developers managing 10+ repositories who want a single place to understand what they have, how it's connected, and where the risks are.

## Architecture

All data lives in a single SQLite database running in WAL mode. The system has two layers:

1. **Knowledge catalog** — repos, tech fingerprints, docs, notes, facts, relationships, FTS search
2. **Audit evidence** — structured audit runs, 80 canonical controls across 19 domains, normalized findings, metrics

The CLI (`rk`) and MCP server share the same database module and query layer.
