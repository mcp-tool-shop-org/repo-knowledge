# STUDY-RK-127 Practitioner pack
Tip: `e268987` (= `origin/main`). Owner: Practitioner. Consumer: repo-knowledge. Q2: On tip `e268987`, what tip evidence still requires KEEP metadata-only gh sync with no new coding PR? Soft folklore invent tip-pulls-source / invent Contents/blob/clone on rk sync / invent mandatory-new-metadata-PR / invent risk-free merge / invent STUDY-RK-131 = fail. No install. No git write. No merge. No new coding PR. REAFFIRM 007/052. 🛑 do not merge #6 #8 #12–#26 #28.

## Eight cited findings

1. Tip `gh repo list --json` field set — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e268987/src/sync/github.ts — `fetchGitHubReposSimple` invokes `gh repo list` with `--json` limited to `name,owner,description,url,isArchived,isPrivate,isFork,defaultBranchRef,stargazerCount,forkCount,createdAt,updatedAt,pushedAt,primaryLanguage,repositoryTopics,licenseInfo`. Metadata inventory only; not a source tree fetch.
2. Tip absence of Contents/blob/clone on gh sync path — same `src/sync/github.ts` (+ `src/sync/index.ts`) — no GitHub Contents API, no blob/raw download, no `git clone` in the sync orchestrator path. Inventing Contents/blob/clone on `rk sync` = fail.
3. Tip hardcoded `open_issues: 0` — same `src/sync/github.ts` mapper — mapped rows set `open_issues: 0` (not fetched in the `--json` list). Tip fact only; this job does not OUTSIDE-mandate a new metadata PR to fetch issues.
4. Tip `fullSync` composition — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e268987/src/sync/index.ts — `fullSync` runs GitHub sync, then local directory scan, then FTS rebuild. Publish-state and build-health workers are re-exported/opt-in and deliberately not invoked on every fullSync.
5. Tip local scan separate — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e268987/src/sync/local.ts — local scanner reads on-disk package/README/docs via `fs`; source/content enrichment is local-path, not GitHub pull. KEEP local scan separate from gh metadata sync.
6. Tip README security model — https://github.com/mcp-tool-shop-org/repo-knowledge/blob/e268987/README.md — Data touched: GitHub API metadata via `gh` (names, descriptions, topics, stars — no source code content). Data NOT touched: no source code is read from GitHub. Matches tip code: no tip-pulls-source.
7. Tip grounding STUDY-RK-007 / 052 — tip `research/STUDY-RK-007/grounding.md` · `research/STUDY-RK-052/grounding.md` — HARD KEEP: gh metadata-only; local scan separate; reject pull-source-blobs / Contents/blob/clone folklore; concrete residual coding gap held = **no**; study land only; no coding PR.
8. STUDY-RK-131 absent + tip inventory — no `research/STUDY-RK-131/` on tip · `/workspace/studio/outbox-STUDY-RK-127/tip-inventory.md` — verdict frame KEEP metadata-only · KEEP local separate · NEW coding PR **no**. Do not invent STUDY-RK-131 or mandatory-new-metadata-PR.

## Classification

Tip already implements metadata-only `gh repo list --json`, keeps local scan + FTS as separate fullSync stages, and documents no-source-from-GitHub. Residual tip coding gap for this job: **no** (REAFFIRM 052 held-gap = no; open_issues hardcoded remains a tip fact, not an OUTSIDE coding mandate here). OUTSIDE HIT / mandatory new metadata PR: **0**. NEW coding PR: **no**. KEEP gh metadata-only · KEEP local scan separate.

## Answers

- Tip evidence requiring KEEP metadata-only gh sync (no new coding PR): tip `--json` metadata field list; no Contents/blob/clone on sync path; `fullSync` = gh + local scan + FTS with publish/health opt-in separate; README no-source-from-GitHub; 007/052 KEEP with residual coding gap held = no.
- KEEP gh metadata-only · KEEP local scan separate: **yes**.
- NEW coding PR: **no**.
- Invented tip-pulls-source / Contents/blob/clone on rk sync / mandatory-new-metadata-PR / risk-free merge / STUDY-RK-131: **0**.
- REAFFIRM: **007 / 052**. 🛑 do not merge #6 #8 #12–#26 #28.

Eight doc/API sources. I did not invent tip-pulls-source.
✅
