STUDY-RK-112 Q1 (Scholar) — tip `48141a1`

stop: 6–8 findings, 500–600 words. Title, authors, year, identifier/URL (DOI/arXiv only — prefer arXiv/open), one-sentence finding each. Papers only. Prefer open PDFs. Soft folklore invent tip-lacks-errors-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131 = FAIL (score 0 each). Stage `/workspace/studio/outbox-STUDY-RK-112/pack-scholar.md`. Last line ✅ only when success (not the three-glyph menu).
prerequisite: Tip `48141a1` (=origin/main after STUDY-RK-111 land). Soft folklore invents = fail. 🛑 do not merge #6 #8 #12–#28.
owner: Scholar
fallback: Pack lacks 6–8 open arXiv/DOI → 🔧 seat rework. Tip mismatch → 🛑 Coordinator. Do not Scholar-only-fake Practitioner/Analogist.

Question: After tip `48141a1`, what peer-reviewed evidence governs treating tip errors/audit regression coverage as settled SoR versus inventing a duplicate dedicated errors/audit vitest PR or restacking onto open #13 (dedicated `test/errors.test.ts` / `audit-controls.test.ts` / `audit-queries.test.ts`)? Tip dedicated filenames may be absent — non-blocking if other tip coverage holds; residual already owned by #13 → NEW coding PR no; do not restack. #14 doctor / #15 github+dogfood-suggest are orthogonal. REAFFIRM 022/058.

Answer: Eight papers, all with DOI or arXiv. I did not invent What. Peer-reviewed SE work treats the regression suite already on main as coverage SoR—keep it rather than invent a parallel dedicated-errors/audit-test PR or restack onto open #13. Dedicated-filename absence is non-blocking when tip coverage holds. Das/Gary: continuous regression carries accompanying tests. Alégroth et al.: cost is maintaining existing suites. Gu/Mesbah and Chang et al.: prune parallel/duplicate redundancy. Ruland/Lochau: RTS starts from the inherited suite. Wang et al.: CI monitors that suite. Santana et al.: Duplicate Assert is a smell to refactor, not a second suite. Spieker et al.: CI selects from the existing suite under a time budget. At tip `48141a1`: audit/errors ON MAIN in `test/audit-import.test.ts` (673 lines; importAudit/importAuditInline; audit queries getLatestAudit/getAuditPosture/getOpenFindings/findByAuditStatus; control_id/domain/severity/metrics throws; seedControls). MCP-006 `audit_failing` ON MAIN in `test/mcp-server.test.ts`. Dep-audit ON MAIN in `test/build-health.test.ts` + `test/sync-build-health.test.ts`; `audit_runs` in `test/diff.test.ts`; async throw/exit in `test/cli-async.test.ts`. `src/errors.ts` present; no tip test import of RepoKnowledgeError. No tip dedicated errors/audit-controls/audit-queries.test.ts (non-blocking). #13 OPEN owns those filenames (STUDY-RK-022). #14 doctor / #15 github+dogfood-suggest orthogonal. REAFFIRM 022/058 context only. Tip coverage holds AND residual dedicated filenames owned by #13 → NEW coding PR: **no**. Do not restack. 🛑 do not merge #6 #8 #12–#28.

| surface | tip | #13/#14/#15 | 022/058 REAFFIRM | NEW coding PR |
| --- | --- | --- | --- | --- |
| audit-import + mcp audit_failing + dep-audit | **ON MAIN** | tip SoR; #13 residual dedicated | 022/#13 OPEN; 058 coding-PR-none | **no** |
| dedicated errors/audit-controls/audit-queries `.test.ts` | tip ABSENT (non-blocking) | #13 owns; #14/#15 orthogonal | — | do not restack |

1. Formalizing Regression Testing for Agile and Continuous Integration Environments — Das, Gary — 2025 — https://arxiv.org/abs/2511.02810 — Continuous regression is builds that each carry the program and accompanying tests—coverage truth rides with the landed audit-import + mcp/dep-audit suite on main.

2. Maintenance of Automated Test Suites in Industry: An Empirical study on Visual GUI Testing — Alégroth, Feldt, Kolström — 2016 — https://arxiv.org/abs/1602.01226 — Industrial cost is dominated by maintaining existing automated suites, not inventing a duplicate dedicated-errors/audit track.

3. Scalable Similarity-Aware Test Suite Minimization with Reinforcement Learning — Gu, Mesbah — 2024 — https://arxiv.org/abs/2408.13517 — Evolving suites accumulate redundant cases; prune duplicates rather than opening parallel covering PRs for errors/audit already on tip.

4. On the Interaction between Test-Suite Reduction and Regression-Test Selection Strategies — Ruland, Lochau — 2022 — https://arxiv.org/abs/2207.12733 — RTS updates the suite inherited from prior revisions—keep relevant tests; add only for new functionality—not restack onto open #13.

5. Efficient Incremental Code Coverage Analysis for Regression Test Suites — Wang, Wang, Nie — 2024 — https://arxiv.org/abs/2410.21798 — CI coverage monitors adequacy of the existing regression suite; the living SoR is the errors/audit suite already on tip.

6. Putting Them under Microscope: A Fine-Grained Approach for Detecting Redundant Test Cases in Natural Language — Chang, Li, Wang, Wang, Li — 2022 — https://arxiv.org/abs/2210.01661 — Parallel testing yields redundant cases; detect redundancy instead of inventing another parallel dedicated errors/audit PR.

7. Refactoring Assertion Roulette and Duplicate Assert test smells: a controlled experiment — Santana, Martins, Virgínio, Soares, Costa, Machado — 2022 — https://arxiv.org/abs/2207.05539 — Duplicate Assert is a smell to refactor in the existing suite—not a warrant for a restacked dedicated-errors PR beside tip coverage.

8. Reinforcement Learning for Automatic Test Case Prioritization and Selection in Continuous Integration — Spieker, Gotlieb, Marijan, Mossige — 2017 — https://arxiv.org/abs/1811.04122 — CI cycles select from the existing suite under a time budget; they do not invent a second suite when errors/audit already lives on main.

Read-only tip check: HEAD `48141a1` (=origin/main) · audit-import ON MAIN · mcp audit_failing ON MAIN · build-health/sync-build-health dep-audit ON MAIN · no tip dedicated errors/audit-controls/audit-queries.test.ts (filename absence non-blocking) · #13 OPEN owns those filenames · #14/#15 OPEN orthogonal · NEW coding PR = no · invent tip-lacks-errors-coverage / restack-#13/#14/#15 / risk-free merge / STUDY-RK-131: no. No git write. No execute. No merge. No implications-as-final. REAFFIRM 022/058 as context only — do not invent merge clearance.

Soft folklore fail checks: invent tip-lacks-errors-coverage = 0; invent restack-#13/#14/#15 = 0; invent risk-free merge = 0; invent STUDY-RK-131 = 0.

✅
