STUDY-RK-093 Q3 Analogist — tip `0e9f632` · REAFFIRM STUDY-RK-037 / STUDY-RK-066 · #23 OPEN · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · keep #23 OPEN while tip CLI already has backup/restore and handbook still documents `cp`; invent tip-already-synced / backup=publish / risk-free merge #23 / mandatory-new-test-PR / STUDY-RK-101 = fail.
prerequisite: tip `0e9f632` matches `origin/main`. #23 OPEN (“STUDY-RK-037 handbook ops rk backup/restore”) — docs only: `site/src/content/docs/handbook/operations.md` + CHANGELOG; replaces primary `cp` with `rk backup` / `rk restore`. Tip CLI already implements `backup` (`VACUUM INTO`) and confirm-gated `restore` in `src/cli.ts`. Tip handbook surfaces still teach `cp data/knowledge.db …` (`HANDBOOK.md`, tip `operations.md`). Tip README already documents CLI backup/restore. Tip CLI authority; docs drift ≠ coding gap; NEW test PR: no. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. SQLite VACUUM INTO as live snapshot primitive — https://sqlite.org/lang_vacuum.html — Hold-with-limit: tip `rk backup` matches vendor INTO snapshot (consistent copy; destination must not pre-exist). Limit: VACUUM INTO ≠ npm/registry publish; invent backup=publish fails.

2. Online Backup API as sibling snapshot path, still not publish — https://sqlite.org/backup.html — Hold-with-limit: Backup API and VACUUM INTO are both local snapshot tools; neither ships packages. Limit: C API incremental copy ≠ `rk publish-state`; same backup≠publish split.

3. Runbook / handbook lag vs CLI system of record — PagerDuty runbook vs playbook — https://www.pagerduty.com/resources/automation/learn/what-is-a-runbook/ — Hold-with-limit: operator prose can lag the executable how-to; tip CLI commands are SoR, handbook `cp` is stale narrative. Limit: incident SaaS ≠ rk; invent tip-already-synced because README is current fails while handbook still says `cp`.

4. Compiler / LangRef docs lag implementation — LLVM Discourse inconsistency — https://discourse.llvm.org/t/langref-implementation-inconsistency-what-is-the-intended-constraint-on-function-return-types/26848 — Hold-with-limit: when narrative and implementation disagree, sync docs to code; open docs PR ≠ tip already synced. Limit: type-system debate ≠ DB ops; same docs-lag-code pattern for #23.

5. Docs-only contributions need content review, not new product test suites — GitHub Docs contributing — https://docs.github.com/en/contributing/collaborating-on-github-docs/about-contributing-to-github-docs — Hold-with-limit: handbook fix PRs are reviewable without inventing CLI negative-test PRs; NEW test PR: no (REAFFIRM 066). Limit: github/docs CI ≠ rk; still rejects mandatory-new-test-PR folklore.

6. Staged verify-then-cutover restore ≠ publish — etcd recovery — https://etcd.io/docs/latest/op-guide/recovery/ — Hold-with-limit: tip restore probes schema then confirm-gates atomic swap; recovery is local cutover, not registry publish. Limit: etcd member recovery ≠ SQLite file swap; rejects backup=publish.

7. Soft folklore invent tip-already-synced / backup=publish / risk-free merge #23 / mandatory-new-test-PR — Fail-transfer: tip handbook still documents `cp`; tip CLI already has backup/restore; #23 is docs debt not tip clearance (REAFFIRM 066). Soft folklore: 0.

8. Invent STUDY-RK-101 / treat tip CLI backup as coding gap because handbook says `cp` / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; tip CLI authority holds; docs drift ≠ coding gap; tip beats PR heads.

Soft folklore tip-already-synced / backup=publish / risk-free merge #23 / mandatory-new-test-PR: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-093/pack-analogist.md`.
🛑 do not invent merge of #23; tip CLI authority; docs drift ≠ coding gap; NEW test PR: no.

✅ · 🛑 · 🔧
