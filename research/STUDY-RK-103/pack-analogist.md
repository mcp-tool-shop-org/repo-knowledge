STUDY-RK-103 Q3 Analogist — tip `e50aeeb` · one-page CI red/green board #6 #8 #12–#26 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent merge / invent green⇒merge / invent STUDY-RK-131 = fail · status inventory holds; green⇒merge fails-transfer.
prerequisite: tip `e50aeeb` matches `origin/main`. Job 103 = one-page CI board only; no merge. Open holds stay OPEN. Rollups from GitHub statusCheckRollup at board time; behind tip on all MERGEABLE rows. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Do not invent STUDY-RK-131.

One-page CI board (OPEN; mergedAt=null):

| PR | CI | mergeable / state | Note |
| --- | --- | --- | --- |
| #6 | GREEN | CONFLICTING / DIRTY | green ≠ mergeable |
| #8 | RED | MERGEABLE / BEHIND | Node22 FAILURE; Node20 CANCELLED |
| #12 #16 #18–#21 #23–#25 | NO_CHECKS | MERGEABLE / BEHIND | docs path; absent ≠ green |
| #13 #14 #15 #17 #22 #26 | GREEN | MERGEABLE / BEHIND | head green ≠ tip |

Counts: GREEN 7 · RED 1 · NO_CHECKS 9.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. SRE status board / golden signals — Google SRE Book — https://sre.google/sre-book/monitoring-distributed-systems/ — Hold-with-limit: a red/green board is authoritative when each row is named; inventing all-clear from partial greens fails. Limit: monitoring ≠ GitHub merge license; tip stays `e50aeeb`.

2. Required status checks prove the head, not tip — GitHub Docs — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — Hold-with-limit: green on #13/#14/#15/#17/#22/#26 proves those heads, not tip contents. Limit: branch-protection UI ≠ invent green⇒merge.

3. MERGEABLE + BEHIND ≠ merge-ready — GitHub MergeStateStatus — https://docs.github.com/en/graphql/reference/enums#mergestatestatus — Hold-with-limit: behind is debt, not clearance; #6 shows GREEN can coexist with DIRTY. Limit: GraphQL enum ≠ auto-merge.

4. Path-filtered / absent checks ≠ silent green — GitHub Actions paths — https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore — Hold-with-limit: NO_CHECKS on docs PRs is honest absence, not invent green. Limit: paths-ignore ≠ invent merge; REAFFIRM #26 residual.

5. Canary green ≠ fleet success — Google SRE release engineering — https://sre.google/sre-book/release-engineering/ — Hold-with-limit: open-PR green is canary for that branch only. Limit: release engineering ≠ invent green⇒merge for the board.

6. CLOSED Is Not MERGED (open ≠ tip) — https://netsujo.jp/en/blog/pull-request-closed-not-merged — Hold-with-limit: rows stay OPEN with mergedAt=null regardless of CI color. Limit: evidence ladder ≠ invent merge; 🛑 do not merge.

7. Soft folklore invent green⇒merge / invent merge / invent all-clear — Fail-transfer: GREEN+DIRTY #6 and other GREENs are still not on tip; invent green⇒merge fails. Soft folklore count: 0. Concrete residual: RED #8 + DIRTY #6 + nine NO_CHECKS + seven head-only GREENs.

8. Invent STUDY-RK-131 / treat CI board as merge job / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; job 103 = one-page CI board; open holds stay OPEN; NEW coding PR default no.

Soft folklore invent merge / invent green⇒merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-103/pack-analogist.md`.
🛑 do not merge #6 #8 #12–#26; status inventory holds; green⇒merge fails-transfer.

✅ · 🛑 · 🔧
