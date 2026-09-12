STUDY-RK-027 Q2 (Practitioner)

stop: docs/source inventory — publish-state surfaces (publish.ts, repo_published_versions, MCP repo_versions, CLI) vs any real publish mutator; what to lock or document next.
prerequisite: STUDY-RK-026 done sha=`2534110` PR #17; tip `db556c6`; clone `/workspace/studio/repo-knowledge`; extras STUDY-RK-010.
owner: Practitioner
fallback: path/URL mismatch -> flag; <6 findings -> Coordinator; if any path would publish -> Coordinator.

HARD observed: Do not publish · do not npm publish · do not call registry publish APIs. No publish mutator found in product paths below.

Eight doc/API sources. I did not invent STUDY-RK-051.

1. STUDY-RK-010 grounding still holds | org: local research | date: tip tree `db556c6` | path: `/workspace/studio/repo-knowledge/research/STUDY-RK-010/grounding.md` | Finding: GET registry/PyPI/GH Releases → upsert repo_published_versions only; no publish path in publish.ts; MCP repo_versions DB-only; Invented Sync-may-publish / publish.ts-publishes-packages: 0.

2. publish.ts header + syncPublishStateForRepo | org: local | date: tip `db556c6` | path: `/workspace/studio/repo-knowledge/src/sync/publish.ts` | Finding: pulls version registries then upserts local repo_published_versions; network-graceful; syncPublishStateForRepo writes catalog rows via upsertPublishedVersion only — no npm publish / twine / cargo publish / gh release create in file.

3. Registry workers are GET/list | org: local | date: tip `db556c6` | path: src/sync/publish.ts | Finding: syncNpmVersion fetches https://registry.npmjs.org/<name>; syncPyPIVersion fetches https://pypi.org/pypi/<name>/json; syncGitHubReleases runs gh release list --json — read/list metadata only.

4. CLI versions / drift / bind-package | org: local | date: tip `db556c6` | paths: src/cli.ts, README.md Publish-State Commands | Finding: rk versions reads DB (+ optional --refresh → syncPublishStateForRepo GETs); rk drift compares SoT vs registry latest; rk bind-package setRepoPackageNames local bindings — no publish command on CLI surface.

5. MCP repo_versions READ-ONLY | org: local | date: tip `db556c6` | path: src/mcp/server.ts | Finding: tool text states READ-ONLY — unlike rk versions --refresh, MCP does NOT hit registries; listPublishedVersions from DB only.

6. Tests lock sync not publish | org: local | date: tip `db556c6` | paths: test/sync-publish.test.ts, test/publish-state.test.ts, test/cli-publish.test.ts | Finding: mocked fetch/gh cover syncNpmVersion/syncPyPIVersion/syncGitHubReleases/syncPublishStateForRepo + listPublishedVersions + CLI empty No published versions — no test invokes a registry publish API.

7. SECURITY / package.json note | org: local | date: tip `db556c6` | paths: SECURITY.md, package.json | Finding: SECURITY — local DB + gh auth inherited, no credentials stored; package.json has prepublishOnly: npm run verify (npm lifecycle gate for publishing THIS package) — not an rk/sync publish mutator and not called by publish.ts.

8. Lock/document next (inventory only) | org: local | date: tip `db556c6` | paths: above | Finding: keep documenting MCP DB-only vs CLI --refresh GET; keep HARD no registry publish; optional handbook callout that publish-state ≠ npm publish; continue locking empty versions sentinel + channel filters — do not add publish APIs.

Publish-mutator-in-product-path: 0 · STUDY-RK-051 invented: 0

✅
