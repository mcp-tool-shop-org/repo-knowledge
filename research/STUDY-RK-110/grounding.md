# STUDY-RK-110 Research grounding
**Tip open:** `96b4e42` (= origin/main after STUDY-RK-109)
**Job:** `--json` / CLI-JSON-CORE ON MAIN vs open #13/#14 · consumer repo-knowledge
**Land tip after:** Builder reports sha + tip

## Adjudication
| Class | Result |
| --- | --- |
| Tip `--json` coverage | CLI-JSON-CORE **PRESENT** ON MAIN in `test/cli-publish.test.ts` (11 live its + dist skip gate); related `rk doctor --json` under CLI-PR-003 |
| `test/json.test.ts` | **ABSENT** — filename absence non-blocking (coverage is CLI-JSON-CORE) |
| #13/#14 `--json` test ownership | **0** (#13 errors+audit · #14 doctor/feed/table/health) |
| NEW coding PR | **no** (tip coverage holds; do not restack #13/#14) |
| Soft folklore | invent tip-lacks-json-coverage / invent restack-#13/#14 / invent risk-free merge / invent STUDY-RK-131: **0** |

REAFFIRM 038/067 KEEP dual human+`--json` (context only). KEEP #13/#14 OPEN for their own modules only.

## Verifier scorecard
- Scholar **8/8** VERIFIED (arXiv open) · process flag: word count 828 > 500–600
- Practitioner **8/8** VERIFIED
- Analogist **6 Hold** VERIFIED · 7–8 Fail-transfer
- Soft folklore invent gates: **0**

## Implications (verified only)
- Tip inventory — CLI-JSON-CORE `--json` regression already on main; open dedicated-vitest PRs do not own `--json` tests.
- Peer-reviewed / analog support — tip-embedded describe is coverage SoR; do not invent parallel `test/json.test.ts` PR or restack onto #13/#14.

## Builder instructions
- Study land only: copy five files under `research/STUDY-RK-110/` from `/workspace/studio/outbox-STUDY-RK-110/` (pack-scholar.md · pack-practitioner.md · pack-analogist.md · grounding.md · handoff.md).
- NEW coding PR: **no**. Do not restack #13/#14.
- Clone `/workspace/studio/repo-knowledge`. gh as mcp-tool-shop. Org noreply. No identity strings. Never npm publish.
- 🛑 do not merge #6 #8 #12–#28. Do not invent STUDY-RK-131.

Quiet in group: paths · land sha · tip · stop.
