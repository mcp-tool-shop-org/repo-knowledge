STUDY-RK-092 Q1 (Scholar) — tip `05bd41c`

stop: 6–8 findings · 500–600 words · papers/arXiv/DOI only · no git write · no execute · no implications-as-final · invent tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22 / STUDY-RK-101 = fail · stage pack to `/workspace/studio/outbox-STUDY-RK-092/pack-scholar.md`
prerequisite: tip `05bd41c` · #22 OPEN head `863e7fd` not on tip · file on PR only: `test/cli-note-delete.test.ts` · tip ABSENT that path · prior research/STUDY-RK-035 + STUDY-RK-065 · KEEP explicit --delete
owner: Scholar
fallback: 🛑 Coordinator if four fields missing or invent gates fire

Question: After tip `05bd41c`, what peer-reviewed evidence still requires treating missing CLI integration coverage for `rk note --delete` as held unmerged debt while PR #22 stays OPEN (REAFFIRM STUDY-RK-035 / STUDY-RK-065)?

Eight papers, all arXiv. Invented tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22 / STUDY-RK-101: 0. Word count ~550.

1. AgentWall: A Runtime Safety Layer for Local AI Agents — Aravind — 2026 — https://arxiv.org/abs/2605.16265 — Runtime layers gate destructive host actions with Allow/Deny/Ask rather than silent execute; explicit `--delete` remains the required gate, and untested CLI delete paths stay held debt.

2. Intent-Governed Tool Authorization for AI Agents — Zhu, Wang — 2026 — https://arxiv.org/abs/2606.22916 — Authorization must match the declared intent of the current request; ambient delete without the flag is over-privilege folklore, not tip-already-covered.

3. SAFETY SENTRY: Context-Aware Human Intervention via EXECUTE-ASK-REFUSE Routing — Chen, Hu, Wang — 2026 — https://arxiv.org/abs/2607.13594 — EXECUTE / ASK / REFUSE makes misuse and confirmation first-class; CLI suites must cover success, not-found, and misuse-without-`--delete` exceptional routes.

4. Exceptional Behaviors: How Frequently Are They Tested? — Hora, Fraser — 2026 — https://arxiv.org/abs/2602.05123 — Exceptional paths are under-tested in practice; tip presence of `classify.test.ts` does not substitute for ABSENT `cli-note-delete.test.ts`.

5. exLong: Generating Exceptional Behavior Tests with Large Language Models — Zhang, Liu, Nie, Li, et al. — 2024 — https://arxiv.org/abs/2405.14619 — Exceptional behavior tests target misuse and illegal-argument paths; the open PR that adds those IT cases remains the held coverage lane.

6. ConE: A Concurrent Edit Detection Tool for Large Scale Software Development — Maddila, Nagappan, Bird, Gousios, et al. — 2021 — https://arxiv.org/abs/2101.06542 — Concurrent edits on overlapping surfaces conflict; a second note-delete IT PR would be duplicate-of-#22 folklore while #22 stays OPEN.

7. BulkPR-Bench: Benchmarking Queue-Level Governance of Interacting Pull Requests — Xiong, Zhao, Zhang, Lyu, et al. — 2026 — https://arxiv.org/abs/2608.02685 — Queued PRs interact; inventing risk-free merge #22 ignores joint queue governance while the IT file lives only on the PR branch.

8. Where Do AI Coding Agents Fail? An Empirical Study of Failed Agentic Pull Requests in GitHub — Ehsani, Pathak, Rawal, Al Mujahid, et al. — 2026 — https://arxiv.org/abs/2601.15195 — Duplicate agentic PRs are a common rejection class; NEW duplicate coding PR: no.

Read-only tip check: HEAD `05bd41c` · PR #22 OPEN (STUDY-RK-035 note --delete CLI integration tests) head `863e7fd` NOT on tip · PR files only: `test/cli-note-delete.test.ts` · tip ABSENT that path · tip HAS `test/classify.test.ts` · tip CLI keeps explicit `--delete` on `rk note` · NEW duplicate coding PR: no. REAFFIRM STUDY-RK-035 (KEEP explicit --delete; no silent-delete-default) and STUDY-RK-065 (KEEP #22 OPEN; tip ABSENT IT file). Soft folklore tip-already-covered / silent-delete-default / risk-free merge #22 / duplicate-of-#22: reject. No git write. No execute. No implications as final. Do not invent STUDY-RK-101.

Soft folklore fail checks: tip-already-covered = 0; silent-delete-default = 0; risk-free merge #22 = 0; duplicate-of-#22 = 0; STUDY-RK-101 = 0.

✅
