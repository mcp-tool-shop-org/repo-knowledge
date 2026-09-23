# STUDY-RK-103 — Research grounding

**Date:** 2026-09-23 (America/New_York)
**Tip at open:** `e50aeeb` (`e50aeeb552672170cfea63c3afb107d5a8024514` = origin/main)
**Consumer:** repo-knowledge · mcp-tool-shop-org/repo-knowledge
**Job:** one-page CI red/green board for open PRs #6 #8 #12–#26 · study land only

## Thesis
REAFFIRM status inventory holds; green⇒merge fails-transfer.

| Class | Count | PRs |
| --- | --- | --- |
| GREEN | 7 | #6 (CONFLICTING/DIRTY — green ≠ mergeable) · #13 #14 #15 #17 #22 #26 (MERGEABLE/BEHIND — head green ≠ tip) |
| RED | 1 | #8 (MERGEABLE/BEHIND; Node22 FAILURE · Node20 CANCELLED) |
| NONE / NO_CHECKS | 9 | #12 #16 #18–#21 #23–#25 (empty rollup; absence ≠ green) |
| PENDING | 0 | — |

Open #6 #8 #12–#26 stay OPEN (`mergedAt=null`). NEW coding PR: **no**. 🛑 do not merge. Soft folklore invent merge / invent green⇒merge / invent STUDY-RK-131: **0**. Do not invent STUDY-RK-131.

## Verifier scorecard
- Scholar **1/8** — #3 VERIFIED (Vasilescu et al. 2015 arXiv:1512.01862) · #1–#2 · #4–#8 UNVERIFIED
- Practitioner **7/8** — #4 UNVERIFIED (#8 rollup CANCELLED+FAILURE ≠ pack “both fail”)
- Analogist **5 Hold VERIFIED · #3 UNVERIFIED · 7–8 Fail-transfer**

## Flags (do not land as verified)
- Scholar #1 Hilton 2016 — claim not on ACM page
- Scholar #2 Vasilescu Yu 2015 — ACM cookieAbsent
- Scholar #4 Cassee 2020 — IEEE empty
- Scholar #5 Labuschagne 2017 — ACM cookieAbsent
- Scholar #6 Luo 2014 — ACM cookieAbsent
- Scholar #7 Shahin 2018 — claim overreach on arXiv
- Scholar #8 Gallaba 2020 — IEEE empty
- Practitioner #4 — #8 wording mismatch (CANCELLED+FAILURE)
- Analogist #3 — GraphQL MergeStateStatus enum page empty of claim

## Implications (verified only)
- Open-PR CI failure rates stay review evidence, not green-as-merge (Vasilescu et al., 2015, arXiv:1512.01862).
- Inventory-only board at tip `e50aeeb`: #6 green≠mergeable; nine NONE; six SUCCESS heads BEHIND; contracts hold anti-invent.
- Status inventory / head-only green / path-absent NONE / OPEN≠merged hold; green⇒merge fails-transfer. Do not land Analogist GraphQL #3 as verified.

## Coding
NEW coding PR: **no**. Study stamp only under `research/STUDY-RK-103/`. 🛑 do not merge #6 #8 #12–#26. Never npm publish. Org noreply. No identity strings.

## Source (cp verbatim)
`/workspace/studio/outbox-STUDY-RK-103/{pack-scholar,pack-practitioner,pack-analogist,grounding,handoff}.md` (+ scorecard.md sidecar optional)

✅
