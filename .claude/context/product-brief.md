# Product Brief — @mcptoolshop/repo-knowledge

## What this is

Relational catalog for org repo knowledge. SQLite + FTS5 full-text search, CLI + MCP server. Stores repo identity, technical fingerprints, notes, docs, facts, releases, relationships, and a full audit evidence layer (runs, controls, findings, metrics, artifacts, exceptions). Syncs from GitHub API and local repos. Provides search, filtering, and audit posture queries.

## Type

CLI + MCP server + SQLite database (persistent, WAL mode, FK-enforced)

## Core value

Structured, queryable org knowledge with audit evidence. Every repo has identity, tech stack, notes, and audit posture in one place. FTS5 search across all content. MCP tools for agent access.

## What it is not

- Not a real-time monitor — data enters via sync, import, or manual entry
- Not an auditor — stores and queries audit evidence, does not perform audits
- Not a CI gate — provides audit posture, does not block builds
- Not idempotent for all write paths (currently) — audit findings can be duplicated on re-import

## Anti-thesis (6 statements)

1. Must never let duplicate audit findings inflate severity counts — re-importing the same audit must not create duplicate findings
2. Must never silently tolerate schema drift — if audit tables are missing or corrupted, queries must fail explicitly, not return zeros
3. Must never serve stale artifact checksums as current — if a file changed on disk, the checksum should not pretend it hasn't
4. Must never let FTS5 index lag behind writes without signaling — if audit data was imported but index not rebuilt, search results are incomplete
5. Must never resolve ambiguous repo slugs silently — partial matches that hit multiple repos must error, not pick the first
6. Must never frame "audit posture: healthy" when the data behind it could be duplicated, stale, or schema-drifted

## Highest-risk seam

**Catalog/schema mutation truth** — the boundary where the system claims data was stored correctly and queries return truthful results. The liar-paths are: audit findings duplicated on re-import, schema drift silently tolerated, artifact checksums not verified on read, and FTS5 index not rebuilt after audit import.
