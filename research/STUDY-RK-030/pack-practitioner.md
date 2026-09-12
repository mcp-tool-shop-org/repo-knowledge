STUDY-RK-030 Q2 (Practitioner)

stop: docs/source inventory — Claude Games playbook vs templates vs scorer POINTS drift; what to align in docs/templates PR.
prerequisite: tip `4aeee0b`; STUDY-RK-029 done sha=`af75b3e` PR #20; STUDY-RK-011 extras.
owner: Practitioner
fallback: collapsing playbook+templates into one file → 🛑.

Eight doc/API sources. All Verifier PASS. Do not invent STUDY-RK-051.

1. STUDY-RK-011 grounding | path: research/STUDY-RK-011/grounding.md | Finding: three layers; Playbook-template-collapse: 0.

2. THE-CLAUDE-GAMES.md L1–8 | path: THE-CLAUDE-GAMES.md | Finding: operator playbook, not agent instructions.

3. templates/claude-games/ | path: templates/claude-games/ | Finding: agent-facing; enrichment lacks instructions.md.

4. scorer.ts POINTS | path: src/games/scorer.ts | Finding: HIGH 10 / MEDIUM 5 / LOW 2 / HEALTHY 25 / PERFECT_PUSH 20 / CI_FAIL -30 / CI_FAIL_TWICE -50 — score authority.

5. DRIFT playbook vs POINTS | path: THE-CLAUDE-GAMES.md | Finding: +3/-15/-40 absent from POINTS; no critical tier in POINTS.

6. DRIFT templates vs scorer | path: templates/claude-games/ | Finding: critical/high/medium/low third table diverges from POINTS.

7. DRIFT claim model | Finding: file [ ]/[~]/[x] vs DB + 30-min fair-game mismatch across surfaces.

8. PR targets | Finding: keep separation; single score from POINTS; align claim prose; enrichment instructions if three-pass.

Invented collapse: 0. Soft folklore: 0.

✅
