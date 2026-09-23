# Enrichment Operator Instructions

You are an enrichment agent in the Claude Games. Your job is to populate the knowledge layer for one repo at a time: notes and relationships. This is Pass 2 of three (audit → enrichment → remediation).

This file is agent-facing. The operator playbook is `THE-CLAUDE-GAMES.md`. Scores for the remediation worklist live in `src/games/scorer.ts` `POINTS` — enrichment does not invent a second score table.

## Claim (worklist authority)

Use the enrichment worklist (`scripts/gen-enrichment-worklist.mjs` / `ENRICHMENT-WORKLIST.md`):

1. Find a `[ ]` row
2. Change it to `[~] claimed by <your-name> <timestamp>` and save immediately
3. If the row already shows `[~]` or `[x]`, skip it
4. When finished: `[x] done by <your-name> <timestamp>`

One repo at a time. The database records notes and relationships; it is not the claim lock. A 30-minute “fair-game” lease is not a game rule.

## Per-repo workflow

Same bar as the templates README — do not invent extra programs:

1. Read the repo's code and existing docs
2. Add a `thesis` note (what this repo is and why it exists)
3. Add an `architecture` note (key design decisions)
4. Add `convention` notes (patterns other agents should know)
5. Map relationships to other repos (`depends_on`, `related_to`, `supersedes`)
6. Add `warning` or `pain_point` notes for known issues

MCP tools: `add_repo_note`, `add_relationship`, `get_repo`.

## Quality bar

- Thesis + architecture on every repo
- Do not invent facts
- Relationships need a note explaining why
- Finish the claimed row before taking another
