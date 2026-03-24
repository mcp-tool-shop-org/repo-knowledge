# Repo Map — @mcptoolshop/repo-knowledge

## Stack

- TypeScript CLI + MCP server
- SQLite (better-sqlite3, WAL mode, FK enforced)
- FTS5 full-text search (porter tokenizer)
- Schema migration system (v1 → v3, two migrations)

## Primary seam: Catalog/schema mutation truth

### Write-path truth concerns

| Write path | Idempotent? | Truth concern |
|-----------|-------------|---------------|
| Repo upsert | YES (slug unique, coalesce) | OK |
| Tech upsert | YES (ON CONFLICT) | OK |
| Note upsert | YES (type+title unique) | OK |
| Doc upsert | YES (checksum dedup) | OK |
| Fact upsert | YES (ON CONFLICT) | OK |
| Release upsert | YES (tag unique) | OK |
| Relationship add | YES (INSERT OR IGNORE) | OK |
| **Audit findings** | **NO (plain INSERT)** | **HIGH — duplicates on re-import** |
| Audit control results | YES (ON CONFLICT) | OK |
| Audit metrics | PARTIAL (UNIQUE but error handling varies) | MEDIUM |

### Query-path truth concerns

| Query | Truth concern |
|-------|---------------|
| FTS5 search | **MEDIUM** — not rebuilt after audit import; truncates docs at 50K |
| Audit posture | **HIGH** — if findings duplicated, severity counts are inflated |
| getStats() | **MEDIUM** — silently returns undefined for missing audit tables |
| Repo slug resolve | **LOW** — partial match returns first hit, not error on ambiguity |

### Schema evolution

```
v1 (schema.sql): repos, tech, topics, notes, docs, facts, releases, relationships, search
v2→v3 (migration 002): audit_runs, controls, control_results, findings, artifacts, metrics, exceptions
v3 (migration 003): ALTER TABLE additions (idempotent, suppresses duplicate-column errors)
```

**Truth concern:** Version jump 1→3 (no v2). Migration 003 suppresses "duplicate column" errors, masking partial migration state.

## Validation

- Vitest tests: db (20+), audit-import (8), security (11), config, dogfood-sync
- Key gaps: no MCP tool tests, no concurrent write tests, no schema drift tests, no re-import idempotency tests
