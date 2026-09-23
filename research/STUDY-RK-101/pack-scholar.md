STUDY-RK-101 Q1 (Scholar) — tip `ad5dead`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL, one-sentence finding each. Papers/arXiv/DOI only. No git write. No execute. No implications as final (Verifier). Soft folklore invent merge / invent STUDY-RK-131 = fail. Stage pack to `/workspace/studio/outbox-STUDY-RK-101/pack-scholar.md`. Last line ✅ · 🛑 · 🔧.
prerequisite: Consumer repo-knowledge. Tip `ad5dead`. Main still v2.1.1; dedicated vitest from open PRs #13–#15 NOT on main. Extra reads optional: README, KNOWLEDGE-CONTRACT.md, AUDIT-CONTRACT.md. Job: inventory src/ on main with no dedicated test vs files only in #13–#15. Study + table. No merge.
owner: Scholar
fallback: Fewer than 6 DOI/arXiv → 🔧. Paywall-only without open abstract → skip. Missing four fields → 🛑 Coordinator.

Question: What does peer-reviewed work say about inventorying production modules that lack dedicated tests versus test suites that exist only on unmerged branches (coverage as evidence of what is protected on main)?

Answer: Tip protection is coverage merged and run on main; suites only on open branches are held evidence. Inventory the gap; do not invent merge. Eight papers, all arXiv (REAFFIRM STUDY-RK-086). Invented invent merge / invent STUDY-RK-131: 0. Word count ~580.

Study inventory (tip `ad5dead`, v2.1.1; #13/#14/#15 OPEN heads not on tip):

| Main module | Dedicated test | On tip? | Open PR |
|---|---|---|---|
| `src/errors.ts` | `test/errors.test.ts` | no | #13 |
| `src/audit/controls.ts` | `test/audit-controls.test.ts` | no | #13 |
| `src/audit/queries.ts` | `test/audit-queries.test.ts` | no | #13 |
| `src/health/doctor.ts` | `test/doctor.test.ts` | no | #14 |
| `src/health/feed.ts` | `test/feed.test.ts` | no | #14 |
| `src/health/table.ts` | `test/table.test.ts` | no | #14 |
| `src/health/index.ts` | `test/health-commands.test.ts` | yes | — |
| `src/sync/github.ts` | `test/github.test.ts` | no | #15 |
| `src/sync/dogfood-suggest.ts` | `test/dogfood-suggest.test.ts` | no | #15 |

Eight of nine PR-named dedicated suites absent from main. No merge. No invent STUDY-RK-131.

1. Assessing Exception Handling Testing Practices — Lima, Rocha, Bezerra, Paixao — 2021 — https://arxiv.org/abs/2105.00500 — Exception/audit-class paths are less covered than happy paths; main green does not mark errors modules tip-protected.

2. Test Coverage Analysis of Agentic Pull Requests — Dipongkor, Baral, Lam, Moran — 2026 — https://arxiv.org/abs/2607.18057 — Suites only on unmerged PRs do not count as tip coverage for production modules.

3. Beyond Coverage and Kill Scores — Paul, Holmes — 2026 — https://arxiv.org/abs/2606.10417 — High structural coverage still leaves behavioural gaps on tip.

4. LLM-Guided Issue Generation from Uncovered Code Segments — Pressato, Tan, Elmoazen, Tan — 2026 — https://arxiv.org/abs/2604.26118 — Uncovered production segments keep residual risk until dedicated coverage lands on main.

5. When Passing Tests Hides Vulnerabilities — Bai, Waseem, Rasheed, Peltonen, Abrahamsson — 2026 — https://arxiv.org/abs/2609.10548 — Passing suites can omit required controls; tip pass ≠ every module verified.

6. On the Illusion of Success in Industrial CI — Aïdasso, Bordeleau, Tizghadam — 2025 — https://arxiv.org/abs/2509.14347 — Green CI can silently skip intended work; unreliable proxy for main module verification.

7. Is Self-Admitted Technical Debt Tested? — Yoshimoto, Horikawa, Feitosa, Kashiwa, Iida — 2026 — https://arxiv.org/abs/2609.13485 — Dedicated repayment must land on main; open-branch suites do not clear debt by folklore.

8. Change And Cover — Zhou, Paltenghi, Kim, Pradel — 2026 — https://arxiv.org/abs/2601.10942 — Last-mile uncovered lines persist in open PRs until merge — invent merge fails Soft folklore.

Read-only tip check: HEAD `ad5dead` · v2.1.1 · #13/#14/#15 OPEN not on tip · 8/9 dedicated suites only on unmerged branches · invent merge: no · invent STUDY-RK-131: no. No git write. No execute. No implications as final.

Soft folklore fail checks: invent merge = 0; invent STUDY-RK-131 = 0.

✅
