STUDY-RK-012 Q3 Analogist — tip `7a1f491` · consumer repo-knowledge

stop: cross-tool vocab migration-011 (analogs).
prerequisite: STUDY-RK-011 done sha=`7a1f491`; tip `7a1f491`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: migration-011 adds `wraps` / `collaborated_in_mission` to `relation_type` CHECK via create→INSERT…SELECT→DROP→RENAME (plus ADD COLUMN `forge_vault_path`); SQLite cannot extend CHECK in place.

1. SQLite ALTER TABLE make-other-kinds-of-table-schema-changes (12-step recreate) — SQLite Docs — ongoing — https://www.sqlite.org/lang_altertable.html — Hold-with-limit: official recipe for adding CHECK is recreate-copy-drop-rename; limit: migration-011 follows that pattern (FK OFF outside txn by JS caller).

2. ServiceNow `cmdb_rel_type` additive CI relation types — ServiceNow CMDB / Snowball — ongoing — https://thesnowball.co/table/cmdb_rel_ci — Hold-with-limit: new relationship semantics added as catalog rows without rewriting edge payloads; limit: lookup-table vocab vs embedded CHECK enum (rk must rebuild table).

3. Neo4j `ALTER CURRENT GRAPH TYPE ADD` relationship types — Neo4j Cypher Manual — ongoing — https://neo4j.com/docs/cypher-manual/current/schema/graph-types/extend-graph-types/ — Hold-with-limit: ADD appends new relationship element types without SET-replacing the graph type; limit: open graph schema vs SQLite closed CHECK list.

4. npm package.json dependency edge kinds (`dependencies` / `peerDependencies` / `optionalDependencies`) — npm Docs — ongoing — https://docs.npmjs.com/cli/v12/configuring-npm/package-json/ — Hold-with-limit: ecosystem adds edge-kind vocab while preserving existing edges; limit: JSON object keys ≠ SQL CHECK literals, same additive-edge idea as `wraps`.

5. Protocol Buffers proto3 enum additive values — protobuf.dev — ongoing — https://protobuf.dev/programming-guides/proto3/ — Hold-with-limit: adding enum values is schema-safe / wire-compatible; limit: open enums tolerate unknowns; SQLite CHECK still closed until recreate widens the list.

6. sqlite-utils `table.transform` rebuild — Simon Willison / sqlite-utils — 2020 — https://simonwillison.net/2020/Sep/23/sqlite-advanced-alter-table/ — Hold-with-limit: library automates create-new→copy→drop→rename for constraint changes ALTER cannot do; limit: same mechanical path as migration-011.

7. SQLite ALTER TABLE extends CHECK in place — Fail-transfer: docs and migration-011 header state CHECK cannot be extended via ALTER; recreate-copy-drop-rename is required.

8. Soft folklore that extending relation vocab must drop or rewrite existing relationship rows — Fail-transfer: migration-011 INSERT…SELECT copies every row byte-identically; only the allowed-value list grows. Soft folklore: 0.

Soft folklore: 0. In-place-CHECK-ALTER claimed: 0. Did not invent STUDY-RK-021.
✅
