# STUDY-RK-115 Verifier scorecard — tip `3cb5dd9`

**Job:** tip content residual under INSIDE covering PRs — held inventory ≠ tip-already-synced.  
**Tip gate:** HEAD = origin/main = `3cb5dd9466c3a1b78275013df39fdfe36cfa1b21` (stamp STUDY-RK-114). Tip match ✅.  
**Open holds:** #6 #8 #12–#26 #28. No STUDY-RK-131 on disk.  
**Soft folklore invent tip-already-synced / invent mandatory-new-leftover-PR / invent risk-free merge / invent STUDY-RK-131:** **0** (all three packs).  
**Invented gates:** 0.  
**NEW leftover/coding PR:** **no**.  
**Thesis:** REAFFIRM 114 + 081/082/083/094/105/106. KEEP holds OPEN. 🛑 do not merge #6 #8 #12–#28.

## Tip inventory (Verifier re-check)

| residual | tip @ `3cb5dd9` | covering PR | NEW leftover PR |
| --- | --- | --- | --- |
| root `HANDBOOK.md` wal_checkpoint / `cp` | still ON TIP (lines ~39–42); `rk backup` count 0 | **INSIDE #28** OPEN `c323e8f` | **no** |
| `.github/workflows/pages.yml` push-only | `on:` push + workflow_dispatch; `pull_request` = 0 | **INSIDE #26** OPEN `b3911e4` | **no** |
| site `operations.md` wal/`cp` | still ON TIP | **INSIDE #23** OPEN `d56c5ed` | **no** |
| site `usage.md` add-only note / six relate | still ON TIP | **INSIDE #25** OPEN `06490f4` | **no** |
| dedicated errors/audit/doctor/feed/table/github/dogfood/cli-note-delete tests | tip **ABSENT** | **INSIDE #13/#14/#15/#22** OPEN | **no** |

Held inventory ≠ tip-already-synced. Covering heads are not tip SoR until merge.

## Scholar — 8/8 verified

Word count **827** (over 500–600 target — flag only; not Soft folklore fail).

| # | claim | URL | verdict |
| --- | --- | --- | --- |
| 1 | Silva et al. 2023 — outdated customer-facing docs stay inventory until named surface remediated | https://arxiv.org/abs/2402.11048 | **verified** (200; title match) |
| 2 | Tan et al. 2024 — dual surfaces accumulate stale refs independently | https://arxiv.org/abs/2212.01479 | **verified** |
| 3 | Tan/DOCER 2023 — outdated-ref scans change-set scoped | https://arxiv.org/abs/2307.04291 | **verified** |
| 4 | Nassif et al. 2020 — remediate affected artifact | https://arxiv.org/abs/2005.08750 | **verified** |
| 5 | Panthaplackel et al. 2020 — partial concurrent updates; no invent mandatory-new for INSIDE | https://arxiv.org/abs/2004.12169 | **verified** |
| 6 | DocChecker / Dau et al. 2024 — fix mismatched surface | https://arxiv.org/abs/2306.06347 | **verified** |
| 7 | Radmanesh et al. 2024 — unremediated inconsistency raises defect odds | https://arxiv.org/abs/2409.10781 | **verified** |
| 8 | Štěpánek et al. 2024 — outdated docs persist under costly maintenance | https://arxiv.org/abs/2407.21621 | **verified** |

Soft folklore invents: 0. Implications only: tip-visible residual under open covering PRs is held inventory; do not invent tip-already-synced or a second leftover PR.

## Practitioner — 8/8 verified

| # | claim | evidence | verdict |
| --- | --- | --- | --- |
| 1 | tip = origin/main `3cb5dd9`… | local `git rev-parse` | **verified** |
| 2 | HANDBOOK wal/`cp` still on tip; not synced to `rk backup` | tip `HANDBOOK.md` L39–42 | **verified** |
| 3 | #28 covers root HANDBOOK; INSIDE → NEW leftover no | https://github.com/mcp-tool-shop-org/repo-knowledge/pull/28 · head `c323e8f` OPEN · files `[HANDBOOK.md]` | **verified** |
| 4 | pages.yml push-only residual on tip | tip workflow; no `pull_request` | **verified** |
| 5 | #26 adds PR build; INSIDE → NEW leftover no | https://github.com/mcp-tool-shop-org/repo-knowledge/pull/26 · head `b3911e4` OPEN · files `[pages.yml]` | **verified** |
| 6 | site ops/usage residuals vs #23/#25 | tip files + PRs #23 `d56c5ed` · #25 `06490f4` OPEN | **verified** |
| 7 | dedicated-test ABSENCE vs #13/#14/#15/#22 | tip ABSENT; heads PRESENT those files | **verified** |
| 8 | hold set OPEN; REAFFIRM 114 + 081/082/083/094/105/106; no merge invent | open PR API; research dirs present | **verified** |

Soft folklore invents: 0. **NEW leftover/coding PR: no.** KEEP holds OPEN.

## Analogist — 6 Hold-with-limit · 7–8 Fail-transfer

| # | analog | URL | verdict |
| --- | --- | --- | --- |
| 1 | tip baseline ≠ open PR head (status checks) | https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks | **verified** Hold-with-limit (200) |
| 2 | covered debt stays inventoried (Fowler TDQ) | https://martinfowler.com/bliki/TechnicalDebtQuadrant.html | **verified** Hold-with-limit |
| 3 | multi-surface docs clocks (Diátaxis) | https://diataxis.fr/ | **verified** Hold-with-limit |
| 4 | content PRs own file set until merge | https://docs.github.com/en/contributing/collaborating-on-github-docs/about-contributing-to-github-docs | **verified** Hold-with-limit |
| 5 | known-error on backlog while fix ticket exists (PagerDuty runbook) | https://www.pagerduty.com/resources/automation/learn/what-is-a-runbook/ | **verified** Hold-with-limit |
| 6 | lit counts landed tip tests (LLVM Testing Guide) | https://llvm.org/docs/TestingGuide.html | **verified** Hold-with-limit |
| 7 | invent tip-already-synced / mandatory-new / risk-free merge | Fail-transfer (policy row) | **Fail-transfer** Soft folklore 0 |
| 8 | invent STUDY-RK-131 / treat held residual as cleared tip | Fail-transfer (policy row) | **Fail-transfer** Soft folklore 0 |

## Scorecard

| seat | score | Soft folklore invent |
| --- | --- | --- |
| Scholar | **8/8** (word count over — flag) | 0 |
| Practitioner | **8/8** | 0 |
| Analogist | **6 Hold-with-limit · 7–8 Fail-transfer** | 0 |

**URL open rate:** 22/22 HTTP 200 (8 arXiv + 8 PR pages + 6 analog docs).  
**Unverified rows:** 0.  
**OUTSIDE product HIT invent / tip-already-synced invent:** no.  
**Builder land:** study land only — five files under `research/STUDY-RK-115/`. No coding PR. No merge.

### Implications (verified only)

Author + year + id + one sentence:

1. Silva et al. 2023 (arXiv:2402.11048) — outdated customer-facing docs remain inventory until the named surface is fixed; tip residual under #28 is not tip-already-synced.  
2. Tan et al. 2024 (arXiv:2212.01479) — dual doc surfaces accumulate stale refs independently; covering open PRs do not invent tip sync.  
3. Tan/Wagner/Treude 2023 (arXiv:2307.04291) — outdated-ref scans are change-set scoped; open holds do not invent tip-already-synced.  
4. Nassif et al. 2020 (arXiv:2005.08750) — remediate the affected artifact; adjacent opens do not clear tip content.  
5. Panthaplackel et al. 2020 (arXiv:2004.12169) — partial concurrent updates fit scoped residual; invent mandatory-new for INSIDE-covered paths fails.  
6. Dau/Guo/Bui 2024 (arXiv:2306.06347) — fix the mismatched surface; second leftover PR while covering OPEN fails.  
7. Radmanesh et al. 2024 (arXiv:2409.10781) — unremediated inconsistency stays owned by covering change sets.  
8. Štěpánek et al. 2024 (arXiv:2407.21621) — outdated docs persist under costly maintenance; open related PRs ≠ tip sync.  
9. Practitioner tip+PR inventory 2026-09-23 — HANDBOOK/#28, pages/#26, ops/#23, usage/#25, dedicated-tests/#13–#15/#22 all INSIDE OPEN → NEW leftover/coding PR **no**.

🛑 do not merge #6 #8 #12–#28.

Staged: `/workspace/studio/outbox-STUDY-RK-115/verifier.md`

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework


# STUDY-RK-115 handoff (Verifier scorecard + land guidance)

Land five files under research/STUDY-RK-115/ from outbox. NEW leftover/coding PR: no. KEEP holds OPEN. 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.
