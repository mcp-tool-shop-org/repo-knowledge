STUDY-RK-035 Q2 (Practitioner)

stop: docs/source inventory — classify + note --delete (v2.1.1); CLI integration test gap for note --delete.
prerequisite: tip `a1e828a`; STUDY-RK-034 done sha=`887c58d`.
owner: Practitioner
fallback: inventing silent-delete-default / mandatory confirm-gate → 🛑.

Eight doc/API sources. All Verifier PASS. Do not invent STUDY-RK-051.

1. CHANGELOG v2.1.1 | Finding: classify + note --delete documented. PASS

2. README | Finding: surfaces note --delete. PASS

3. cli note --delete | path: src/cli.ts | Finding: explicit --delete; no confirm/--yes required today. PASS

4. deleteNote hard SQL | Finding: hard delete (not soft). PASS

5. classify set/clear only | Finding: no --delete on classify. PASS

6. Contrast confirm-gated deletes | Finding: repo delete/prune are confirm-gated contrast. PASS

7. Unit tests deleteNote + classify | path: test/db.test.ts | Finding: unit coverage exists. PASS

8. CLI integration test gap | Finding: CLI note --delete success/not-found/misuse tests missing — held as coding target. PASS

Invented silent-delete-default: 0. Soft folklore: 0.

✅
