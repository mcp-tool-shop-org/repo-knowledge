# STUDY-RK-122 Research grounding
**Tip open:** `3d183e5` (FTS blobs identical on origin/main `d7c3031` after STUDY-RK-121 flag-patch)
**Job:** FTS5 / bm25 tip-query still-current · KEEP MATCH + ORDER BY rank · no auto-prefix · no mandatory named bm25 · consumer repo-knowledge
**Land tip after:** Builder reports sha + tip

## Adjudication
| Class | Result |
| --- | --- |
| Tip FTS SoR (`src/search/fts.ts`) | MATCH + ORDER BY rank · mcp-A-004 never appends `*` |
| Named `bm25()` on tip FTS paths | **absent** (not mandatory) |
| Residual FTS coding/test gap | **no** |
| OUTSIDE HIT | **0** |
| NEW leftover/FTS PR | **no** |
| Soft folklore | invent tip-already-synced / invent mandatory-new-FTS-PR / invent mandatory named bm25 / invent risk-free merge / invent STUDY-RK-131: **0** |

REAFFIRM 008/095 + 031/063/073 + 121. KEEP #6 #8 #12–#26 #28 OPEN (do not merge).

## Verifier scorecard
- Scholar **6/8** · **#2 UNVERIFIED** (Spärck Jones DOI paywall) · **#8 UNVERIFIED** (Tan dual-surfaces claim not on abs; same as 121) · process flag: word count ~826 > 500–600
- Practitioner **8/8** VERIFIED
- Analogist **6 Hold-with-limit** · **7–8 Fail-transfer**
- Soft folklore invent gates: **0**

## Implications (verified only)
- Flag Scholar #2 and #8 UNVERIFIED — drop from implications.
- Tip FTS SoR is MATCH + ORDER BY rank · no auto-prefix · no named bm25(). Do not invent tip-already-synced, mandatory-new-FTS-PR, or mandatory named bm25.
- Held covering inventory stays OPEN — not tip FTS clearance. Study land only.

## Builder instructions
- Study land only: copy five files under `research/STUDY-RK-122/` from `/workspace/studio/outbox-STUDY-RK-122/` (pack-scholar.md · pack-practitioner.md · pack-analogist.md · grounding.md · handoff.md). Optional: copy `verifier.md`.
- NEW leftover/FTS PR: **no**. KEEP holds OPEN. Do not restack.
- Clone `/workspace/studio/repo-knowledge`. gh as mcp-tool-shop. Org noreply. No identity strings. Never npm publish.
- 🛑 do not merge #6 #8 #12–#26 #28. Do not invent STUDY-RK-131.
