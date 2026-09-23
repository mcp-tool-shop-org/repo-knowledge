# STUDY-RK-116 Q2 — Practitioner pack

Tip `4e6f6b0` (= `origin/main`, stamp STUDY-RK-115). Job: tip leftover docs vs open heads **#12 / #16–#21 / #24**. Soft folklore invent tip-already-synced / invent mandatory-new-leftover-PR / invent risk-free merge / invent STUDY-RK-131: **0**. No git write. No merge. No restack of #13/#14/#15/#22/#23/#25/#26/#28 (covered in 115).

## Findings (8)

1. Tip equals origin/main | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `/workspace/studio/repo-knowledge` @ `4e6f6b00462ef9e36f2e6849b19d7b7f596bcbd5` | Finding: `HEAD` == `origin/main` == tip. Tip gate passes.

2. Tip handbook CLI surface lag vs #12 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `site/src/content/docs/handbook/usage.md` (184 lines, 20 `### rk` heads) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/12 · head `09bb4b4` · files: `site/src/content/docs/handbook/index.md`, `mcp-server.md`, `usage.md` | Finding: tip usage omits many live CLI heads that #12 adds (`rk backup`/`restore`, `doctor`, `health*`, `versions`, `drift`, `fsck`, …). Residual **still on tip**. **INSIDE #12**. NEW leftover PR: **no**.

3. Tip MCP tool count 19 vs server 30 / #16 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `site/src/content/docs/handbook/mcp-server.md:8` (“exposes 19 tools”), `handbook/index.md` (“19 MCP tools”); tip `src/mcp/server.ts` has **30** `server.tool(` · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/16 · head `74bfd4a` · files: `index.md`, `mcp-server.md` | Finding: tip docs still say 19 while tip code is 30; #16 head rewrites both to 30 and expands tool tables. Residual ≠ tip-already-synced. **INSIDE #16**. NEW: **no**.

4. Tip related-empty honesty vs #17 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `site/.../usage.md` `rk related` block (no empty-state prose) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/17 · head `99834db` · files: `usage.md`, `mcp-server.md`, `beginners.md`, `src/cli.ts`, `src/mcp/server.ts`, `test/related-empty.test.ts` (+ CHANGELOG) | Finding: tip lacks empty-relationship honesty; #17 head adds text/JSON empty behavior (+162/−4). **INSIDE #17**. NEW: **no**.

5. Tip publish-state catalog silence vs #18 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `site/.../usage.md` (no Publish-state section) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/18 · head `75503ca` · files: `CHANGELOG.md`, `README.md`, `mcp-server.md`, `usage.md` | Finding: tip handbook usage still omits caution that publish-state ≠ npm publish; #18 head adds `rk versions`/`drift`/`bind-package` docs with registry-read-only caution. **INSIDE #18**. NEW: **no**.

6. Tip dual-path install under-spec vs #19 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `getting-started.md:12`, `operations.md` (`better-sqlite3` build fails) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/19 · head `eaa81cc` · files: `CHANGELOG.md`, `README.md`, `beginners.md`, `getting-started.md`, `operations.md` | Finding: tip still implies prebuilts “used automatically”; tip ops lacks `prebuild-install || node-gyp` dual-path prose that #19 head adds. **INSIDE #19**. NEW: **no**.

7. Tip absolute machine paths vs #20 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `ROADMAP.md:163–166` (`/Users/michaelfrilot/.claude/projects/...`, count 3) · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/20 · head `7dbc12d` · files: `CHANGELOG.md`, `KNOWLEDGE-CONTRACT.md`, `REMEDIATION-INSTRUCTIONS.md`, `ROADMAP.md`, `THE-CLAUDE-GAMES.md` | Finding: tip ROADMAP still embeds operator-absolute paths; #20 head rewrites to portable memory labels (abs count 0 on head ROADMAP). **INSIDE #20**. NEW: **no**.

8. Tip Games layering + getting-started seed vs #21/#24 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `THE-CLAUDE-GAMES.md` · `site/.../getting-started.md` · PRs https://github.com/mcp-tool-shop-org/repo-knowledge/pull/21 head `ab69021` (files: `THE-CLAUDE-GAMES.md`, `templates/claude-games/*`, README, CHANGELOG) · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/24 head `dced9f9` (files: CHANGELOG, README, beginners, getting-started, security) | Finding: tip Games still collapses playbook/templates/POINTS; tip getting-started under-specifies `rk init` idempotence and sync language stub. Both residuals on tip; both **INSIDE** #21/#24. NEW leftover/coding PR: **no**.

## Answer

Inventory seats **#12/#16–#21/#24**: every proven tip residual is **INSIDE** the named open covering PR (head sha + file set above). **OUTSIDE HIT count: 0.** **NEW leftover/coding PR: no.** Tip residuals remain present (≠ tip-already-synced). REAFFIRM 114/115 + 081/082/083/094/105/106. KEEP holds OPEN. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. Do not restack 115 seats.

Eight doc/API sources. I did not invent What.

✅
