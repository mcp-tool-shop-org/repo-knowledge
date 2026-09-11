STUDY-RK-003 Q3 for @Verifier (tip `2d83594`). Four fields:

stop: MCP server vs rk CLI — which tools must stay deterministic (analogs).
prerequisite: STUDY-RK-002 done sha=`2d83594`; tip `2d83594`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Q3 — Analogs for “which tools must stay deterministic” when a system exposes both a human CLI and an LLM/MCP tool surface over a structured catalog (not a vector store). Hold or fail-transfer for repo-knowledge (SQLite+FTS5 + rk + MCP). Do not invent “all agent tools may be stochastic” as holding. Do not invent STUDY-RK-021. No implications as final.

**8 findings** (title / authors·org / year / URL / finding)

1. MCP Tool Annotations — Hungerford et al. / MCP Blog — 2026 — https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/ — Analog: `readOnlyHint` / `idempotentHint` / `destructiveHint` mark which tools are safe to auto-approve or retry. Holds for tagging MCP `search_repos`/`get_repo`/`repo_summary` as read-only deterministic vs mutate tools (`add_repo_note`). Limit: annotations are untrusted hints, not hard enforcement.

2. llvm-nm — LLVM Project — docs — https://llvm.org/docs/CommandGuide/llvm-nm.html — Analog: CLI dumps symbol table from bitcode/object with stable format options (deterministic listing, not generative). Holds for compiler-CLI / symbol-table query peer to `rk show`/`rk find` / FTS MATCH. Limit: object symbols ≠ thesis prose.

3. Types of SQL Statements — Oracle — docs — https://docs.oracle.com/en/database/oracle/oracle-database/12.2/sqlrf/Types-of-SQL-Statements.html — Analog: SELECT accesses data without mutating store; DDL/DML change schema or rows under different commit rules. Holds for DB query-vs-mutate separation: MCP/CLI reads over SQLite catalog stay deterministic; writes are explicit mutate tools. Limit: Oracle DDL auto-commit ≠ better-sqlite3 local WAL.

4. What is a CMDB? — Atlassian / ITIL CI — https://www.atlassian.com/itsm/it-asset-management/cmdb — Analog: CMDB read for impact analysis vs controlled change of CIs. Holds for SRE CMDB read-vs-mutate: catalog lookups stay deterministic; enrichment mutations are gated. Limit: ITSM change workflow ≠ MCP stdio server.

5. Retrieval-Augmented Generation… — Lewis et al. — 2020 — https://arxiv.org/abs/2005.11401 — Analog: RAG retriever+generator is a stochastic generation stack over non-parametric memory. Holds as contrast: RAG-style tools are non-deterministic consumers; structured metadata/FTS tools are not that class. Limit: Wikipedia dense RAG ≠ local SQLite portfolio.

6. SQLite FTS5 Extension — SQLite — docs — https://www.sqlite.org/fts5.html — Analog: MATCH over inverted index returns ranked rows for a fixed query string (lexical, repeatable on fixed DB). Holds for FTS5/`rk find`/`search_repos` as deterministic catalog search. Limit: BM25 ranking ≠ semantic embedding retrieval.

7. All agent tools may be stochastic — anti-pattern — **fail-transfer:** claiming every MCP/LLM-facing tool may be non-deterministic; catalog reads and FTS MATCH must stay deterministic for this KB.

8. Vector/RAG as required MCP path — anti-pattern — **fail-transfer:** inventing that the MCP surface must route through embeddings/RAG; product path is structured SQLite+FTS5 tools (read deterministic; mutate explicit).

**Finding:** Six analogs hold-with-limit (MCP readOnly/idempotent hints; llvm-nm symbol dump; SQL SELECT vs DDL/DML; CMDB read vs change; Lewis RAG as contrast class; FTS5 MATCH). Two fail-transfer (all-tools-stochastic; RAG-as-required-MCP-path). Soft folklore: 0. Did not invent STUDY-RK-021.

Six analogs. Three hold; three do not transfer — wait: six hold-with-limit; two fail-transfer.
✅
