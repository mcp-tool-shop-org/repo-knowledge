STUDY-RK-015 Q1 — Scholar pack (papers/arXiv/DOI only). Tip `66d57a5`. Consumer: repo-knowledge handbook (`site/src/content/docs/handbook/`) vs README CLI Reference vs `src/cli.ts`. stop: handbook vs CLI drift (peer lit). Silent-diverge-without-cost invented: 0. Do not invent STUDY-RK-021.

Eight papers, all with DOI or arXiv. I did not invent What.

1. Baek, Krampf, Pradel (2026). READU: Inconsistency-Driven Just-in-Time Detection and Repair of README Bugs. arXiv:2607.15780 / https://arxiv.org/abs/2607.15780 — Flags implementation–documentation drift including README defaults that no longer match CLI implementations; inconsistency detection is required because drift misleads users.

2. Tan, Wagner, Treude (2022). Detecting Outdated Code Element References in Software Repository Documentation. arXiv:2212.01479 / https://arxiv.org/abs/2212.01479 — Outdated docs are pervasive and hinder effective use; DOCER detects stale code-element references in README/wiki that diverge from the executable codebase.

3. Badrinarayan, Parthasarathy (2026). DocSync: Agentic Documentation Maintenance via Critic-Guided Reflexion. arXiv:2605.02163 / https://arxiv.org/abs/2605.02163 — Treats documentation maintenance as co-evolution with code changes (AST+RAG + critic loop) so docs do not lag silently behind the implementation surface.

4. Xu, Liu, Wang, Zhong, Zheng (2026). RepoDoc: A Knowledge Graph-Based Framework to Automatic Documentation Generation and Incremental Updates. arXiv:2604.26523 / https://arxiv.org/abs/2604.26523 — When code evolves, docs must update; impact propagation selects which handbook/API surfaces to regenerate so command tables stay aligned with the code graph.

5. Xu, Wahab, Holmes, Lemieux (2025). DocPrism: Multi-lingual Detection of Incorrectness Inconsistencies between Code and Documentation. arXiv:2511.00215 / https://arxiv.org/abs/2511.00215 — Detects over-promise/direct-mismatch inconsistencies between documented behavior and code—command-table mismatch as a first-class correctness problem.

6. Mynampaty, Josephine, Isaacs, McNutt (2026). Linting Style and Substance in READMEs. arXiv:2603.00331 / https://arxiv.org/abs/2603.00331 — LintMe can execute documented CLI/install commands as substance checks, catching handbook/README instructions that no longer run against the real tool surface.

7. Silva, Unterkalmsteiner, Wnuk (2024). Towards identifying and minimizing customer-facing documentation debt. arXiv:2402.11048 / https://arxiv.org/abs/2402.11048 — Manual command handoff from developers to docs creates command mismatch defects; lack of automated documentation testing leaves operators paying the cost of drift.

8. Radmanesh, Imani, Ahmed, Moshirpour (2024). Investigating the Impact of Code Comment Inconsistency on Bug Introducing. arXiv:2409.10781 / https://arxiv.org/abs/2409.10781 — Inconsistent doc/code changes raise bug-introduction odds (~1.5×); divergence is not free—it increases defect risk for maintainers and users.

Gates: Silent-diverge-without-cost invented: 0. STUDY-RK-021 invented: 0. Findings: 8. Tip `66d57a5`.

URLs:
https://arxiv.org/abs/2607.15780
https://arxiv.org/abs/2212.01479
https://arxiv.org/abs/2605.02163
https://arxiv.org/abs/2604.26523
https://arxiv.org/abs/2511.00215
https://arxiv.org/abs/2603.00331
https://arxiv.org/abs/2402.11048
https://arxiv.org/abs/2409.10781

✅
