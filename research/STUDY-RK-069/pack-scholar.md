STUDY-RK-069 Q1 (Scholar) — tip `df55e34`. Eight papers, all arXiv. Invented phantom CLI: 0. Invented merge-advice: 0. STUDY-RK-081 invented: 0. No coding PR.

1. Hallucination Inspector — Tileria, Dash, Pârţachi — 2026 — https://arxiv.org/abs/2604.20202 — Scaffolding hallucination invents Phantom Symbols (imports/constructors/constants) absent from the API specification. PASS

2. Agent-Reactive Bugs — Chen, Chen, Zhu — 2026 — https://arxiv.org/abs/2607.15684 — Tool Hallucination is using a tool/argument the registry does not define, or an incorrect name for an existing one. PASS

3. SAAG — Garimella, Khandelwal, Kohli — 2026 — https://arxiv.org/abs/2607.18245 — Registry Conformance separates hallucinated function names from schema/value failures (FNEM). PASS

4. READU — Baek, Krampf, Pradel — 2026 — https://arxiv.org/abs/2607.15780 — Implementation–documentation drift: docs stating behavior that no longer matches the implementation. PASS

5. Documentation-to-Code Traceability — Alor, Khatoonabadi, Shihab — 2025 — https://arxiv.org/abs/2506.16440 — False positives include naming-based assumptions and phantom links to non-existent artifacts. PASS

6. CLI-Anything — Yang, Fan, Huang — 2026 — https://arxiv.org/abs/2606.03854 — Harness method discovers the backend contract and publishes truthful previews from the real backend. PASS

7. Tool Forge — Rao — 2026 — https://arxiv.org/abs/2605.28000 — CLI help checks ensure the command-line surface matches the capability contract. PASS

8. Command-Line Customization — Schröder, Cito — 2020 — https://arxiv.org/abs/2012.10206 — UNVERIFIED — flag; do not land as verified.

Tip check: cli.ts `.command('runs')`; README `rk runs`; MCP `ops_runs`. No `rk operational-runs`. Reaffirm STUDY-RK-041.

Verifier: Scholar 7/8 PASS · #8 UNVERIFIED.

✅
