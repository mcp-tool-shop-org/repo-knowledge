STUDY-RK-010 Q1 — Scholar pack (papers/arXiv/DOI only). Tip `ee3ccb9`. Consumer: repo-knowledge `src/sync/publish.ts` (npm/PyPI/GH Releases → `repo_published_versions`; network-graceful). stop: publish-state vs npm (peer lit). Do not publish / do not npm publish. Sync-may-publish invented: 0. Do not invent STUDY-RK-021.

Eight papers, all with DOI or arXiv. I did not invent What.

1. Pinckney, Cassano, Guha, Bell (2023). npm-follower: A Complete Dataset Tracking the NPM Ecosystem. arXiv:2308.12545 / https://arxiv.org/abs/2308.12545 — Continuous scrape of npm registry metadata (and code) into a local catalog via the changes stream; retains deleted versions; pure read/follower of published state, not a publisher.

2. Gao, Xu, Yang, Zhou (2024). PyRadar: Towards Automatically Retrieving and Validating Source Code Repository Information for PyPI Packages. arXiv:2404.16565 / https://arxiv.org/abs/2404.16565 — Treats PyPI releases as a published catalog separate from VCS trees; retrieves/validates repository links from registry metadata and source distributions without uploading packages.

3. Vu, Massacci, Pashchenko, Plate, Sabetta (2021). LastPyMile: identifying the discrepancy between sources and packages. DOI:10.1145/3468264.3468592 / https://doi.org/10.1145/3468264.3468592 — Empirical gap between PyPI published artifacts and linked GitHub source trees (~65% of artifacts differ); published-version catalogs are not identical to local source trees.

4. Decan, Mens, Grosjean (2017). An Empirical Comparison of Dependency Network Evolution in Seven Software Packaging Ecosystems. arXiv:1710.04936 / https://arxiv.org/abs/1710.04936 — Uses libraries.io published package/version metadata as the read model for cross-ecosystem dependency-network evolution (npm, PyPI, and peers).

5. Duan, Alrawi, Kasturi, Elder, Saltaformaggio, Lee (2020). Towards Measuring Supply Chain Attacks on Package Managers for Interpreted Languages. arXiv:2002.01139 / https://arxiv.org/abs/2002.01139 — Observes registries with metadata/static/dynamic analysis to measure abuse and report removals; measurement pipeline reads published packages rather than mutating registries by publishing.

6. Huang, Wang, Wang, Sun, Li, Chen, Zhao, Han, Yang, Shi (2024). Donapi: Malicious NPM Packages Detector using Behavior Sequence Knowledge Mapping. arXiv:2403.08334 / https://arxiv.org/abs/2403.08334 — Near-real-time local npm cache synced from replicate/_changes (~3.4M packages), retaining deleted tarballs; ingest of published registry state for observation, not npm publish.

7. Santos-Grueiro (2026). On Good Authority: Release-Authority Measurement for Registry-Mediated Package Ecosystems. arXiv:2606.22593 / https://arxiv.org/abs/2606.22593 — Predecessor-aware release-authority records from public control-plane evidence (publisher, repo, workflow, provenance, signing, mediation) on npm/PyPI and peers; observes how releases reached users without writing to registries.

8. Pohl, Novák, Ohm, Meier (2025). SoK: Towards Reproducibility for Software Packages in Scripting Language Ecosystems. arXiv:2503.21705 / https://arxiv.org/abs/2503.21705 — Systematizes registry-distributed artifacts vs source trees; surveys matching GitHub Releases/tags to npm published versions as a read-path between VCS and registry catalogs (observe published artifacts vs mutate registries).

Gates: Sync-may-publish invented: 0. STUDY-RK-021 invented: 0. Findings: 8. Tip `ee3ccb9`.

URLs:
https://arxiv.org/abs/2308.12545
https://arxiv.org/abs/2404.16565
https://doi.org/10.1145/3468264.3468592
https://arxiv.org/abs/1710.04936
https://arxiv.org/abs/2002.01139
https://arxiv.org/abs/2403.08334
https://arxiv.org/abs/2606.22593
https://arxiv.org/abs/2503.21705

✅
