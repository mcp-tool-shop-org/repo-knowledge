# STUDY-RK-003 — Research grounding (verified — copy)

1. Lit. read vs write tool contracts, deterministic gates/replay, structured schemas (Dhage; Mudasiru; Pan/Hou; Mansoor; Reddy; Gorilla; StableToolBench; ToolLLM).
2. Docs. Catalog reads (`get_repo`/`find`/`search`/`related`/`health_*`/`repo_diff`/`ops_runs` + CLI `show`/`list`/`find --json`) stay deterministic / DB-only where documented. Mutators stay explicit (`add_repo_note`/`add_relationship`/`sync_repos`/`audit_submit`/`archive_repo`/`delete_repo`); `db_fsck` WRITES `db_health_runs` (not pure).
3. Analogs hold-with-limit: MCP annotations; llvm-nm; SQL SELECT vs DDL/DML; CMDB read vs change; Lewis RAG as contrast; FTS5 MATCH.

**Unverified / do not land as verified:** Practitioner #1 (`sync_dogfood` not in server.ts L7–35 inventory); Analogist #7–#8 fail-transfer.

**Invented gates: 0** — Non-deterministic-must-tool · All-MCP-non-det · RAG-as-required-MCP · All-tools-stochastic.

Verifier: Scholar 8/8 · Practitioner 7/8 (#1 unverified) · Analogist 1–6 hold; 7–8 fail-transfer.

Do not invent STUDY-RK-021.
