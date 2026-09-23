# STUDY-RK-106 handoff (Verifier scorecard + land guidance)

# STUDY-RK-106 Verifier scorecard
Tip `49f65b0` (= `49f65b0a91d802677fb9839080373c3e4c28d02f` = origin/main after STUDY-RK-105 land). Consumer repo-knowledge. Named residual follow-up: OUTSIDE HIT root `HANDBOOK.md`.
Retrieval-check ALL THREE packs. Opened every URL. Default unverified on 404/paywall/mismatch. No git write. No code. No merge. Do not invent STUDY-RK-131.

## Tip stamp (local + gh)
- HEAD == `49f65b0` == origin/main · subject `research: stamp STUDY-RK-105 handoff land line` · commit URL HTTP 200.
- `research/STUDY-RK-105/` five files present · `research/STUDY-RK-106/` **absent** · `research/STUDY-RK-131/` **absent**.
- Root `HANDBOOK.md`: `wal_checkpoint`=1 · `cp data/knowledge.db`=1 · `rk backup`=0 · `rk restore`=0 · Disaster Recovery leads with `rm` + `rk init` (no restore) → **OUTSIDE HIT**.
- Tip `README.md` + `src/cli.ts`: `rk backup` / `rk restore` present (CLI authority).
- Open PR file-set union #12/#16–#26: **zero** owners of root `HANDBOOK.md` (all OPEN).
- INSIDE residuals still HIT on tip but covered by OPEN PRs: operations (#23 head `d56c5ed` wal=0 rk-backup>0 vs tip wal=1) · usage (#25 head `06490f4` `--delete` present on head vs tip `--delete`=0 / six Types) · beginners PATH inside #17/#19/#24 (tip still wal FAQ) · getting-started/security (#24 head `dced9f9`) · pages.yml (#26 head `b3911e4`; tip has no `pull_request` trigger).
- Soft folklore invent tip-already-synced / invent risk-free merge / invent STUDY-RK-131 / invent mandatory-new for INSIDE-covered: **0** across packs that reject them.

## Thesis adjudication
Practitioner + Analogist lean **ONE HANDBOOK-only leftover docs PR: yes** while OUTSIDE HIT persists. Scholar documents scoped leftover **allowed** (no PR opened by Scholar). That is the **named residual** this study authorizes — **not** the 105 invent-mandatory-new-leftover-PR gate.
- Invent mandatory-new for **INSIDE**-covered paths = fail (REAFFIRM 105) → clean.
- Invent tip-already-synced / invent risk-free merge covering #12/#16–#26 = fail → clean.
- Invent STUDY-RK-131 = fail → clean.
- NEW coding PR: **no**. INSIDE KEEP NEW PR: **no**. 🛑 do not merge #6 #8 #12–#26.

---

## Scholar — 8/8 VERIFIED
All eight arXiv abs pages HTTP 200; titles match pack; abstracts support the one-sentence findings (open path; no IEEE/Springer paywall this study).

| # | Verdict | Source | One-sentence (verified implication) |
| --- | --- | --- | --- |
| 1 | VERIFIED | Silva, Unterkalmsteiner, Wnuk — 2023 — arXiv:2402.11048 | Customer-facing docs debt stays inventory until the named surface is remediated. |
| 2 | VERIFIED | Tan, Wagner, Treude — 2024 — arXiv:2212.01479 | Dual docs surfaces accumulate stale refs independently; leftovers outside a scoped open-PR file set remain residual. |
| 3 | VERIFIED | Tan, Wagner, Treude — 2023 — arXiv:2307.04291 | Outdated-doc detection is change-set scoped; does not invent merge as clearance of unrelated orphan pages. |
| 4 | VERIFIED | Nassif, Hernandez, Sridharan, Robillard — 2020 — arXiv:2005.08750 | Outdated docs are replaced on the affected artifact — targeted remediation, not invent tip sync via open related PRs. |
| 5 | VERIFIED | Panthaplackel, Nie, Gligoric, Li, Mooney — 2020 — arXiv:2004.12169 | Partial concurrent updates track the related change; scoped residual after inventory fits; invent mandatory-new for INSIDE does not. |
| 6 | VERIFIED | Dau, Guo, Bui / DocChecker — 2024 — arXiv:2306.06347 | Inconsistencies are fixed on the mismatched surface; neighboring open change sets do not invent clearance of an untouched handbook path. |
| 7 | VERIFIED | Radmanesh, Imani, Ahmed, Moshirpour — 2024 — arXiv:2409.10781 | Unremediated inconsistency debt raises defect risk; debt outside open file sets stays actionable after inventory. |
| 8 | VERIFIED | Štěpánek, Kuťák, Kozlíková, Byška — 2024 — arXiv:2407.21621 | Missing/outdated textual docs persist under costly manual maintenance; open related PRs do not invent tip-already-synced for an orphan root handbook. |

Soft folklore invent gates in Scholar pack: **0**.

---

## Practitioner — 8/8 VERIFIED
Tip/gh/API/local paths all open and match.

| # | Verdict | Finding check |
| --- | --- | --- |
| 1 | VERIFIED | Tip stamp `49f65b0` = origin/main; 105 land present; 106 tree absent. |
| 2 | VERIFIED | OPEN #12/#16–#26 file lists: zero `HANDBOOK.md`; holds #6 #8 #12–#26 stay OPEN. |
| 3 | VERIFIED | Root HANDBOOK OUTSIDE HIT persists (wal/`cp`/DR without rk backup/restore). Soft folklore tip-already-synced: fail (correct). |
| 4 | VERIFIED | operations INSIDE #23: tip wal=1 rk-backup=0; head `d56c5ed` wal=0 rk-backup>0 — invent mandatory-new INSIDE: fail. |
| 5 | VERIFIED | usage INSIDE #25: tip `--delete`=0 / six Types; head `06490f4` owns `--delete` + expanded types — NEW duplicate leftover PR: no. |
| 6 | VERIFIED | #24 getting-started/beginners/security OPEN `dced9f9`; tip pages.yml no `pull_request`, #26 OPEN `b3911e4` — INSIDE; invent mandatory-new: fail. |
| 7 | VERIFIED | beginners tip still wal FAQ; PATH inside #17/#19/#24 — coordinate only; not a second mandatory path PR. |
| 8 | VERIFIED | Warrant (scoped): because HANDBOOK OUTSIDE HIT persists after 105, **ONE scoped leftover docs PR: yes** (HANDBOOK-only). NEW coding PR: **no**. Soft folklore invent risk-free merge / STUDY-RK-131: fail. (Aligned with 106 thesis — not the 105 invent-mandatory-new folklore.) |

---

## Analogist — 5 Hold VERIFIED · #2 UNVERIFIED · 7–8 Fail-transfer
| # | Verdict | Analog | Note |
| --- | --- | --- | --- |
| 1 | Hold VERIFIED | Fowler Technical Debt Quadrant · https://martinfowler.com/bliki/TechnicalDebtQuadrant.html · HTTP 200 | After stamp, one deliberate repayment targets the named residual. Limit: ≠ invent tip-already-synced. |
| 2 | **UNVERIFIED** | PagerDuty runbook / known error · https://www.pagerduty.com/resources/automation/learn/what-is-a-runbook/ · HTTP 200 | Page is a **runbook** explainer; **“known error” not on page** → claim mismatch. Do not land as verified. |
| 3 | Hold VERIFIED | GitHub Docs contributing · https://docs.github.com/en/contributing/collaborating-on-github-docs/about-contributing-to-github-docs · HTTP 200 | Content PRs / scoped path contributions; HANDBOOK-only shape fits. Limit: ≠ invent mandatory-new INSIDE. |
| 4 | Hold VERIFIED | Diátaxis · https://diataxis.fr/ · HTTP 200 | Distinct doc surfaces drift on different clocks; open site PRs ≠ sync root HANDBOOK. Limit: ≠ invent tip-already-synced. |
| 5 | Hold VERIFIED | documentation-gap-finder skill · https://github.com/Notysoty/openagentskills/blob/main/skills/documentation-gap-finder/SKILL.md · HTTP 200 + raw | Gap audit lists undocumented/outdated paths then prioritize write order. Limit: ≠ invent risk-free merge. |
| 6 | Hold VERIFIED | driftsync · https://pkg.go.dev/github.com/karosia/driftsync/cmd/driftsync (+ README) · HTTP 200 | Automation proposes narrow residual PR; human merges. Limit: ≠ invent tip already has HANDBOOK; NEW coding PR: no. |
| 7 | Fail-transfer | invent tip-already-synced / invent risk-free merge / invent mandatory-new INSIDE | Correct reject. Soft folklore: 0. |
| 8 | Fail-transfer | invent STUDY-RK-131 / treat residual as coding gap / Analogist-fake Scholar\|Practitioner | Correct reject. NEW coding PR: no. |

---

## Soft folklore invent gates
| Gate | Result |
| --- | --- |
| invent tip-already-synced | **0** |
| invent risk-free merge (#12/#16–#26 clearance) | **0** |
| invent STUDY-RK-131 | **0** |
| invent mandatory-new for INSIDE-covered | **0** |
| named residual ONE HANDBOOK-only leftover docs PR while OUTSIDE HIT | **holds** (thesis-aligned; Scholar = allowed · Practitioner #8 / Analogist Hold = yes) |

## Implications (verified only)
- Silva et al. 2023 arXiv:2402.11048 — Named customer-facing docs surface unpaid until remediated.
- Tan et al. 2024 arXiv:2212.01479 — Leftovers outside open change-set file sets stay residual.
- Tip inventory — root `HANDBOOK.md` OUTSIDE HIT; union #12/#16–#26 omits it; CLI already has backup/restore.
- Fowler Technical Debt Quadrant — One deliberate repayment change for the named residual after stamp.
- GitHub Docs contributing / Diátaxis / driftsync — Scoped single-path docs PR is the right shape; multi-surface open PRs do not clear root; merge stays human.

## Unverified (flag for Builder land)
- Analogist #2 PagerDuty “known-error” claim — runbook page mismatch.

## Land guidance
- Study land only · five files under `research/STUDY-RK-106/` · preserve Analogist #2 UNVERIFIED flag.
- NEW coding PR: **no**.
- INSIDE KEEP NEW PR: **no**.
- Named residual: Coordinator may frame ONE scoped leftover docs PR (HANDBOOK-only) as **holding** while OUTSIDE HIT persists — **do not** open it from this Verifier seat; Builder does not open coding PRs from study land.
- 🛑 do not merge #6 #8 #12–#26.

✅ Builder may land · 🛑 Coordinator · 🔧 seat rework
