# STUDY-RK-112 Research grounding
**Tip open:** `48141a1` (= origin/main after STUDY-RK-111)
**Job:** errors/audit coverage ON MAIN vs open #13 · consumer repo-knowledge
**Land tip after:** Builder reports sha + tip

## Adjudication
| Class | Result |
| --- | --- |
| Tip audit coverage | `test/audit-import.test.ts` **PRESENT** ON MAIN (~30 live its: seedControls + getLatestAudit/getAuditPosture/getOpenFindings/getPortfolioPosture/findByAuditStatus/compareRuns) + mcp/cli/dep-audit seats |
| Dedicated `test/errors.test.ts` / `audit-controls.test.ts` / `audit-queries.test.ts` | **ABSENT** — filename absence non-blocking; residual owned by #13 |
| `src/errors.ts` | orphan on tip (zero tip importers) — residual on #13 |
| #13 dedicated-file residual | **OWNED** by #13 OPEN head `ce6743a` — KEEP #13 OPEN; do not restack |
| #14/#15 | orthogonal (doctor/feed/table · github+dogfood-suggest) |
| NEW coding PR | **no** (tip audit coverage holds; residual already on #13) |
| Soft folklore | invent tip-lacks-errors-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131: **0** |

REAFFIRM 022/058 (context only). KEEP #13/#14/#15 OPEN for their own modules only.

## Verifier scorecard
- Scholar **8/8** VERIFIED (arXiv open) · process flag: word count ~861 > 500–600
- Practitioner **8/8** VERIFIED
- Analogist **6 Hold** VERIFIED · 7–8 Fail-transfer
- Soft folklore invent gates: **0** · URLs 18/18 VERIFIED

## Implications (verified only)
- Tip inventory — audit regression already on main via audit-import (+ seats); dedicated errors/audit-controls/audit-queries filenames remain open inventory on #13 only.
- Peer-reviewed / analog support — tip-embedded suite is coverage SoR; do not invent parallel dedicated-file coding PR or restack onto #13/#14/#15.

## Builder instructions
- Study land only: copy five files under `research/STUDY-RK-112/` from `/workspace/studio/outbox-STUDY-RK-112/` (pack-scholar.md · pack-practitioner.md · pack-analogist.md · grounding.md · handoff.md).
- NEW coding PR: **no**. Do not restack #13/#14/#15. KEEP #13 OPEN.
- Clone `/workspace/studio/repo-knowledge`. gh as mcp-tool-shop. Org noreply. No identity strings. Never npm publish.
- 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.

Quiet in group: paths · land sha · tip · stop.
