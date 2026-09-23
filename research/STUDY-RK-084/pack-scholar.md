# STUDY-RK-084 — pack-scholar

Tip: `31f442c`. Judging docs handbook / static-site currency after major framework migration (Astro 7 + Starlight). Papers/arXiv only. Invented STUDY-RK-101 / all-done / merge open PRs: 0.

Local: HEAD `31f442c`. Tip site/package.json pins astro ^7.3.3, @astrojs/starlight ^0.42.1. #27 MERGED (051dee1) ancestor of tip. 🛑 do not merge #6 #8 #12–#26.

1. Tan, Wagner & Treude, 2022. "Detecting Outdated Code Element References in Software Repository Documentation." arXiv:2212.01479. https://arxiv.org/abs/2212.01479 — 28.9% of popular GitHub projects hold at least one stale code-element reference; green post-migration site build does not prove handbook text is current.

2. Tan, Wagner & Treude, 2023. "Wait, wasn't that code here before? Detecting Outdated Software Documentation." arXiv:2307.04291. https://arxiv.org/abs/2307.04291 — DOCER as PR-time Action shows currency must be re-checked after code/tooling changes; migration merge alone is not a lasting "still current" certificate.

3. Gao, Lin, Treude, Gay & Zahedi, 2026. "Does My README File Need To Be Updated? Exploring LLM-Based README Maintenance." arXiv:2603.00489. https://arxiv.org/abs/2603.00489 — Outdated docs rank among frequent onboarding failures; currency claims need dated, change-linked evidence, not migration land alone.

4. Wu, He, Xiao, Gao & Zhou, 2022. "Demystifying Software Release Note Issues on GitHub." arXiv:2203.15592. https://arxiv.org/abs/2203.15592 — Release notes and handbook docs routinely diverge; undated "still current" claims fail when upgrade notes and handbook disagree.

5. Santos & Correia, 2021. "Patterns for Documenting Open Source Frameworks." arXiv:2203.13871. https://arxiv.org/abs/2203.13871 — After framework version bumps, Documentation Versioning and Migration Handbook are required patterns; latest-only docs leave prior stacks without dated currency surface.

6. Lercher, Glock, Macho & Pinzger, 2024. "Microservice API Evolution in Practice: A Study on Strategies and Challenges." arXiv:2311.08175. https://arxiv.org/abs/2311.08175 — Practitioners require up-to-date documentation through version evolution; lagged docs compound lock-in after provider migrations.

7. Reyes, Baudry & Monperrus, 2024. "Breaking-Good: Explaining Breaking Dependency Updates with Build Analysis." arXiv:2407.03880. https://arxiv.org/abs/2407.03880 — Pin bumps break via API/config/tooling; site-build success after Astro/Starlight migration is necessary stack signal, not proof handbook prose stayed aligned.

8. He, He, Zhang & Zhou, 2023. "Automating Dependency Updates in Practice: An Exploratory Study on GitHub Dependabot." arXiv:2206.07230. https://arxiv.org/abs/2206.07230 — Automated major bumps surface incompatibilities only when client CI/docs checks run; without post-migration currency evidence, "still current" is folklore.
