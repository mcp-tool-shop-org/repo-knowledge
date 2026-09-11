STUDY-RK-002 Q2 for @Verifier (tip `d08a6cd`). Four fields: stop 6–8 primary docs/paths for KNOWLEDGE-CONTRACT required thesis + architecture + ≥1 relationship and isolated-entry behavior; on-page claims from KNOWLEDGE-CONTRACT.md, schema notes/relationships, MCP tools, worklist · prereq STUDY-RK-001 `d08a6cd` · owner practitioner · fallback Blog-only → skip; Invent optional-thesis → 🛑. Do not invent STUDY-RK-021. Current consumer repo-knowledge. Readouts parked.

**8 findings**
1. KNOWLEDGE-CONTRACT.md MUST minimum — local — tip `d08a6cd` — `/workspace/studio/repo-knowledge/KNOWLEDGE-CONTRACT.md` — “Every repo **MUST** get at minimum: **thesis** … **architecture** …”; Rules: “**Every repo gets thesis + architecture at minimum. No exceptions.**”
2. KNOWLEDGE-CONTRACT relationships — same file — tip `d08a6cd` — MCP `add_relationship`; “**Relationships must have a note explaining why. No bare edges.**”; workflow step 7: record relationships to other org repos.
3. KNOWLEDGE-WORKLIST.md Minimum deliverables — local — started **2026-03-18** — `/workspace/studio/repo-knowledge/KNOWLEDGE-WORKLIST.md` — Checklist: **thesis** note · **architecture** note · **relationships** recorded · releases if applicable · additional notes as warranted; one-repo-at-a-time claim rules.
4. Worklist completed rows with rels:0 — same worklist — tip `d08a6cd` — e.g. `local/mcp-org-github` … `notes:2 rels:0`; `a11y-mcp-tools` … `notes:2 rels:0` — on-page completed entries can land with **zero relationships** (isolated in edge count).
5. schema.sql `repo_notes` — local — tip `d08a6cd` — `/workspace/studio/repo-knowledge/src/db/schema.sql` — `note_type` CHECK includes `'thesis','architecture',...`; table allows any listed type — **no CHECK forcing thesis/architecture presence per repo**.
6. schema.sql `repo_relationships` — same schema — tip `d08a6cd` — Edges with typed `relation_type` enum + optional `note TEXT`; unique (from, type, to) — **no NOT NULL mandate that every repo has ≥1 edge**.
7. README + MCP tools — tip `d08a6cd` — README lists `rk note` / `rk relate` and MCP `add_repo_note` `add_relationship`; Enrichment Pass: “add thesis, architecture notes, and relationship mappings”; Data Model shows notes + relationships children of repos.
8. Gaps (contract vs schema) — tip `d08a6cd` — Contract language is **MUST thesis+architecture**; worklist lists relationships as minimum deliverable; DB schema **does not enforce** thesis/arch presence or ≥1 relationship (isolated `rels:0` rows exist). **Invent optional-thesis → 🛑.**

**Contrast:** Required thesis/architecture is **contract/worklist MUST**; ≥1 relationship is worklist minimum but **schema-permissive** (isolated entries appear as `rels:0`).

Seven doc/API sources. I did not invent What.
✅
