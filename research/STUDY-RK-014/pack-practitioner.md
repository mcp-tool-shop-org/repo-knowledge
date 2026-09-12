STUDY-RK-014 Q2 — Practitioner

stop: security model no telemetry / tokens never in DB (docs + source).
prerequisite: STUDY-RK-013 done sha=`96662ef`; tip `96662ef`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary SECURITY/README/github.ts state for no telemetry, no credentials stored, gh auth inheritance, and tokens/secrets never in knowledge.db?

Eight doc/API sources. I did not invent What. Telemetry/token-in-DB invented: 0. Do not invent STUDY-RK-021.

1. README Security Model — mcp-tool-shop-org · tip `96662ef` (2026-09-11) · `/workspace/studio/repo-knowledge/README.md` L37–45 — Data touched: local SQLite + gh metadata (no source); NOT touched: no credentials stored, no data sent to external services; **No telemetry, no analytics, no phone-home.**

2. SECURITY.md considerations — mcp-tool-shop-org · tip `96662ef` · `SECURITY.md` L26–30 — Local SQLite may hold metadata/notes/findings; MCP stdio, no network endpoints; GitHub sync uses `gh` CLI and **inherits its authentication**; **No credentials are stored by repo-knowledge.**

3. SECURITY.md reporting — mcp-tool-shop-org · tip `96662ef` · `SECURITY.md` L9–12 — Vulnerability reports must NOT include secrets, credentials, or API keys.

4. github.ts uses gh CLI only — mcp-tool-shop-org · tip `96662ef` · `src/sync/github.ts` L1–2, L116–133 — Sync pulls metadata via `execFileSync('gh', …)` (`repo list` / releases); no process.env token write path in this module.

5. gh JSON fields upserted — mcp-tool-shop-org · tip `96662ef` · `src/sync/github.ts` L122–168 — Fetches name/owner/description/url/stars/topics/license/dates — catalog metadata only; no token/secret fields in mapped GitHubRepo shape.

6. Under-scoped token as operational note — mcp-tool-shop-org · tip `96662ef` · `src/sync/github.ts` L288–318 — Mentions under-scoped `gh` token as cause of listing gaps; instructs operator to `gh repo view` — auth stays in gh, not stored in DB.

7. MCP stdio local — mcp-tool-shop-org · tip `96662ef` · `src/mcp/server.ts` L38, L1149 · SECURITY L29 — StdioServerTransport; server runs on stdio — aligns with no exposed network telemetry endpoint.

8. Schema/secrets naming boundary — mcp-tool-shop-org · tip `96662ef` · `src/db/migration-002-audit.sql` (secrets domain / secrets_found count) · `migration-007` publisher_method enum labels (`npm_token`/`pypi_token` as method names) — audit domain + publisher-method labels are not stored API tokens; no credential/token column for gh auth in schema.sql.

On-page: no telemetry; credentials not stored; gh inherits auth. Invented telemetry/token-in-DB: 0.

✅
