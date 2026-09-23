# STUDY-RK-117 Q2 — Practitioner pack

Tip `387e0eea5819d2669a5ec17b2e085a64557eeae4` (= `origin/main`, stamp STUDY-RK-116). Job: tip dedicated-test ABSENCE vs open heads **#13 / #14 / #15 / #22**. Soft folklore invent tip-already-synced / invent mandatory-new-leftover-PR / invent risk-free merge / invent STUDY-RK-131: **0**. No git write. No merge. No restack of #12/#16–#21/#24 (covered in 116).

## Findings (8)

1. Tip equals origin/main | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `/workspace/studio/repo-knowledge` @ `387e0eea5819d2669a5ec17b2e085a64557eeae4` | Finding: `HEAD` == `origin/main` == tip. Tip gate passes.

2. Tip `test/` inventory (no `src/**/*.test.ts`) | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `test/*.test.ts` (38 files on tip) | Finding: this consumer keeps vitest under `test/`, not `src/**/*.test.ts`. Dedicated suite names below are therefore `test/<name>.test.ts`. Indirect coverage exists (`audit-import`, `health-commands`, `sync-404-archived`, dogfood sync suites) but is **not** the dedicated files named by #13/#14/#15/#22.

3. Tip ABSENT errors/audit dedicated vs #13 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `test/errors.test.ts` · `test/audit-controls.test.ts` · `test/audit-queries.test.ts` all **ABSENT** · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · head `ce6743a` · files: those three only | Finding: tip still lacks the dedicated trio; #13 head PRESENTs them (70 / 135 / 182 lines). Residual ≠ tip-already-synced. **INSIDE #13**. NEW leftover/coding PR: **no**.

4. Tip ABSENT doctor/feed/table dedicated vs #14 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `test/doctor.test.ts` · `test/feed.test.ts` · `test/table.test.ts` all **ABSENT**; tip already has `test/health-commands.test.ts` · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/14 · head `8fee954` · files: `doctor`/`feed`/`table`/`health-commands` | Finding: tip…#14 adds three new dedicated files (+123/+194/+153) and a small `health-commands` tweak (+7/−1). Dedicated doctor/feed/table residual **still ABSENT on tip**. **INSIDE #14**. NEW: **no**.

5. Tip ABSENT github/dogfood-suggest dedicated vs #15 | org: mcp-tool-shop-org | date: 2026-09-23 | tip paths: `test/github.test.ts` · `test/dogfood-suggest.test.ts` **ABSENT** · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/15 · head `e75f703` · files: those two | Finding: tip lacks dedicated suites; #15 head PRESENTs them (482 / 260 lines). Tip still has indirect dogfood sync / sync-404 coverage only. **INSIDE #15**. NEW: **no**.

6. Tip ABSENT note --delete CLI dedicated vs #22 | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: `test/cli-note-delete.test.ts` **ABSENT** · PR https://github.com/mcp-tool-shop-org/repo-knowledge/pull/22 · head `863e7fd` · files: `test/cli-note-delete.test.ts` | Finding: tip ABSENT; #22 head PRESENT (144 lines). **INSIDE #22**. NEW: **no**.

7. Presence matrix (tip N → covering head Y) | org: mcp-tool-shop-org | date: 2026-09-23 | tip path: presence matrix over dedicated file set · PR heads `ce6743a`/`8fee954`/`e75f703`/`863e7fd` | Finding: nine dedicated targets ABSENT on tip and PRESENT only on their owning head (`errors`/`audit-*`→#13; `doctor`/`feed`/`table`→#14; `github`/`dogfood-suggest`→#15; `cli-note-delete`→#22). **OUTSIDE HIT count: 0.**

8. Hold set + REAFFIRM (no merge invent) | org: mcp-tool-shop-org | date: 2026-09-23 | URL: open PR API #6 #8 #12–#28 | Finding: #13/#14/#15/#22 stay OPEN. REAFFIRM 114/115/116 + 022/024/058/059/112/113. Do not restack #12/#16–#21/#24. 🛑 do not merge #6 #8 #12–#28. No STUDY-RK-131. No risk-free merge claim.

## Answer

Named dedicated suites remain **ABSENT on tip `387e0ee`** and **PRESENT on covering heads #13/#14/#15/#22**. **OUTSIDE HIT: 0.** **NEW leftover/coding PR: no.** Residuals remain ABSENT on tip (≠ tip-already-synced). KEEP holds OPEN. Default study land.

Eight doc/API sources. I did not invent What.

✅
