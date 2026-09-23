# STUDY-RK-125 Practitioner pack
Tip: `bdc8e80` (= `origin/main`). Owner: Practitioner. Consumer: repo-knowledge. Q2: Does tip still KEEP package pins from 035/057/073/097, and is #8 still OPEN process gap (not tip-already-fixed / merge-is-fine)? Soft folklore invent tip-already-synced / invent merge-is-fine / invent merge-#8-clears-tip / invent mandatory-new-deps-PR / invent risk-free merge / invent STUDY-RK-131 = fail. No install. No git write. No merge. REAFFIRM 035/057/073/097 + 124. 🛑 do not merge #6 #8 #12–#26 #28.

## Eight cited findings

1. Tip `package.json` pins — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/bdc8e80/package.json — tip still declares `commander` `^14.0.3`, `typescript` `^5.9.3`, `@types/node` `^25.5.0`, `better-sqlite3` `^12.8.0` (plus lock resolved `14.0.3` / `5.9.3` / `25.5.0`). Majors commander/TS/@types-node remain held on tip. Inventing tip-already-bumped-by-#8 = fail.
2. Tip `package-lock.json` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/bdc8e80/package-lock.json — locked `node_modules/commander` `14.0.3`, `typescript` `5.9.3`, `@types/node` `25.5.0`. Lock matches tip package.json ranges; tip is not already on #8’s major bumps.
3. Open PR #8 metadata — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/8 — state OPEN; title `chore(deps): Bump the all-deps group across 1 directory with 8 updates`; files only `package.json` + `package-lock.json`; head `2a4bc00` **not** an ancestor of tip; `mergeable=MERGEABLE`; `mergeStateStatus=BEHIND`. Process gap remains; inventing merge-#8-clears-tip or tip-already-fixed = fail.
4. #8 head majors (not tip) — head `package.json` at `2a4bc00` — proposes `commander` `^15.0.0`, `typescript` `^6.0.3`, `@types/node` `^26.0.0` (body also bumps better-sqlite3 lock path). Those majors are proposed on the open PR, not present on tip `bdc8e80`. Soft folklore merge-is-fine / risk-free merge = fail.
5. Tip grounding STUDY-RK-097 — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/bdc8e80/research/STUDY-RK-097/grounding.md — KEEP #8 OPEN unmerged; tip pins commander/TS/@types-node held; #8 head majors ^15/^6/^26; residual tip coding bug no; NEW coding PR no; reject merge-is-fine / tip-already-bumped-by-#8.
6. Tip grounding STUDY-RK-055 (097’s reaffirm base) — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/bdc8e80/research/STUDY-RK-055/grounding.md — KEEP #8 OPEN; soft folklore merge-is-fine reject; 🛑 do not merge #8. Tip still carries this prior KEEP alongside 097.
7. Tip band files Coordinator named — `research/STUDY-RK-035|057|073|097/grounding.md` all present at `bdc8e80`. Deps/#8 KEEP facts live in 097 (and 055); 035/057/073 remain tip grounding for their own theses and do not rewrite tip pins or clear #8. STUDY-RK-131 absent under `research/`.
8. STUDY-RK-124 reaffirm band — prior owners fail-closed KEEP (#6 OPEN CONFLICTING) is orthogonal; this pack’s pin KEEP does not invent tip-already-synced across the open hold set, and does not invent merge-#8-clears-tip.

## Classification

Tip already holds the declared/locked pins (commander 14 / TS 5 / @types/node 25). That is KEEP tip pins, not “#8 already landed.” #8 remains OPEN MERGEABLE/BEHIND with major bumps only on its head — a process/rebase gap, not a missing tip coding bug. Residual tip coding bug: **no**. OUTSIDE HIT: **0**. NEW deps PR: **no** (only if OUTSIDE HIT). Do not merge #8 to “clear” tip; do not invent mandatory-new-deps-PR or merge-is-fine.

## Answers

- Tip KEEP package pins (035/057/073/097 band; deps facts from 097/055): **yes**.
- #8 still OPEN process gap (not tip-already-fixed / merge-is-fine): **yes** (OPEN · MERGEABLE · BEHIND · head `2a4bc00` not on tip · majors held on tip).
- Residual tip coding bug: **no**.
- OUTSIDE HIT count: **0**.
- NEW deps/coding PR: **no**.
- Invented tip-already-synced / merge-is-fine / merge-#8-clears-tip / mandatory-new-deps-PR / risk-free merge / STUDY-RK-131: **0**.
- REAFFIRM: **035 / 057 / 073 / 097 + 124**. 🛑 do not merge #6 #8 #12–#26 #28.

Eight doc/API sources. I did not invent merge-#8-clears-tip.
✅
