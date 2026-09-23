# STUDY-RK-112 handoff (Verifier scorecard + land guidance)

# STUDY-RK-112 Verifier scorecard

Tip: `48141a1` (=origin/main). Consumer: repo-knowledge.
Thesis: errors/audit ON MAIN vs open #13 dedicated `test/errors.test.ts` / `audit-controls.test.ts` / `audit-queries.test.ts`. Dedicated filenames ABSENT on tip = non-blocking; tip covers audit via `test/audit-import.test.ts` (+ mcp/cli surfaces); `src/errors.ts` orphan (zero tip importers) — residual owned by #13. KEEP #13 OPEN. #14/#15 orthogonal. NEW coding PR: no (do not restack #13/#14/#15). REAFFIRM 022/058. Soft folklore invent tip-lacks-errors-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131 = fail. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write.

Retrieval-check ALL THREE packs. Opened every cited URL (18/18 HTTP 200 · claim match). Default unverified on 404/paywall/mismatch.

## Tip inventory (Verifier)

| check | result |
| --- | --- |
| HEAD | `48141a1` = origin/main |
| `test/audit-import.test.ts` | ON MAIN · 673 lines · 10 describes · **30** live its · imports seedControls + audit queries |
| MCP-006 `audit_failing` | ON MAIN in `test/mcp-server.test.ts` |
| dep-audit / audit_runs / cli surfaces | ON MAIN (`test/build-health.test.ts`, `sync-build-health.test.ts`, `diff.test.ts`, `cli-publish.test.ts`, `cli-async.test.ts`) |
| dedicated errors/audit-controls/audit-queries `.test.ts` | ABSENT on tip (non-blocking) |
| `src/errors.ts` | present · **zero** tip `src/`/`test/` importers (orphan) |
| #13 OPEN | head `ce6743a` · files exactly `test/errors.test.ts` · `audit-controls.test.ts` · `audit-queries.test.ts` |
| #14 OPEN | head `8fee954` · doctor/feed/table + health-commands — orthogonal |
| #15 OPEN | head `e75f703` · github + dogfood-suggest — orthogonal |
| research/STUDY-RK-022 · 058 | five-file trees present |
| research/STUDY-RK-112 · 131 | absent |
| open PRs | #6 #8 #12–#26 #28 (no new beyond #28) |

## Scholar — 8/8 VERIFIED

Word count ~861 — **flag** (over 500–600). Citations held; do not fake unverified.

| # | verdict | source |
| --- | --- | --- |
| 1 | VERIFIED | Das, Gary 2025 · https://arxiv.org/abs/2511.02810 |
| 2 | VERIFIED | Alégroth, Feldt, Kolström 2016 · https://arxiv.org/abs/1602.01226 |
| 3 | VERIFIED | Gu, Mesbah 2024 · https://arxiv.org/abs/2408.13517 |
| 4 | VERIFIED | Ruland, Lochau 2022 · https://arxiv.org/abs/2207.12733 |
| 5 | VERIFIED | Wang, Wang, Nie 2024 · https://arxiv.org/abs/2410.21798 |
| 6 | VERIFIED | Chang et al. 2022 · https://arxiv.org/abs/2210.01661 |
| 7 | VERIFIED | Santana et al. 2022 · https://arxiv.org/abs/2207.05539 |
| 8 | VERIFIED | Spieker et al. 2017/2018 · https://arxiv.org/abs/1811.04122 |

Soft folklore invent gates in Scholar pack: **0**.

## Practitioner — 8/8 VERIFIED

| # | verdict | note |
| --- | --- | --- |
| 1 | VERIFIED | tip stamp commit `48141a1` · HTTP 200 · STUDY-RK-111 handoff land line |
| 2 | VERIFIED | dedicated errors/audit-controls/audit-queries filenames ABSENT · non-blocking |
| 3 | VERIFIED | local tip `test/audit-import.test.ts` · 30 live its · controls/queries exercised |
| 4 | VERIFIED | mcp-server + cli-publish audit seats on tip |
| 5 | VERIFIED | `src/errors.ts` orphan (zero tip importers) · residual owned by #13 |
| 6 | VERIFIED | #13 OPEN · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/13 · owns three dedicated files |
| 7 | VERIFIED | #14 / #15 OPEN · orthogonal (doctor/health; github/dogfood) |
| 8 | VERIFIED | warrant: tip audit coverage PRESENT + #13 owns residual → **NEW coding PR: no**; do not restack #13/#14/#15 · REAFFIRM 022/058 |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold-with-limit · 7–8 Fail-transfer

| # | verdict | source |
| --- | --- | --- |
| 1 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · tip audit-import describes = SoR; ≠ invent tip-lacks |
| 2 | Hold VERIFIED | GitHub about PRs · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests · #13 owns residual; ≠ invent risk-free merge |
| 3 | Hold VERIFIED | Gauntlet why tests miss bugs · https://gauntletci.com/articles/why-tests-miss-bugs · covered tip ≠ missing splits mean zero coverage |
| 4 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · lit counts landed tests; open patches ≠ tip members |
| 5 | Hold VERIFIED | GitHub status checks · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks · tip checks ≠ invent merge clearance |
| 6 | Hold VERIFIED | Kubernetes deprecation policy · https://kubernetes.io/docs/reference/using-api/deprecation-policy/ · keep tip SoR; leave residual on #13; #14/#15 orthogonal |
| 7 | Fail-transfer | invent tip-lacks-errors-coverage / invent restack-#13/#14/#15 / invent risk-free merge — correct reject · Soft folklore: 0 |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #13 as tip SoR / Analogist-fake Scholar\|Practitioner — correct reject · NEW coding PR: no |

Soft folklore invent gates in Analogist pack: **0**.

## Soft folklore invent gates (cross-pack)

| gate | count |
| --- | --- |
| invent tip-lacks-errors-coverage | **0** |
| invent restack-#13/#14/#15 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |

## Implications (verified only)

Tip already carries audit coverage via `test/audit-import.test.ts` (30 its) plus mcp/cli/dep-audit seats. Dedicated `errors`/`audit-controls`/`audit-queries` filenames absent on tip are non-blocking. `src/errors.ts` is an orphan on tip — residual owned by open #13. #14/#15 are orthogonal. Therefore **NEW coding PR: no**; **do not restack #13/#14/#15**; **KEEP #13 OPEN**. REAFFIRM 022/058 (context only). Soft folklore invent tip-lacks-errors-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Flags

- Scholar word-count ~861 (over 500–600) — flag only; citations held.
- Invented gates: **0**.
- NEW coding PR: **no**.
- URL retrieval: 18/18 VERIFIED (`url-check.json`).

## Score

Scholar **8/8** · Practitioner **8/8** · Analogist **6 Hold-with-limit · 7–8 Fail-transfer**

✅ Builder may land
