STUDY-RK-107 Q3 Analogist — tip `b24994b` · FTS dedicated tests ON MAIN vs open #13/#14 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail. Prefer open/docs URLs.
prerequisite: tip `b24994b` matches `origin/main`. Job: FTS dedicated tests ON MAIN vs open dedicated-vitest PRs #13/#14 that do not own fts. Tip has `test/fts.test.ts`. NEW coding PR: no when suite already on tip; do not restack #13/#14. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Missing four fields → 🛑 Coordinator.

Fact check at tip `b24994b`:
- Settled on tip: `test/fts.test.ts` present (dedicated FTS regression suite ON MAIN). REAFFIRM 095 / 073 edge coverage already on tip.
- #13 OPEN (mergedAt=null): owns `test/errors.test.ts`, `test/audit-controls.test.ts`, `test/audit-queries.test.ts` only — fts path count in PR files = 0.
- #14 OPEN (mergedAt=null): owns `test/doctor.test.ts`, `test/feed.test.ts`, `test/health-commands.test.ts`, `test/table.test.ts` — fts path count = 0.
- Do not invent tip-lacks-FTS-suite; do not restack FTS onto #13/#14; NEW coding PR: no for FTS.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Default-branch suite is SoR — GitHub required status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — Hold-with-limit: checks prove the checked-out tree; tip already contains `test/fts.test.ts`, so FTS coverage is settled on main. Limit: status UI ≠ invent restack of unrelated open vitest PRs.

2. Lit/FileCheck discovery only counts landed tests — LLVM Testing Guide — https://llvm.org/docs/TestingGuide.html — Hold-with-limit: discovery walks the tip tree; a landed FTS file is already suite membership. Limit: LLVM lit ≠ invent tip-lacks-FTS-suite while the file exists.

3. Reaffirm-when-no-gap (suite present → no parallel PR) — Kubernetes deprecation policy — https://kubernetes.io/docs/reference/using-api/deprecation-policy/ — Hold-with-limit: when the authoritative surface is already present and unchanged in role, reaffirm KEEP rather than invent a fresh coding debt. Limit: k8s calendar ≠ SQLite FTS; NEW coding PR: no.

4. Orthogonal open suites ≠ missing FTS — Gauntlet / why tests miss bugs — https://gauntletci.com/articles/why-tests-miss-bugs — Hold-with-limit: open #13/#14 carry other dedicated modules; their ABSENT fts ownership is correct scope, not an FTS tip gap. Limit: general CI essay ≠ invent merge of #13/#14 as FTS clearance.

5. Do not restack settled coverage onto unrelated PRs — GitHub Docs about pull requests / stacking — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests — Hold-with-limit: each PR owns its file set; restacking FTS into #13/#14 widens unrelated reviews. Limit: PR mechanics ≠ invent risk-free merge.

6. SQLite FTS5 tests live with the FTS surface — SQLite FTS5 — https://www.sqlite.org/fts5.html — Hold-with-limit: tip already pairs `src/search/fts.ts` with `test/fts.test.ts` on main; vendor docs support keeping that suite where it landed. Limit: vendor SQL ≠ invent a second FTS vitest PR.

7. Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge — Fail-transfer: FTS suite is ON MAIN; #13/#14 do not own fts and must not be restacked for it; open dedicated vitest PRs stay OPEN for their own modules only. Soft folklore: 0.

8. Invent STUDY-RK-131 / treat open #13/#14 as FTS authority / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; tip beats PR heads for FTS; NEW coding PR: no when suite already on tip.

Soft folklore invent tip-lacks-FTS-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-107/pack-analogist.md`.
🛑 do not merge #6 #8 #12–#28; settled FTS on tip holds; invent-gap / invent-restack / invent-merge fails-transfer.

✅ · 🛑 · 🔧
