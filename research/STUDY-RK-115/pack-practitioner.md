# STUDY-RK-115 Q2 — Practitioner pack

Tip `3cb5dd9` (= `origin/main`, stamp STUDY-RK-114). Job: tip content vs open covering PR heads for held residuals. Soft folklore invent tip-already-synced / invent mandatory-new-leftover-PR / invent risk-free merge / invent STUDY-RK-131: **0**. No git write. No execute. No invent merge advice.

## Findings (8)

1. Tip equals origin/main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: local clone `/workspace/studio/repo-knowledge` · tip `3cb5dd9` | Finding: `HEAD` and `origin/main` both resolve to `3cb5dd9466c3a1b78275013df39fdfe36cfa1b21`. Tip gate passes; no Coordinator 🛑 on tip mismatch.

2. Tip `HANDBOOK.md` wal/`cp` residual still present | org: mcp-tool-shop-org | date: 2026-09-23 | path: tip `HANDBOOK.md` | Finding: tip still documents `PRAGMA wal_checkpoint(FULL);` then `cp data/knowledge.db …` as the backup path (lines ~39–42). Tip is **not** already synced to `rk backup`/`VACUUM INTO`. Residual **≠ tip-already-synced**.

3. #28 head covers root HANDBOOK (INSIDE) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/28 · head `c323e8f` OPEN | Finding: #28 rewrites Backup to `rk backup` / `rk restore` and drops live-file `cp` as primary. Diffstat tip…#28: `HANDBOOK.md` +15/−9. HIT remains on tip **and** is INSIDE #28 → NEW leftover PR for this path: **no**.

4. Tip `pages.yml` push-only residual still present | org: mcp-tool-shop-org | date: 2026-09-23 | path: tip `.github/workflows/pages.yml` | Finding: tip `on:` has `push` + `workflow_dispatch` only; `pull_request` count on tip = **0**. Residual **≠ tip-already-synced**.

5. #26 head adds PR build (INSIDE) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 · head `b3911e4` OPEN | Finding: #26 adds paths-gated `pull_request` on `main`, narrows write perms to deploy, skips upload on PR. Diffstat tip…#26: `pages.yml` +34/−6. HIT INSIDE #26 → NEW leftover/coding PR: **no**.

6. Tip site ops + usage residuals vs #23/#25 | org: mcp-tool-shop-org | date: 2026-09-23 | paths: `site/.../operations.md` · `usage.md` · PRs #23 `d56c5ed` · #25 `06490f4` OPEN | Finding: tip operations still shows wal_checkpoint/`cp`; #23 head switches to `rk backup`/`rk restore`. Tip usage documents add-only `rk note` and six relate types; #25 head adds `--delete` prose plus `wraps`/`collaborated_in_mission`. Both residuals still on tip, both INSIDE open PRs → NEW leftover PR: **no**.

7. Tip dedicated-test ABSENCE vs #13/#14/#15/#22 | org: mcp-tool-shop-org | date: 2026-09-23 | URL: PRs #13 `ce6743a` · #14 `8fee954` · #15 `e75f703` · #22 `863e7fd` all OPEN | Finding: tip ABSENT `errors`/`audit-controls`/`audit-queries`/`doctor`/`feed`/`table`/`github`/`dogfood-suggest`/`cli-note-delete` test files; each PRESENT only on the named PR head file set. KEEP those holds OPEN (REAFFIRM 111–114). NEW dedicated-test coding PR: **no**.

8. Hold set + REAFFIRM (no merge invent) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: open PR API for #6 #8 #12–#28 | Finding: covering seats stay OPEN. REAFFIRM STUDY-RK-114 (OUTSIDE count 0; NEW leftover no) and 081/082/083/094/105/106. 🛑 do not merge #6 #8 #12–#28. No risk-free merge claim. No STUDY-RK-131.

## Answer

Proven at tip `3cb5dd9`: HANDBOOK wal/`cp`, pages push-only, site ops/usage drift, and dedicated-test ABSENCE are **still present on tip** (≠ tip-already-synced) and each maps **INSIDE** an open covering PR head (#28/#26/#23/#25/#13/#14/#15/#22). That is ownership already seated — **≠ invent mandatory-new leftover PR**, **≠ invent risk-free merge**. **NEW leftover/coding PR: no.** KEEP holds OPEN. Default study land.

Seven doc/API sources. I did not invent What.

✅ · 🛑 · 🔧
