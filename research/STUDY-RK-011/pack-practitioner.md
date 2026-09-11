STUDY-RK-011 Q2 — Practitioner

stop: Claude Games templates vs THE-CLAUDE-GAMES.md (docs + source).
prerequisite: STUDY-RK-010 done sha=`2d4f9ff`; tip `2d4f9ff`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch → flag; 🛑 Coordinator if <6 findings.

Q2 — What do primary Claude Games docs+source state for operator playbook vs agent templates vs scoring engine, and where they drift?

Eight doc/API sources. I did not invent What. THE-CLAUDE-GAMES-as-agent-instructions invented: 0. Do not invent STUDY-RK-021.

1. THE-CLAUDE-GAMES.md audience — mcp-tool-shop-org · tip `2d4f9ff` (2026-09-11) · `/workspace/studio/repo-knowledge/THE-CLAUDE-GAMES.md` L1–8 — States it is an **operator playbook** to kick off coordinated sweeps; **What this is not:** instructions for the Claudes themselves (those live in pass-specific instruction files).

2. Operator playbook structure — mcp-tool-shop-org · tip `2d4f9ff` · `THE-CLAUDE-GAMES.md` L20–135, L166–199 — Three passes (Audit/Enrichment/Remediation); generate worklists via `scripts/gen-*-worklist.mjs`; launch Claudes with copy-paste pass instructions; file claim `[ ]`→`[~]`→`[x]`; scoring table for quality.

3. templates/claude-games/README.md — mcp-tool-shop-org · tip `2d4f9ff` · `templates/claude-games/README.md` L1–60 — Multi-agent orchestration; points agents to `audit-instructions.md` / `remediation-instructions.md`; setup via `rk audit unaudited` / `rk list`; DB-shared coordination narrative.

4. Agent instruction templates — mcp-tool-shop-org · tip `2d4f9ff` · `templates/claude-games/audit-instructions.md` L1–79 · `remediation-instructions.md` L1–45 — Agent-facing: "You are an audit/remediation agent"; 80-control workflow + `audit_submit`; 8-step remediation (clone/branch/fix/verify).

5. Scoring engine (src/games) — mcp-tool-shop-org · tip `2d4f9ff` · `src/games/index.ts` · `scorer.ts` L1–24 · `types.ts` L1–5 · `parser.ts` L1–8 — Parses REMEDIATION-WORKLIST.md; POINTS: +10H/+5M/+2L/+25 healthy/+20 perfect push/−30 CI fail/−50 twice; `rk games score` (README L160).

6. DRIFT: playbook vs scorer POINTS — mcp-tool-shop-org · tip `2d4f9ff` · `THE-CLAUDE-GAMES.md` L170–181 vs `scorer.ts` L16–24 — Playbook lists +3 control-flip, −15 unjustified skip, −40 abandon; scorer POINTS object omits those three; done rows also auto-award PERFECT_PUSH ("can't detect CI fails from worklist alone").

7. DRIFT: templates README score table — mcp-tool-shop-org · tip `2d4f9ff` · `templates/claude-games/README.md` L62–77 — Different table (critical 10, high 5, medium 3, low 1 + doc/CI bonuses) vs playbook and vs scorer H/M/L constants — three scoring stories diverge.

8. DRIFT: claim coordination — mcp-tool-shop-org · tip `2d4f9ff` · `THE-CLAUDE-GAMES.md` L187–197 vs `templates/.../README.md` L80–87 — Playbook: markdown worklist optimistic lock; templates README: claims recorded in database + 30-min fair-game — coordination mechanism differs on-page.

On-page: playbook ≠ agent instructions. Invented agent-facing THE-CLAUDE-GAMES.md: 0.

✅
