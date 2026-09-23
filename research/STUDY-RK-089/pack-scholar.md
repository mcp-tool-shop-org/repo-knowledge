# STUDY-RK-089 — pack-scholar

Tip `5dd98ea`. Eight papers (7 arXiv + 1 DOI). Invented publish-mutator / tip-already-documented / risk-free merge #18 / npm publish / STUDY-RK-101: 0. REAFFIRM STUDY-RK-027 / STUDY-RK-060. NEW duplicate docs PR: no. HARD: Do not publish. Word count ~570.

Question: After tip `5dd98ea`, what peer-reviewed evidence still requires treating publish-state ≠ registry-publish documentation drift as held unmerged debt while PR #18 stays OPEN?

1. npm-follower — Pinckney, Cassano, Guha, Bell — 2023 — https://arxiv.org/abs/2308.12545 — Continuously scrapes npm registry metadata/code into a local archive; a follower/inventory of published state, not a publisher that mutates the registry.

2. PyRadar — Gao, Xu, Yang, Zhou — 2024 — https://arxiv.org/abs/2404.16565 — Treats PyPI releases as a published catalog separate from VCS; retrieves and validates repo links from registry metadata without uploading packages.

3. LastPyMile — Vu, Massacci, Pashchenko, Plate, Sabetta — 2021 — https://doi.org/10.1145/3468264.3468592 — Published registry artifacts systematically diverge from linked source trees; a published-version inventory is not a local-source publish path.

4. DONAPI — Huang, Wang, Wang, Sun, Li, et al. — 2024 — https://arxiv.org/abs/2403.08334 — Near-real-time local npm cache synced from replicate/_changes for observation of published packages — ingest of registry state, not npm publish.

5. On Good Authority — Santos-Grueiro — 2026 — https://arxiv.org/abs/2606.22593 — Builds release-authority records from public control-plane evidence once releases are observable — observes how releases reached users without writing to registries.

6. ConfuGuard — Jiang, Çakar, Lysenko, Davis — 2025 — https://arxiv.org/abs/2502.20528 — Operates on consolidated registry metadata (names, versions, maintainers) for detection — metadata inventory reads, not a publish mutator.

7. DocPrism — Xu, Wahab, Holmes, Lemieux — 2025 — https://arxiv.org/abs/2511.00215 — Incorrectness defects include over-promise and direct mismatch; docs that imply a publish capability the code does not implement are first-class documentation bugs.

8. READU — Baek, Krampf, Pradel — 2026 — https://arxiv.org/abs/2607.15780 — README bugs include implementation–documentation drift when handbook/README wording under- or mis-states the true contract (inventory GET vs registry mutation).

Read-only tip context (not citations): tip `5dd98ea` — `src/sync/publish.ts` GETs npm/PyPI/GitHub Releases and upserts `repo_published_versions` only (filename ≠ mutator); README Publish-State table lists versions/drift/bind without an explicit “≠ npm publish” sentence; handbook `usage.md` / `mcp-server.md` lack the #18 clarifiers (publish-state ≠ npm publish; MCP `repo_versions` DB-only vs CLI `--refresh`). PR #18 OPEN (docs-only) — branch not on tip. No other OPEN PR duplicates this docs fix → NEW duplicate docs PR: no. No publish APIs invented. No git. No execute. No npm publish. No implications as final.

Soft folklore fail checks: invent publish-mutator = 0; tip-already-documented = 0; risk-free merge #18 = 0; npm publish = 0; STUDY-RK-101 = 0.
