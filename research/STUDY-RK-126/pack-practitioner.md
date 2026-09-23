# STUDY-RK-126 Practitioner pack
Tip: `2d39cf6` (= `origin/main`). Owner: Practitioner. Consumer: repo-knowledge. Q2: On tip `2d39cf6`, what tip vs #17 evidence still requires KEEP empty getRelated UX honesty debt OPEN with no duplicate coding PR? Soft folklore invent empty=success / invent relatedness / invent tip-already-fixed / invent risk-free merge #17 / invent STUDY-RK-131 = fail. No install. No git write. No merge. No new coding PR. REAFFIRM 026/060/074/088. 🛑 do not merge #6 #8 #12–#26 #28 (includes #17/#18).

## Eight cited findings

1. Tip `rk related` human sentinel — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/2d39cf6/src/cli.ts — when `getRelated` returns no rows, text path prints `No relationships recorded for: <slug>` and returns; `--json` serializes the rows directly so empty → `[]`. Sentinel states incompleteness; it does not invent relatedness.
2. Tip MCP `related_repos` empty shape — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/2d39cf6/src/mcp/server.ts — tool returns JSON `{ slug, relationships: <rows> }`; empty getRelated yields `relationships: []`. Honest empty MCP payload; still not the `rk show` fix.
3. Tip `rk show` / `formatRepo` silent omit — same `src/cli.ts` `formatRepo` — Relationships section gated on `repo.relationships?.length`; when empty the section is omitted entirely. Residual honesty debt vs the dedicated `related` sentinel.
4. Tip test gap — tip MISS `test/related-empty.test.ts` (no `test/related*.ts` on tip). Empty-related CLI/MCP honesty lacks a dedicated tip test file.
5. Open PR #17 — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/17 — state OPEN; title `STUDY-RK-026 empty getRelated UX honesty`; head `99834db` **not** on tip; mergeable MERGEABLE; mergeStateStatus BEHIND; files include `src/cli.ts`, `src/mcp/server.ts`, `test/related-empty.test.ts`, handbook usage/mcp/beginners, CHANGELOG. Head holds always-print Relationships + empty tests. Inventing tip-already-fixed or risk-free merge #17 = fail.
6. Open PR #18 — https://github.com/mcp-tool-shop-org/repo-knowledge/pull/18 — state OPEN; title publish-state docs; head `75503ca` not on tip; files docs/README/handbook/CHANGELOG only. Docs overlap with #17 handbook paths; not the coding fix for empty Relationships. KEEP OPEN; not a substitute merge.
7. Tip inventory + prior grounding — `/workspace/studio/outbox-STUDY-RK-126/tip-inventory.md` · tip `research/STUDY-RK-026|060|074|088/grounding.md` — shared KEEP: empty getRelated UX honesty debt while #17 OPEN; tip MISS related-empty test; formatRepo length-gate; NEW duplicate coding PR **no**; reject empty=success / invent relatedness / tip-already-fixed.
8. STUDY-RK-131 absent — no `research/STUDY-RK-131/` on tip. Do not invent STUDY-RK-131.

## Classification

Tip already has related sentinel + JSON `[]` + MCP `{ relationships: [] }`, but still silently omits empty Relationships in `formatRepo` / `rk show`, and still lacks `test/related-empty.test.ts`. That residual tip debt is exactly what OPEN #17 carries. Residual tip show/omit debt: **yes (held by #17, not tip-fixed)**. OUTSIDE HIT requiring a *new* coding PR: **0**. NEW duplicate coding PR: **no**. KEEP #17/#18 OPEN.

## Answers

- Tip vs #17 evidence requiring KEEP empty getRelated UX honesty debt OPEN: tip `formatRepo` length-gate silent omit + tip MISS `test/related-empty.test.ts` + #17 OPEN head `99834db` holds fix/tests not on tip; tip `related` sentinel / `--json []` and MCP empty shape do not clear the show/omit debt.
- KEEP #17/#18 OPEN: **yes**.
- NEW duplicate coding PR: **no**.
- Invented empty=success / relatedness / tip-already-fixed / risk-free merge #17 / STUDY-RK-131: **0**.
- REAFFIRM: **026 / 060 / 074 / 088**. 🛑 do not merge #6 #8 #12–#26 #28.

Eight doc/API sources. I did not invent tip-already-fixed.
✅
