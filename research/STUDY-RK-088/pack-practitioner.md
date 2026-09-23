# STUDY-RK-088 — pack-practitioner

Tip `ea985f1`. Eight doc/GH/API/tip sources. Invented empty=success / tip-already-fixed / risk-free merge / STUDY-RK-101: 0. 🛑 do not merge #17/#18.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/ea985f139f26ad9b0075ea02aa6734869c19e5fc | Finding: tip `ea985f1` is main (STUDY-RK-087 land); inventory used this sha only.

2. PR #17 still OPEN (026) | org: mcp-tool-shop-org | date: created 2026-09-12 / still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/17 | Finding: state OPEN; head `99834db` is not an ancestor of tip; title STUDY-RK-026 empty getRelated UX honesty; 8 files / +162/−4.

3. Tip vs #17 file presence (counts) | org: local tip `ea985f1` | date: 2026-09-23 | path: test/ + PR file list | Finding: PATH_HIT 7/8 PR paths (CHANGELOG, beginners/mcp-server/usage handbook, cli.ts, server.ts, mcp-server.test.ts); PATH_MISS 1/8 = test/related-empty.test.ts — dedicated empty-honesty suite absent on tip.

4. Tip cli.ts still gates Relationships | org: local tip `ea985f1` | date: 2026-09-23 | path: src/cli.ts | Finding: formatRepo still `if (repo.relationships?.length)` before printing Relationships (silent on zero edges); PR head always prints section + `No relationships recorded` — tip MISS show honesty. Tip `rk related` already has human sentinel string; that alone ≠ tip-already-fixed for #17 scope.

5. Tip mcp/handbook lack #17 honesty delta | org: local tip `ea985f1` | date: 2026-09-23 | paths: src/mcp/server.ts, handbook usage/mcp-server/beginners | Finding: tip mcp has no STUDY-RK-026 empty-state comment; tip handbook pages lack PR honesty paragraphs (empty = nothing recorded, not Isolated-OK / enrichment-complete). Content MISS on those PATH_HIT files.

6. PR #18 still OPEN (overlap) | org: mcp-tool-shop-org | date: still open 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/18 | Finding: state OPEN; head not on tip; title STUDY-RK-027 publish-state ≠ registry publish (docs); file overlap with #17 = CHANGELOG.md + handbook mcp-server.md + usage.md (3) — keep both OPEN; different scope.

7. Prior 026/060/074 hold | org: local research | date: tip tree | paths: research/STUDY-RK-026/handoff.md, STUDY-RK-060/handoff.md, STUDY-RK-074/handoff.md | Finding: 026 opened #17; 060/074 reaffirm 🛑 do not merge #17 and NEW coding PR = no; residual is open #17 UX debt.

8. Diffstat confirms tip ≠ #17 | org: git tip…PR17 head | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/17 | Finding: tip…head still shows 8-file delta including new related-empty.test.ts (+123) and cli/mcp/handbook honesty hunks — not merged folklore.

Answer: At tip `ea985f1`, #17 is still OPEN and not on tip. Tip still MISSes: test/related-empty.test.ts (path), plus content deltas on cli show Relationships gate, mcp empty-state note, and handbook honesty prose (rk related sentinel alone ≠ full fix). #18 still OPEN with docs overlap. NEW duplicate coding PR: no. 🛑 do not merge #17/#18.
