# STUDY-RK-089 — pack-practitioner

Tip `5dd98ea`. Eight doc/GH/API/tip sources. Invented publish-mutator / tip-already-documented / risk-free merge / npm publish / STUDY-RK-101: 0. 🛑 do not merge #18/#17. NEVER npm publish.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/5dd98eac9eeb56e2fa3e0c57789c3f7dbd95ab2d | Finding: tip `5dd98ea` is main (STUDY-RK-088 land); inventory used this sha only; no execute / no npm publish.

2. PR #18 still OPEN (027) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/18 | Finding: state OPEN; head `75503ca` is not an ancestor of tip; title STUDY-RK-027 publish-state ≠ registry publish (docs); 4 files / +44/−0.

3. Tip vs #18 file presence | org: local tip `5dd98ea` | date: 2026-09-23 | paths: CHANGELOG.md, README.md, handbook usage.md, mcp-server.md | Finding: PATH_HIT 4/4 PR-named files; presence alone ≠ tip-already-documented — honesty callouts are content MISS (below).

4. Tip README / CHANGELOG MISS honesty lines | org: local tip `5dd98ea` | date: 2026-09-23 | paths: README.md, CHANGELOG.md | Finding: tip README has Publish-state command table without “reads registries only / never publishes / filename is inventory not mutator”; tip CHANGELOG Unreleased lacks the PR Changed bullet — CONTENT_MISS vs PR head.

5. Tip handbook MISS Publish-state sections | org: local tip `5dd98ea` | date: 2026-09-23 | paths: site/src/content/docs/handbook/usage.md, mcp-server.md | Finding: tip lacks PR `## Publish-state` / caution “Publish-state ≠ npm publish” and usage Publish-state commands block; CONTENT_MISS on both handbook paths.

6. Tip publish.ts / mcp authority (read-only inventory) | org: local tip `5dd98ea` | date: 2026-09-23 | paths: src/sync/publish.ts, src/mcp/server.ts | Finding: publish.ts header is GET/upsert inventory into repo_published_versions (not a registry mutator); mcp `repo_versions` already documents READ-ONLY / no registry hit — code authority exists; tip docs still drift from #18 honesty callouts.

7. PR #17 still OPEN (overlap) | org: mcp-tool-shop-org | date: still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/17 | Finding: state OPEN; head not on tip; file overlap with #18 = CHANGELOG.md + handbook mcp-server.md + usage.md (3) — keep both OPEN; #17 is empty-getRelated UX, not publish-state docs.

8. Prior 027/060 hold | org: local research | date: tip tree | paths: research/STUDY-RK-027/handoff.md, STUDY-RK-060/handoff.md | Finding: 027 opened #18 docs-only; 060 🛑 do not merge #17/#18 and no coding PR — residual is open #18 docs debt; NEW duplicate docs PR = no.

Answer: At tip `5dd98ea`, #18 is still OPEN and not on tip. Tip paths still MISS the PR-named honesty callouts on README, CHANGELOG, handbook usage.md, and handbook mcp-server.md (PATH_HIT, CONTENT_MISS). #17 still OPEN with docs overlap. NEW duplicate docs PR: no. 🛑 do not merge #18/#17. NEVER npm publish.
