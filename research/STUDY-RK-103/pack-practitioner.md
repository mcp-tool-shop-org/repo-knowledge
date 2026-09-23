# STUDY-RK-103 Q2 · Practitioner pack
Tip: `e50aeeb` · clone `/workspace/studio/repo-knowledge` · gh as mcp-tool-shop · GH checks API + tip · no invent merge / invent green⇒merge / invent STUDY-RK-131 · 🛑 do not merge #6 #8 #12–#26

Seven doc/API sources. I did not invent merge clearance, green⇒merge, or STUDY-RK-131.

## Answer
At tip `e50aeeb` (`e50aeeb552672170cfea63c3afb107d5a8024514` = origin/main), CI on OPEN hold **heads** is mixed (`gh pr view --json statusCheckRollup,mergeable` + `gh pr checks`). #6 CONFLICTING with head green — green≠merge. #8 FAILURE. Six SUCCESS. Nine **none**. Pending 0. NEW coding PR: **no**. 🛑 do not merge.

### Red/green table (PR head vs tip `e50aeeb`)

| PR | merge / mss | head | CI |
|----|-------------|------|-----|
| #6 | CONFLICTING / DIRTY | `3b748d2` | 🟠 conflicting (head build-and-test pass) |
| #8 | MERGEABLE / BEHIND | `2a4bc00` | 🔴 failure (build-and-test 20+22) |
| #13 | MERGEABLE / BEHIND | `ce6743a` | 🟢 success |
| #14 | MERGEABLE / BEHIND | `8fee954` | 🟢 success |
| #15 | MERGEABLE / BEHIND | `e75f703` | 🟢 success |
| #17 | MERGEABLE / BEHIND | `99834db` | 🟢 success |
| #22 | MERGEABLE / BEHIND | `863e7fd` | 🟢 success |
| #26 | MERGEABLE / BEHIND | `b3911e4` | 🟢 success (pages build pass; deploy skipped) |
| #12 | MERGEABLE / BEHIND | `09bb4b4` | none |
| #16 | MERGEABLE / BEHIND | `74bfd4a` | none |
| #18 | MERGEABLE / BEHIND | `75503ca` | none |
| #19 | MERGEABLE / BEHIND | `eaa81cc` | none |
| #20 | MERGEABLE / BEHIND | `7dbc12d` | none |
| #21 | MERGEABLE / BEHIND | `ab69021` | none |
| #23 | MERGEABLE / BEHIND | `d56c5ed` | none |
| #24 | MERGEABLE / BEHIND | `dced9f9` | none |
| #25 | MERGEABLE / BEHIND | `06490f4` | none |

Counts: conflicting/1 · failure/1 · success/6 · none/9 · pending/0. None = empty rollup / “no checks reported.”

## Findings (8)

1. **Tip** — Title: stamp STUDY-RK-102. Org: mcp-tool-shop-org/repo-knowledge. Date: 2026-09-23. Path: tip `e50aeeb552672170cfea63c3afb107d5a8024514`. Finding: Tip equals origin/main (`research: stamp STUDY-RK-102 handoff land line`).

2. **ci.yml path filters** — Title: CI workflow filters. Org: local tip. Date: tip `e50aeeb`. Path: `.github/workflows/ci.yml`. Finding: `pull_request` paths gate src/test/package/tsconfig/workflows/site package — docs-only PRs can show **none**.

3. **#6** — Title: sync fail-closed. Org: mcp-tool-shop-org. Date: live API. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/6. Finding: CONFLICTING/DIRTY with head SUCCESS — invent green⇒merge fails.

4. **#8** — Title: all-deps bump. Org: mcp-tool-shop-org. Date: live API. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/8. Finding: Sole FAILURE — build-and-test (20) and (22) fail.

5. **Vitest greens** — Title: STUDY-RK-022/023/024/035. Org: mcp-tool-shop-org. Date: live API. URLs: pulls/13,14,15,22. Finding: Heads SUCCESS on build-and-test 20/22; still BEHIND — success≠merge.

6. **Docs none** — Title: handbook/docs without checks. Org: mcp-tool-shop-org. Date: 2026-09-23. URLs: pulls/12,16,18–21,23–25. Finding: Nine empty rollups — class **none**, not invent-green.

7. **#26** — Title: site build on PRs. Org: mcp-tool-shop-org. Date: live API. URL: https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26. Finding: build-and-test + pages `build` SUCCESS, deploy SKIPPED; BEHIND; 🛑 hold.

8. **Anti-invent** — Title: hold set. Org: GH + tip. Date: 2026-09-23. Paths: KNOWLEDGE-CONTRACT.md, AUDIT-CONTRACT.md. Finding: Inventory only; invent merge / green⇒merge / STUDY-RK-131 fails. NEW coding PR: no.

## Four fields
| Field | Value |
|-------|--------|
| tip SHA | `e50aeeb552672170cfea63c3afb107d5a8024514` |
| CI classes | conflicting/1 · failure/1 · success/6 · none/9 · pending/0 |
| red / conflict | #8 failure; #6 conflicting (head green ≠ merge) |
| NEW coding PR | no |

✅ · 🛑 · 🔧
