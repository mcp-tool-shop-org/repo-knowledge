# STUDY-RK-094 — Practitioner Q2 pack

**Owner:** Practitioner  
**Tip:** `9e21d89` (main; `research: stamp STUDY-RK-093 land sha`)  
**PR #23:** OPEN — head `d56c5ed` — files only `CHANGELOG.md` · `site/src/content/docs/handbook/operations.md`  
**Prior:** STUDY-RK-037 / 066 / 093  
**NEW leftover docs PR warranted:** yes  
**NEW coding/test PR:** no  
**Do not invent STUDY-RK-101.** 🛑 do not merge #23.

## Answer

After tip `9e21d89` / STUDY-RK-093, tip inventory still shows leftover backup/`cp` docs **outside** #23’s file set. Tip `operations.md` remains the in-scope #23 residual (KEEP #23 OPEN). Tip `HANDBOOK.md` and tip `beginners.md` still teach wal_checkpoint + copy-the-`.db` and are **not** on #23’s paths. NEW leftover docs PR: **yes**. NEW coding/test PR: **no**. Tip is not already synced. Backup is not publish. Do not merge #23.

## Findings (8)

1. **Tip pin (GH/local).** Clone `/workspace/studio/repo-knowledge` HEAD = `9e21d8998a8c51bd7196f3ae3b05f344bfa9fca2`. `merge-base --is-ancestor 9e21d89 HEAD` → tip_ok. Tip subject stamps STUDY-RK-093. Prerequisite holds. Tip tree has `research/STUDY-RK-093/` five files; no `research/STUDY-RK-094/` yet.

2. **#23 still OPEN; file set narrow (GH API).** `gh pr view 23` → OPEN, headRefOid `d56c5eddad1d3c7cb10347cb1b8b29cf211bc0c2`, title STUDY-RK-037 handbook ops rk backup/restore. Files: `CHANGELOG.md`, `operations.md` only. `merge-base --is-ancestor d56c5ed 9e21d89` → pr23_NOT_on_tip. REAFFIRM 037/066/093: KEEP #23 OPEN unmerged.

3. **Tip `operations.md` vs #23 (in-set residual).** Tip still shows `PRAGMA wal_checkpoint(FULL);` and `cp data/knowledge.db data/knowledge-backup-$(date +%Y%m%d).db` under “Database backup”; no `rk backup` / `rk restore` in that section. That residual is exactly what #23 rewrites. Not a second PR’s job.

4. **Tip `HANDBOOK.md` leftover OUTSIDE #23.** Tip `## Database Backup` still documents wal_checkpoint then `cp data/knowledge.db data/knowledge-backup-…`. Disaster Recovery still leads with `rm` + `rk init` + `rk sync`, not `rk restore`. No open PR lists `HANDBOOK.md` in its files. PATH outside #23 file set: HIT leftover.

5. **Tip `beginners.md` leftover OUTSIDE #23.** FAQ “How do I back up my database?” still: “Copy the `.db` file… `sqlite3 … PRAGMA wal_checkpoint(FULL);` … then copy the file.” Not in #23 file set. PATH outside #23: HIT leftover.

6. **#24 PATH overlap on beginners (content residual unchanged).** PR #24 OPEN (STUDY-RK-054) also edits `beginners.md`, but tip…#24 diff does **not** touch the backup FAQ; #24 head still carries the same copy/`wal_checkpoint` sentence. #12/#25 do not touch `HANDBOOK.md` or that beginners FAQ. Leftover docs work must not invent that #24 already fixed backup prose.

7. **CLI vs docs authority (tip).** Tip `src/cli.ts` still registers `backup` / `restore`; tip README table already lists `rk backup [--out <path>]` with `VACUUM INTO`. Docs drift is handbook/root prose, not missing CLI. Tip `rg` under `test/` for backup/restore CLI strings remains empty relative to prior 066/093. **NEW coding/test PR: no.**

8. **Warrant call.** Because `HANDBOOK.md` (unowned by any open PR) and `beginners.md` backup FAQ (outside #23; still present on #24 head) retain `cp`/wal_checkpoint debt after 093, **NEW leftover docs PR: yes** (docs-only; align those leftovers to `rk backup`/`rk restore`; do not expand into coding/tests; do not merge #23; coordinate beginners edit with open #24 PATH_HIT). Soft-fail gates: invent tip-already-synced / backup=publish / risk-free merge #23 / STUDY-RK-101 = fail. KEEP residual-only would leave root HANDBOOK and beginners FAQ teaching the old path after #23 lands.

## Word note

Docs/GH/API/local tip only. No git write. No execute. No implications-as-final.

✅ · 🛑 · 🔧
