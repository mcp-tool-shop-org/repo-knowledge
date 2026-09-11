# STUDY-RK-004 — Research grounding (verified — copy)

1. Lit. CQRS/read-model sync, freshness gates, federated secondary views, local-first optional projections (Garralda-Barrio; Proof-or-Stop; FAIR; Forage V2; SuperLocalMemory; Schema-First; Overeem; Laigner).
2. Docs. One-way `repo_facts` read model; testing-os write authority; index+enforcement ingest; intelligence optional; swarm local-only readonly → `dogfood.swarm.*` facts (no sqlite into knowledge.db); suggest* reads synced facts only.
3. Analogs hold-with-limit: ServiceNow Discovery/IRE; PROV-DM; Maven local≠Central; air-gap control plane. Analogist #4 sccache Caching.md: unverified.

**Unverified / do not land as verified:** Practitioner #7 (handbook usage lines); Analogist #4 (sccache Caching.md); Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Copy-`.swarm`-into-knowledge.db · Soft folklore embedding swarm write-authority DB.

Verifier: Scholar 8/8 · Practitioner 7/8 (#7 unverified) · Analogist 1–3,5–6 hold; #4 unverified; 7–8 fail-transfer.

HARD: do not copy `.swarm` sqlite. Do not invent STUDY-RK-021.
