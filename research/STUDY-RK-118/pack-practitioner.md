# STUDY-RK-118 Q2 — Practitioner pack

Tip `a220695` (= `origin/main`, stamp STUDY-RK-117). Job: tip leftover-docs residuals under handbook operations / usage / pages CI / root HANDBOOK vs OPEN heads **#23 / #25 / #26 / #28**. Soft folklore invent tip-already-synced / invent mandatory-new-leftover-PR / invent risk-free merge / invent STUDY-RK-131: **0**. No git write. No merge. No identity strings.

## Findings (8)

1. Tip equals origin/main | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `/workspace/studio/repo-knowledge` @ `a220695a3752917bf319529a7e74f3fb00c93a20` | Finding: `HEAD` == `origin/main` == tip. Tip gate passes.

2. Covering heads match claimed SHAs | org: mcp-tool-shop-org | date: 2026-09-23 | URL: open PR API #23/#25/#26/#28 | Finding: live heads match prerequisite — #23 `d56c5ed` (operations.md+CHANGELOG), #25 `06490f4` (usage.md), #26 `b3911e4` (pages.yml), #28 `c323e8f` (HANDBOOK.md). All OPEN.

3. Tip operations.md wal/`cp` residual vs #23 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `site/src/content/docs/handbook/operations.md:27–30` · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/23 · head `d56c5ed` · files: `operations.md`, `CHANGELOG.md` | Finding: tip still shows `PRAGMA wal_checkpoint(FULL);` then `cp data/knowledge.db …`. #23 head rewrites to `rk backup`/`rk restore` + VACUUM INTO (+19/−7 on ops). Residual still on tip (≠ tip-already-synced). **INSIDE #23**.

4. Tip usage.md note/--delete + RELATION residual vs #25 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `site/src/content/docs/handbook/usage.md` (`rk note` add-only; six relate types) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/25 · head `06490f4` · files: `usage.md` | Finding: tip lacks `--delete` prose and `wraps`/`collaborated_in_mission`; #25 head adds both (+5/−2). Residual on tip. **INSIDE #25**.

5. Tip pages.yml push-only residual vs #26 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `.github/workflows/pages.yml` (`on:` push only; `pull_request` count **0**) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 · head `b3911e4` · files: `pages.yml` | Finding: tip still push-only; #26 head adds paths-gated `pull_request` (+34/−6). Residual on tip. **INSIDE #26**.

6. Tip root HANDBOOK.md wal/`cp` residual vs #28 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `HANDBOOK.md:39–42` · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/28 · head `c323e8f` · files: `HANDBOOK.md` | Finding: tip still documents wal_checkpoint/`cp` backup; #28 head switches to `rk backup`/`rk restore` (+15/−9). Residual on tip. **INSIDE #28**.

7. OUTSIDE HIT tally for this seat set | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: operations · usage · pages.yml · HANDBOOK | Finding: four named residuals each map **INSIDE** their covering OPEN PR file set. **OUTSIDE HIT count: 0.** No path in this inventory is absent from every OPEN covering set. Default study land; do not invent a new leftover PR while covered.

8. Hold + REAFFIRM (no merge invent) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: hold set #6 #8 #12–#28 | Finding: REAFFIRM 114/115/116/117 + 081/082/083/094/105/106. KEEP holds OPEN. 🛑 do not merge #6 #8 #12–#28. No STUDY-RK-131. No risk-free merge claim. **NEW leftover/coding PR: no** (would FAIL if invent-yes while INSIDE).

## Answer

At tip `c323e8f`, handbook operations / usage / pages CI / root HANDBOOK leftovers are **INSIDE** OPEN #23/#25/#26/#28 respectively. **OUTSIDE HIT count: 0.** **NEW leftover/coding PR: no.** Residuals remain on tip (≠ tip-already-synced).

Eight doc/API sources. I did not invent What.

✅
