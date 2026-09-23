# STUDY-RK-105 — pack-practitioner

Tip `78b263e`. Eight docs/GH/API/local-tip sources. Soft folklore invent mandatory-new-leftover-PR / invent tip-already-synced / invent risk-free merge / invent STUDY-RK-131: 0. 🛑 do not merge #6 #8 #12–#26. Study land default.

1. Tip stamp on main | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/commit/78b263e31c9fe7c712153f34d595590a4bce391b | Finding: short sha `78b263e` equals origin/main (“research: stamp STUDY-RK-104 handoff land line”); clone HEAD matches prerequisite; `research/STUDY-RK-105/` absent (stamp residual for Builder, not a coding PR).

2. Open docs-ish PR file-set union | org: mcp-tool-shop-org | date: 2026-09-23 | URLs: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/12 · /16 · /17 · /18 · /19 · /20 · /21 · /23 · /24 · /25 · /26 | Finding: still-OPEN docs/CI peers touch `site/src/content/docs/handbook/{index,mcp-server,usage,beginners,getting-started,operations,security}.md`, README, CHANGELOG, contracts/games templates, and `.github/workflows/pages.yml`; **no** open PR lists root `HANDBOOK.md`.

3. Residual HIT OUTSIDE open file sets — root HANDBOOK | org: local tip `78b263e` | date: 2026-09-23 | path: `HANDBOOK.md` | Finding: tip Database Backup still shows `PRAGMA wal_checkpoint` + `cp data/knowledge.db …`; Disaster Recovery still leads with `rm` of DB files + `rk init` (no `rk backup` / `rk restore`); path unowned by #12/#16–#26. Soft folklore tip-already-synced: fail.

4. Covered-by-OPEN — operations backup (REAFFIRM 094 in-set) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/23 | Finding: tip `site/src/content/docs/handbook/operations.md` still wal_checkpoint+cp (HIT); #23 OPEN head `d56c5ed` rewrites to `rk backup`/`rk restore` (wal=0 · rk-backup hits>0 on head); residual is exactly #23’s file set — not a second PR’s job.

5. Covered-by-OPEN — usage note/--delete + eight RELATION_TYPES (REAFFIRM 082) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/25 | Finding: tip `usage.md` still add-only note + six Types; #25 OPEN head `06490f4` adds `--delete` prose + `wraps`/`collaborated_in_mission`; path ON_TIP, content gap behind #25 only — NEW duplicate leftover PR: no.

6. Covered-by-OPEN — getting-started/README/seed-controls (REAFFIRM 081) + pages PR build (REAFFIRM 083) | org: mcp-tool-shop-org | date: 2026-09-23 | URLs: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/24 · /26 | Finding: #24 OPEN still owns getting-started/beginners/security/README init-sync-seed residuals; tip `.github/workflows/pages.yml` still has no `pull_request:` while #26 OPEN head `b3911e4` adds it — both content/CI gaps are behind OPEN PRs, not tip-missing extra files.

7. beginners backup FAQ — PATH covered, content uncleared | org: local tip + PR heads | date: 2026-09-23 | path: `site/src/content/docs/handbook/beginners.md` · PRs #17/#19/#24 | Finding: tip FAQ still “Copy the `.db`” + wal_checkpoint (rk backup=0); #19/#24 heads keep the same class counts; file is inside open PR sets so PATH is covered, but do not invent that those PRs already cleared backup prose — coordinate any beginners edit with PATH owners; alone it does not invent a mandatory second path PR.

8. Warrant + hold set | org: gh pr list + tip CLI/README | date: 2026-09-23 | path: open set #6 #8 #12–#26 · tip `README.md` already lists `rk backup`/`VACUUM INTO` · tip `src/cli.ts` registers backup/restore | Finding: because root `HANDBOOK.md` residual is HIT outside every open PR file set, **NEW leftover docs PR: yes** (docs-only; align HANDBOOK Database Backup / Disaster Recovery to `rk backup`/`rk restore`; do not open coding/test PR; do not merge holds). Soft folklore invent mandatory-new-leftover-PR for #23/#24/#25/#26-covered residuals / tip-already-synced / risk-free merge / STUDY-RK-131: fail. REAFFIRM 081/082/083/094 leftovers still HIT behind their OPEN PRs.

Answer: At tip `78b263e`, leftover docs debt **outside** open #12/#16–#26 file sets is root **`HANDBOOK.md`** backup/cp/disaster prose (HIT). Covered-by-OPEN (NEW leftover PR = no for those): operations→#23, usage→#25, getting-started/seed→#24, pages PR build→#26, plus mcp/usage/index peers #12/#16–#18/#21. beginners backup FAQ is PATH-covered but content-uncleared. **NEW leftover docs PR: yes** (HANDBOOK-only docs). NEW coding PR: no. 🛑 do not merge #6 #8 #12–#26.

✅ · 🛑 · 🔧
