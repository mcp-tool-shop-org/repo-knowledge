# STUDY-RK-096 — Practitioner Q2 pack

**Owner:** Practitioner  
**Tip:** `ccee3c7` (`ccee3c79496270d39820065c76fa59e4fadba78d`; `research: stamp STUDY-RK-095 land sha`)  
**PR #6:** OPEN — head `3b748d2` — “fix(sync): rk sync exited 0 while crashing — propagate failures (1.0.6)”  
**Prior:** STUDY-RK-033 / 056 / 072  
**Residual tip coding bug:** no  
**NEW coding PR:** no  
**Do not invent STUDY-RK-101.** 🛑 do not merge #6.

## Answer

After tip `ccee3c7`, tip vs PR #6 inventory REAFFIRMS 033/056/072. #6 is OPEN; head is not on tip; mergeable=CONFLICTING and mergeStateStatus=DIRTY. Tip still carries sync fail-closed defenses (`program.parseAsync().catch` → `process.exit(2)`, empty-owners warn, config undefined-skip, `test/cli-async.test.ts`). Residual tip coding bug: **no**. NEW coding PR: **no**. Soft fails rejected: invent silent-zero-is-success / risk-free merge #6 / tip-already-fixed-by-#6 / STUDY-RK-101.

## Findings (8)

1. **Tip pin (GH/local).** Clone `/workspace/studio/repo-knowledge` HEAD = `ccee3c79496270d39820065c76fa59e4fadba78d`. `merge-base --is-ancestor ccee3c7 HEAD` → tip_ok. Tip stamps STUDY-RK-095. Tip tree has `research/STUDY-RK-033/`, `056/`, `072/`, and `095/`; no `research/STUDY-RK-096/` yet. Remote `mcp-tool-shop-org/repo-knowledge`; `gh` as mcp-tool-shop.

2. **PR #6 still OPEN (GH API).** `gh pr view 6` → state OPEN, base `main`, headRefOid `3b748d2e96c537f1cde5f9ff959b8f78c61a5426`, URL https://github.com/mcp-tool-shop-org/repo-knowledge/pull/6. Files: `.github/workflows/ci.yml`, `.github/workflows/pages.yml`, `CHANGELOG.md`, `package-lock.json`, `package.json`, `scripts/postbuild.js`, `src/cli.ts`, `src/config.ts`, `test/config.test.ts`, `tsconfig.json` — matches prerequisite cli/config/workflows.

3. **#6 head not on tip; behind/conflict.** `merge-base --is-ancestor 3b748d2 ccee3c7` → pr6_NOT_on_tip. `git rev-list --left-right --count ccee3c7...refs/pr/6` → `223 5` (tip carries 223 commits not in #6; #6 has 5 unique). Soft-fail invent tip-already-fixed-by-#6 = fail (#6 is not an ancestor of tip; tip defenses are tip-local).

4. **Mergeable / dirty / conflict status (GH API).** `mergeable` = `CONFLICTING`; `mergeStateStatus` = `DIRTY`. Soft-fail invent risk-free merge #6 = fail. 🛑 do not merge #6.

5. **Tip sync fail-closed defenses still present (local tip).** Tip `src/cli.ts` F-BE-FT1 block: `program.parseAsync().catch` logs and `process.exit(2)` so async action rejections (sync included) do not exit 0. Sync action cli-PH-004 warns on stderr when no owners resolve instead of a silent GitHub no-op. Tip `src/config.ts` skips undefined override fields so callers cannot clobber file/default owners. Soft-fail invent silent-zero-is-success = fail (tip contract is non-zero on async throw).

6. **Tip regression coverage.** Tip `test/cli-async.test.ts` (F-TS-003) asserts non-zero exit when an async action throws (e.g. sync-dogfood with a bad `--local` path). Tip also keeps `test/sync-owners-config.test.ts` and `test/config.test.ts`. Coverage is on tip today; it is not delivered by merging dirty #6.

7. **#6 patch vs tip (stale overlap).** Diff tip…#6 still proposes parseAsync wiring, stripUndefined-style config validation, and Actions v4→v5 bumps, but tip already has parseAsync fail-closed and undefined-skip; merge-tree reports both-changed conflicts (including workflow files). #6 is a stale process/PR artifact, not a clean tip fix vehicle. REAFFIRM 033/056/072: keep #6 OPEN unmerged; no replacement coding PR required for this residual.

8. **Gap / NEW PR calls.** Prior handoffs (033/056/072): concrete residual coding bug = no; NEW coding PR = no; 🛑 do not merge #6. Tip `ccee3c7` inventory matches: **residual tip coding bug: no** · **NEW coding PR: no**. Do not invent STUDY-RK-101. Fallback unused: tip/PR inventory verified without invent.

## Word note

Docs/GH/API/local tip only. No git write. No execute. No implications-as-final.

Seven doc/API sources. I did not invent What.

✅ · 🛑 · 🔧
