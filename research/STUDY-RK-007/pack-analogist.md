STUDY-RK-007 Q3 Analogist — tip `ab89010` · consumer repo-knowledge

stop: gh sync vs local scan. SECURITY: GitHub metadata only, no source from GitHub (analogs).
prerequisite: STUDY-RK-006 done sha=`ab89010`; tip `ab89010`; consumer repo-knowledge.
owner: Analogist
fallback: Analog without limit → 🔧; 🛑 Coordinator if <6 findings.

Six hold-with-limit; two fail-transfer. Context: README Security Model — `gh` pulls names/descriptions/topics/stars/releases/languages; local scan reads checkout docs on disk; no GitHub source content.

1. GitHub REST list/get repository metadata — GitHub Docs — ongoing — https://docs.github.com/en/rest/repos/repos — Hold-with-limit: org/repo listing returns forge inventory JSON without cloning trees; limit: Contents API is a separate surface—rk sync stays on list/metadata, not blob fetch.

2. `git ls-remote` refs without objects — Git SCM — ongoing — https://git-scm.com/docs/git-ls-remote — Hold-with-limit: lists remote refs/SHAs without downloading objects; limit: inventory of tips ≠ checkout of source trees.

3. npm registry packument/metadata without tarball — npm registry docs — ongoing — https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md — Hold-with-limit: package identity/versions via JSON; tarball fetch is explicit opt-in; limit: metadata catalog ≠ local `node_modules` checkout.

4. Agentless CMDB discovery (inventory without copying binaries) — Parascope / Micro Focus UD — ongoing — https://parascope.io/docs/os-collection — Hold-with-limit: outside-in/platform or SSH inventory observes state without installing agents or copying target binaries home; limit: discovery facts enrich CMDB, do not substitute for a local source tree.

5. Forge metadata vs local doc scan split (rk itself / HANDBOOK reconstructability) — repo-knowledge README/HANDBOOK — tip `ab89010` — Hold-with-limit: GitHub metadata reconstructable remotely; thesis/docs/architecture come from local scan + notes; limit: local scan needs a disk path—never implies GitHub blob pull.

6. Package-registry / Docker Hub catalog tags vs image pull — registry catalog pattern — ongoing — https://docs.docker.com/registry/spec/api/ — Hold-with-limit: list tags/manifests without pulling layers; limit: tag inventory ≠ local image filesystem.

7. `gh sync` must fetch source code from GitHub — Fail-transfer: Security Model states no source from GitHub; `src/sync/github.ts` is metadata via `gh`; source/docs enter only via `src/sync/local.ts` on local paths.

8. Soft folklore that inventory is incomplete without cloning every remote — Fail-transfer: dual-path design (forge metadata + optional local scan) is intentional; soft folklore: 0.

Soft folklore: 0. Source-from-GitHub claimed: 0. Did not invent STUDY-RK-021.
✅
