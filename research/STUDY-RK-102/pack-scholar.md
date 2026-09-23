STUDY-RK-102 Q1 (Scholar) — tip `d98ba99`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL, one-sentence finding each. Papers/arXiv/DOI only. No git write. No execute. No implications as final (Verifier). Soft folklore invent merge / invent STUDY-RK-131 = fail. Stage pack to `/workspace/studio/outbox-STUDY-RK-102/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Consumer repo-knowledge. Tip `d98ba99` (post-101). Job: conflict graph of open PRs #12–#26 vs tip — which collide on usage.md / handbook / server.ts. One page. No merge. Open #6 #8 #12–#26 stay OPEN.
owner: Scholar
fallback: Fewer than 6 DOI/arXiv → 🔧. Missing four fields → 🛑 Coordinator.

Question: What does peer-reviewed work say about detecting and documenting file-level merge conflicts / overlapping edits across parallel open pull requests (especially shared docs and core modules) without merging them?

Answer: Literature favors early awareness of overlapping edits across concurrent branches and open PRs via file/region overlap graphs, conflict predictors, and fine-grained awareness tools — not inventing a merge. Speculative merge is one research technique; documenting the open-PR collision graph without landing merges matches ConE-style concurrent-edit detection. Document the collision set; keep PRs open. Eight papers, all with DOI or arXiv. Invented invent merge / invent STUDY-RK-131: 0. Word count ~530.

Conflict graph (tip `d98ba99`; open #12–#26 on focus paths; #6 CONFLICTING and #8 MERGEABLE stay OPEN; no merge):

| Focus file | Open PRs touching it |
|---|---|
| `handbook/usage.md` | #12, #17, #18, #25 |
| `handbook/mcp-server.md` | #12, #16, #17, #18 |
| `handbook/beginners.md` | #17, #19, #24 |
| `handbook/index.md` | #12, #16 |
| `handbook/getting-started.md` | #19, #24 |
| `handbook/operations.md` | #19, #23 |
| `src/mcp/server.ts` | #17 only (among #12–#26) |

Hubs: usage.md (4), mcp-server.md (4), beginners.md (3). CHANGELOG is also multi-touched (#17/#18/#19/#20/#21/#23/#24) but outside the focus table. Test-only #13/#14/#15/#22 miss these docs/core paths. Document overlaps; do not invent merge. Open #6 #8 #12–#26 stay OPEN. No invent STUDY-RK-131.

1. ConE: A Concurrent Edit Detection Tool for Large Scale Software Development — Maddila, Nagappan, Bird, Gousios, van Deursen — 2021 — https://arxiv.org/abs/2101.06542 — ConE detects overlapping concurrent edits across active PRs without speculative merge of every pair at enterprise scale.

2. Predicting Merge Conflicts in Collaborative Software Development — Owhadi-Kareshk, Nadi, Rubin — 2019 — https://arxiv.org/abs/1907.06274 — Models predict textual merge conflict risk from concurrent change features before a merge is performed.

3. BDCI: Behavioral Driven Conflict Identification — Pastore, Mariani, Micucci — 2017 — https://arxiv.org/abs/1708.01650 — Behavioral conflict identification complements speculative merge by surfacing higher-order interference without merge-then-test alone.

4. Automatic Detection and Resolution of Software Merge Conflicts: Are We There Yet? — Shen, Xiao, Meng, He — 2021 — https://arxiv.org/abs/2102.11307 — Textual overlap is only one conflict class; silent semantic integration still needs detection beyond merge-then-CI.

5. Alleviating Merge Conflicts with Fine-grained Visual Awareness — Levin, Yehudai — 2015 — https://arxiv.org/abs/1508.01872 — Fine-grained near-real-time visual awareness of overlapping semantic elements supports documenting collisions before merge.

6. An empirical investigation into merge conflicts and their effect on software quality — Brindescu, Ahmed, Jensen, Sarma — 2019/2020 — https://doi.org/10.1007/s10664-019-09735-4 — About one in five merges conflict; conflict-touched code is more bug-prone, motivating pre-merge overlap documentation.

7. The life-cycle of merge conflicts: processes, barriers, and strategies — Nelson, Brindescu, McKee, Sarma, Dig — 2019 — https://doi.org/10.1007/s10664-018-9674-x — Developers monitor and defer conflicts as a lifecycle; awareness and process structure overlaps without inventing an early merge.

8. Understanding semi-structured merge conflict characteristics in open-source Java projects — Accioly, Borba, Cavalcanti — 2018 — https://doi.org/10.1007/s10664-017-9586-1 — Most conflicts concentrate on same or nearby method regions, so file- and region-level overlap graphs are the natural inventory unit.

Read-only tip check: HEAD `d98ba99` · open #6 CONFLICTING · #8 MERGEABLE · #12–#26 OPEN · hubs usage.md / mcp-server.md · invent merge: no · invent STUDY-RK-131: no. No git write. No execute. No implications as final.

Soft folklore fail checks: invent merge = 0; invent STUDY-RK-131 = 0.

✅
