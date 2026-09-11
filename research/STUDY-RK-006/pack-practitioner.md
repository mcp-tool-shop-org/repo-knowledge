STUDY-RK-006 Q2 — Practitioner

stop: migration sequence 002–011. Fail-closed upgrades (docs + source).
prerequisite: STUDY-RK-005 done sha=`4e58842`; tip `4e58842`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary migration SQL + init runner + migration-sequence.test state for ordered 002–011 ladder, fail-closed upgrades, and sequence asserts?

Eight doc/API sources. I did not invent What. Skip-version-as-allowed invented: 0. Do not invent STUDY-RK-021.

1. CURRENT_SCHEMA_VERSION head — mcp-tool-shop-org · tip `4e58842` (2026-09-11) · `/workspace/studio/repo-knowledge/src/db/init.ts` L49–58 — Exports `CURRENT_SCHEMA_VERSION = 11`; must stay in lockstep with highest stamped `schema_version` (migration-011 → `'11'`).

2. Ordered lower-bound ladder 002→011 — mcp-tool-shop-org · tip `4e58842` · `src/db/init.ts` L357–544 — Each step re-reads `meta.schema_version` and applies only if `< N` (002 if `<2` … 010 if `<10`, 011 if `<11`); sequential gates, no jump-over of later scripts before earlier ones.

3. Migration SQL version stamps — mcp-tool-shop-org · tip `4e58842` · `src/db/migration-002`…`011` — Stamp bumps: 002→`'2'`, 003→`'3'`, 004→`'4'`, **005 does not bump** (sets `fts_triggers_added`; comment: schema_version stays `'4'`), 006→`'6'`, 007→`'7'`, 008→`'8'`, 009→`'9'`, 010→`'10'`, 011→`'11'`.

4. Fail-closed forward-compat (PH-DB-001) — mcp-tool-shop-org · tip `4e58842` · `src/db/init.ts` L283–310 — If on-disk `schema_version` **>** `CURRENT_SCHEMA_VERSION`, close singleton and **throw** (“newer than this rk build… Upgrade rk”) — refuse opening newer-schema DB with older code.

5. Fail-closed exec + 011 refuse stamp — mcp-tool-shop-org · tip `4e58842` · `src/db/init.ts` L131–189, L607–624 — `execMigrationIdempotent`/`Strict` throw `Migration … failed` on non-tolerated errors; 011 path refuses to stamp `schema_version=11` if relationships table would be left gone after recreate failure.

6. Pre-migration snapshot (PR-002) — mcp-tool-shop-org · tip `4e58842` · `src/db/init.ts` L196–212, L329–354 — Before ladder mutates, byte snapshot when file existed, version `<` head, and `RK_NO_MIGRATION_BACKUP` unset — safety net for fail-closed recovery.

7. migration-sequence.test.ts contract — mcp-tool-shop-org · tip `4e58842` · `test/migration-sequence.test.ts` L2–27, L95–113 — Asserts head `'11'`; **“per-migration version bumps run in order (no skips)”**; v1→v11 on first `openDb`; audit tables + `idx_findings_canonical`; idempotent re-open stays at head.

8. Sequence test fail-closed + snapshots — mcp-tool-shop-org · tip `4e58842` · `test/migration-sequence.test.ts` L286–302, L397–448 — Expects throw on schema newer than `CURRENT_SCHEMA_VERSION`; snapshots pre-existing old DB before migrate; no snapshot on fresh open or when `RK_NO_MIGRATION_BACKUP` set (still migrates to head).

On-page: ordered `<N` gates; skip-version-as-allowed invented: 0 (005 non-bump is documented, not a skip of later steps).

✅
