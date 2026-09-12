STUDY-RK-026 Q2 (Practitioner)

stop: docs/source inventory — current empty getRelated behaviour across CLI + MCP + helpers (what users see when related list is empty; gaps vs contract).
prerequisite: STUDY-RK-025 done sha=`3aa30af` PR #16; tip `4331f8b`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-019.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator.

Eight doc/API sources. I did not invent STUDY-RK-051.

1. STUDY-RK-019 grounding | org: local research | date: tip tree `4331f8b` | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-019/grounding.md` | Finding: verified core — contract repos don't exist in isolation; empty getRelated is engine state not approved folklore; Soft folklore Isolated-OK: 0.

2. getRelated helper empty return | org: local | date: tip `4331f8b` | path: `/workspace/studio/repo-knowledge/src/db/init.ts` | Finding: getRelated runs bidirectional UNION ALL over repo_relationships and returns a plain array — zero edges yield [] with no sentinel string or enrichment hint.

3. CLI rk related text vs --json | org: local | date: tip `4331f8b` | path: `/workspace/studio/repo-knowledge/src/cli.ts` | Finding: text path prints No relationships recorded for: <slug> then returns; --json emits JSON.stringify(related) so empty is [] — intentional split so jq never hits the human sentinel (CLI-JSON-CORE comment).

4. MCP related_repos empty payload | org: local | date: tip `4331f8b` | path: `/workspace/studio/repo-knowledge/src/mcp/server.ts` | Finding: related_repos returns JSON { slug, relationships: related } with no not-found-style empty message when relationships is [] — agents see an empty array only.

5. rk show / getRepo empty relationships | org: local | date: tip `4331f8b` | paths: src/db/init.ts getRepo, src/cli.ts formatRepo | Finding: getRepo.relationships is [] when none; formatRepo only prints ─── Relationships ─── when repo.relationships?.length — empty case omits the section entirely (silent vs related's explicit sentinel).

6. Handbook/README document related without empty UX | org: local | date: tip `4331f8b` | paths: `site/src/content/docs/handbook/usage.md`, `beginners.md`, `README.md` | Finding: usage/beginners show rk related / rk relate examples and types but do not document the No relationships recorded sentinel or --json []; gap vs CLI behaviour.

7. KNOWLEDGE-CONTRACT gap vs empty surfaces | org: local | date: tip `4331f8b` | path: `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md` | Finding: Cross-repo edges matter because repos don't exist in isolation; workflow step 7 Record relationships; Rules minimum is thesis+architecture — product never labels empty getRelated as finished enrichment, while engine still serves empty lists.

8. Tests touch getRelated but not empty CLI sentinel | org: local | date: tip `4331f8b` | paths: `test/db.test.ts`, `test/relation-types.test.ts` | Finding: tests assert non-empty getRelated after addRelationship; no on-page test for No relationships recorded or related_repos { relationships: [] } empty UX.

STUDY-RK-051 invented: 0

✅
