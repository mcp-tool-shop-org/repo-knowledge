STUDY-RK-108 Q3 Analogist — tip `046fae3` · classify dedicated tests ON MAIN vs open #13/#14 · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · invent tip-lacks-classify-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131 = fail. Prefer open/docs URLs.
prerequisite: tip `046fae3` matches `origin/main`. Job: classify dedicated tests ON MAIN vs open dedicated-vitest PRs #13/#14 that do not own classify. Tip has `test/classify.test.ts`. NEW coding PR: no when suite already on tip; do not restack #13/#14. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: Missing identifier/URL → 🔧. Missing four fields → 🛑 Coordinator.

Fact check at tip `046fae3`:
- Settled on tip: `test/classify.test.ts` present (dedicated classify/setter regression suite ON MAIN).
- #13 OPEN (mergedAt=null): owns `test/errors.test.ts`, `test/audit-controls.test.ts`, `test/audit-queries.test.ts` only — classify path count in PR files = 0.
- #14 OPEN (mergedAt=null): owns `test/doctor.test.ts`, `test/feed.test.ts`, `test/health-commands.test.ts`, `test/table.test.ts` — classify path count = 0.
- Do not invent tip-lacks-classify-suite; do not restack classify onto #13/#14; NEW coding PR: no for classify. REAFFIRM 107 settled-suite shape (FTS); same for classify.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Default-branch suite is SoR — GitHub about status checks — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — Hold-with-limit: tip already contains `test/classify.test.ts`, so classify coverage is settled on main. Limit: status UI ≠ invent restack of unrelated open vitest PRs.

2. Lit/FileCheck discovery only counts landed tests — LLVM Testing Guide — https://llvm.org/docs/TestingGuide.html — Hold-with-limit: discovery walks the tip tree; a landed classify file is already suite membership. Limit: LLVM lit ≠ invent tip-lacks-classify-suite while the file exists.

3. Reaffirm-when-no-gap (suite present → no parallel PR) — Kubernetes deprecation policy — https://kubernetes.io/docs/reference/using-api/deprecation-policy/ — Hold-with-limit: when the authoritative surface is already present, reaffirm KEEP rather than invent fresh coding debt. Limit: k8s calendar ≠ rk classify; NEW coding PR: no.

4. Orthogonal open suites ≠ missing classify — Gauntlet / why tests miss bugs — https://gauntletci.com/articles/why-tests-miss-bugs — Hold-with-limit: open #13/#14 carry other dedicated modules; ABSENT classify ownership is correct scope, not a classify tip gap. Limit: general CI essay ≠ invent merge of #13/#14 as classify clearance.

5. Do not restack settled coverage onto unrelated PRs — GitHub Docs about pull requests — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests — Hold-with-limit: each PR owns its file set; restacking classify into #13/#14 widens unrelated reviews. Limit: PR mechanics ≠ invent risk-free merge.

6. Vitest file discovery is path-local — Vitest including/excluding tests — https://vitest.dev/guide/filtering — Hold-with-limit: the runner picks up `test/classify.test.ts` from tip without needing open-PR heads. Limit: Vitest filter docs ≠ invent a second classify suite PR.

7. Soft folklore invent tip-lacks-classify-suite / invent restack-#13/#14 / invent risk-free merge — Fail-transfer: classify suite is ON MAIN; #13/#14 do not own classify and must not be restacked for it; open dedicated vitest PRs stay OPEN for their own modules only. Soft folklore: 0.

8. Invent STUDY-RK-131 / treat open #13/#14 as classify authority / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 131; tip beats PR heads for classify; NEW coding PR: no when suite already on tip.

Soft folklore invent tip-lacks-classify-suite / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: 0. Staged `/workspace/studio/outbox-STUDY-RK-108/pack-analogist.md`.
🛑 do not merge #6 #8 #12–#28; settled classify on tip holds; invent-gap / invent-restack / invent-merge fails-transfer.

✅ · 🛑 · 🔧
