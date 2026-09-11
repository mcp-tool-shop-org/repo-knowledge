STUDY-RK-007 Q2 — Practitioner

stop: gh sync vs local scan. SECURITY: GitHub metadata only, no source from GitHub (docs + source).
prerequisite: STUDY-RK-006 done sha=`ab89010`; tip `ab89010`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary github/local/SECURITY/README state for gh metadata vs disk scan, and the HARD no-source-from-GitHub boundary?

Eight doc/API sources. I did not invent What. Pull-source-blobs-from-GitHub invented: 0. Do not invent STUDY-RK-021.

1. README Security Model HARD — mcp-tool-shop-org · tip `ab89010` (2026-09-11) · `/workspace/studio/repo-knowledge/README.md` L39–41 — **Data touched:** local SQLite + GitHub API metadata via `gh` (repo names, descriptions, topics, stars — **no source code content**); **Data NOT touched:** no source code read from GitHub, no credentials stored, no external phone-home.

2. github.ts header — mcp-tool-shop-org · tip `ab89010` · `src/sync/github.ts` L1–2 — States GitHub sync pulls **repo metadata, topics, releases, and languages via gh CLI** (no clone/checkout/blob language in file header).

3. `gh repo list --json` fields — mcp-tool-shop-org · tip `ab89010` · `src/sync/github.ts` L116–168 — Fetches name/owner/description/url/archive/private/fork/defaultBranch/stars/forks/dates/primaryLanguage/topics/license; maps to catalog fields; `languages: {}` on this simple path — metadata listing, not tree contents.

4. Optional releases via `gh api` — mcp-tool-shop-org · tip `ab89010` · `src/sync/github.ts` L176–224 — `fetchReleases` uses `gh api repos/…/releases` jq `{tag_name,name,body,prerelease,published_at}` when `--releases`; still release metadata/notes, not source blobs/checkout.

5. local.ts scanner header + ingest — mcp-tool-shop-org · tip `ab89010` · `src/sync/local.ts` L1–2, L100–163, L353–382 — Local scanner **reads package files, README, docs from disk**; `scanLocalRepo`/`ingestLocalRepo` upsert tech + `upsertDoc` with file **content** from the local path.

6. Local doc + manifest reads — mcp-tool-shop-org · tip `ab89010` · `src/sync/local.ts` L169–220, L304–350 — `detectTech` reads manifests (`package.json`, etc.); `indexDocs` reads README/CHANGELOG/LICENSE/SECURITY/CONTRIBUTING/`docs/*.md` via `tryReadText` (disk only).

7. Local scan denylist — mcp-tool-shop-org · tip `ab89010` · `src/sync/local.ts` L398–436 — Recursive `.git` probe skips `node_modules`/`dist`/`build`/… and dot-dirs — disk walk bounds, still local filesystem only.

8. SECURITY.md gh auth — mcp-tool-shop-org · tip `ab89010` · `SECURITY.md` L26–30 — Local SQLite may hold metadata/notes/findings; MCP stdio local; **GitHub sync uses `gh` CLI and inherits auth; no credentials stored by repo-knowledge** — aligns with metadata sync, not embedded tokens or source pull.

HARD on-page: GitHub path = metadata (+ optional release notes); source/docs content from **local disk scan**. Invented GitHub source-blob pull: 0.

✅
