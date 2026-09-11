STUDY-RK-004 Q3 Analogist — tip `09e6122` · consumer repo-knowledge

stop: dogfood-labs sync / intelligence layer (analogs). Do not copy `.swarm` sqlite.
prerequisite: STUDY-RK-003 done sha=`09e6122`; tip `09e6122`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: `rk sync-dogfood` / `suggest-dogfood` read testing-os + optional swarm control-plane into `repo_facts`; control plane stays write authority opened read-only; CLONE-POLICY forbids copying `.swarm` sqlite into the VM/product DB.

1. ServiceNow Discovery probes/sensors — ServiceNow Docs — ongoing — https://github.com/ServiceNow/ServiceNowDocs/blob/australia/markdown/it-operations-management/discovery/c_DiscoveryProbesAndSensors.md — Hold-with-limit: lab probes enrich CMDB CIs via sensors; limit: enrichment updates governed attributes, not a wholesale replace of the CMDB store with the probe DB.

2. CMDB IRE / authoritative source per attribute — ServiceNow practice (TechRevati) — 2024–26 — https://techrevati.com/en/blog/servicenow-cmdb-csdm-foundations — Hold-with-limit: discovery/lab is one reconciled source with attribute-level authority; limit: never transplant the discovery sqlite into the CI SoR file.

3. W3C PROV-DM WasDerivedFrom / Bundle — W3C Provenance WG — 2013 — https://www.w3.org/TR/prov-dm/ — Hold-with-limit: sync derived evidence with provenance into the consumer SoR as attributed facts; limit: PROV records derivation, does not require merging the source sqlite into the shipped DB.

4. sccache/ccache private build cache vs published artifacts — Mozilla sccache / ccache — ongoing — https://github.com/mozilla/sccache/blob/main/docs/Caching.md — Hold-with-limit: private compile cache accelerates builds while published artifact indexes stay separate; limit: cache objects are not the product catalog SoR.

5. Maven local `~/.m2` vs Maven Central — Apache Maven — ongoing — https://maven.apache.org/repositories/local.html — Hold-with-limit: local cache/install dir is not the published registry; limit: never ship `~/.m2` as `knowledge.db`.

6. Air-gap fail-closed local control plane — g8e air_gap guide — ongoing — https://github.com/g8e-ai/g8e/blob/main/docs/guides/air_gap.md — Hold-with-limit: local-only control-plane state stays on host and fails closed if an external resource is required; limit: local control sqlite is not an ingest payload for a shipped product DB.

7. Copy `.swarm` / control-plane.db into knowledge.db as required — Fail-transfer: repo-knowledge opens `swarms/control-plane.db` read-only and upserts selected `dogfood.swarm.*` facts; CLONE-POLICY forbids copying `.swarm` sqlite; “copy `.swarm` into knowledge.db is required” does not transfer.

8. Soft folklore that optional dogfood intelligence requires embedding the swarm write-authority DB — Fail-transfer: sync-dogfood is optional (absent DB → null/zeros OK); curated `dogfood.*` facts ≠ raw control-plane authority file; soft folklore: 0.

Soft folklore: 0. `.swarm` copy-required claimed: 0. Did not invent STUDY-RK-021.
✅
