# STUDY-RK-023 — Builder handoff

**Date:** 2026-09-11
**Four fields:**
- stop: Land research/STUDY-RK-023/ five files + coding dedicated vitest for health doctor/feed/table; branch; npm test + npm run verify; open PR; do not merge. Flag Analogist #4 unverified. Org noreply. Need sha + PR URL.
- prerequisite: Verifier ✅ + Coordinator grounding. Tip `55fcc39`. STUDY-RK-022 done sha=`53e8137` PR #13.
- owner: builder
- fallback: path/sha fail → stop; do not merge; do not npm publish; do not invent coverage % or STUDY-RK-051.

**Verifier scorecard:** Scholar 8/8 · Practitioner 8/8 · Analogist 1–3/5–6 hold; #4 unverified; 7–8 fail-transfer. Invented gates: 0.

**Coding PR plan:** dedicated test/doctor.test.ts, test/feed.test.ts, test/table.test.ts (or CONVENTIONS-matching) locking buildRepoDoctor+renderDoctorText, buildFeed(+kevList)+renderFeedText, buildHealthTable+renderHealthTableText including thin branches; keep/migrate health-commands asserts; no invented module %.

**Outcome:** Research packs landed. Coding PR (pending).

**Landed:**
- `/workspace/studio/repo-knowledge/research/STUDY-RK-023/{pack-scholar,pack-practitioner,pack-analogist,grounding,handoff}.md`

**sha:** (pending commit)
**PR:** (pending)
