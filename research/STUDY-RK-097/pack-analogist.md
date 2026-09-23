STUDY-RK-097 Q3 Analogist — tip `0a54088` · REAFFIRM STUDY-RK-055 · #8 OPEN · consumer repo-knowledge

stop: 6–8 findings · name analog + limit · inventing merge of #8 or Soft folklore merge-is-fine / risk-free merge #8 / tip-already-bumped-by-#8 / STUDY-RK-101 = fail.
prerequisite: tip `0a54088` matches `origin/main`. #8 OPEN Dependabot all-deps (“chore(deps): Bump the all-deps group…”) — mergeable MERGEABLE, mergeStateStatus BEHIND; head `2a4bc00` NOT on tip. Tip `package.json` still pins `commander` ^14.0.3, `typescript` ^5.9.3, `@types/node` ^25.5.0 (majors in #8 not landed). Held risks A–E from STUDY-RK-055 (majors commander 15 · TS 6 · @types/node 26; engines/CI gap; bulk all-deps; behind + red history). Prior KEEP OPEN; NEW coding PR default no (behind Dependabot ≠ tip coding hole). 🛑 do not merge #8. No git write. No execute. No implications-as-final.
owner: Analogist
fallback: 🛑 Coordinator if invent gates fire.

Six analogs. Three hold; three do not transfer. (1–6 Hold-with-limit; 7–8 Fail-transfer.)

1. Dependabot groups / update-types — GitHub Docs — https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#groups — Hold-with-limit: wildcard `all-deps` bundles majors with patches; tip `.github/dependabot.yml` uses patterns `"*"` with no SemVer split. Limit: config syntax ≠ invent merge-is-fine; KEEP #8 OPEN until majors are split or reviewed.

2. Renovate group:allNonMajor / keep majors separate — Renovate Docs — https://docs.renovatebot.com/presets-group/#groupallnonmajor — Hold-with-limit: separate majors from non-majors so bulk PRs stay reviewable. Limit: Renovate knobs ≠ Dependabot bot; same discipline against invent risk-free merge #8.

3. SemVer major = breaking — https://semver.org/#spec-item-8 — Hold-with-limit: commander 15 / TypeScript 6 / @types/node 26 are major bumps; majors are not silent bumps. Limit: version label ≠ runtime proof; held risks A–E stay open (REAFFIRM 055).

4. SRE gradual / canary change — Google SRE Book — https://sre.google/sre-book/release-engineering/ — Hold-with-limit: land dependency change in small steps with verified health, not one all-deps canary. Limit: release engineering ≠ npm lockfile PR; invent merge-is-fine fails.

5. MERGEABLE + BEHIND ≠ merge-ready — GitHub mergeability — https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks — Hold-with-limit: #8 is MERGEABLE but BEHIND tip; behind + major churn is inventory, not clearance. Limit: GitHub UI status ≠ tip SoR; 🛑 do not merge #8.

6. engines / runtime floor mismatch (commander 15 vs tip engines ≥20) — Node.js engines — https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines — Hold-with-limit: tip engines and CI Node matrix can disagree with a major that raises the floor; KEEP OPEN until engines/CI story is explicit. Limit: engines field ≠ auto-bump tip; NEW coding PR default no.

7. Soft folklore invent merge-is-fine / risk-free merge #8 / tip-already-bumped-by-#8 — Fail-transfer: tip still on commander 14 / TS 5.9 / @types/node 25; #8 head not on tip; invent merge or “#8 already bumped tip” fails (REAFFIRM 055). Soft folklore count: 0.

8. Invent STUDY-RK-101 / treat behind Dependabot as tip coding hole requiring NEW coding PR / Analogist-fake Scholar or Practitioner — Fail-transfer: do not invent 101; KEEP #8 OPEN unmerged; NEW coding PR default no.

Soft folklore invent merge-is-fine / risk-free merge #8 / tip-already-bumped-by-#8: 0. Did not invent STUDY-RK-101. Staged `/workspace/studio/outbox-STUDY-RK-097/pack-analogist.md`.
🛑 do not merge #8; tip KEEP OPEN; NEW coding PR default no.

✅ · 🛑 · 🔧
