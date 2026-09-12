STUDY-RK-012 Q1 — Scholar pack (papers/arXiv/DOI only). Tip `7a1f491`. Consumer: repo-knowledge `migration-011-cross-tool-vocab.sql` / `init.ts` (extend relation_type CHECK with wraps + collaborated_in_mission via recreate→copy→drop→rename; ADD COLUMN forge_vault_path; transactional durability). stop: cross-tool vocab migration-011 (peer lit). ALTER-extends-CHECK invented: 0. Do not invent STUDY-RK-021.

Eight papers, all with DOI or arXiv. I did not invent What.

1. Braininger, Mauerer, Scherzinger (2020). Replicability and Reproducibility of a Schema Evolution Study in Embedded Databases. arXiv:2008.10925 / https://arxiv.org/abs/2008.10925 — Schema-evolution study focused on SQLite-backed apps; SMOs include CREATE/DROP TABLE as first-class change forms in embedded schema histories (not in-place CHECK rewrite).

2. Etien, Anquetil (2024). Automatic Recommendations for Evolving Relational Databases Schema. arXiv:2404.08525 / https://arxiv.org/abs/2404.08525 — Models Check constraints as evolvable entities; when the RDBMS blocks an operation, dependent objects are removed and later recreated (identity/recreate path), not silent in-place CHECK mutation.

3. Herrmann, Voigt, Behrend, Rausch, Lehner (2016). Living in Parallel Realities — Co-Existing Schema Versions with a Bidirectional Database Evolution Language. arXiv:1608.05564 / https://arxiv.org/abs/1608.05564 — Bidirectional SMOs for durable schema evolution with co-existing versions; evolution is operator-mediated, not unconstrained ALTER of integrity expressions.

4. Hu, Wang, Zhou (2022). Online Schema Evolution is (Almost) Free for Snapshot Databases. arXiv:2210.03958 / https://arxiv.org/abs/2210.03958 — Treats DDL as transactional out-of-place migration (copy/transform into new structure) so schema change and data migration stay consistent under concurrency.

5. Zeng, Li, Gao, Zhang, Zhang, Cui (2024). SLSM: An Efficient Strategy for Lazy Schema Migration on Shared-Nothing Databases. arXiv:2404.03929 / https://arxiv.org/abs/2404.03929 — Shadow-table recipe: register new schema, copy data, then atomic rename switch — the durable additive-migration pattern used when in-place ALTER is insufficient.

6. Dintyala, Narechania, Arulraj (2020). SQLCheck: Automated Detection and Diagnosis of SQL Anti-Patterns. arXiv:2004.10232 / https://arxiv.org/abs/2004.10232 — Documents ENUM-as-CHECK as a maintainability anti-pattern: extending the enumerated value set requires dropping and re-adding the CHECK (rewrite), not a free in-place ALTER of the constraint list.

7. Harrand, Durieux, Broman, Baudry (2021). Automatic Diversity in the Software Supply Chain. arXiv:2111.03154 / https://arxiv.org/abs/2111.03154 — Bridge/Facade/Wrapper architecture for library substitution; wrapper edges are explicit software-graph relations between higher-level adapters and concrete implementations.

8. Rafay, Susanti, Lamprecht, Färber (2026). SemRepo: A Knowledge Graph for Research Software and Its Scholarly Ecosystem. arXiv:2605.13310 / https://arxiv.org/abs/2605.13310 — Software-catalog ontology with role/collaboration structure plus cross-graph alignment properties for multi-system vocabulary (federated catalogs, not a single collapsed enum).

Gates: ALTER-extends-CHECK invented: 0. STUDY-RK-021 invented: 0. Findings: 8. Tip `7a1f491`.

URLs:
https://arxiv.org/abs/2008.10925
https://arxiv.org/abs/2404.08525
https://arxiv.org/abs/1608.05564
https://arxiv.org/abs/2210.03958
https://arxiv.org/abs/2404.03929
https://arxiv.org/abs/2004.10232
https://arxiv.org/abs/2111.03154
https://arxiv.org/abs/2605.13310

✅
