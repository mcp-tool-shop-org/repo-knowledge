STUDY-RK-064 Q3 Analogist — tip `ad4b6ef`
Six hold-with-limit; two fail-transfer. Soft folklore invent resources≡tools / everything-is-a-tool: 0. STUDY-RK-081 invented: 0. No coding PR.

1. MCP tools (model-invoked actions) — MCP Spec tools — ongoing — https://modelcontextprotocol.io/specification/2026-07-28/server/tools — Hold-with-limit: tools/call is a distinct primitive; tip correctly centers tools. Limit: tools capability alone does not erase resources/prompts as protocol concepts.

2. MCP resources (URI context reads) — MCP Spec resources — ongoing — https://modelcontextprotocol.io/specification/2026-07-28/server/resources — Hold-with-limit: resources/read / list share data by URI, not tool invocation. Limit: tip omitting resources is product scope, not resources≡tools or a bug.

3. MCP prompts (templated message packs) — MCP Spec prompts — ongoing — https://modelcontextprotocol.io/specification/2025-11-25/server/prompts — Hold-with-limit: prompts/get returns messages for the model, not a tool side-effect. Limit: unused prompts ≠ invent everything-is-a-tool.

4. Spec lists Resources, prompts, and tools as separate server features — MCP Spec basic — ongoing — https://modelcontextprotocol.io/specification/2026-07-28/basic/index — Hold-with-limit: three named server features; collapsing them invents Soft folklore. Limit: advertising one capability is allowed; collapse is not.

5. HTTP safe GET vs unsafe POST — RFC 9110 / IANA methods — ongoing — https://www.iana.org/assignments/http-methods/http-methods.xhtml — Hold-with-limit: read/context vs action are protocol-distinct; maps to resources/read vs tools/call. Limit: HTTP verbs ≠ MCP JSON-RPC names.

6. Connect RPC NO_SIDE_EFFECTS → GET-eligible — Connect Protocol — ongoing — https://connectrpc.com/docs/protocol/ — Hold-with-limit: side-effect-free reads stay off mutating call paths. Limit: Connect ≠ MCP stdio; still rejects invent all-as-tools.

7. Soft folklore invent resources≡tools / invent missing-resource coding bug / invent everything-is-a-tool — Fail-transfer: Soft folklore: 0. Concrete coding bug = no. KEEP three primitives distinct. No coding PR.

8. invent STUDY-RK-081 or treat tools-only tip as protocol collapse — Fail-transfer: do not invent STUDY-RK-081; STUDY-RK-032 stands; tools-only ≠ wrong.

Verifier: Analogist 1–6 HOLD · 7–8 FAIL-TRANSFER. Soft folklore: 0.

✅
