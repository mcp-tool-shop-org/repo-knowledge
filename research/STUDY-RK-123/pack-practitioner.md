# STUDY-RK-123 Practitioner pack
Tip: `c38ca63` (= `origin/main`). Owner: Practitioner. Consumer: repo-knowledge. Q2: tip vanished-repo / pruneVanished inventory vs residual vanished gap · OUTSIDE HIT · NEW leftover/coding PR yes/no. REAFFIRM STUDY-RK-034 / STUDY-RK-071 + STUDY-RK-122. Soft folklore invent tip-already-synced / invent auto-archive-vanished-default / invent mandatory-new-vanished-PR / invent risk-free merge / invent STUDY-RK-131 = fail. No git write. No coding/docs PR. No merge.

## Eight cited findings

1. Tip CLI opt-in — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/src/cli.ts — `.option('--prune-vanished', …, false)` wires Commander default **false**; routine `rk sync` passes `pruneVanished: opts.pruneVanished` through without flipping archival on.
2. Tip sync orchestrator default — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/src/sync/index.ts — `pruneVanished: config.pruneVanished ?? false`; when false and `ghResult.vanished.length`, stderr warns and tells the operator to confirm then re-run with `--prune-vanished` (fully-scoped token). Detection surfaces; archival stays off.
3. Tip GitHub sync contract — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/src/sync/github.ts — docs + code: `pruneVanished` DEFAULT false; `result.vanished` always populated; archival only when flag set; empty owner-fetch is “no signal,” not mass-vanish; truncated listing skips prune archival; recorded-private rows stay unarchived even under the flag.
4. Tip config surface — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/src/config.ts — no `pruneVanished` config key; safe default lives in CLI/sync code paths (`false`), not a config-file auto-archive toggle. Inventing auto-archive-vanished-default as tip behavior = fail.
5. Tip tests `test/sync-404-archived.test.ts` — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/test/sync-404-archived.test.ts — covers opt-in archival, **empty owner-level fetch does not archive** (ambient failure), other-owner isolation, idempotent re-archive, private omit guard, case-insensitive slug, **DEFAULT sync detects but never archives**, truncated-listing prune suppression (SYNC-PH-04).
6. Prior grounding STUDY-RK-034 (2026-09-12) — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/research/STUDY-RK-034/grounding.md — KEEP pruneVanished default false; opt-in archive; empty-fetch≠archive; study land only; invented auto-archive-vanished-default / 404=safe-prune: 0.
7. Prior grounding STUDY-RK-071 (2026-09-12) — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/c38ca63/research/STUDY-RK-071/grounding.md — REAFFIRM 034; tip sync-404-archived tests hold; NEW test PR: no; invented auto-archive-vanished-default / mandatory new test PR: 0.
8. Open PR title scan (gh, tip day) — open set includes sync-adjacent #6 / #12 / #15 / #24 among the standing hold list, but none are a mandatory new vanished-archival coding PR required to close a tip gap; vanished KEEP shape is already on tip. Inventing mandatory-new-vanished-PR = fail. STUDY-RK-122 FTS KEEP (MATCH + ORDER BY rank, no mandatory bm25) stays orthogonal and reaffirmed as study land, not a vanished residual.

## Classification

Tip inventory matches the 034/071 KEEP: default detect+warn, `--prune-vanished` opt-in, empty-fetch≠archive, dedicated sync-404-archived tests present. That is not “tip-already-synced” folklore about unrelated open docs/test leftovers elsewhere; it is a measured vanished-surface completeness. Residual vanished coding/test gap: **no**. OUTSIDE HIT: **0**. NEW leftover/coding PR: **no**. Do not invent risk-free merge of the open hold set (#6 #8 #12–#26 #28). STUDY-RK-131 absent under `research/`.


## Residual note

Vanished-surface KEEP on tip does not clear unrelated open docs/test seats (#12–#28 band and sync failure #6). Those remain OPEN covers for other leftovers; they are not evidence of a missing vanished coding PR. Claiming tip-already-synced across the whole hold set would be folklore; claiming a mandatory new vanished PR while tip already defaults false and tests empty-fetch + default detect-only would also be folklore.

## Answers

- Tip inventory: **pruneVanished default false · `--prune-vanished` opt-in · empty-fetch ≠ archive · sync-404-archived tests present**.
- Residual vanished coding/test gap: **no**.
- OUTSIDE HIT count: **0**.
- NEW leftover/coding PR: **no**.
- Invented tip-already-synced / auto-archive-vanished-default / mandatory-new-vanished-PR / risk-free merge / STUDY-RK-131: **0**.
- REAFFIRM: **034 / 071 + 122**.

Eight doc/API sources. I did not invent auto-archive-vanished-default.
✅
