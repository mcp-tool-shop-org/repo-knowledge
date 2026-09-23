STUDY-RK-097 Q1 (Scholar) — tip `0a54088`

stop: 6–8 findings · 500–600 words · papers/arXiv/DOI only · no git write · no execute · no implications-as-final · invent risk-free merge #8 / Soft folklore merge-is-fine / tip-already-bumped-by-#8 / STUDY-RK-101 = fail · stage pack to `/workspace/studio/outbox-STUDY-RK-097/pack-scholar.md`
prerequisite: tip `0a54088` (after STUDY-RK-096 land sha=`4d2b5f8`) · PR #8 OPEN Dependabot all-deps · head `2a4bc00` NOT on tip · mergeable=MERGEABLE · mergeStateStatus=BEHIND · files package.json + package-lock.json only · majors in PR: commander 14→15 · typescript 5→6 · @types/node 25→26 · prior STUDY-RK-055 KEEP #8 OPEN · held risks A–E · NEW coding PR: no unless verified tip residual · 🛑 do not merge #8
owner: Scholar
fallback: 🛑 Coordinator if four fields missing or invent gates fire

Question: After tip `0a54088` and STUDY-RK-096 land, does peer-reviewed evidence still require inventing merge of Dependabot PR #8 (or a replacement deps coding PR) vs REAFFIRM STUDY-RK-055 (KEEP #8 OPEN unmerged · majors commander/TS/@types-node held · Soft folklore merge-is-fine / risk-free merge #8 = fail)?

Answer: No. Evidence supports REAFFIRM STUDY-RK-055, not inventing merge of #8 or a replacement deps coding PR. Eight papers, all arXiv (seven prior PASS from 055; eighth replaces prior UNVERIFIED Imtiaz/Williams claim). Invented risk-free merge #8 / Soft folklore merge-is-fine / tip-already-bumped-by-#8 / STUDY-RK-101: 0. Word count ~545.

1. Automating Dependency Updates in Practice — He, Xu, Xu, Zhou, Zhou — 2022 — https://arxiv.org/abs/2206.07230 — Dependabot PRs raise update suspicion and breakage friction; bulk bots do not authorize risk-free merge folklore.

2. When Should Dependabot Suggest a Dependency Update? — Rombaut, Cogo, Adams, Hassan — 2024 — https://arxiv.org/abs/2403.09012 — Compatibility scores remain imperfect; MERGEABLE≠safe for major bumps.

3. Can we trust tests to automate dependency updates? — Hejderup, Gousios — 2021 — https://arxiv.org/abs/2109.11921 — Green CI can hide update breakage; BEHIND + majors held stay held.

4. BUMP: A Benchmark of Reproducible Breaking Dependency Updates — Reyes, Baudry, Monperrus — 2024 — https://arxiv.org/abs/2401.09906 — Breaking updates are a measured risk class; commander/TS/@types-node majors fit it, not tip-already-bumped-by-#8.

5. Breaking-Good: Explaining Breaking Dependency Changes with Build Analysis — Reyes et al. — 2024 — https://arxiv.org/abs/2407.03880 — Build analysis is required before treating a major bump PR as fine; Soft folklore merge-is-fine fails.

6. Dependency Update Strategies and Package Characteristics — Javan Jafari, Costa, Shihab, Abdalkareem — 2023 — https://arxiv.org/abs/2305.15675 — SemVer majors carry elevated client risk; KEEP #8 OPEN matches tip’s held majors.

7. Towards More Secure Open Source Ecosystems — Wattanakriengkrai et al. — 2023 — https://arxiv.org/abs/2309.04197 — Unsafe / supply-chain-sensitive updates argue against inventing merge of an all-deps group PR.

8. I depended on you and you broke me — Mujahid, Abdalkareem, Shihab — 2023 — https://arxiv.org/abs/2301.04563 — Manifesting breaking changes often arrive via dependency bots; recovery is not inventing merge while tip still pins pre-major versions.

Read-only tip check: HEAD `0a54088` · STUDY-RK-096 land `4d2b5f8` ancestor · PR #8 OPEN head `2a4bc00` NOT on tip · mergeable MERGEABLE / BEHIND · files package.json + package-lock.json only · tip still commander ^14.0.3 · typescript ^5.9.3 · @types/node ^25.5.0 (majors held) · held risks A–E KEEP · NEW deps coding PR: no · invent merge #8: no · 🛑 do not merge #8. REAFFIRM STUDY-RK-055. Soft folklore merge-is-fine / risk-free merge #8 / tip-already-bumped-by-#8: reject. No git write. No execute. No implications as final. Do not invent STUDY-RK-101.

Soft folklore fail checks: risk-free merge #8 = 0; Soft folklore merge-is-fine = 0; tip-already-bumped-by-#8 = 0; STUDY-RK-101 = 0.

✅
