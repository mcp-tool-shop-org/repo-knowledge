STUDY-RK-002 Q3. Tip `d08a6cd` (STUDY-RK-001 done). Adjacent required-fields / CMDB CI completeness / anti-isolation analogs for repo-knowledge KNOWLEDGE-CONTRACT. Soft folklore dropped. **Do not invent STUDY-RK-021.** No implications as final.

**8 findings** (title / authors·org / year / URL / finding)

1. JSON Schema `required` — json-schema.org — docs — https://json-schema.org/understanding-json-schema/reference/object — Analog: properties listed under `required` must be present; omitting them fails validation. Holds for contract **thesis + architecture at minimum**. Limit: JSON instance shape ≠ note prose quality.

2. What is a CMDB? — Atlassian / ITIL CI — https://www.atlassian.com/itsm/it-asset-management/cmdb — Analog: CIs carry attributes **and** relationships; impact needs interdependencies. Holds for repos-as-CIs + edges (`depends_on`/`companion_to`). Limit: ITSM tooling ≠ MCP `add_relationship`.

3. CMDB Completeness KPI — BMC Documentation — https://docs.bmc.com/xwiki/bin/view/Service-Management/IT-Service-Management/BMC-CMDB/ac2002/Administering/Configuring-Key-Performance-Indicators-for-CMDB/ — Analog: Completeness scores missing mandatory attributes; incomplete CIs flagged. Holds for mandatory thesis/architecture completeness gate. Limit: BMC priority weights ≠ note_type enum.

4. package.json name/version — npm Docs — https://docs.npmjs.com/cli/v10/configuring-npm/package-json — Analog: publish requires name+version as unique identity; optional fields don’t replace them. Holds for required-vs-optional note types (thesis/architecture vs warning/next_step). Limit: npm publish gate ≠ enrichment worklist.

5. PROV-DM — W3C — 2013 — https://www.w3.org/TR/prov-dm/ — Analog: Entity + Activity + `wasDerivedFrom`/relations; provenance is a graph, not a lone node. Holds for “repos don’t exist in isolation” + why-noted edges. Limit: generic provenance model ≠ org portfolio graph.

6. LLVM ValueSymbolTable — LLVM — docs — https://llvm.org/docs/doxygen/classllvm_1_1ValueSymbolTable.html — Analog: named Value entries exist in a module symbol map (identity in context), not free-floating blobs. Holds for slug-keyed notes attached to catalog identity. Limit: IR symbols ≠ human thesis.

7. Treat isolated entry as complete — anti-pattern — **fail-transfer:** marking a repo “done” with zero relationships / no edge-why when portfolio context exists; isolation ≠ complete under KNOWLEDGE-CONTRACT.

8. Thesis optional / skip required fields — anti-pattern — **fail-transfer:** treating thesis or architecture as optional, or accepting README-only / “seems fine” notes as complete.

**Finding:** Six analogs hold-with-limit (JSON Schema required; CMDB CIs+edges; BMC Completeness; npm name/version gate; PROV graph edges; LLVM symbol identity). Two fail-transfer (isolated-as-complete; thesis-optional). Soft folklore: 0. Did not invent STUDY-RK-021.

Six analogs. Three hold; three do not transfer — wait: six hold-with-limit; two fail-transfer.
✅
