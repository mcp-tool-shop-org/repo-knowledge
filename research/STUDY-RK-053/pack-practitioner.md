STUDY-RK-053 Q2 (Practitioner)

stop: docs/source inventory — FTS triggers on note --delete (v2.1.1); residual coding gap or study-only.
prerequisite: tip `cf0d832`; STUDY-RK-052 tip parent.
owner: Practitioner
fallback: inventing missing DELETE triggers → 🛑.

Eight doc/API sources. All Verifier PASS. Coding for absent triggers: no. Do not invent STUDY-RK-081. Do not merge PR #22.

1. Tip cf0d832; cli-note-delete.test.ts absent on tip (PR #22 OPEN). PASS
2. migration-005 trg_repo_search_notes_delete AFTER DELETE present. PASS
3. openDb wires MIGRATION_005; deleteNote hard DELETE fires trigger. PASS
4. CLI rk note --delete + CHANGELOG v2.1.1. PASS
5. PH-DB-007 pins trg_repo_search_notes_delete. PASS
6. fts.test INSERT-only; no DELETE→search case. PASS
7. STUDY-RK-035 CLI integration gap. PASS
8. Residual: fts DELETE untested; tip DELETE trigger not missing; coding for absent triggers: no. PASS

Invented missing-delete-triggers: 0. Soft folklore: 0. STUDY-RK-081 invented: 0.

✅
