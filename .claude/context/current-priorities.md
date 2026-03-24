# Current Priorities — @mcptoolshop/repo-knowledge

## Status

Locked (Role OS lockdown 2026-03-24). Primary seam: catalog/schema mutation truth.

## Classification

Lock candidate → locked.

## Seam family

Mutation truth (catalog variant) — same family as registry-sync but with persistent state (SQLite) instead of remote API mutations.

## Must-preserve invariants (7)

1. **SQLite WAL mode + FK enforcement** — concurrent reads, serialized writes, referential integrity.
2. **Parameterized queries everywhere** — no SQL string concatenation. Injection-resistant by construction.
3. **Repo upsert is idempotent** — slug uniqueness + coalesce pattern. Safe to re-sync.
4. **Doc dedup by checksum** — same content = same doc. No duplicate indexing.
5. **Audit control catalog is immutable** — IDs never renamed or reused. Append-only.
6. **Control results are idempotent** — ON CONFLICT upsert per (run_id, control_id).
7. **Transactions wrap batch operations** — seedControls, importAudit, rebuildIndex use transactions.

## Banned detours

- Making schema migrations silently suppress errors beyond known-safe cases
- Adding "smart dedup" to findings that guesses identity instead of using explicit constraints
- Removing transaction wrappers from batch operations
- Making FTS5 index optional or lazy-by-default
- Treating audit posture as live security state
