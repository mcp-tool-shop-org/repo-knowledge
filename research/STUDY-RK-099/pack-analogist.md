STUDY-RK-099 Q3 Analogist — tip `4735ef3` · TO-COORDINATOR tip+open board (like STUDY-RK-079) · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent merge open PRs / invent closed-as-merged / invent STUDY-RK-101 = fail.
prerequisite: tip `4735ef3` matches `origin/main` (“stamp STUDY-RK-098 patch sha”). Open board (all state=OPEN, mergedAt=null): #6 DIRTY; #8 BEHIND; #12–#26 BEHIND. Stamp-only land `research/STUDY-RK-099/` — tip SHA + open-PR enumeration as board authority, not coding. Prior STUDY-RK-079 used the same tip+open board shape. NEW coding PR default no. 🛑 do not merge. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Open inventory URLs (board rows, not tip SoR):
https://github.com/mcp-tool-shop-org/repo-knowledge/pull/6 · /8 · /12 · /13 · /14 · /15 · /16 · /17 · /18 · /19 · /20 · /21 · /22 · /23 · /24 · /25 · /26

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. SRE status board / golden signals — Google SRE Book — https://sre.google/sre-book/monitoring-distributed-systems/ — Hold-with-limit: a status board is authoritative only when it names the pinned tip and lists open debt rows; inventing “all clear” without OPEN rows is false success. Limit: monitoring chapter ≠ GitHub PR API; tip SHA `4735ef3` + #6/#8/#12–#26 remain the board.

2. CMDB known-unknowns / audit exceptions — Checklist CMDB Audit Protocol (ITIL) — https://wiki.en.it-processmaps.com/index.php/Checklist_CMDB_Audit_Protocol — Hold-with-limit: open PRs are known unknowns relative to tip; enumerating them is the audit, not closing them by claim. Limit: CMDB CI list ≠ invent merge; stamp-only board does not land coding.

3. CLOSED Is Not MERGED (evidence ladder) — https://netsujo.jp/en/blog/pull-request-closed-not-merged — Hold-with-limit: OPEN + mergedAt=null means not on tip; invent closed-as-merged fails. Limit: blog evidence ladder ≠ auto-merge; 🛑 do not merge #6 #8 #12–#26.

4. Stale open-PR inventory without tip pin — ghreplica commit — https://github.com/dutifuldev/ghreplica/commit/87f365dcf061297fd9eadd6fca05042429c8b8d7 — Hold-with-limit: a PR list without tip SHA is an incomplete board; this pack pins tip `4735ef3`. Limit: replica tooling ≠ repo-knowledge SoR; board without tip incomplete.

5. GitHub Projects best practices — https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects — Hold-with-limit: project boards track work; they do not rewrite git tip. Limit: Projects UI ≠ tip SHA + PR URLs; board authority stays tip+open enumeration.

6. Composition pin + readback — shipthenews / deployment-readback — https://shipthenews.com/microservices-release-composition-pin · https://github.com/yurukusa/cc-safe-setup/blob/main/examples/deployment-readback-gate.sh — Hold-with-limit: pin is tip SHA; open PRs are unpinned debt still on the board. Limit: readback script shape ≠ invent merge folklore; NEW coding PR default no.

7. Soft folklore invent merge open PRs / invent closed-as-merged — Fail-transfer: all target PRs remain OPEN with mergedAt=null; invent merge or closed-as-merged fails (REAFFIRM 079). Soft folklore count: 0.

8. Invent STUDY-RK-101 / omit tip SHA and call board done / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; missing tip SHA = not done; stamp-only; NEW coding PR default no.

Soft folklore invent merge open PRs / invent closed-as-merged: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-099/pack-analogist.md`.
🛑 do not merge #6 #8 #12–#26; tip+open board authority = `4735ef3` + OPEN rows; NEW coding PR default no.

✅ · 🛑 · 🔧
