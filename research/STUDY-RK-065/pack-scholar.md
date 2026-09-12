STUDY-RK-065 Q1 (Scholar) — tip `f2629d5`. Eight papers, all arXiv. Invented merge-advice: 0. Invented silent-delete-default: 0. STUDY-RK-081 invented: 0. Do not merge #22.

1. AgentWall: A Runtime Safety Layer for Local AI Agents — Aravind — 2026 — https://arxiv.org/abs/2605.16265 — Runtime layer intercepts proposed agent actions before host execution, including blocking destructive shell commands and Allow/Deny/Ask decisions (destructive paths need explicit gating, not silent execute). PASS

2. Intent-Governed Tool Authorization for AI Agents — Zhu, Wang — 2026 — https://arxiv.org/abs/2606.22916 — Server-side intent certificates narrow authorized tool manifests and check proposed tool/payload effects before execution (permissions scoped to the current request, not ambient over-privilege). PASS

3. SAFETY SENTRY: Context-Aware Human Intervention via EXECUTE-ASK-REFUSE Routing — Chen, Hu, Wang — 2026 — https://arxiv.org/abs/2607.13594 — Reframes per-action safety as three-way EXECUTE / ASK / REFUSE routing rather than binary safe/unsafe (misuse and confirmation paths are first-class). PASS

4. Exceptional Behaviors: How Frequently Are They Tested? — Hora, Fraser — 2026 — https://arxiv.org/abs/2602.05123 — Empirical study of how often exceptional behaviors are covered by tests; good suites should exercise both normal and exceptional paths to catch regressions. PASS

5. exLong: Generating Exceptional Behavior Tests with Large Language Models — Zhang, Liu, Nie et al. — 2024 — https://arxiv.org/abs/2405.14619 — Exceptional behavior tests (EBTs) check unwanted events and appropriate errors; prior work establishes EBTs as important for detecting misuse/illegal-argument paths. PASS

6. ConE: A Concurrent Edit Detection Tool for Large Scale Software Development — Maddila, Nagappan, Bird et al. — 2021 — https://arxiv.org/abs/2101.06542 — Concurrent edits to the same areas produce hard-to-merge or conflicting changes when multiple developers (or PRs) touch overlapping surfaces. PASS

7. BulkPR-Bench: Benchmarking Queue-Level Governance of Interacting Pull Requests — Xiong, Zhao, Zhang et al. — 2026 — https://arxiv.org/abs/2608.02685 — Queued PRs interact; sequential one-at-a-time policies miss joint decisions about overlapping/duplicate outcomes across candidates. PASS

8. Where Do AI Coding Agents Fail? An Empirical Study of Failed Agentic Pull Requests in GitHub — Ehsani, Pathak, Rawal et al. — 2026 — https://arxiv.org/abs/2601.15195 — Qualitative taxonomy of agentic PR rejection patterns includes duplicate PRs among reasons not-merged PRs fail review. PASS

Context: tip lacks cli-note-delete.test.ts; #22 adds that suite; tip has classify.test.ts. STUDY-RK-035 KEEP explicit --delete.

Verifier: Scholar 8/8 PASS.

✅
