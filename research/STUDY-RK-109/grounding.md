# STUDY-RK-109 Research grounding
**Tip open:** `8299e8b` (= origin/main after STUDY-RK-108)
**Job:** backup/restore coverage ON MAIN vs open #13/#14 · consumer repo-knowledge
**Land tip after:** Builder reports sha + tip

## Adjudication
| Class | Result |
| --- | --- |
| Tip backup/restore coverage | CLI-PR-001 **PRESENT** ON MAIN in `test/cli-publish.test.ts` (2 live its + dist skip gate); tip CLI `rk backup`/`rk restore` in `src/cli.ts` |
| `test/backup.test.ts` | **ABSENT** — filename absence non-blocking (coverage is CLI-PR-001) |
| #13/#14/#23/#28 backup-test ownership | **0** (#13 errors+audit · #14 doctor/feed/table/health · #23 docs ops/CHANGELOG · #28 HANDBOOK only) |
| NEW coding PR | **no** (tip coverage holds; do not restack #13/#14) |
| Soft folklore | invent tip-lacks-backup-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0** |

REAFFIRM 037/066/#23 context only — do not merge #23. KEEP #13/#14 OPEN for their own modules only.

## Verifier scorecard
- Scholar **8/8** VERIFIED (arXiv open) · process flag: word count 834 > 500–600
- Practitioner **8/8** VERIFIED
- Analogist **6 Hold** VERIFIED · 7–8 Fail-transfer
- Soft folklore invent gates: **0**

## Implications (verified only)
- Tip inventory — backup/restore regression already on main via CLI-PR-001; open dedicated-vitest / docs PRs do not own backup tests.
- Peer-reviewed / analog support — tip-embedded describe is coverage SoR; do not invent parallel `test/backup.test.ts` PR or restack onto #13/#14.

## Builder instructions
- Study land only: copy five files under `research/STUDY-RK-109/` from `/workspace/studio/outbox-STUDY-RK-109/` (pack-scholar.md · pack-practitioner.md · pack-analogist.md · grounding.md · handoff.md).
- NEW coding PR: **no**. Do not restack #13/#14. Do not touch #23/#28 for backup tests.
- Clone `/workspace/studio/repo-knowledge`. gh as mcp-tool-shop. Org noreply. No identity strings. Never npm publish.
- 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.

Quiet in group: paths · land sha · tip · stop.
