STUDY-RK-024 Q2 (Practitioner)

stop: docs/source inventory — vitest already covers vs missing for src/sync/github.ts + src/sync/dogfood-suggest.ts (and CLI/MCP touch points).
prerequisite: STUDY-RK-023 done sha=`6e34cc9` PR #14; tip `5f74850`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-004 + STUDY-RK-007 + STUDY-RK-016.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator; do not invent coverage %.

HARD observed: GitHub metadata only; never copy .swarm sqlite; no source checkout from GitHub.

Eight doc/API sources. I did not invent coverage % or STUDY-RK-051.

1. STUDY-RK-016 grounding named gap | org: local research | date: tip tree `5f74850` | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-016/grounding.md` | Finding: named gaps include sync/github + dogfood-suggest; green vitest ≠ dedicated suite per module; Invented coverage %: 0.

2. STUDY-RK-007 + README/SECURITY metadata boundary | org: local | date: tip `5f74850` | paths: `research/STUDY-RK-007/grounding.md`, `README.md` Security Model, `SECURITY.md` | Finding: gh sync is repo list/releases metadata via gh CLI; no source blobs from GitHub; no credentials stored — product boundary for github.ts tests (mock gh JSON, not clone).

3. STUDY-RK-004 suggest read model | org: local | date: tip tree | path: `research/STUDY-RK-004/grounding.md` | Finding: suggest* reads synced repo_facts only; swarm is local-only readonly facts — Invented gate Copy-.swarm-into-knowledge.db: 0; dogfood-suggest must not open testing-os/.swarm sqlite.

4. No module-named test files | org: local | date: tip `5f74850` | paths: `src/sync/github.ts`, `src/sync/dogfood-suggest.ts`, `test/` | Finding: no github.test.ts / dogfood-suggest.test.ts (482 / 177 LOC modules); coverage is split across sync-404-archived, sync.test, dogfood-intelligence-sync, dogfood-swarm-sync.

5. Already covered — syncGitHub via sync-404-archived | org: local | date: tip `5f74850` | path: `test/sync-404-archived.test.ts` | Finding: locks pruneVanished archival, default detect-only, empty-list ambient no-archive, other-owner isolation, private omit, case-insensitive slug, stderr channel discipline, truncated-listing prune guard (SYNC-PH-04) — mocked gh, not live GitHub source.

6. Already covered — dogfood-suggest via dogfood tests | org: local | date: tip `5f74850` | paths: `test/dogfood-intelligence-sync.test.ts`, `test/dogfood-swarm-sync.test.ts` | Finding: suggestByRepo findings/patterns/doctrine + empty unknown repo; suggestBySurface LIKE escape + exact CSV membership (sync-A-007) — reads DB facts only.

7. Thin / missing lock targets (no %) | org: local | date: tip `5f74850` | paths: src/sync/github.ts, dogfood-suggest.ts | Finding: dedicated suites should still lock validateGhIdentifier reject (spaces/;), fetchGitHubRepos malformed JSON degrade-to-empty, fetchReleases path under includeReleases, suggestByRepo recommendations bucket, unparseable fact JSON skip — without inventing measured %.

8. CLI/MCP + verify floors | org: local | date: tip `5f74850` | paths: `src/cli.ts`, `src/mcp/server.ts`, `package.json`, `vitest.config.ts` | Finding: rk sync --prune-vanished threads to syncGitHub; rk suggest-dogfood --repo/--surface (+ MCP suggest_dogfood) call suggestBy*; verify=typecheck+lint+test+test:scripts; coverage floors 50/40/50 are thresholds only.

Exports to lock: fetchGitHubRepos, fetchReleases, syncGitHub(+pruneVanished); suggestByRepo, suggestBySurface(+escapeLike). HARD: tests mock gh metadata / local facts — never copy .swarm sqlite; never checkout GitHub source.

Coverage % invented: 0 · STUDY-RK-051 invented: 0

✅
