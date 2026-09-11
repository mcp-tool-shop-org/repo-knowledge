STUDY-RK-002 Q1 — Scholar pack (tip d08a6cd)

Q1 — What peer sources support requiring thesis + architecture + ≥1 relationship, and treating isolated entries as incomplete?

Consumer KNOWLEDGE-CONTRACT: every repo MUST get thesis + architecture at minimum; “repos don’t exist in isolation”; relationships with why-notes. Pack is papers/arXiv/DOI only; no execute; no implications as final. Optional-thesis invented: 0.

1. Datasheets for Datasets — Timnit Gebru, Jamie Morgenstern, Briana Vecchione, Jennifer Wortman Vaughan, Hanna Wallach, Hal Daumé III, Kate Crawford — 2018 — https://arxiv.org/abs/1803.09010 — Documents a required Motivation section (“For what purpose was the dataset created?”) and asks whether relationships among instances are made explicit, supporting purpose/thesis documentation plus explicit edges rather than isolated entries.

2. CIAO - Code In Architecture Out - Automated Software Architecture Documentation with Large Language Models — Marco De Luca, Tiziano Santilli, Domenico Amalfitano, Anna Rita Fasolino, Patrizio Pelliccione — 2026 — https://arxiv.org/abs/2604.08293 — Treats system-level architecture documentation as essential for comprehension yet often unavailable or incomplete, and generates ISO/IEC/IEEE 42010–oriented architecture descriptions from repositories.

3. Evolving Reference Architecture Description: Guidelines based on ISO/IEC/IEEE 42010 — Edilson Soares Palma, Elisa Yumi Nakagawa, Débora Maria Barroso Paiva, Maria Istela Cagnin — 2022 — https://arxiv.org/abs/2209.14714 — Grounds architecture-description evolution in ISO/IEC/IEEE 42010 stakeholder/viewpoint requirements so architecture content is a governed work product, not an optional afterthought.

4. A Review of SHACL: From Data Validation to Schema Reasoning for RDF Graphs — Paolo Pareti, George Konstantinidis — 2021 — https://arxiv.org/abs/2112.01441 — Reviews W3C SHACL shape constraints that validate nodes against required properties and cardinalities (e.g. minCount), enabling schemas that mark missing required fields or edges as invalid rather than merely sparse.

5. No Edges, No Verdict: A Large-Scale Empirical Study of Declared Dependency Graphs in 78K SBOMs in the Wild — Artur Zięba-Kozarzewski — 2026 — https://arxiv.org/abs/2607.22140 — Shows majority of published SBOMs omit dependency relationships or leave most components isolated, arguing NTIA-required edges and that “no edges” must mean incomplete/no verdict, not independence.

6. Steps to Knowledge Graphs Quality Assessment — Elwin Huaman — 2022 — https://arxiv.org/abs/2208.07779 — Extends KG quality frameworks with completeness dimensions spanning data, population, and interlinking, so missing links are a first-class incompleteness signal alongside missing properties.

7. KGMM — A Maturity Model for Scholarly Knowledge Graphs based on Intertwined Human-Machine Collaboration — Hassan Hussein, Allard Oelen, Oliver Karras, Sören Auer — 2022 — https://arxiv.org/abs/2211.12223 — Grades scholarly KG maturity with property completeness and linkability measures, placing incomplete properties and weak linking below higher maturity stages.

8. Completeness, Recall, and Negation in Open-World Knowledge Bases: A Survey — Simon Razniewski, Hiba Arnaout, Shrestha Ghosh, Fabian Suchanek — 2023 — https://arxiv.org/abs/2305.05403 — Surveys how to know whether and where a KB is incomplete; silence under open-world assumptions is not evidence of completeness, supporting explicit completeness contracts for required facts and relations.

Recipes invented: 0. Metrics invented: 0. Optional-thesis invented: 0.
Tip: d08a6cd. Extra reads: KNOWLEDGE-CONTRACT.md, README, src/db/schema.sql.

✅
