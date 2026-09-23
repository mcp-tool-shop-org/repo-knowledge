STUDY-RK-102 Q3 Analogist — tip `d98ba99` · one-page conflict graph #12–#26 vs tip on usage.md / handbook / server.ts · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent merge / invent STUDY-RK-131 = fail · “list collisions” holds; “merge to resolve” fails-transfer.
prerequisite: tip `d98ba99` matches `origin/main`. Job 102 = inventory conflict graph only; no merge. Open #6 #8 #12–#26 stay OPEN. Shared hot paths on tip: `site/src/content/docs/handbook/usage.md`, handbook/* (index, mcp-server, beginners, getting-started, operations, security), `src/mcp/server.ts`. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Do not invent STUDY-RK-131. Missing four fields → 🛑 Coordinator.

One-page conflict graph (OPEN PRs touching target paths; all mergedAt=null):

| Shared path (tip) | Colliding OPEN PRs |
| --- | --- |
| `handbook/usage.md` | #12 · #17 · #18 · #25 |
| `handbook/mcp-server.md` | #12 · #16 · #17 · #18 |
| `handbook/index.md` | #12 · #16 |
| `handbook/beginners.md` | #17 · #19 · #24 |
| `handbook/getting-started.md` | #19 · #24 |
| `handbook/operations.md` | #19 · #23 |
| `src/mcp/server.ts` (+ `src/cli.ts`) | #17 |
| No hit on usage/handbook/server.ts | #13 · #14 · #15 · #20 · #21 · #22 · #26 (still OPEN holds; out of this hub graph) |

Hub density: usage.md (4) · mcp-server.md (4) · beginners (3) · index/getting-started/operations (2) · server.ts (1 coding + docs PR #17).

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Resource-contention / lock graph inventory — Google SRE Book (managing overload) — https://sre.google/sre-book/handling-overload/ — Hold-with-limit: naming shared resources under concurrent claim is the first control; listing hubs is inventory, not clearance. Limit: load shedding ≠ invent merge of #12/#16/#17/#18/#25.

2. Merge-queue / serial landing for conflicting paths — GitHub merge queue — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue — Hold-with-limit: queues serialize conflicted heads; a graph explains why serial review is needed. Limit: queue docs ≠ authority to invent merge-to-resolve now; 🛑 do not merge.

3. Git rename / content conflict detection — Git merge conflicts — https://git-scm.com/docs/git-merge#_how_conflicts_are_presented — Hold-with-limit: overlapping edits on same path are expected to conflict; multi-PR hubs on usage.md are the analog of simultaneous edits. Limit: git conflict markers ≠ “merge PRs to fix tip.”

4. Dependency / call-graph fan-in hotspots — LLVM CallGraph — https://llvm.org/docs/ProgrammersManual.html#the-callgraph-and-friends — Hold-with-limit: high fan-in nodes (usage.md, mcp-server.md) are hotspots where many changes collide. Limit: compiler IR graph ≠ docs PR merge license.

5. CMDB CI shared-dependency audit — Checklist CMDB Audit Protocol (ITIL) — https://wiki.en.it-processmaps.com/index.php/Checklist_CMDB_Audit_Protocol — Hold-with-limit: recording which CIs share a dependency is audit; it does not auto-remediate. Limit: CMDB list ≠ tip SoR after invent merge.

6. Stacked / overlapping open-PR debt (open ≠ tip) — CLOSED Is Not MERGED — https://netsujo.jp/en/blog/pull-request-closed-not-merged — Hold-with-limit: enumerating OPEN collisions is board honesty; mergedAt=null means not on tip `d98ba99`. Limit: evidence ladder ≠ invent merge-to-resolve.

7. Soft folklore invent merge / “list collisions ⇒ merge to resolve” / invent all-clear — Fail-transfer: collision graph is inventory only; inventing merge of hub PRs (#12/#16/#17/#18/#19/#23/#24/#25) or treating graph as tip clearance fails. Soft folklore count: 0.

8. Invent STUDY-RK-131 / treat graph as coding job / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; job 102 = one-page conflict graph; open holds stay OPEN; NEW coding PR default no.

Soft folklore invent merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-102/pack-analogist.md`.
🛑 do not merge #12–#26 (or #6 #8); list collisions holds; merge-to-resolve fails-transfer.

✅ · 🛑 · 🔧
