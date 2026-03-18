# The Claude Games

Multi-agent orchestration for portfolio-wide repo operations. Multiple Claude instances work in parallel, coordinating through a shared worklist to audit, enrich, and remediate an entire organization's repos.

## Architecture

```
Coordinator (you)
  |
  +-- Agent 1 (claims repos from worklist)
  +-- Agent 2 (claims repos from worklist)
  +-- Agent N (claims repos from worklist)
  |
  v
Shared Database (rk knowledge.db)
```

Each agent runs in its own Claude session. Coordination happens through the repo-knowledge database: agents claim repos, submit results, and the database tracks what's done.

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
1. Claim a repo from the worklist (mark as in-progress)
2. Clone or navigate to the repo
3. Run the 80-control audit across all 19 domains
4. Submit results via `rk audit import` or the MCP `audit_submit` tool
5. Mark repo as complete on the worklist

### Pass 2: Enrichment

Agents add structured knowledge to each repo: thesis, architecture notes, conventions, relationships.

**Per-repo workflow:**
1. Read the repo's code and existing docs
2. Add a `thesis` note (what is this repo and why does it exist)
3. Add an `architecture` note (key design decisions)
4. Add `convention` notes (patterns other agents should know)
5. Map relationships to other repos (`depends_on`, `related_to`, `supersedes`)
6. Add `warning` or `pain_point` notes for known issues

### Pass 3: Remediation

Agents fix audit findings, scored by impact.

**Agent instructions:** See [remediation-instructions.md](remediation-instructions.md)

## Scoring System

Each remediation action is scored:

| Action | Points |
|--------|--------|
| Fix a critical finding | 10 |
| Fix a high finding | 5 |
| Fix a medium finding | 3 |
| Fix a low finding | 1 |
| Add missing SECURITY.md | 3 |
| Add missing CHANGELOG.md | 2 |
| Fix CI pipeline | 5 |
| Improve test coverage >80% | 3 |
| Clean up dependency vulnerabilities | 5 |

The scoring system gamifies remediation and provides a leaderboard across agents.

## Coordination Model

**Worklist claiming** prevents duplicate work:

1. Before starting a repo, check if another agent has claimed it
2. Claims are recorded in the database with a timestamp
3. If an agent crashes, unclaimed repos after 30 minutes are fair game
4. The coordinator monitors progress via `rk audit posture` and `rk stats`

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
# Give each agent the audit-instructions.md or remediation-instructions.md

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
