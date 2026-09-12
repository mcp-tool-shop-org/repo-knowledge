STUDY-RK-032 Q2 (Practitioner)

stop: docs/source inventory — MCP tools vs resources vs prompts in server/README/handbook; collapse folklore or study-only.
prerequisite: tip `08c48a8`; STUDY-RK-031 done sha=`979f59d`; STUDY-RK-003/025 extras.
owner: Practitioner
fallback: inventing resources≡tools → 🛑.

Eight doc/API sources. Do not invent STUDY-RK-051.

1. STUDY-RK-003 grounding | path: research/STUDY-RK-003/ | Finding: MCP tool inventory vs writers. PASS

2. server.ts tools-only | path: src/mcp/server.ts | Finding: 30× server.tool; zero resource/prompt registrations. PASS

3. MCP-001/002 IDs | Finding: FAIL — absent from handbook/AUDIT; live in server.ts; delete_repo is MCP-004. UNVERIFIED/FLAG

4. README 30 tools only | path: README.md | Finding: documents tools surface only. PASS

5. MCP Tools spec | Finding: Tools distinct primitive. PASS

6. MCP Resources spec | Finding: Resources distinct primitive. PASS

7. MCP Prompts spec | Finding: Prompts distinct primitive. PASS

8. Gaps | Finding: tools-only product + handbook undercount history; not protocol collapse (resources≠tools). PASS

**Verifier flag (do not land as verified):** Practitioner #3 FAIL (MCP-001/002 IDs absent from handbook/AUDIT). Invented collapse: 0. Soft folklore: 0.

✅
