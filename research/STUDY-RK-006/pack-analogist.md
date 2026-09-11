STUDY-RK-006 Q3 Analogist — tip `4e58842` · consumer repo-knowledge

stop: migration sequence 002–011. Fail-closed upgrades (analogs).
prerequisite: STUDY-RK-005 done sha=`4e58842`; tip `4e58842`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: `CURRENT_SCHEMA_VERSION=11`; ladder gates `version < N` then apply 002…011; seed stays at `1` so tables are not skipped; newer-than-head refuse; pre-migration snapshot.

1. Flyway versioned migrations + validate — Redgate Flyway — ongoing — https://documentation.red-gate.com/flyway/flyway-concepts/migrations — Hold-with-limit: pending versions apply in order; validate fails on missing/altered checksums; limit: `outOfOrder=true` is an explicit escape, not the default for rk’s linear ladder.

2. Liquibase ordered changelog + validate — Liquibase — ongoing — https://docs.liquibase.com/oss/user-guide-4-33/what-is-a-changelog — Hold-with-limit: changesets run in declared order with DATABASECHANGELOG ledger; validate fails closed before update; limit: alphabetical includeAll still needs padded naming so order ≡ version intent.

3. Rails `schema_migrations` ordered apply — Rails ActiveRecord — ongoing — https://github.com/rails/rails/blob/main/activerecord/lib/active_record/schema_migration.rb — Hold-with-limit: versions recorded and pending migrations sorted ascending before run; limit: dump row order ≠ skip permission—pending set still must apply in sequence.

4. SQLite `PRAGMA user_version` migration ladder — SQLite / common pattern — ongoing — https://sqlite.org/pragma.html#pragma_user_version — Hold-with-limit: read version, apply N>current in order, bump in same transaction; limit: rk uses `meta.schema_version` equivalently—monotonic additive bumps, not jump-to-head.

5. Kubernetes CRD conversion fail-closed — Kubernetes docs — ongoing — https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/ — Hold-with-limit: unsupported/failed conversion rejects the API request; limit: conversion ≠ skipping intermediate storage versions without a working path.

6. Compiler ABI / CXXABI symbol version gates — GCC libstdc++ ABI — ongoing — https://gcc.gnu.org/onlinedocs/libstdc++/manual/abi.html — Hold-with-limit: loader fails closed when required `CXXABI_*`/`GLIBCXX_*` missing; limit: runtime refuse-newer-or-missing mirrors rk refuse when `schema_version > CURRENT_SCHEMA_VERSION`.

7. Skipping a migration version is fine — Fail-transfer: schema.sql deliberately seeds `schema_version=1` so 002–010 table-creates are not skipped; ladder is lower-bound gated per step; “skip is fine” does not transfer.

8. Soft folklore that bumping seed to head (or jumping meta to 11) replaces the ladder — Fail-transfer: db-A-002 / comments warn seed-at-head would break fresh DBs; soft folklore: 0.

Soft folklore: 0. Skip-migration claimed: 0. Did not invent STUDY-RK-021.
✅
