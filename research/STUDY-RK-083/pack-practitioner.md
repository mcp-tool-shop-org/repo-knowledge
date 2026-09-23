# STUDY-RK-083 — pack-practitioner

Tip: `e702251`. Eight doc/API sources. Invented STUDY-RK-101 / tip-has-#26-content: 0. 🛑 do not merge #26 (or #6 #8 #12–#25).

1. Tip HEAD — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · https://github.com/mcp-tool-shop-org/repo-knowledge/commit/e702251489132a789c9bce43809aa155a3cf5745 — short sha `e702251` ("research: stamp STUDY-RK-082 handoff land sha"); clone at tip.
2. PR #26 OPEN — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 — state OPEN; head `b3911e4`; single file `.github/workflows/pages.yml` (+34/−6); title ci build site on PRs not only deploying push.
3. Tip pages.yml triggers — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e702251/.github/workflows/pages.yml — `on:` is push[main]+paths site/**+pages.yml and workflow_dispatch only; **no** `pull_request:` block on tip.
4. Tip pages.yml permissions/deploy — same path · tip — workflow-wide `permissions: contents:read pages:write id-token:write`; build always `upload-pages-artifact`; deploy job always runs (no `if:`). Tip ≠ #26 delta.
5. #26 delta (prove) — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · PR #26 pages.yml — adds `pull_request:` paths site/**+pages.yml; build job `permissions: contents:read` only; `upload-pages-artifact` `if: github.event_name != 'pull_request'`; deploy `if: github.event_name != 'pull_request'` + pages/id-token write on deploy only. Soft folklore tip-already-has-delta: fail.
6. Tip ci.yml Extra — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e702251/.github/workflows/ci.yml — PR trigger includes site/package.json|lock|astro.config.mjs paths but is package/test CI, not `site` `npm run build`; does not replace #26 site-build gate.
7. Tip site/package.json + astro.config — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · site/package.json pins `@astrojs/starlight` ^0.42.1; astro.config.mjs sidebar uses labeled autogenerate shape — remaining risk is missing PR site-build check in tip pages.yml, not a second missing workflow file.
8. NEW leftover PR gate — tip-missing file beyond #26: none. Residual risk = CI/docs gap only. NEW coding/docs PR: **no**. 🛑 do not merge #26.

Answers: tip ≠ #26 delta · #26=OPEN · residual=one-page CI tip never builds site on PR · NEW PR=no · invented 101 / tip-has-open-PR-content=0.
