# STUDY-RK-124 Practitioner pack
Tip: `f828b4f` (= `origin/main`). Owner: Practitioner. Consumer: repo-knowledge. Q2: Does tip still KEEP fail-closed sync `--owners` defenses from 033/056/072/096, and is #6 still OPEN process gap (not tip-already-fixed)? Soft folklore invent tip-already-synced / invent silent-zero-is-success / invent merge-#6-clears-tip / invent mandatory-new-owners-PR / invent risk-free merge / invent STUDY-RK-131 = fail. No install. No git write. No merge. REAFFIRM 033/056/072/096 + 123. 🛑 do not merge #6 #8 #12–#26 #28.

## Eight cited findings

1. Tip `src/cli.ts` parseAsync.catch — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/f828b4f/src/cli.ts — F-BE-FT1: `program.parseAsync().catch(...)` logs the error and `process.exit(2)`. Async handler throws no longer exit 0 silently (pre-v1.0.6 class). Inventing silent-zero-is-success against tip = fail.
2. Tip empty-owners warn — same `src/cli.ts` sync action (cli-PH-004) — when config owners are empty and `--owners` was not passed, stderr warns that GitHub sync is skipped and points at `rk owners add` / `--owners`; local scan still proceeds. Empty owners is a signal, not a quiet success.
3. Tip `src/config.ts` undefined-strip — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/f828b4f/src/config.ts — FT-5: `resolveConfig` skips override fields whose value is `undefined`, so an unset CLI `--owners` cannot wipe file-supplied owners. Non-array `owners`/`localDirs` also fall back with stderr advisory.
4. Tip `sync_runs` observability — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/f828b4f/src/sync/index.ts (+ migration-010) — `fullSync` inserts a `sync_runs` row with `owners_json` at start and completes/finalizes it even on propagated error; empty-owners no longer means “no record of the attempt.”
5. Tip tests — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/f828b4f/test/cli-async.test.ts · https://github.com/mcp-tool-shop-org/repo-knowledge/blob/f828b4f/test/sync-owners-config.test.ts — async throw / bad path → non-zero exit; owners helpers + `resolveConfig` file fallback / explicit override / undefined-skip coverage. Tip defenses are tested on tip, not only proposed on #6.
6. Open PR #6 — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/6 — state OPEN; title “fix(sync): rk sync exited 0 while crashing — propagate failures (1.0.6)”; head `3b748d2` **not** an ancestor of tip; `mergeable=CONFLICTING`; `mergeStateStatus=DIRTY`; touches `src/cli.ts` / `src/config.ts` among others. Process gap remains; inventing merge-#6-clears-tip or tip-already-fixed-by-#6 = fail.
7. Prior grounding STUDY-RK-033 / 056 / 072 / 096 — tip paths under `research/STUDY-RK-033|056|072|096/grounding.md` at `f828b4f` — shared KEEP: tip fail-closed defenses; #6 OPEN unmerged process gap; residual tip coding bug no; NEW coding PR no; reject silent-zero-is-success and risk-free merge folklore.
8. STUDY-RK-123 reaffirm band — prior vanished KEEP (pruneVanished default false) is orthogonal; this pack’s owners fail-closed KEEP does not invent tip-already-synced across the whole open hold set. STUDY-RK-131 absent under `research/`.

## Classification

Tip already carries parseAsync→exit 2, empty-owners warn, config undefined-strip, sync_runs, and owners-config tests. That is KEEP tip defenses, not “#6 already landed.” #6 remains OPEN CONFLICTING/DIRTY against tip — a process/rebase gap, not proof of a missing tip coding bug. Residual tip coding bug: **no**. OUTSIDE HIT: **0**. NEW owners PR: **no** (only if OUTSIDE HIT). Do not merge #6 to “clear” tip; do not invent mandatory-new-owners-PR.

## Answers

- Tip KEEP fail-closed `--owners` defenses (033/056/072/096): **yes**.
- #6 still OPEN process gap (not tip-already-fixed): **yes** (OPEN · CONFLICTING · DIRTY · head not on tip).
- Residual tip coding bug: **no**.
- OUTSIDE HIT count: **0**.
- NEW owners/coding PR: **no**.
- Invented tip-already-synced / silent-zero-is-success / merge-#6-clears-tip / mandatory-new-owners-PR / risk-free merge / STUDY-RK-131: **0**.
- REAFFIRM: **033 / 056 / 072 / 096 + 123**. 🛑 do not merge #6 #8 #12–#26 #28.

Eight doc/API sources. I did not invent merge-#6-clears-tip.
✅
