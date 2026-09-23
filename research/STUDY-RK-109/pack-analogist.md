STUDY-RK-109 Q3 Analogist — tip `8299e8b` · backup/restore ON MAIN vs open #13/#14 · REAFFIRM 037/066/#23 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail. Prefer open/docs URLs. (1–6 Hold-with-limit; 7–8 Fail-transfer.)
prerequisite: tip `8299e8b` matches `origin/main`. Job: backup/restore coverage ON MAIN (CLI-PR-001 in `test/cli-publish.test.ts`; no required `test/backup.test.ts` filename) vs open #13/#14 that do not own backup. NEW coding PR only if residual; do not restack #13/#14. REAFFIRM 037/066/#23 context — do not merge #23. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Missing four fields → 🛑 Coordinator.

Fact check at tip `8299e8b`:
- Settled on tip: `describe('CLI-PR-001: backup / restore (cli.ts)')` in `test/cli-publish.test.ts` (round-trip + schema_version refuse). `test/backup.test.ts` ABSENT — filename absence ≠ coverage gap.
- #13/#14 OPEN (mergedAt=null): dedicated vitest for errors/audit and doctor/feed/table/health — backup/restore path ownership = 0. Do not restack.
- #23 OPEN: handbook `operations.md` + CHANGELOG docs only (REAFFIRM 037/066) — docs sync ≠ invent tip-lacks-backup-coverage; 🛑 do not merge #23 as test clearance.
- NEW coding PR: no for parallel dedicated backup suite while CLI-PR-001 lives on tip (residual not proven for a new suite file).

Six analogs. Three hold; three do not transfer.

1. Embedded suite is still SoR — Vitest filtering / describe blocks — https://vitest.dev/guide/filtering — Hold-with-limit: settled coverage is the landed describe, not a required filename; CLI-PR-001 in `cli-publish.test.ts` is tip SoR. Limit: Vitest filter docs ≠ invent mandatory `test/backup.test.ts`.

2. Default-branch checks prove tip tree — GitHub about status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — Hold-with-limit: green tip runs include CLI-PR-001 without open #13/#14 heads. Limit: status UI ≠ invent restack.

3. Lit discovers landed tests, not preferred filenames — LLVM Testing Guide — https://llvm.org/docs/TestingGuide.html — Hold-with-limit: discovery counts what is in the tip tree; invent tip-lacks-backup-coverage fails while CLI-PR-001 exists. Limit: LLVM lit ≠ invent parallel backup suite PR.

4. Orthogonal open vitest PRs ≠ backup gap — Gauntlet / why tests miss bugs — https://gauntletci.com/articles/why-tests-miss-bugs — Hold-with-limit: #13/#14 correctly omit backup; ABSENT ownership is scope, not tip debt. Limit: general CI essay ≠ invent risk-free merge.

5. Docs playbook PR ≠ test SoR — Diátaxis / how-to vs reference — https://diataxis.fr/ — Hold-with-limit: #23 updates handbook ops prose toward `rk backup`/`rk restore`; tip CLI-PR-001 already protects the CLI. Limit: Diátaxis ≠ invent merge #23 as backup-test clearance (REAFFIRM 037/066).

6. Do not restack settled coverage onto unrelated PRs — GitHub Docs about pull requests — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests — Hold-with-limit: each PR owns its file set; restacking backup into #13/#14 widens unrelated reviews. Limit: PR mechanics ≠ invent tip gap from missing filename.

7. Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge — Fail-transfer: CLI-PR-001 is ON MAIN; filename `backup.test.ts` is not required; #13/#14/#23 stay OPEN for their own scopes. Soft folklore: 0.

8. Invent STUDY-RK-131 / treat open #13/#14 as backup authority / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; tip beats PR heads; NEW coding PR only if residual (none for parallel suite).

Soft folklore invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-109/pack-analogist.md`.
🛑 do not merge #6 #8 #12–#28 (incl. #23); tip-embedded backup/restore SoR holds; invent-gap / invent-restack / invent-merge fails-transfer.

✅ · 🛑 · 🔧
