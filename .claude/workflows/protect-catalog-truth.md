# Workflow: Protect Catalog Truth

**Repo:** @mcptoolshop/repo-knowledge
**Seam:** Catalog/schema mutation truth — the boundary where the system claims data was stored correctly and queries return truthful results.

## What this workflow protects

The contract that every write is idempotent or explicitly constrained, every query reflects actual stored state (not inflated/stale/partial), and schema evolution never silently degrades data integrity.

## Automatic reject criteria (8)

A proposed change MUST be rejected if it:

1. **Introduces a write path without idempotency or conflict handling** — new INSERT statements must use ON CONFLICT, INSERT OR IGNORE, or explicit existence checks. Plain INSERT for entities that can be re-imported is a duplication defect.
2. **Silently tolerates schema drift** — wraps table-missing errors in try/catch that returns zeros or undefined instead of failing explicitly. If the schema is wrong, the system must say so.
3. **Serves stale checksums without verification** — returns artifact checksums from DB without checking the actual file, or serves cached query results without age signaling.
4. **Lets FTS5 index lag behind writes without signaling** — adds write paths that modify searchable content without rebuilding the index or flagging that search results may be stale.
5. **Inflates audit posture through duplicate data** — allows re-import to create duplicate findings, metrics, or control results that make severity counts unreliable.
6. **Suppresses migration errors beyond known-safe cases** — catches schema evolution errors that should be fatal (e.g., missing columns, type mismatches) in the same catch block as intentionally-idempotent ALTER TABLE.
7. **Resolves ambiguous identifiers silently** — returns first partial match for repo slugs instead of erroring when multiple repos match.
8. **Makes human-facing reassurance stronger while leaving machine-facing semantics unchanged** — e.g., audit posture says "healthy" while the underlying data has duplicated findings or stale imports (org-wide reassurance drift rule).

## The key question this workflow answers

**Can the system claim data was stored correctly when it wasn't, or return query results that don't reflect actual state?**

### Currently: yes, in bounded ways

- Audit findings can be duplicated on re-import (no UNIQUE constraint)
- Schema drift is silently tolerated for audit tables (try/catch returns undefined)
- FTS5 index is not rebuilt after audit import

### Must maintain
- Idempotent upserts for repos, tech, notes, docs, facts, releases, relationships, control results
- Parameterized queries everywhere
- Transaction wrappers for batch operations
- FK enforcement + WAL mode

## When to re-prove

Re-prove when:
- New tables or entities are added
- Migration system changes
- FTS5 indexing strategy changes
- New write paths are added (especially for audit data)
- Conflict handling on any table changes
