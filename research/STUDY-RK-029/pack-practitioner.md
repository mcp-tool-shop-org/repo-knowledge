STUDY-RK-029 Q2 (Practitioner)

stop: docs/source inventory — machine-absolute paths in product-facing docs vs portable README/handbook; what to strip/rephrase.
prerequisite: tip `996e7af`; STUDY-RK-028 done sha=`1b716df` PR #19; STUDY-RK-018 extras.
owner: Practitioner
fallback: inventing F:\ or /Users as product → 🛑.

Eight doc/API sources. All Verifier PASS. Do not invent STUDY-RK-051.

1. STUDY-RK-018 grounding | org: local research | path: research/STUDY-RK-018/grounding.md | Finding: studio paths are operator inputs, not product requirements.

2. README + handbook portable | org: local | paths: README.md, site/src/content/docs/handbook/ | Finding: no baked F:\ /Users /workspace/studio in README/handbook product prose.

3. KNOWLEDGE-CONTRACT absolutes | org: local | path: KNOWLEDGE-CONTRACT.md | Finding: hard-codes F:\AI\repo-knowledge\… and F:\AI\memory\ absolutes.

4. THE-CLAUDE-GAMES absolutes | org: local | path: THE-CLAUDE-GAMES.md | Finding: hard-codes F:\AI\repo-knowledge\ paths throughout operator scripts.

5. REMEDIATION-INSTRUCTIONS absolutes | org: local | path: REMEDIATION-INSTRUCTIONS.md | Finding: F:\AI\repo-knowledge\… and F:\AI\<repo-name> as work locations.

6. ROADMAP companion absolutes | org: local | path: ROADMAP.md | Finding: /Users/michaelfrilot/.claude/projects/… memory companion paths.

7. ROADMAP multi-rig examples | org: local | path: ROADMAP.md | Finding: /Volumes/T9-Shared/AI and F:\AI\X as multi-rig path examples.

8. Docs PR list | org: local | Finding: replace F:\ with relative/`<workspace>` placeholders; rephrase companion as operator-only narrative; label multi-rig examples; keep README/handbook portable.

Invented paths: 0. Soft folklore: 0.

✅
