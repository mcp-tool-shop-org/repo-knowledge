# STUDY-RK-084 — pack-practitioner

Tip: `31f442c`. Eight tip+vendor sources. Invented tip-behind-#27 / STUDY-RK-101 / merge-open-PRs: 0. 🛑 do not merge #6 #8 #12–#26.

1. Tip HEAD — mcp-tool-shop-org/repo-knowledge · 2026-09-23 · https://github.com/mcp-tool-shop-org/repo-knowledge/commit/31f442cf113352edf541b5cb0aa80f20bbb836f5 — short sha `31f442c`; clone at tip.
2. PR #27 MERGED — mcp-tool-shop-org/repo-knowledge · 2026-09-18 · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/27 — state MERGED; mergeCommit `051dee1`; tip is descendant of `051dee1`. Soft folklore tip-behind-#27: fail.
3. Tip site/package.json pins — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/31f442c/site/package.json — `astro` ^7.3.3; `@astrojs/starlight` ^0.42.1.
4. Vendor npm latest — https://registry.npmjs.org/astro/latest · https://registry.npmjs.org/@astrojs/starlight/latest — latest astro 7.3.4, starlight 0.42.3; tip carets allow patches; no major-line lag.
5. Tip astro.config sidebar — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/31f442c/site/astro.config.mjs — Handbook uses `items: [{ autogenerate: { directory: 'handbook' } }]`.
6. Vendor Starlight sidebar docs — https://starlight.astro.build/guides/sidebar/ — documents autogenerate.directory; tip shape matches.
7. Tip handbook content paths — https://github.com/mcp-tool-shop-org/repo-knowledge/tree/31f442c/site/src/content/docs/handbook — nine handbook md files + docsLoader/docsSchema.
8. Tip ci/pages site gates — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/31f442c/.github/workflows/ci.yml · pages.yml — ci path-filters site package files but root npm run build; pages.yml site build push-only (no PR). Stack migrate current; PR site-build residual OPEN #26 (083), not #27-behind gap.

Answers: stack still-current on Astro 7 / Starlight 0.42 after #27 · NEW leftover coding/docs PR for migrate currency: **no** · invented tip-behind-#27 / 101: 0.
