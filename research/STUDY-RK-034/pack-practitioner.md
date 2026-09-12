STUDY-RK-034 Q2 (Practitioner)

stop: docs/source inventory — vanished-repo archival opt-in vs auto-archive-default folklore; residual coding bug or study-only.
prerequisite: tip `455a6fb`; STUDY-RK-033 done sha=`45003ee`; STUDY-RK-007 extras.
owner: Practitioner
fallback: inventing auto-archive-vanished-default → 🛑.

Eight doc/API sources. All Verifier PASS. Coding: none mandatory. Do not invent STUDY-RK-051.

1. STUDY-RK-007 + 033 grounding | paths: research/STUDY-RK-007/, research/STUDY-RK-033/ | Finding: fail-closed sync lineage; empty-fetch ≠ archive. PASS

2. a5b8e3e opt-in | Finding: opt-in after visibility-guard. PASS

3. pruneVanished default false | Finding: safe default. PASS

4. CLI --prune-vanished default false | Finding: detect+warn; opt-in. PASS

5. fullSync warn path | Finding: warn+hint without auto-archive. PASS

6. CHANGELOG L40 | Finding: documents opt-in behavior. PASS

7. sync-404-archived.test.ts | Finding: safe-default tests. PASS

8. Residual | Finding: stale CHANGELOG L77 auto-archive narrative = docs polish only; no mandatory coding. PASS

Invented auto-archive-vanished-default: 0. Soft folklore: 0.

✅
