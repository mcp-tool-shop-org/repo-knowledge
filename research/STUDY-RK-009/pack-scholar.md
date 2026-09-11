STUDY-RK-009 Q1 — Scholar pack (tip 2dd0bb5)

Q1 — Peer literature on repository/build-health dashboards, integrity checkers (fsck-class), doctor-style single-entity deep-dives, portfolio health tables/feeds, and audit trails of health runs.

Consumer context (not citations): `rk health` feed/doctor/table; `rk fsck` writes `db_health_runs`; diff window. Pack is papers/arXiv/DOI only. Did not invent a paper that says health probes may silently skip writing run audit rows when the product records them.

1. Awareness 2.0: Staying Aware of Projects, Developers and Tasks Using Dashboards and Feeds — Christoph Treude, Margaret-Anne D. Storey — 2010 — https://doi.org/10.1145/1806799.1806854 — Shows teams combine configurable project/team dashboards with individual event feeds: dashboards for prioritization at decision moments, feeds for short-horizon planning—matching a health surface split between portfolio tables and change feeds.

2. Metrics Dashboard: A Hosted Platform for Software Quality Metrics — George K. Thiruvathukal, Shilpika, Nicholas J. Hayward, Konstantin Läufer — 2018 — https://arxiv.org/abs/1804.02053 — Mines hosted repositories into cached team/project-health metrics (size, defects, productivity) exposed via interactive time-series dashboards and APIs rather than per-commit vanity stats alone.

3. Package Dashboard: A Cross-Ecosystem Framework for Dual-Perspective Analysis of Software Packages — Ziheng Liu, Runzhi He, Minghui Zhou — 2025 — https://arxiv.org/abs/2512.01630 — Unifies artifact risk (CVEs, licenses, deps) with upstream community/repo health into one portfolio-style dual-panel dashboard for cross-ecosystem package inventories.

4. A Static Analysis Platform for Investigating Security Trends in Repositories — Tim Sonnekalb, Christopher-Tobias Knaust, Bernd Gruner, Clemens-Alexander Brust, Lynn von Kurnatowski, Andreas Schreiber — 2023 — https://arxiv.org/abs/2304.01725 — Continuously monitors SAST warnings across Git history and surfaces trends/hotspots in a repository dashboard so operators can deep-dive modules that degrade over versions.

5. Accelerating Filesystem Checking and Repair with pFSCK — David Domingo, Kyle Stratton, Sudarsun Kannan — 2020 — https://arxiv.org/abs/2004.05524 — Studies classic multi-pass C/R integrity checkers (inode/dir/connectivity/refcount/bitmap style fsck) that scan metadata for structural inconsistencies—an fsck-class pattern for operational integrity probes over stored state.

6. RADAR: Exposing Unlogged NoSQL Operations — Mahfuzul I. Nissan, James Wagner — 2026 — https://arxiv.org/abs/2602.12600 — Cross-checks storage artifacts against application audit logs to find unlogged inserts/deletes/updates, treating the audit trail as authoritative intended operations rather than optional telemetry that may be silently omitted.

7. Bluejay: A Cross-Tooling Audit Framework For Agile Software Teams — Cesar Garcia, Alejandro Guerrero, Joshua Zeitsoff, Srujay Korlakunta, Pablo Fernandez, Armando Fox — 2021 — https://arxiv.org/abs/2103.06798 — Monitors defined practice audits across tools and auto-generates per-audit dashboards (graph + table) so team/portfolio health checks leave a measurable audit record over time.

8. MetricSynth: Framework for Aggregating DORA and KPI Metrics Across Multi-Platform Engineering — Pallav Jain, Yuvraj Agrawal, Ashutosh Nigam, Pushpak Patil — 2025 — https://arxiv.org/abs/2511.06864 — Aggregates portfolio CI/quality KPIs with threshold alerts and drill-down from dashboard anomalies to underlying pipeline evidence—supporting doctor-style single-entity investigation from a health rollup.

Papers inventing silent skip of health-run audit rows: 0.
Tip: 2dd0bb5. Extra context only: src/health/*.ts.

✅
