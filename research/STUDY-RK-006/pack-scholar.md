STUDY-RK-006 Q1 — Scholar pack (tip 4e58842)

Q1 — Peer literature on ordered database schema migration sequences, fail-closed upgrades (refuse skip/partial apply), additive migration ladders, and verification that schema_version advances without gaps.

Consumer context (not citations): SQLite migrations 002–011; linear `schema_version` bumps in order with no skips; refuse newer-than-build opens; additive ladder 006–011; FTS-005 uses a side meta marker. Pack is papers/arXiv/DOI only. Did not invent a paper that permits skipping migration versions.

1. Graceful Database Schema Evolution: the PRISM Workbench — Carlo A. Curino, Hyun Jin Moon, Carlo Zaniolo — 2008 — https://doi.org/10.14778/1453856.1453939 — Expresses upgrades as ordered Schema Modification Operators with automatic data migration and full documentation of intervened schema versions (validated on Wikipedia’s 170+ versions), treating evolution as a recorded sequence of steps rather than ad-hoc jumps over missing versions.

2. Living in Parallel Realities — Co-Existing Schema Versions with a Bidirectional Database Evolution Language — Kai Herrmann, Hannes Voigt, Andreas Behrend, Jonas Rausch, Wolfgang Lehner — 2016 — https://arxiv.org/abs/1608.05564 — Maintains a schema-version genealogy and admits a materialization only when validity conditions on the SMO DAG hold, so upgrades follow an explicit version graph rather than unconstrained skips or orphan targets.

3. Online Schema Evolution is (Almost) Free for Snapshot Databases — Tianxun Hu, Tianzheng Wang, Qingqing Zhou — 2022 — https://arxiv.org/abs/2210.03958 — Models DDL as transactional DDaM; if the intended transformation is incompatible with existing data the DDL aborts and reclaims resources, so a failed or partial migration does not leave a committed half-applied schema visible to consumers.

4. Managing Schema Evolution in NoSQL Data Stores — Stefanie Scherzinger, Meike Klettke, Uta Störl — 2013 — https://arxiv.org/abs/1308.0514 — Introduces a numeric entity `version` advanced by each evolution operator and restricts operators to entities of a given version, enabling interrupt-safe, ordered application plus dry-run safety checks before mutating production entities.

5. An Empirical Characterization of Event Sourced Systems and Their Schema Evolution — Michiel Overeem, Marten Spoor, Slinger Jansen, Sjaak Brinkkemper — 2021 — https://arxiv.org/abs/2104.01146 — Documents industry tactics (versioned events, weak schema, upcasting, in-place, copy-and-transform) that advance schema along versioned event histories rather than silently omitting intermediate transforms from the upgrade path.

6. MigCast in Monte Carlo: The Impact of Data Model Evolution in NoSQL Databases — Andrea Hillenbrand, Uta Störl, Shamil Nabiyev, Stefanie Scherzinger — 2021 — https://arxiv.org/abs/2104.11787 — Evaluates eager, lazy, incremental, and predictive migration strategies across sequenced schema-change scenarios, tying cost and latency to applying the evolution path rather than treating intermediate versions as optional.

7. Living Databases: A Unified Model for Continuous Schema Evolution, Versioning, and Transformations — Amol Deshpande — 2026 — https://arxiv.org/abs/2605.00676 — Surveys continuous and multi-version schema evolution and notes practitioners prefer small incremental additive changes (with co-existing versions and lazy migration) over disruptive one-shot offline rewrites that erase intermediate ladder steps.

8. Proof-Gated Publication: Verify-Before-Commit Content Integrity for Serverless Data-Mesh Lakehouses — Viquar Khan — 2026 — https://arxiv.org/abs/2608.14643 — Fail-closes consumer-visible commit until an independent content proof PASSes; a failed, duplicated, or incomplete write path never publishes a gap-ridden snapshot—aligned with refuse-skip and refuse-partial upgrade posture for schema ladders.

Papers inventing skip-version migration as allowed: 0.
Tip: 4e58842. Extra context only: src/db/migration-002…011.sql, test/migration-sequence.test.ts.

✅
