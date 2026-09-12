# STUDY-RK-024 — Builder handoff

**Date:** 2026-09-11
**Four fields:**
- stop: Land research/STUDY-RK-024/ five files + coding dedicated vitest for sync/github + dogfood-suggest; branch; npm test + npm run verify; open PR; do not merge. Flag Scholar #1/#6 unverified. HARD: metadata-only; no `.swarm`; no GH source. Org noreply. Need sha + PR URL.
- prerequisite: Verifier ✅ + Coordinator grounding. Tip `5f74850`. STUDY-RK-023 done sha=`6e34cc9` PR #14.
- owner: builder
- fallback: path/sha fail → stop; HARD violation → stop; do not merge; do not npm publish; do not invent coverage % or STUDY-RK-051.

**Verifier scorecard:** Scholar 6/8 (#1/#6 unverified) · Practitioner 8/8 · Analogist 1–6 hold; 7–8 fail-transfer. Invented gates: 0.

**Coding PR plan:** dedicated test/github.test.ts + test/dogfood-suggest.test.ts (or CONVENTIONS-matching) with mocked gh metadata / local DB facts only; keep sync-404-archived + dogfood-* as integration or migrate; no invented module %.

**Outcome:** Research packs landed. Coding PR (pending).

**Landed:**
- `/workspace/studio/repo-knowledge/research/STUDY-RK-024/{pack-scholar,pack-practitioner,pack-analogist,grounding,handoff}.md`

**sha:** `b8524e8`
**PR:** (pending)
