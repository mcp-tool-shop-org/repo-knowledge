STUDY-RK-019 Q2 (Practitioner)

stop: relationship graph vs isolated entries (docs + source).
prerequisite: STUDY-RK-018 done sha=`afcc9b7`; tip `afcc9b7`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent isolated-ok folklore or STUDY-RK-021.

1. KNOWLEDGE-CONTRACT relationships section | org: mcp-tool-shop-org/repo-knowledge | date: tip afcc9b7 | path: `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md` | Finding: states Cross-repo edges matter because repos don't exist in isolation; lists six enrichment-era types; quality rules ban bare edges and random related_to webs; Rules minimum is thesis+architecture (relationships are workflow step 7 Record relationships, not listed in the No exceptions minimum line).

2. THE-CLAUDE-GAMES Enrichment Pass | org: local | date: 2026-04-24 (eac41fd) | path: `/workspace/studio/repo-knowledge/THE-CLAUDE-GAMES.md` | Finding: Pass 2 copy-paste instructions say Every repo gets thesis note, architecture note, relationships mapped, releases synced — operator enrichment expects mapped edges per repo, not isolated catalog rows.

3. RELATION_TYPES shared tuple | org: local | date: tip afcc9b7 | path: `/workspace/studio/repo-knowledge/src/index.ts` | Finding: eight closed values depends_on related_to supersedes shares_domain_with shares_package_with companion_to wraps collaborated_in_mission (FT-5 comments); single source for CLI + MCP validators.

4. schema.sql repo_relationships | org: local | date: 2026-06-20 (08eaa8a) | path: `/workspace/studio/repo-knowledge/src/db/schema.sql` | Finding: optional child table (no per-repo edge NOT NULL); relation_type CHECK matches the eight-value enum; UNIQUE(from_repo_id, relation_type, to_repo_id); note column nullable at SQL layer.

5. addRelationship + relation-types tests | org: local | date: 2026-06-20 (08eaa8a) | paths: `src/db/init.ts`, `test/relation-types.test.ts` | Finding: validates relation_type before INSERT OR IGNORE (ts-A-003); tests assert wraps/collaborated_in_mission round-trip, length 8, invented types throw, invalid types leave zero rows, dedup keeps one row — vocabulary enforcement, not an isolated-repo policy switch.

6. MCP add_relationship / related_repos | org: local | date: tip afcc9b7 | path: `/workspace/studio/repo-knowledge/src/mcp/server.ts` | Finding: add_relationship Zod-enums RELATION_TYPES with optional note; related_repos returns JSON { slug, relationships: getRelated(...) } — read path surfaces whatever edges exist (including none).

7. CLI rk related / rk relate | org: local | date: tip afcc9b7 | path: `/workspace/studio/repo-knowledge/src/cli.ts` | Finding: relate validates type against RELATION_TYPES; related text path prints No relationships recorded for: <slug> when empty, while --json emits [] so machine consumers see zero edges without a human sentinel — documents empty-edge DB state without labeling isolation as approved folklore.

8. README Enrichment + data model | org: local | date: 2026-06-22 (a301d0e on README) | path: `/workspace/studio/repo-knowledge/README.md` | Finding: product pitch includes inter-repo relationships; Enrichment Pass adds relationship mappings; schema sketch lists relationships (depends_on, related_to, supersedes, ...); CLI rk related / rk relate listed — graph is a first-class product surface alongside notes.

Isolated-ok folklore invented: 0 · STUDY-RK-021 invented: 0

✅
