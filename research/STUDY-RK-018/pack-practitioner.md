STUDY-RK-018 Q2 (Practitioner)

stop: Phase 5 full-treatment — product requirements vs studio-local paths (docs + source).
prerequisite: STUDY-RK-017 done sha=`3253278`; tip `3253278`; clone `/workspace/studio/repo-knowledge`.
owner: Practitioner
fallback: Path/URL mismatch -> flag; Coordinator if <6 findings.

Eight doc/API sources. I did not invent Phase 5 as a studio-only path requirement, nor STUDY-RK-021.

1. KNOWLEDGE-CONTRACT product minimum | org: mcp-tool-shop-org/repo-knowledge | date: tip 3253278 (file present; last README/package-era commit a301d0e 2026-06-22) | path: `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md` | Finding: every repo MUST get thesis + architecture notes at minimum; relationships via add_relationship; optional note types warning/next_step/drift_risk/release_summary/convention/pain_point/command/general; rules forbid inventing release history.

2. KNOWLEDGE-CONTRACT studio-local operator paths | org: local contract | date: tip 3253278 | path: same KNOWLEDGE-CONTRACT.md | Finding: header pins Database F:\AI\repo-knowledge\data\knowledge.db and Worklist F:\AI\repo-knowledge\KNOWLEDGE-WORKLIST.md; workflow says check F:\AI\memory\ as authored input then verify against the repo — these are Windows operator paths, not npm package install requirements.

3. README product surfaces (no F: paths) | org: mcp-tool-shop-org/repo-knowledge | date: 2026-06-22 (a301d0e) | path: `/workspace/studio/repo-knowledge/README.md` | Finding: product blurb catalogs thesis notes, architecture docs, relationships; CLI rk note / rk relate; MCP list includes add_repo_note and add_relationship; Enrichment Pass agents add thesis, architecture, relationship mappings — README Requirements list Node/gh/better-sqlite3 only, not memory file paths.

4. NOTE_TYPES + RELATION_TYPES product enums | org: local | date: tip 3253278 | path: `/workspace/studio/repo-knowledge/src/index.ts` | Finding: shared tuples thesis|architecture|warning|next_step|drift_risk|release_summary|convention|pain_point|command|general and depends_on|related_to|supersedes|shares_domain_with|shares_package_with|companion_to|wraps|collaborated_in_mission — product schema vocabulary mirrored for CLI/MCP.

5. MCP mutating tools for enrichment | org: local | date: tip 3253278 | path: `/workspace/studio/repo-knowledge/src/mcp/server.ts` | Finding: add_repo_note Zod-enums NOTE_TYPES; add_relationship Zod-enums RELATION_TYPES; tools write DB notes/edges without referencing F:\AI\memory\.

6. ROADMAP Axis 5 Full treatment vs Feature 5 | org: local | date: 2026-05-01 (f894ed0) | path: `/workspace/studio/repo-knowledge/ROADMAP.md` | Finding: swarm model ends with Full treatment = shipcheck → version bumps → README/handbook/translations → publish; Feature 5 = relation_type wraps + collaborated_in_mission migration — neither names Full treatment as a studio-only memory-path requirement (Phase 5-as-studio-path not asserted in this file).

7. ROADMAP companion Mac memory paths | org: local | date: 2026-05-01 | path: ROADMAP.md Companion docs | Finding: lists operator-local Claude project memory files under /Users/michaelfrilot/.claude/projects/-Volumes-T9-Shared-AI/memory/ (repo-knowledge.md, dogfood-swarm.md, feedback_consult_canonical_registry.md) plus ~/.claude/skills/repo-knowledge/SKILL.md — studio/rig operator docs, not package Requirements.

8. Claude Games enrichment vs F:\ layout | org: local | date: 2026-04-24 (eac41fd games) / tip templates | paths: `/workspace/studio/repo-knowledge/THE-CLAUDE-GAMES.md`, `templates/claude-games/README.md` | Finding: Pass 2 Enrichment requires thesis + architecture + relationships (product-shaped); THE-CLAUDE-GAMES.md pins operator tree under F:\AI\repo-knowledge\ (contracts/worklists/cd) and memory/org-audit-complete.md for sweep results — path layout is operator-local while enrichment content types match the contract.

Phase-5-as-studio-only-path invented: 0 · STUDY-RK-021 invented: 0

✅
