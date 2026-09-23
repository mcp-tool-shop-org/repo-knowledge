# STUDY-RK-093 — Practitioner Q2 pack

**Owner:** Practitioner  
**Tip:** `0e9f632` (main; `research: stamp STUDY-RK-092 land sha`)  
**PR:** #23 OPEN — head `d56c5ed` — title “STUDY-RK-037 handbook ops rk backup/restore”  
**Files on #23:** `CHANGELOG.md` · `site/src/content/docs/handbook/operations.md`  
**Prior:** STUDY-RK-037 / STUDY-RK-066  
**NEW duplicate coding/test PR:** no  
**Do not invent STUDY-RK-101.**

## Answer

After tip `0e9f632`, vendor/docs/GH tip inventory still shows handbook ops backup/restore docs drift while PR #23 stays OPEN. Tip CLI already owns `rk backup` / `rk restore`; tip handbook `operations.md` still teaches `sqlite3` `PRAGMA wal_checkpoint(FULL)` plus manual `cp` of `data/knowledge.db`. #23 head `d56c5ed` is not an ancestor of tip. Tip is not already synced. Backup is not publish. Do not merge #23.

## Findings (8)

1. **Tip pin (GH/local).** Clone `/workspace/studio/repo-knowledge` HEAD = `0e9f6320f14b9207a822effc30bf188ca5e7a101`. `git merge-base --is-ancestor 0e9f632 HEAD` → tip_ok. Tip subject: stamp STUDY-RK-092. Prerequisite tip holds.

2. **PR #23 still OPEN (GH API).** `gh pr view 23` → state OPEN, base `main`, headRefOid `d56c5eddad1d3c7cb10347cb1b8b29cf211bc0c2`, URL https://github.com/mcp-tool-shop-org/repo-knowledge/pull/23. Files: `CHANGELOG.md` (+4/−0), `site/src/content/docs/handbook/operations.md` (+15/−7). Head oid matches Coordinator `d56c5ed`.

3. **#23 not on tip.** `git merge-base --is-ancestor d56c5ed 0e9f632` → pr23_NOT_on_tip. Diff tip…head touches only the two docs paths above. Tip does not carry the Unreleased “Handbook operations backup” CHANGELOG bullet or the `rk backup`/`rk restore` handbook rewrite.

4. **Tip CLI authority for backup/restore (local tip `src/cli.ts`).** Tip registers `.command('backup')` with `--out` (default under `data/backups/`, `VACUUM INTO`) and `.command('restore <path>')` with `--yes`, schema_version probe, confirm gate, atomic temp-then-rename, WAL sidecar clear, refuse newer-schema backup. Tip CHANGELOG `[2.1.0]` Added already documents `rk backup` / `rk restore` and auto-snapshot before migrations. CLI authority is on tip; the residual is handbook prose, not missing CLI.

5. **Tip handbook still `cp` debt (local tip `operations.md`).** Tip “Database backup” section still says the DB is a single SQLite file in WAL mode, then shows `sqlite3 … PRAGMA wal_checkpoint(FULL);` and `cp data/knowledge.db data/knowledge-backup-$(date +%Y%m%d).db`, plus “Only the `.db` file is needed.” Tip `rg` on that file finds those lines and does **not** find `rk backup` or `rk restore` in the backup section. Recovery still leads with delete-and-`rk init`/`rk sync` rather than `rk restore`.

6. **#23 head content delta (docs only).** Head replaces the wal_checkpoint/`cp` block with `rk backup` / `rk backup --out …`, documents `VACUUM INTO`, adds `rk restore` / `--yes`, schema-validated confirm-gated atomic swap + WAL clear, and retargets Recovery to prefer restore when a snapshot exists. CHANGELOG Unreleased gains a Changed bullet stating handbook now documents first-class CLI instead of manual `cp`. No `src/` or `test/` files on the PR.

7. **Test / duplicate-PR inventory.** Tip `rg` under `test/` for `rk backup` / restore CLI command strings returned empty. Open PR search for backup/restore names #23 and #12; #12 files are handbook `index.md`, `mcp-server.md`, `usage.md` — not `operations.md`. STUDY-RK-066 handoff already recorded NEW backup/restore test PR: no and keep #23 OPEN. No second open PR duplicates #23’s operations backup rewrite. **NEW duplicate coding/test PR: no.**

8. **Prior land context (research stubs on tip).** Tip tree has `research/STUDY-RK-037/` and `research/STUDY-RK-066/` (packs + grounding + handoff). 037 handoff: docs PR #23 open, do not merge, do not npm publish. 066 handoff: research-only land, no coding/test PR, 🛑 do not merge #23. Tip has no `research/STUDY-RK-093/` yet (Builder land later). Soft-fail gates: invent tip-already-synced = fail; invent backup=publish = fail; invent risk-free merge #23 = fail; invent STUDY-RK-101 = fail.

## Word note

Docs/GH/API/local tip only. No git write. No execute. No implications-as-final. Soft folklore (tip-already-synced / backup=publish / risk-free merge #23 / STUDY-RK-101) rejected.

✅ · 🛑 · 🔧
