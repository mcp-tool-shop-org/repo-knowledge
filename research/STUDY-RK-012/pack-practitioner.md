STUDY-RK-012 Q2 — Practitioner

stop: cross-tool vocab migration-011 (docs + source).
prerequisite: STUDY-RK-011 done sha=`7a1f491`; tip `7a1f491`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary migration-011 + init gate + RELATION_TYPES state for wraps/collaborated_in_mission, forge_vault_path, recreate pattern, FK OFF, and markers?

Eight doc/API sources. I did not invent What. In-place CHECK ALTER invented: 0. Do not invent STUDY-RK-021.

1. Migration-011 header — mcp-tool-shop-org · tip `7a1f491` (2026-09-11) · `/workspace/studio/repo-knowledge/src/db/migration-011-cross-tool-vocab.sql` L1–16 — Adds relation_types `wraps` and `collaborated_in_mission` plus `forge_vault_path`; states SQLite cannot extend CHECK via ALTER TABLE — must create-new → INSERT…SELECT → DROP → RENAME.

2. Recreate-copy-drop-rename SQL — mcp-tool-shop-org · tip `7a1f491` · `migration-011` L54–86 — Creates `repo_relationships_new` with 8-value CHECK (legacy six + wraps + collaborated_in_mission); copies all rows; DROP old; RENAME; recreates idx_rel_from/to/unique.

3. forge_vault_path ADD COLUMN — mcp-tool-shop-org · tip `7a1f491` · `migration-011` L88–95 — `ALTER TABLE repos ADD COLUMN forge_vault_path TEXT` (nullable; game repos point at forge-vault wing).

4. Meta stamps — mcp-tool-shop-org · tip `7a1f491` · `migration-011` L97–102 — Stamps `schema_version`='11' and `cross_tool_vocab_added` datetime marker for application-layer gating.

5. FK OFF outside transaction — mcp-tool-shop-org · tip `7a1f491` · `src/db/init.ts` L157–192 · migration header L17–24 — `execMigrationStrict` sets `foreign_keys=OFF` before `db.transaction(() => db.exec(sql))`, restores ON in finally; SQLite cannot toggle FKs inside a transaction; bare PRAGMA removed from SQL file.

6. init.ts migration-011 gate — mcp-tool-shop-org · tip `7a1f491` · `src/db/init.ts` L503–545 — Runs if schema_version < 11 and `cross_tool_vocab_added` absent; recovery for stranded `repo_relationships_new`; skip destructive recreate if enum already has wraps/collaborated_in_mission.

7. RELATION_TYPES export — mcp-tool-shop-org · tip `7a1f491` · `src/index.ts` L28–37 — Shared tuple: depends_on/related_to/supersedes/shares_domain_with/shares_package_with/companion_to + wraps + collaborated_in_mission (comments define wrapper vs Role OS mission coop).

8. No in-place CHECK ALTER — mcp-tool-shop-org · tip `7a1f491` · `migration-011` L12–16 · `init.ts` L505–507 — On-page: recreate pattern only; transactional all-or-nothing; invent in-place CHECK ALTER: 0.

✅
