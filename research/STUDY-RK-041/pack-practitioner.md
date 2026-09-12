STUDY-RK-041 Q2 (Practitioner)

stop: docs/source inventory — migration-010 run tables vs CLI `rk runs` / MCP ops_runs; residual coding gap or study-only. Do not invent `rk operational-runs`.
prerequisite: tip `d0756e7`; STUDY-RK-040 done sha=`41e054e`; STUDY-RK-013 extras.
owner: Practitioner
fallback: inventing phantom CLI → 🛑.

Eight doc/API sources. All Verifier PASS. Coding: none. Do not invent STUDY-RK-051.

1. STUDY-RK-013 grounding | Finding: operational runs lineage. PASS
2. migration-010 | Finding: db_health_runs/sync_runs tables. PASS
3. writers | Finding: fsck/fullSync write run rows. PASS
4. `rk runs` | Finding: CLI present (not `rk operational-runs`). PASS
5. MCP ops_runs/db_fsck | Finding: MCP surfaces present. PASS
6. CHANGELOG FT-4 | Finding: documents run tables. PASS
7. tests | Finding: coverage pins writers/CLI/MCP. PASS
8. CLI not absent | Finding: tip bug held = none; no mandatory coding. PASS

Invented phantom CLI: 0. Soft folklore: 0.

✅
