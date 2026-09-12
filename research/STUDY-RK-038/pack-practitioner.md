STUDY-RK-038 Q2 (Practitioner)

stop: docs/source inventory — --json on core/audit/ops commands; residual coding gap or study-only.
prerequisite: tip `e9716ad`; STUDY-RK-037 done sha=`4581731` PR #23; STUDY-RK-003 extras.
owner: Practitioner
fallback: inventing json-as-only-output / JSON-only UX → 🛑.

Eight doc/API sources. All Verifier PASS. Coding: none. Do not invent STUDY-RK-051.

1. CHANGELOG | Finding: --json coverage documented. PASS
2. README | Finding: dual human+`--json` surfaces. PASS
3. emit / notFoundJson | Finding: shared JSON emit helpers. PASS
4. 19 cmds with --json | Finding: core+audit+ops (19). PASS
5. without flag | Finding: default stays text. PASS
6. schema | Finding: JSON schema/shape holds for covered cmds. PASS
7. CLI-JSON-CORE tests | Finding: core JSON tests present. PASS
8. Residual versions/drift | Finding: versions/drift lack flag + thinner tests = polish only; no mandatory coding. PASS

Invented json-as-only-output: 0. Soft folklore: 0.

✅
