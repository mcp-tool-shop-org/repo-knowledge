# STUDY-RK-083 — pack-scholar

Tip: `e702251`. Pre-merge static-site/docs CI gates vs post-deploy; path-filtered non-required limits. Papers/arXiv only. Invented tip-has-#26 / STUDY-RK-101 / merge: 0.

Local: HEAD `e702251`. Tip pages.yml push-only — no pull_request. PR #26 OPEN adds paths-gated PR site build (non-required). Tip ≠ #26. 🛑 do not merge #26.

1. Hong, Tantithamthavorn, Pasuksmit, Thongtanunam, Friedman, Zhao & Krasikov, 2024. "Practitioners' Challenges and Perceptions of CI Build Failure Predictions at Atlassian." arXiv:2402.09651. Main-branch CI failures waste ~120 build-hours/project/year; pre-merge outcome insight is valued so breakage is caught before integration, not after deploy.

2. Reyes, Baudry & Monperrus, 2024. "Breaking-Good: Explaining Breaking Dependency Updates with Build Analysis." arXiv:2407.03880. Dependency bumps commonly break client builds via API/config/tooling changes; build analysis on update PRs surfaces breakage before merge—the residual class when tip only builds docs on push-to-main.

3. He, He, Zhang & Zhou, 2023. "Automating Dependency Updates in Practice: An Exploratory Study on GitHub Dependabot." arXiv:2206.07230. Dependabot/update PRs rely on client CI to expose incompatibilities; without a PR-time docs/site build, tooling bumps (e.g. doc-framework schema shifts) reach main and fail only at deploy.

4. Jin & Servant, 2021. "What helped, and what did not? An Evaluation of the Strategies to Improve Continuous Integration." arXiv:2102.06666. Build-selection/skip strategies trade cost for missed failures; seemingly-safe skips still miss config/compilation failures—limits apply when path filters or optional checks omit a docs/site job from the required gate set.

5. Mhalla & Saied, 2024. "Detecting Continuous Integration Skip: A Reinforcement Learning-based Approach." arXiv:2405.09657. CI-skip research treats skip vs run as a risk decision; inaccurate skips waste little but miss breakage—path-filtered or non-required site builds are the same class of incomplete gate.

6. Ge & Zhang, 2026. "Understanding and Detecting Flaky Builds in GitHub Actions." arXiv:2602.02307. GHA `conclusion: skipped` is distinct from success/failure; path filters that skip a workflow leave no pass/fail signal, so a required check can stall or a non-required one can quietly never fail the PR.

7. Rombaut, Cogo & Hassan, 2024. "Leveraging the Crowd for Dependency Management: An Empirical Study on the Dependabot Compatibility Score." arXiv:2403.09012. Compatibility signals depend on CI quantity and quality; sparse or weak checks inflate "safe"—path-filtered non-required docs builds limit the crowd/gate signal for tooling bumps.

8. Abid, Ouni, Mkaouer et al., 2026. "Doc2CI: A Multi-Service Study of CI Configuration Generation Using Large Language Models." arXiv:2608.01451. CI YAML must satisfy service schemas; workflow/config drift (triggers, path filters, permissions) is structural risk—validating PR-time site-build config before merge is the schema-gate counterpart to waiting for post-deploy red. [Verifier: UNVERIFIED — page lists Taher A. Ghaleb; "schema drift" not stated; do not land as verified]
