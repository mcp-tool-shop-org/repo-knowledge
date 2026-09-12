STUDY-RK-059 Q2 (Practitioner)

stop: docs/source inventory — PRs #15+#16 / 024/025 one-page; merge recommended or hold.
prerequisite: tip `e827776`; STUDY-RK-058 tip parent.
owner: Practitioner
fallback: inventing merge of #15/#16 → 🛑.

Eight doc/API sources. Verifier PASS. Merge recommended: no. Do not invent STUDY-RK-081 or coverage %. 🛑 do not merge #15/#16.

1. #15+#16 OPEN behind mergeable; tip e827776. PASS
2. #15: github + dogfood-suggest vitest; mocks only. PASS
3. #16: mcp-server+index 19→30; not reuse #12. PASS
4. Tip: #15 files ABSENT; handbook still 19; research 024/025 landed. PASS
5. #15 disjoint #13/#14; #16 overlaps #12. PASS
6. Behind ~59/#15 · ~56/#16; #15 CI old green; #16 no checks. PASS
7. Residual: test/docs debt + process queue. PASS
8. Merge recommended: no. PASS

Invented risk-free merge: 0. Soft folklore: 0. STUDY-RK-081 invented: 0.

✅
