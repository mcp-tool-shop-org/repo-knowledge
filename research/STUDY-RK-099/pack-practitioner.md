# STUDY-RK-099 Q2 · Practitioner pack
Tip: `4735ef3` · clone `/workspace/studio/repo-knowledge` · gh as mcp-tool-shop · TO-COORDINATOR tip SHA + open-PR URL list · vendor docs/GH/API/local tip only · no invent merge clearance / invent closed-as-merged / invent STUDY-RK-101

Seven doc/API sources. I did not invent merge clearance, closed-as-merged, or STUDY-RK-101.

## Answer
At tip `4735ef3`, exact tip SHA is `4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f` (matches `origin/main`). Tip commit URL: `https://github.com/mcp-tool-shop-org/repo-knowledge/commit/4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f`. Open PR hold set is **#6, #8, #12–#26** (17 OPEN), each still OPEN with URLs and mergeable states below. `research/STUDY-RK-098/` is present and COMPLETE_5. NEW coding PR: **no**. 🛑 do not merge. Do not invent STUDY-RK-101.

## Findings (8)

1. **Tip SHA vs origin/main (local tip)** — After `git fetch origin`, `git rev-parse HEAD` and `git rev-parse origin/main` both return `4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f`. `git merge-base --is-ancestor 4735ef3 HEAD` succeeds. Subject line: `research: stamp STUDY-RK-098 patch sha` (author mcp-tool-shop). Prerequisite tip matches `origin/main` exactly; short tip `4735ef3` is that commit’s prefix.

2. **Tip commit URL (GitHub)** — `git remote get-url origin` is `https://github.com/mcp-tool-shop-org/repo-knowledge.git`. Canonical commit URL for the full SHA is `https://github.com/mcp-tool-shop-org/repo-knowledge/commit/4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f`. That URL is the TO-COORDINATOR tip commit pointer for this job.

3. **STUDY-RK-098 five-file (local tip)** — `research/STUDY-RK-098/` exists on tip. Exact files: `grounding.md`, `handoff.md`, `pack-analogist.md`, `pack-practitioner.md`, `pack-scholar.md`. Set equality check against the COMPLETE_5 expected set: missing empty, extra empty. Stamp land from STUDY-RK-098 is on tip as briefed.

4. **Open set cardinality (GitHub API)** — `gh pr list --state open --json number,...` returns exactly numbers 6, 8, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 — seventeen PRs. Matches brief open set `#6 #8 #12–#26`. API state is open for each; inventing closed-as-merged for any of them fails the soft gate.

5. **#6 mergeable (GitHub API)** — PR #6 URL `https://github.com/mcp-tool-shop-org/repo-knowledge/pull/6`, title `fix(sync): rk sync exited 0 while crashing — propagate failures (1.0.6)`, mergeable **CONFLICTING**, mergeStateStatus **DIRTY**. Matches expected CONFLICTING/DIRTY. 🛑 do not merge; inventing merge clearance for #6 fails.

6. **#8 mergeable (GitHub API)** — PR #8 URL `https://github.com/mcp-tool-shop-org/repo-knowledge/pull/8`, title `chore(deps): Bump the all-deps group across 1 directory with 8 updates`, mergeable **MERGEABLE**, mergeStateStatus **BEHIND**. KEEP OPEN as deps hold; NEW deps or coding PR: no.

7. **#12–#26 hold URLs + states (GitHub API)** — Fifteen study/docs/ci PRs, each MERGEABLE / BEHIND with URLs:
   #12 https://github.com/mcp-tool-shop-org/repo-knowledge/pull/12 · #13 …/pull/13 · #14 …/pull/14 · #15 …/pull/15 · #16 …/pull/16 · #17 …/pull/17 · #18 …/pull/18 · #19 …/pull/19 · #20 …/pull/20 · #21 …/pull/21 · #22 …/pull/22 · #23 …/pull/23 · #24 …/pull/24 · #25 …/pull/25 · #26 …/pull/26 (full host `https://github.com/mcp-tool-shop-org/repo-knowledge`). Typical MERGEABLE/BEHIND as briefed. 🛑 do not merge any of the seventeen holds.

8. **NEW coding PR + anti-invent (brief)** — This Q2 is tip SHA + open-PR URL/status inventory for Coordinator only. Tip already stamps STUDY-RK-098; no tip coding gap is named by the question. **NEW coding PR: no.** Do not invent merge clearance for #6 or any hold, do not invent closed-as-merged, do not invent STUDY-RK-101.

## TO-COORDINATOR fields
| Field | Value |
|-------|--------|
| tip SHA | `4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f` |
| tip commit URL | https://github.com/mcp-tool-shop-org/repo-knowledge/commit/4735ef3fc1e54d2640649ba7b6b319f9f1d1b94f |
| open PR hold set | #6 #8 #12–#26 (17); #6 CONFLICTING/DIRTY; #8+#12–#26 MERGEABLE/BEHIND; URLs above |
| research/STUDY-RK-098/ COMPLETE_5 | YES |
| NEW coding PR | no |

✅ · 🛑 · 🔧
