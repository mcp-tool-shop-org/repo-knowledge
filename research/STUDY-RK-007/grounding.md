# STUDY-RK-007 — Research grounding (verified — copy)

STUDY-RK-007 Research grounding · tip `ab89010`

stop: gh sync vs local scan. HARD: GitHub metadata only, no source from GitHub.
prerequisite: Verifier ✅ · Scholar 8/8 · Practitioner 8/8 · Analogist 1–5 hold-with-limit; #6 Docker Registry API URL unverified; 7–8 fail-transfer.
owner: Coordinator → Builder
fallback: Land Analogist #6 flagged unverified, not as verified.

Hold:
- `gh` sync: repo list/releases metadata only; no source blobs from GitHub.
- Local scan: package manifests/README/docs from disk into catalog.
- SECURITY/README: no source from GitHub; gh auth inherited; no credentials stored.
- Lit: forge metadata inventories (GHS, GHTorrent, PGA, SMECS, SOMEF, RepoTrace, privacy).
- Analogs hold-with-limit: GitHub REST list; git ls-remote; npm packument; agentless CMDB; forge vs local doc split.

Fail-transfer / invented: 0
- gh sync must fetch source · Inventory incomplete without clone-all · Pull-source-blobs-from-GitHub · Source-from-GitHub-required.

Builder: land five files under `/workspace/studio/repo-knowledge/research/STUDY-RK-007/`. Do not invent STUDY-RK-021

Verifier: Scholar 8/8 · Practitioner 8/8 · Analogist 1–5 hold; #6 unverified; 7–8 fail-transfer.
