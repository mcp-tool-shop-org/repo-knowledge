# The Claude Games

Agent-facing templates for portfolio-wide repo operations. Multiple Claude instances work in parallel, coordinating through a shared **worklist file** to audit, enrich, and remediate an entire organization's repos.

This directory is **not** the operator playbook. Operators start from [`THE-CLAUDE-GAMES.md`](../../THE-CLAUDE-GAMES.md). Score authority is `src/games/scorer.ts` `POINTS` — not the tables in this folder.

## Architecture

```
Coordinator (you) — operator playbook: THE-CLAUDE-GAMES.md
  |
  +-- Agent 1 (claims repos from the worklist file)
  +-- Agent 2 (claims repos from the worklist file)
  +-- Agent N (claims repos from the worklist file)
  |
  v
Worklist markdown  ([ ] / [~] / [x])     ← claim lock; scorer reads this
Shared Database    (rk knowledge.db)     ← results: audits, notes, relationships
```

Each agent runs in its own Claude session. Agents claim on the worklist (`[ ]` → `[~]` → `[x]`), then submit results to the database. The database tracks what was stored; it is not the claim lock.

## Three-Pass Structure

### Pass 1: Audit

Each agent runs the 80-control audit against claimed repos and submits structured evidence.

**Setup:**
```bash
# Generate the audit worklist
rk audit unaudited > worklist.txt

# Or target specific repos
rk list --owner <your-org> > worklist.txt
```

**Agent instructions:** See [audit-instructions.md](audit-instructions.md)

**Per-repo workflow:**
1. Claim a repo on the worklist (`[ ]` → `[~] claimed by <name> <timestamp>`)
2. Clone or navigate to the repo
3. Run the 80-control audit across all 19 domains
4. Submit results via `rk audit import` or the MCP `audit_submit` tool
5. Mark the worklist row `[x] done by <name> <timestamp>`

### Pass 2: Enrichment

Agents add structured knowledge to each repo: thesis, architecture notes, conventions, relationships.

**Agent instructions:** See [enrichment-instructions.md](enrichment-instructions.md)

**Per-repo workflow:**
1. Read the repo's code and existing docs
2. Add a `thesis` note (what is this repo and why does it exist)
3. Add an `architecture` note (key design decisions)
4. Add `convention` notes (patterns other agents should know)
5. Map relationships to other repos (`depends_on`, `related_to`, `supersedes`)
6. Add `warning` or `pain_point` notes for known issues

### Pass 3: Remediation

Agents fix audit findings, scored by `src/games/scorer.ts` `POINTS`.

**Agent instructions:** See [remediation-instructions.md](remediation-instructions.md)

## Scoring System

**Score authority:** `src/games/scorer.ts` `POINTS` (the only table `rk games score` awards). There is no critical-finding score tier. Audit finding severity `critical` is a findings label, not a points band.

| Action | Points | `POINTS` key |
|--------|--------|--------------|
| High finding fixed | +10 | `HIGH_FIXED` |
| Medium finding fixed | +5 | `MEDIUM_FIXED` |
| Low finding fixed | +2 | `LOW_FIXED` |
| Posture upgraded to healthy | +25 | `HEALTHY` |
| CI passes on first push | +20 | `PERFECT_PUSH` |
| CI fails after push | -30 | `CI_FAIL` |
| CI fails twice on same repo | -50 | `CI_FAIL_TWICE` |

`rk games score` parses the remediation worklist (`[x] done by …` plus `NH NM NL`). Done rows currently auto-award `HEALTHY` + `PERFECT_PUSH` because the worklist alone cannot detect CI fails.

### Non-authoritative notes (not in `POINTS`)

These rows used to appear in this template. They are **not** awarded by the scorer:

| Note | Why it is not a score |
|------|------------------------|
| Fix a critical finding (was 10) | No critical tier in `POINTS` |
| High/medium/low as 5 / 3 / 1 | Wrong constants (`POINTS` is 10 / 5 / 2) |
| Add SECURITY.md / CHANGELOG.md, fix CI, coverage, vulns as extra bands | Absent from `POINTS` |

The scoring system gamifies remediation and provides a leaderboard across agents via `rk games score`.

## Coordination Model

**Worklist claiming** (`[ ]` / `[~]` / `[x]`) is the claim lock. The scorer (`src/games/parser.ts`) reads those status cells. The database stores results, not the claim.

1. Find the first `[ ]` row on the worklist
2. Change it to `[~] claimed by <name> <timestamp>` and save immediately
3. If the row already shows `[~]` or `[x]`, skip it
4. When finished: `[x] done by <name> <timestamp>`
5. The coordinator monitors progress via the worklist plus `rk audit posture` and `rk stats`

A 30-minute “fair-game” lease is **not** implemented in the scorer or worklist parser — do not treat it as a game rule.

**Conflict resolution:**
- First write wins for audit submissions (subsequent runs create new audit_run records)
- Notes and relationships are additive (no conflicts)
- The coordinator resolves any disputes

## Running the Games

```bash
# 1. Prepare the environment
rk init
rk sync --owners <your-org>
rk audit seed-controls

# 2. Check what needs work
rk audit unaudited
rk stats

# 3. Launch agents (each in their own terminal/session)
# Give each agent audit-instructions.md, enrichment-instructions.md,
# or remediation-instructions.md — not THE-CLAUDE-GAMES.md

# 4. Monitor progress
rk audit posture          # Portfolio-wide posture
rk audit findings         # Open findings
rk stats                  # Database stats

# 5. Generate reports
rk audit posture          # Final portfolio posture
rk audit findings -s critical  # Remaining critical findings
```

## Tips

- Start with 2-3 agents for audit pass, scale up once the workflow is proven
- Use `rk audit posture` frequently to monitor convergence
- The enrichment pass is highest-value for long-term knowledge retention
- Remediation works best when agents specialize by domain (e.g., one agent handles all `dependencies_sca` findings)
