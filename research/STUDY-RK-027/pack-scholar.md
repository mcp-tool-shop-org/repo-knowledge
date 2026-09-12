STUDY-RK-027 Q1 (Scholar) — tip `db556c6`. stop: registry/version inventory reads vs publish mutators (metadata sync of published versions; do-not-publish boundaries). HARD: Do not publish. Eight papers (7 arXiv + 1 DOI). Invented sync-may-publish: 0. Invented STUDY-RK-051: 0. Never recommend publishing. Word count ~580.

1. npm-follower: A Complete Dataset Tracking the NPM Ecosystem — Pinckney, Cassano, Guha, Bell, 2023 — https://arxiv.org/abs/2308.12545 — Continuously scrapes npm registry metadata/code into a local archive (retaining deletes); a follower/inventory of published state, not a publisher.

2. PyRadar: Towards Automatically Retrieving and Validating Source Code Repository Information for PyPI Packages — Gao, Xu, Yang, Zhou, 2024 — https://arxiv.org/abs/2404.16565 — Treats PyPI releases as a published catalog separate from VCS; retrieves/validates repo links from registry metadata without uploading packages.

3. LastPyMile: identifying the discrepancy between sources and packages — Vu, Massacci, Pashchenko, Plate, Sabetta, 2021 — https://doi.org/10.1145/3468264.3468592 — Published registry artifacts systematically diverge from linked source trees; a published-version inventory is not a local-source publish path.

4. An Empirical Comparison of Dependency Network Evolution in Seven Software Packaging Ecosystems — Decan, Mens, Grosjean, 2017 — https://arxiv.org/abs/1710.04936 — Uses libraries.io published package/version metadata as the read model for ecosystem evolution across npm/PyPI and peers.

5. Towards Measuring Supply Chain Attacks on Package Managers for Interpreted Languages — Duan, Alrawi, Kasturi, Elder, Saltaformaggio, Lee, 2020 — https://arxiv.org/abs/2002.01139 — Mirrors registries and reads package metadata/artifacts for measurement; observation pipeline, not registry mutation by publishing.

6. DONAPI: Malicious NPM Packages Detector using Behavior Sequence Knowledge Mapping — Huang, Wang, Wang, Sun, Li, et al., 2024 — https://arxiv.org/abs/2403.08334 — Near-real-time local npm cache synced from replicate/_changes for observation/detection of published packages — ingest of registry state, not npm publish.

7. On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems — Santos-Grueiro, 2026 — https://arxiv.org/abs/2606.22593 — Builds release-authority records from public control-plane evidence on npm/PyPI and peers once releases are observable — observes how releases reached users without writing to registries.

8. ConfuGuard: Using Metadata to Detect Active and Stealthy Package Confusion Attacks Accurately and at Scale — Jiang, Çakar, Lysenko, Davis, 2025 — https://arxiv.org/abs/2502.20528 — Operates on consolidated registry metadata (names, versions, maintainers) updated on a schedule for detection — metadata inventory reads, not a publish mutator.

Read-only context: `src/sync/publish.ts` GETs npm/PyPI/GH Releases → upserts `repo_published_versions` only; network-graceful; no publish path. STUDY-RK-010 HARD: Do not publish. No git. No execute. No publish recommended.

✅
