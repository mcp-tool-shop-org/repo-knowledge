STUDY-RK-024 Q1 (Scholar) — tip `5f74850`. stop: dedicated tests for metadata-sync / suggestion-layer modules (suite-green ≠ module adequacy; API client vs local DB vs advisory suggest). HARD: metadata-only; no GitHub source-fetch lit. Eight papers (7 arXiv + 1 DOI). Invented coverage %: 0. Invented STUDY-RK-051: 0. Papers requiring GitHub source-fetch into catalog: 0. Word count ~590.

1. Systematic API Testing Through Model Checking and Executable Contracts — Ribeiro, Mamede, Ferreira, 2026 — https://arxiv.org/abs/2604.08633 — Black-box API suites need behavioural contracts beyond status codes; GET/read responses instrument mutating sync paths — dedicated API-client tests for metadata sync, not suite-green alone. [unverified — Verifier: behavioural contracts hold; metadata-sync suite wording not on page]

2. SAINT: Service-level Integration Test Generation with Program Analysis and LLM-based Agents — Pan, Pavuluri, Huang, Krishna, Stennett, Orso, Sinha, 2025 — https://arxiv.org/abs/2511.13305 — Service-level tests prioritize covering database interaction points on endpoints — API→local-DB metadata write-back needs dedicated DB-path cases.

3. MonkeyDB: Effectively Testing Correctness against Weak Isolation Levels — Biswas, Kakwani, Vedurada, Enea, Lal, 2021 — https://arxiv.org/abs/2103.02830 — Storage-backed apps need a dedicated mock/local DB test surface to expose correctness bugs that live-store suite-green can miss.

4. A Framework and Toolkit for Testing the Correctness of Recommendation Algorithms — Michiels, Verachtert, Ferraro, Falk, Goethals, 2024 — https://doi.org/10.1145/3591109 — High package coverage still left recommendation bugs; dedicated unit/integration/system suites for advisory algorithms complement coverage metrics.

5. NOVA: A Verification-Aware Agent Harness for Architecture Evolution in Industrial Recommender Systems — Liu, Fang, Sun, Huang, Luo, et al., 2026 — https://arxiv.org/abs/2606.27243 — Compilation and unit-test pass are insufficient for recommender/suggestion semantics; dedicated semantic checks beyond suite-green are required.

6. Schema-First Retrieval: Embedding Catalogs for Natural Language Analytics — Agrawal, Indukuri, 2026 — https://arxiv.org/abs/2606.28387 — Advisory answers should retrieve typed catalog metadata rather than raw warehouse scrape — aligns with suggest* reading synced `repo_facts` only (no live forge source tree). [unverified — Verifier: typed-catalog holds; advisory/scrape framing not on page]

7. Test Coverage Analysis of Agentic Pull Requests — Dipongkor, Baral, Lam, Moran, 2026 — https://arxiv.org/abs/2607.18057 — Suite-green and line coverage can still omit adequate tests for changed modules — `github.ts` / `dogfood-suggest.ts` need module-dedicated suites.

8. Beyond Coverage and Kill Scores: Empirically Measuring Test Suite Behavioural Gaps — Paul, Holmes, 2026 — https://arxiv.org/abs/2606.10417 — Coverage/mutation are implementation-centric and miss behavioural gaps across layered surfaces — dedicated cases for API-client vs local-DB vs advisory-suggest paths.

Read-only context: `src/sync/github.ts` (gh metadata list/releases; no source blobs); `src/sync/dogfood-suggest.ts` (`suggestByRepo`/`suggestBySurface` over synced facts); SECURITY/README metadata-only; STUDY-RK-004/007/016 grounding (suggest reads synced facts; HARD no `.swarm` copy; RK-016 gap sync/github+dogfood-suggest). Tip tests: sync-404-archived + dogfood-* touch paths; no claim of coverage %. No git. No execute.

✅
