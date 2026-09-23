# STUDY-RK-113 Verifier scorecard

Tip: `e9bfdb6` (=origin/main). Consumer: repo-knowledge.
Thesis: sync/github + dogfood-suggest ON MAIN vs open #15 dedicated `test/github.test.ts` / `test/dogfood-suggest.test.ts`. Dedicated filenames ABSENT on tip = non-blocking; tip covers `syncGitHub` via `test/sync-404-archived.test.ts` and dogfood suggest via `test/dogfood-swarm-sync.test.ts` + `test/dogfood-intelligence-sync.test.ts` (+ mcp `suggest_dogfood`); residual owned by #15. KEEP #15 OPEN. #13/#14 orthogonal. NEW coding PR: no (do not restack #13/#14/#15). REAFFIRM 024/059. Soft folklore invent tip-lacks-github-dogfood-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131 = fail. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131. No git write.

Retrieval-check ALL THREE packs. Opened every cited URL (18/18 HTTP 200 · claim match). Default unverified on 404/paywall/mismatch.

## Tip inventory (Verifier)

| check | result |
| --- | --- |
| HEAD | `e9bfdb6` = origin/main (“research: stamp STUDY-RK-112 handoff land line”) |
| `test/sync-404-archived.test.ts` | ON MAIN · 462 lines · 3 describes · **10** live its · imports `syncGitHub` from `src/sync/github.js` |
| `test/dogfood-swarm-sync.test.ts` | ON MAIN · 14 its · imports `suggestBySurface` · describe sync-A-007 |
| `test/dogfood-intelligence-sync.test.ts` | ON MAIN · 11 its · imports `suggestByRepo` + `suggestBySurface` |
| `test/dogfood-sync.test.ts` | ON MAIN · present (syncDogfood seat) |
| MCP `suggest_dogfood` | ON MAIN in `test/mcp-server.test.ts` (mutual-exclusion + happy path) |
| dedicated `github.test.ts` / `dogfood-suggest.test.ts` | ABSENT on tip (non-blocking) |
| `src/sync/github.ts` · `dogfood-suggest.ts` | present · exports `syncGitHub` · `suggestByRepo` · `suggestBySurface` |
| #15 OPEN | head `e75f703` · files exactly `test/github.test.ts` · `test/dogfood-suggest.test.ts` |
| #13 OPEN | head `ce6743a` · errors + audit-controls/queries — orthogonal |
| #14 OPEN | head `8fee954` · doctor/feed/table + health-commands — orthogonal |
| research/STUDY-RK-024 · 059 | five-file trees present |
| research/STUDY-RK-113 · 131 | absent |
| open PRs | #6 #8 #12–#26 #28 (no new beyond #28) |

## Scholar — 8/8 VERIFIED

Word count ~856 — **flag** (over 500–600). Citations held; do not fake unverified.

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
| 1 | VERIFIED | tip stamp commit `e9bfdb6` · HTTP 200 · STUDY-RK-112 handoff land line · research/STUDY-RK-112 five files · 113 absent |
| 2 | VERIFIED | dedicated github/dogfood-suggest filenames ABSENT · non-blocking |
| 3 | VERIFIED | local tip `test/sync-404-archived.test.ts` · 3 describes · **10** live its · `syncGitHub` |
| 4 | VERIFIED | dogfood-swarm (14 its · `suggestBySurface`) + dogfood-intelligence (11 its · `suggestByRepo`/`suggestBySurface`) |
| 5 | VERIFIED | tip sources `src/sync/github.ts` + `dogfood-suggest.ts` export product seats |
| 6 | VERIFIED | #15 OPEN · https://github.com/mcp-tool-shop-org/repo-knowledge/pull/15 · head `e75f703` · owns two dedicated files |
| 7 | VERIFIED | #13 / #14 OPEN · orthogonal (errors/audit; doctor/health) |
| 8 | VERIFIED | warrant: tip github+dogfood-suggest coverage PRESENT + #15 owns residual → **NEW coding PR: no**; do not restack #13/#14/#15 · REAFFIRM 024/059 |

Soft folklore invent gates in Practitioner pack: **0**.

## Analogist — 6 Hold-with-limit · 7–8 Fail-transfer

| # | verdict | source |
| --- | --- | --- |
| 1 | Hold VERIFIED | Vitest filtering · https://vitest.dev/guide/filtering · tip sync-404 + dogfood-* / MCP describes = SoR; ≠ invent tip-lacks |
| 2 | Hold VERIFIED | GitHub about PRs · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests · #15 owns residual; ≠ invent risk-free merge |
| 3 | Hold VERIFIED | Gauntlet why tests miss bugs · https://gauntletci.com/articles/why-tests-miss-bugs · covered tip ≠ missing dedicated splits mean zero coverage |
| 4 | Hold VERIFIED | LLVM Testing Guide · https://llvm.org/docs/TestingGuide.html · lit counts landed tests; open patches ≠ tip members |
| 5 | Hold VERIFIED | GitHub status checks · https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks · tip checks ≠ invent merge clearance |
| 6 | Hold VERIFIED | Kubernetes deprecation policy · https://kubernetes.io/docs/reference/using-api/deprecation-policy/ · keep tip SoR; leave residual on #15; #13/#14 orthogonal |
| 7 | Fail-transfer | invent tip-lacks-github-dogfood-coverage / invent restack-#13/#14/#15 / invent risk-free merge — correct reject · Soft folklore: 0 |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat #15 as tip SoR / Analogist-fake Scholar\|Practitioner — correct reject · NEW coding PR: no |

Soft folklore invent gates in Analogist pack: **0**.

Note: Analogist line 13 prose says “Three hold; three do not transfer” while items 1–6 are all labeled Hold-with-limit and 7–8 Fail-transfer — scored by labeled rows; prose slip only.

## Soft folklore invent gates (cross-pack)

| gate | count |
| --- | --- |
| invent tip-lacks-github-dogfood-coverage | **0** |
| invent restack-#13/#14/#15 | **0** |
| invent risk-free merge | **0** |
| invent STUDY-RK-131 | **0** |

## Implications (verified only)

Tip already carries sync/github coverage via `test/sync-404-archived.test.ts` (10 its) and dogfood-suggest via swarm (14 its) + intelligence (11 its) plus mcp `suggest_dogfood`. Dedicated `github` / `dogfood-suggest` filenames absent on tip are non-blocking. Residual owned by open #15. #13/#14 are orthogonal. Therefore **NEW coding PR: no**; **do not restack #13/#14/#15**; **KEEP #15 OPEN**. REAFFIRM 024/059 (context only). Soft folklore invent tip-lacks-github-dogfood-coverage / invent restack / invent risk-free merge / invent STUDY-RK-131 = fail → packs clean. 🛑 do not merge #6 #8 #12–#28.

## Flags

- Scholar word-count ~856 (over 500–600) — flag only; citations held.
- Analogist “Three hold; three do not transfer” vs labeled 1–6 Hold — prose slip only.
- Invented gates: **0**.
- NEW coding PR: **no**.
- URL retrieval: 18/18 VERIFIED (`url-check.json`).

## Score

Scholar **8/8** · Practitioner **8/8** · Analogist **6 Hold-with-limit · 7–8 Fail-transfer**

✅ Builder may land


# STUDY-RK-113 handoff (Verifier scorecard + land guidance)

Land five files under research/STUDY-RK-113/ from outbox. NEW coding PR: no. KEEP #15 OPEN. Do not restack #13/#14/#15. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.
