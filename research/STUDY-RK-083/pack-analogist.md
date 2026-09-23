# STUDY-RK-083 — pack-analogist

Tip: `e702251`. PR #26 OPEN https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 · mergedAt null. Tip pages.yml push-only. Soft folklore invent merge / invent tip-already-gated / invent STUDY-RK-101: 0.

Six Hold-with-limit; two Fail-transfer.

1. HOLD-WITH-LIMIT — SRE canary-after-merge (Google SRE Workbook) — https://sre.google/workbook/canarying-releases/ — Tip discovers Astro/Starlight breakage only on main Pages deploy. Limit: #26 moves detection earlier; path-filtered + not-required leaves residual post-merge canary.

2. HOLD-WITH-LIMIT — Compiler / presubmit PR gate — https://xgwang.me/google-ci/ · https://blog.theopnv.com/posts/2026/07/blocking-vs-chasing-failures/ — Fast build-check belongs pre-merge. Limit: #26 path filter + non-required = advisory, not merge-blocking.

3. HOLD-WITH-LIMIT — Path-filtered required checks strand (GitHub Docs) — https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks — Required + paths leaves "Waiting for status." Limit: #26 non-required is correct escape.

4. HOLD-WITH-LIMIT — HCI / progressive staged rollout — https://argo-rollouts.readthedocs.io/en/stable/features/analysis/ · https://rajivonai.com/blog/2024-01-23-ci-cd-pipeline-design-fast-feedback-vs-safe-promotion/ — PR proves build, main publishes. Limit: optional/path-skipped job is not a hard stage gate.

5. HOLD-WITH-LIMIT — Music-pedagogy rehearsal-before-recital — PR npm run build before Pages deploy. Limit: optional rehearsal does not block stage door while not required.

6. HOLD-WITH-LIMIT — Trigger-level paths only for non-required workflows — https://www.devopsness.com/blog/github-actions-conditional-jobs · https://starsling.dev/best-practices/github-actions/path-filter-workflows — Path filters safe when not required. Limit: tip has no PR site-build; #26 is residual debt on e702251.

7. FAIL-TRANSFER — Soft folklore invent merge-#26 / invent tip-already-gated. Tip push-only; #26 OPEN.

8. FAIL-TRANSFER — Soft folklore invent STUDY-RK-101.
