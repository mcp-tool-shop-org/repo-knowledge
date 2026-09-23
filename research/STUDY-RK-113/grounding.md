# STUDY-RK-113 Research grounding
**Tip open:** `e9bfdb6` (= origin/main after STUDY-RK-112)
**Job:** sync/github + dogfood-suggest coverage ON MAIN vs open #15 · consumer repo-knowledge
**Land tip after:** Builder reports sha + tip

## Adjudication
| Class | Result |
| --- | --- |
| Tip github coverage | `test/sync-404-archived.test.ts` **PRESENT** ON MAIN (10 live its · imports `syncGitHub` from `src/sync/github.js`) |
| Tip dogfood-suggest coverage | `test/dogfood-swarm-sync.test.ts` (14 its · `suggestBySurface`) + `test/dogfood-intelligence-sync.test.ts` (11 its · `suggestByRepo`/`suggestBySurface`) + mcp `suggest_dogfood` ON MAIN |
| Dedicated `test/github.test.ts` / `dogfood-suggest.test.ts` | **ABSENT** — filename absence non-blocking; residual owned by #15 |
| #15 dedicated-file residual | **OWNED** by #15 OPEN head `e75f703` — KEEP #15 OPEN; do not restack |
| #13/#14 | orthogonal (errors/audit · doctor/feed/table) |
| NEW coding PR | **no** (tip github+dogfood coverage holds; residual already on #15) |
| Soft folklore | invent tip-lacks-github-dogfood-coverage / invent restack-#13/#14/#15 / invent risk-free merge / invent STUDY-RK-131: **0** |

REAFFIRM 024/059 (context only). KEEP #13/#14/#15 OPEN for their own modules only.

## Verifier scorecard
- Scholar **8/8** VERIFIED (arXiv open) · process flag: word count ~856 > 500–600
- Practitioner **8/8** VERIFIED
- Analogist **6 Hold** VERIFIED · 7–8 Fail-transfer · prose slip (“Three hold…”) vs labeled 1–6 Hold — flag only
- Soft folklore invent gates: **0** · URLs 18/18 VERIFIED

## Implications (verified only)
- Tip inventory — github + dogfood-suggest regression already on main via sync-404-archived + dogfood-*-sync (+ mcp); dedicated github/dogfood-suggest filenames remain open inventory on #15 only.
- Peer-reviewed / analog support — tip-embedded suite is coverage SoR; do not invent parallel dedicated-file coding PR or restack onto #13/#14/#15.

## Builder instructions
- Study land only: copy five files under `research/STUDY-RK-113/` from `/workspace/studio/outbox-STUDY-RK-113/` (pack-scholar.md · pack-practitioner.md · pack-analogist.md · grounding.md · handoff.md).
- NEW coding PR: **no**. Do not restack #13/#14/#15. KEEP #15 OPEN.
- Clone `/workspace/studio/repo-knowledge`. gh as mcp-tool-shop. Org noreply. No identity strings. Never npm publish.
- 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.

Quiet in group: paths · land sha · tip · stop.
