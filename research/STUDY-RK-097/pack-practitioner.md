# STUDY-RK-097 — Practitioner Q2 pack

**Owner:** Practitioner  
**Tip:** `0a54088` (`0a54088b8e50fd12452926213b675464835d37d6`; `research: stamp STUDY-RK-096 land sha`)  
**PR #8:** OPEN — head `2a4bc00` — `chore(deps): Bump the all-deps group across 1 directory with 8 updates`  
**URL:** https://github.com/mcp-tool-shop-org/repo-knowledge/pull/8  
**Prior:** STUDY-RK-055 KEEP #8 OPEN  
**Residual tip coding bug / NEW deps PR:** no  
**Do not invent STUDY-RK-101.** 🛑 do not merge #8.

## Answer

After tip `0a54088`, tip vs PR #8 inventory REAFFIRMS STUDY-RK-055. #8 is still OPEN; head `2a4bc00` is not on tip; mergeable=MERGEABLE and mergeStateStatus=BEHIND. Tip `package.json` still pins pre-#8 majors (`better-sqlite3^12.8.0`, `commander^14.0.3`, `typescript^5.9.3`, `@types/node^25.5.0`). Residual tip coding bug requiring a NEW deps PR: **no**. KEEP #8 OPEN. Soft fails rejected: invent risk-free merge #8 / Soft folklore merge-is-fine / tip-already-bumped-by-#8 / STUDY-RK-101.

## Findings (8)

1. **Tip pin (GH/local).** Clone `/workspace/studio/repo-knowledge` HEAD = `0a54088b8e50fd12452926213b675464835d37d6`. `merge-base --is-ancestor 0a54088 HEAD` → tip_ok. Tip stamps STUDY-RK-096. Tip tree has `research/STUDY-RK-055/` and `research/STUDY-RK-096/`; no `research/STUDY-RK-097/` yet. `gh` as mcp-tool-shop against `mcp-tool-shop-org/repo-knowledge`.

2. **PR #8 still OPEN (GH API).** `gh pr view 8` → state OPEN, base `main`, title matches Dependabot all-deps bump, headRefOid `2a4bc00fd2de1531dca18b3694469663066d7c4c`, URL https://github.com/mcp-tool-shop-org/repo-knowledge/pull/8. Files only: `package-lock.json`, `package.json`.

3. **Head not on tip; BEHIND.** `merge-base --is-ancestor 2a4bc00 0a54088` → pr8_NOT_on_tip. `mergeable` = `MERGEABLE`; `mergeStateStatus` = `BEHIND`. `git rev-list --left-right --count 0a54088...refs/pr/8` → `194 1` (tip ahead by 194; PR unique = 1). Soft-fail invent tip-already-bumped-by-#8 = fail (#8 is not an ancestor of tip).

4. **Tip deps still pre-#8 majors (local tip `package.json`).** Tip pins: `better-sqlite3` `^12.8.0`, `commander` `^14.0.3`, `typescript` `^5.9.3`, `@types/node` `^25.5.0`. Matches prerequisite pin list. Tip is not already carrying #8’s major bumps.

5. **#8 head bumps (docs/GH diff tip…#8).** Head `package.json` moves `commander` `^14.0.3` → `^15.0.0`, `typescript` `^5.9.3` → `^6.0.3`, `@types/node` `^25.5.0` → `^26.0.0`; `better-sqlite3` stays `^12.8.0` in the JSON range while lockfile churns (+309/−269). Major surface is commander 15 / TypeScript 6 / @types/node 26 — same class named in STUDY-RK-055.

6. **Prior KEEP (research stub).** STUDY-RK-055 handoff: land research five files only; merge recommended NO; coding PR none; 🛑 do not merge #8 (or #24). Practitioner 055 pack: #8 OPEN/behind; majors commander 15 / TS 6 / @types/node 26; Merge recommended: no. Tip `0a54088` still holds that process residual.

7. **Merge folklore gates.** Soft-fail invent risk-free merge #8 = fail (BEHIND + major bumps + tip not carrying head). Soft folklore merge-is-fine = fail. MERGEABLE alone is not “ready”: mergeStateStatus remains BEHIND and tip is 194 commits ahead. 🛑 do not merge #8.

8. **Gap / NEW PR calls.** Coordinator default NEW coding PR: no. Tip inventory shows no tip coding bug that requires opening a second deps PR while #8 stays OPEN as the Dependabot vehicle. **Residual tip coding bug requiring NEW deps PR: no.** **NEW coding PR: no.** REAFFIRM STUDY-RK-055 KEEP #8 OPEN vs invent merge. Do not invent STUDY-RK-101. Fallback unused: four fields and tip/PR inventory verified without invent.

## Word note

Docs/GH/API/local tip only. No git write. No execute. No implications-as-final.

Seven doc/API sources. I did not invent What.

✅ · 🛑 · 🔧
