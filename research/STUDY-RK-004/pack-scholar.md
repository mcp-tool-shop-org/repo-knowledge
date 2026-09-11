STUDY-RK-004 Q1 — Scholar pack (tip 09e6122)

Q1 — Peer literature on syncing lab/dogfood intelligence or operational-test facts into a structured knowledge catalog (SQLite): freshness of run evidence, optional intelligence layers vs core catalog, local-only control-plane data that must not be copied into product DBs, retrieval of synced facts for suggestions.

Consumer context (not citations): dogfood one-way read into `repo_facts`; testing-os remains sole write authority; optional intelligence export; swarm control-plane stays local-only and is not a product-DB copy target. These eight sources support one-way read-model sync, freshness gates, optional layers, and sovereignty of control-plane stores. Pack is papers/arXiv only. Did not invent a paper requiring copying `.swarm` sqlite into the catalog.

1. Knowledge-Centric Information Systems — Mariano Garralda-Barrio — 2026 — https://arxiv.org/abs/2607.02609 — Maps ETL/CDC/catalogs/CQRS onto knowledge ingestion, change detection, knowledge catalogs, and raw–curated–operational layers, supporting a core catalog plus optional operational knowledge views rather than a single undifferentiated store.

2. Proof-or-Stop: Don't Trust the Agent, Trust the Evidence… — Jek Huang, Jeffery Hsia, Jiayi Sun, Freddie Shi, Wei Huang, Ian H. White — 2026 — https://arxiv.org/abs/2607.14890 — Admits lifecycle claims only when fresh, source-bound, mechanically verifiable evidence passes gates; stale or missing evidence must not count as current enforcement/run truth.

3. Towards FAIR and federated Data Ecosystems for interdisciplinary Research — Sebastian Beyvers, Jannis Hochmuth, Lukas Brehm, Maria Hansen, Alexander Goesmann, Frank Förster — 2025 — https://arxiv.org/abs/2504.20298 — Keeps distributed data planes authoritative under domain sovereignty while a service plane builds secondary databases with eventual consistency — secondary sync without relocating primary control-plane stores.

4. Forage V2: Knowledge Evolution and Transfer in Autonomous Agent Organizations — Huaqing Xie — 2026 — https://arxiv.org/abs/2604.19837 — Transfers organizational lessons as readable documents across runs/models without copying evaluator/planner code or session internals, supporting inheritance of dogfood learning without shipping private control-plane DBs.

5. SuperLocalMemory 4.0: The Governed Memory Operating System for AI Agents — Varun Pratap Bhardwaj, Garima Singh, Arun Pratap Bhardwaj — 2026 — https://arxiv.org/abs/2608.08253 — Local-first SQLite memory with optional derived projections under prepare→verify→promote; canonical store stays local while optional layers are governed, not mandatory product copies of every control DB.

6. Schema-First Retrieval: Embedding Catalogs for Natural Language Analytics — Adarsh Agrawal, Shashank Indukuri — 2026 — https://arxiv.org/abs/2606.28387 — Retrieves typed catalog objects (not raw warehouse rows) to ground suggestions/SQL, aligning with querying synced `repo_facts` for “what should this surface inherit” rather than live-scraping the lab store.

7. An Empirical Characterization of Event Sourced Systems and Their Schema Evolution… — Michiel Overeem, Marten Spoor, Slinger Jansen, Sjaak Brinkkemper — 2021 — https://arxiv.org/abs/2104.01146 — Documents industry CQRS where write/command authority stays separate from eventually consistent read projections rebuilt from events — matching one-way sync into a read-model catalog.

8. An Empirical Study on Challenges of Event Management in Microservice Architectures — Rodrigo Laigner, Ana Carolina Almeida, Wesley K. G. Assunção, Yongluan Zhou — 2024 — https://arxiv.org/abs/2408.00440 — Reports practitioners synchronizing materialized views via domain events across services so a joined read model stays eventually consistent without sharing a single authoritative database.

Recipes invented: 0. Metrics invented: 0. Copy-`.swarm`-into-catalog invented: 0.
Tip: 09e6122. Extra context only: src/sync/dogfood.ts, src/sync/dogfood-suggest.ts.

✅
