# STUDY-RK-120 Practitioner pack
Tip: `78c9b6e` (= `origin/main`). Owner: Practitioner. Q2: tip Astro/Starlight pins after #27 MERGED · held #26 ≠ tip-behind-#27 · OUTSIDE HIT count · NEW leftover/coding PR yes/no. Soft folklore invent tip-behind-#27 / invent mandatory-new-astro-PR / invent risk-free merge / invent STUDY-RK-131 = fail. No git write. No coding/docs PR. No merge. Stage only.

## Eight cited sources

1. Tip `site/package.json` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/78c9b6e/site/package.json — dependencies declare `astro` ^7.3.3 and `@astrojs/starlight` ^0.42.1 on tip main after the migrate landed.
2. Tip `site/package-lock.json` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/78c9b6e/site/package-lock.json — lock packages resolve `node_modules/astro` 7.3.3 and `node_modules/@astrojs/starlight` 0.42.1, matching the caret floor.
3. PR #27 MERGED — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/27 — title “Migrate site/ to astro 7, and let the checks that gate it actually fire”; state MERGED; `mergedAt` 2026-09-18T01:16:48Z; `mergeCommit` `051dee13bddbd7899e65232b9016df6e4476ddcc`; touched `site/package.json`, `site/package-lock.json`, `site/astro.config.mjs`, `.github/workflows/ci.yml`.
4. Pins at mergeCommit `051dee1` plus ancestry — `git show 051dee1:site/package.json` shows the same carets (^7.3.3 / ^0.42.1); `git merge-base --is-ancestor 051dee1 HEAD` exits 0, so tip `78c9b6e` already contains #27 (about 96 commits after the merge on the ancestry path). Tip is not tip-behind-#27.
5. Tip `.github/workflows/pages.yml` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/78c9b6e/.github/workflows/pages.yml — triggers on `push` to `main` (paths `site/**` and the workflow file) and `workflow_dispatch` only; no `pull_request` job gate on tip.
6. Open PR #26 head `b3911e46b9337303bc2a97ea709a1bcf7358fdf1` — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 — state OPEN; title “ci: build the site on pull requests, not only on the deploying push”; sole changed file `.github/workflows/pages.yml`; adds a paths-gated `pull_request` build. That is site-CI residual, not a pin rollback and not evidence tip lags #27.
7. npm registry latest — https://registry.npmjs.org/astro/latest and https://registry.npmjs.org/@astrojs/starlight/latest — published latest astro 7.3.4 and starlight 0.42.3. Tip carets already admit those patches; there is no major-line lag that would force a new migrate PR on main.
8. Prior stamp `research/STUDY-RK-084/grounding.md` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/78c9b6e/research/STUDY-RK-084/grounding.md — already recorded KEEP stack still-current on Astro 7 / Starlight 0.42 after #27; named #26 as site-CI (not tip-behind-#27); NEW leftover coding/docs PR for migrate currency: no. Tip today still matches that stamp on pins.

## Classification

Migrate-currency question on tip: pins match post-#27 mergeCommit; lock matches; ancestry proves #27 is in tip. Held #26 covers only pages PR-build missing on tip. That residual sits INSIDE open #26. No Astro/Starlight package pin gap sits OUTSIDE the open covering set for this Q2.


## Note on hold set

Open PRs observed via `gh pr list` for this tip include #6, #8, #12–#26, and #28. PR #27 is MERGED and is not an open cover. The site-CI gap on tip pages.yml is exactly the file set of open #26; inventing a second Astro migrate PR while tip pins already match `051dee1` would be folklore. STUDY-RK-131 is absent under `research/` and must not be invented as a follow-on id from this pack.

## Answers

- Tip Astro/Starlight pins after #27 MERGED: **yes** (`astro` ^7.3.3 · `@astrojs/starlight` ^0.42.1 on tip and on `051dee1`).
- Held #26 ≠ tip-behind-#27: **yes** (#26 = pages `pull_request` CI only).
- OUTSIDE HIT count: **0**.
- NEW leftover/coding PR (mandatory new Astro PR): **no**.
- Invented tip-behind-#27 / mandatory-new-astro-PR / risk-free merge / STUDY-RK-131: **0**. Open hold set #6 #8 #12–#26 #28 remains; do not merge.

Seven doc/API sources plus one prior grounding stamp. I did not invent tip-behind-#27.
✅
