STUDY-RK-010 Q2 — Practitioner

stop: publish-state vs npm (docs + source). Do not publish.
prerequisite: STUDY-RK-009 done sha=`ee3ccb9`; tip `ee3ccb9`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary publish.ts + SECURITY + CLI/MCP state for registry reads, repo_published_versions writes, and never publishing?

Eight doc/API sources. I did not invent What. publish.ts-publishes-packages invented: 0. Do not invent STUDY-RK-021.

1. publish.ts header — mcp-tool-shop-org · tip `ee3ccb9` (2026-09-11) · `/workspace/studio/repo-knowledge/src/sync/publish.ts` L1–9 — Pulls version registries from npm, PyPI, and GitHub Releases, then upserts into `repo_published_versions`; network-graceful; never throws into caller sync loop.

2. syncNpmVersion — mcp-tool-shop-org · tip `ee3ccb9` · `src/sync/publish.ts` L227–351 — GETs `https://registry.npmjs.org/<name>` packument `time` map; returns channel=`npm` records; NEVER throws; no `npm publish` / mutate path.

3. syncPyPIVersion — mcp-tool-shop-org · tip `ee3ccb9` · `src/sync/publish.ts` L354–479 — GETs `https://pypi.org/pypi/<name>/json` releases; channel=`pypi`; read-only JSON API.

4. syncGitHubReleases — mcp-tool-shop-org · tip `ee3ccb9` · `src/sync/publish.ts` L482–554 — `gh release list --json tagName,publishedAt,name` (limit 100); channel=`github_release`; list metadata only.

5. syncPublishStateForRepo upsert — mcp-tool-shop-org · tip `ee3ccb9` · `src/sync/publish.ts` L574–644 — Orchestrates bound npm/pypi (+ always GH if owner+name); every record `upsertPublishedVersion` into local DB; writes catalog rows only; never throws.

6. CLI `rk versions` — mcp-tool-shop-org · tip `ee3ccb9` · `src/cli.ts` L1143–1179 · `README.md` L105–107 — Dashboard over `repo_published_versions`; `--refresh` calls syncPublishStateForRepo (network read); `rk drift` compares SoT vs registry; `rk bind-package` sets bindings — no publish command.

7. MCP `repo_versions` READ-ONLY — mcp-tool-shop-org · tip `ee3ccb9` · `src/mcp/server.ts` L1013–1035 — Lists published versions from DB; unlike `rk versions --refresh`, MCP does NOT hit registries.

8. SECURITY.md + README Security Model — mcp-tool-shop-org · tip `ee3ccb9` · `SECURITY.md` L26–30 · `README.md` L39–43 — Local SQLite + gh metadata auth inherited; no credentials stored; no telemetry. No npm-publish surface stated.

HARD on-page: registry GET/list → local upsert. Invented publish.ts-publishes-packages: 0.

✅
