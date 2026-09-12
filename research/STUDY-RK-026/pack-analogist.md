STUDY-RK-026 Q3 Analogist — tip `4331f8b` · consumer repo-knowledge coding

stop: adjacent analogs for empty related/zero-hit UX (honest empty vs silent success; graph incompleteness signals); name analog + limit.
prerequisite: STUDY-RK-025 done sha=`3aa30af` PR #16; tip `4331f8b`; extras STUDY-RK-019.
owner: Analogist
fallback: soft folklore that empty getRelated means enrichment complete / isolated-OK → fail-transfer; <6 findings → 🛑 Coordinator.

Six hold-with-limit; two fail-transfer. Context: empty `getRelated` is engine state (CLI: “No relationships recorded”; JSON `[]`) — not approved folklore that enrichment is done (STUDY-RK-019).

1. NN/G search “No Results” SERP — Nielsen Norman Group — ongoing — https://www.nngroup.com/articles/search-no-results-serp/ — Hold-with-limit: zero-hit must name the miss, not look like success. Limit: SERP ≠ relationship graph, same honest-empty rule.

2. NN/G empty-state interface design — Nielsen Norman Group — ongoing — https://www.nngroup.com/articles/empty-state-interface-design/ — Hold-with-limit: blank panel without status confuses loading vs empty vs error; state the absence. Limit: enterprise app panels ≠ `rk related`.

3. Empty vs no-results vs error (distinct causes) — UX Patterns Guide — ongoing — https://uxpatternsguide.com/compare/empty-state-vs-no-results-recovery-vs-error-state/ — Hold-with-limit: zero related ≠ first-use onboarding ≠ failure; branch by cause. Limit: web patterns ≠ CLI text, same cause-splitting.

4. Wikidata Recoin relative incompleteness — Wikidata:Recoin — ongoing — https://www.wikidata.org/wiki/Wikidata:Recoin — Hold-with-limit: missing properties/edges are surfaced as incompleteness, not silent “done.” Limit: Wikidata gadgets ≠ SQLite relate rows.

5. ServiceNow CMDB orphan / relationship health — ServiceNow CMDB Health — ongoing — https://www.servicenow.com/docs/bundle/zurich-servicenow-platform/page/product/configuration-management/concept/overview-cmdb-health.html — Hold-with-limit: zero relationships is a health/orphan signal, not “complete.” Limit: enterprise CMDB ≠ local portfolio graph.

6. REST empty collection: 200 + `[]` honest success-with-zero — API Handyman — ongoing — https://apihandyman.io/empty-lists-http-status-code-200-vs-204-vs-404/ — Hold-with-limit: empty array is successful zero, not 404 “missing resource”; still not “enrichment finished.” Limit: HTTP status ≠ enrichment folklore.

7. empty getRelated means enrichment complete / isolated-OK — Fail-transfer: STUDY-RK-019 + contract — empty is engine state; isolation is not approved finished product.

8. Soft folklore that silent success / blank related is fine forever — Fail-transfer: Soft folklore: 0. Honest empty (“No relationships recorded”) must stay a gap signal, not a celebration.

Soft folklore: 0. Isolated-OK claimed: 0. Did not invent STUDY-RK-051.
✅
