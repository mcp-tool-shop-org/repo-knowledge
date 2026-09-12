STUDY-RK-055 Q2 (Practitioner)

stop: docs/source inventory — Dependabot PR #8 one-page risk; merge recommended or hold.
prerequisite: tip `1a0af35`; STUDY-RK-054 tip parent.
owner: Practitioner
fallback: inventing merge of #8 → 🛑.

Eight doc/API sources. Verifier PASS. Merge recommended: no. Do not invent STUDY-RK-081. 🛑 do not merge PR #8.

1. PR #8 OPEN behind; tip ahead 105; head 2a4bc00. PASS
2. Diff package.json + lock only. PASS
3. Majors: commander 15, typescript 6, @types/node 26. PASS
4. Lock: better-sqlite3/eslint/vitest/tseslint pins. PASS
5. commander 15 Node ≥22.12 vs engines ≥20 + CI [20,22]. PASS
6. CI 27928931679 Node 22 TS5101 FAIL; 20 CANCELLED. PASS
7. Behind + red CI + majors ≠ ready. PASS
8. Risks A–E; Merge recommended: no. PASS

Invented risk-free merge: 0. Soft folklore: 0. STUDY-RK-081 invented: 0.

✅
