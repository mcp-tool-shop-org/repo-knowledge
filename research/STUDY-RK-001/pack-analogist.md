STUDY-RK-001 Q3. Tip `b211fe5`. Adjacent SQLite-SoR / FTS5 catalog vs embeddings / structured-metadata analogs for repo-knowledge. Soft folklore dropped. Extra reads: README Why, KNOWLEDGE-CONTRACT. **Do not invent STUDY-RK-021.** No implications as final.

**8 findings** (title / authors·org / year / URL / finding)

1. SQLite As An Application File Format — Hipp / SQLite — docs — https://www.sqlite.org/appfileformat.html — Analog: single-file relational schema as application system of record (tables + relationships, not opaque blob). Holds for `knowledge.db` as repo-knowledge SoR (thesis/architecture/audit/edges). Limit: generic app-file essay ≠ GitHub sync shape.

2. SQLite FTS5 Extension — SQLite — docs — https://www.sqlite.org/fts5.html — Analog: inverted-index MATCH / BM25 over tokenized columns; lexical FTS without dense vectors. Holds for FTS5 catalog search (`rk find`) vs requiring embeddings. Limit: BM25 token match ≠ semantic near-dupe across paraphrases.

3. What is a CMDB? — Atlassian / ITIL CI framing — https://www.atlassian.com/itsm/it-asset-management/cmdb — Analog: configuration items + interdependencies as structured SoR for impact/change. Holds as SRE CMDB peer for repos-as-CIs + `depends_on`/`companion_to` edges. Limit: ITSM incident tooling ≠ npm/gh metadata sync.

4. LLVM ValueSymbolTable — LLVM Project — docs — https://llvm.org/docs/doxygen/classllvm_1_1ValueSymbolTable.html — Analog: name→Value structured lookup table (exact symbol map, not similarity search). Holds for compiler symbol-table peer to slug/repo identity + typed notes. Limit: IR names ≠ human thesis prose.

5. Retrieval-Augmented Generation… — Lewis et al. — 2020 — https://arxiv.org/abs/2005.11401 — Analog: RAG = parametric model + non-parametric retriever over an external memory. Holds as optional *consumer* pattern over a governed store — not a replacement for structured notes/edges. Limit: Wikipedia dense index paper ≠ local SQLite portfolio KB.

6. Source Level Debugging with LLVM — LLVM Project — docs — https://llvm.org/docs/SourceLevelDebugging.html — Analog: DWARF/debug metadata maps IR objects to source as explicit structured metadata. Holds for structured enrichment (KNOWLEDGE-CONTRACT notes) over embedding-only recall. Limit: debug info ≠ audit control rows.

7. Require vector store / embeddings as product SoR — anti-pattern — **fail-transfer:** inventing a mandatory embedding index as the system of record for repo-knowledge; product is SQLite+FTS5 catalog.

8. RAG as sole retrieval path — anti-pattern — **fail-transfer:** treating RAG/dense retrieval as the only way to find thesis/architecture/audit; structured metadata + FTS5 MATCH remain the primary path.

**Finding:** Six analogs hold-with-limit (SQLite app-file SoR; FTS5 MATCH; CMDB CIs+edges; LLVM symbol table; Lewis RAG-as-consumer; DWARF structured metadata). Two fail-transfer (vector-store-as-required; RAG-as-sole-path). Soft folklore: 0. Did not invent STUDY-RK-021.

Six analogs. Three hold; three do not transfer — wait: six hold-with-limit; two fail-transfer.
✅
