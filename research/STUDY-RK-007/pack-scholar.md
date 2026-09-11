STUDY-RK-007 Q1 — Scholar pack (tip ab89010)

Q1 — Peer literature on inventorying software portfolios via forge/API metadata vs local filesystem scans — metadata-only GitHub sync (no remote source-code fetch), local README/package-file knowledge extraction, separation of forge listings from source content, privacy of not ingesting remote blobs.

Consumer context (not citations): `gh` sync of names/descriptions/topics/stars/releases; local scan of README/package files; SECURITY/README: no source from GitHub. Pack is papers/arXiv/DOI only. Did not invent a paper that requires fetching source from GitHub into the catalog.

1. Sampling Projects in GitHub for MSR Studies — Ozren Dabic, Emad Aghajani, Gabriele Bavota — 2021 — https://arxiv.org/abs/2103.04682 — Builds GHS from GitHub search/API and homepage-derived characteristics so portfolios can be sampled and inventoried from forge metadata without cloning repositories for the selection step.

2. World of Code: Enabling a Research Workflow for Mining and Analyzing the Universe of Open Source VCS data — Yuxing Ma, Tapajit Dey, Chris Bogart, Sadika Amreen, Marat Valiev, Adam Tutko, et al. — 2020 — https://arxiv.org/abs/2010.16196 — Contrasts GHTorrent/GH Archive as GitHub-event/metadata collections that do not include underlying source code with infrastructures that mirror VCS content, separating forge listings from blob archives.

3. The GHTorrent dataset and tool suite — Georgios Gousios — 2013 — https://doi.org/10.1109/MSR.2013.6624034 — Archives GitHub API responses as queriable metadata (events, projects, linked entities) for offline inventory, establishing the metadata-mirror pattern rather than a mandatory source-tree ingest into the research DB.

4. Public Git Archive: a Big Code dataset for all — Vadim Markovtsev, Waren Long — 2018 — https://arxiv.org/abs/1803.10144 — Notes GHTorrent’s scalability choice to focus on metadata and then builds a separate source-code archive from URL lists, reinforcing that forge metadata catalogs and source corpora are distinct layers.

5. SMECS: A Software Metadata Extraction and Curation Software — Stephan Ferenz, Aida Jafarbigloo, Oliver Werth, Astrid Nieße — 2025 — https://arxiv.org/abs/2507.18159 — Harvests GitHub API project/collaboration fields alongside CFF/CodeMeta and (via SOMEF-class pipelines) package manifests and README-derived fields into curated CodeMeta, treating API listings and local/package metadata as complementary extractors.

6. Scholarly Knowledge Extraction from Published Software Packages — Muhammad Haris, Markus Stocker, Sören Auer — 2022 — https://arxiv.org/abs/2212.07921 — Uses repository/package APIs plus SOMEF README parsing to extract name, description, languages, and citation links from published packages—knowledge extraction from docs/manifests rather than full remote tree clones into the KG.

7. RepoTrace: Browser-Assisted Evidence Collection for GitHub Research Datasets — Xue Yao, Zehua Zhang, Jiatong Liu, Yongqiang Tian — 2026 — https://arxiv.org/abs/2607.05106 — Keeps GitHub issue/PR evidence and labels in a local SQLite workspace with optional API enrichment, local-first rather than continuously mirroring remote blobs into the research store.

8. Should I Get Involved? On the Privacy Perils of Mining Software Repositories for Research Participants — Melina Vidoni, Nicolás E. Díaz Ferreyra — 2022 — https://arxiv.org/abs/2202.11969 — Warns that disclosing non-aggregated/raw repository artifacts can re-identify contributors, supporting privacy postures that inventory via metadata and avoid unnecessary ingest of remote source content into shared datasets.

Papers requiring GitHub source-fetch into the catalog: 0.
Tip: ab89010. Extra context only: src/sync/github.ts, src/sync/local.ts, SECURITY.md, README Data touched.

✅
