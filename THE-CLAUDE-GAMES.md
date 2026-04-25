# The Claude Games

A reusable workflow for running parallel multi-Claude operations across the entire repo portfolio.

**What this is:** A playbook for the operator (you) to kick off coordinated sweeps where multiple Claude instances work through every repo in the portfolio — auditing, enriching, remediating, or any future pass you define.

**What this is not:** Instructions for the Claudes themselves. Those live in the pass-specific instruction files generated for each run.

---

## When to Run

- Quarterly portfolio health check
- After a batch of new repos ship
- After a major standards change (new controls, new quality bar)
- Post-incident hardening sweep
- When the remediation backlog grows past a threshold you set
- Any time you want parallel Claudes to systematically touch every repo

---

## The Three Passes

Every sweep follows the same three-pass structure. You can run one, two, or all three depending on what you need.

### Pass 1: Audit

**Purpose:** Evaluate every repo against the standard. Produce structured findings.

**Standard:** 19 domains, 80 controls, evidence-backed results, normalized findings, metrics, derived posture.

**Operator files:**
- `AUDIT-CONTRACT.md` — the full audit standard (controls, posture rules, submission format)
- `data/control-registry.json` — machine-readable control catalog
- `AUDIT-WORKLIST.md` — generated claim table (one row per repo)

**Generate the worklist:**
```bash
node scripts/gen-audit-worklist.mjs
```

**Claude instructions (copy-paste to each Claude):**
```
You are auditing repos. Read these files in order, then start:
1. F:\AI\repo-knowledge\AUDIT-CONTRACT.md
2. F:\AI\repo-knowledge\AUDIT-WORKLIST.md

Worklist is a table. Claim a repo by changing [ ] to [~] with your name and timestamp.
Submit results via the audit_submit MCP tool.
When done, mark [x] and grab the next repo. Keep rolling.
One repo at a time. Every control gets a result. Every non-pass needs evidence.
```

### Pass 2: Enrichment

**Purpose:** Populate the knowledge layer — notes, relationships, releases. The part that makes this a knowledge system, not a metadata dump.

**Operator files:**
- `ENRICHMENT-WORKLIST.md` — generated claim table
- `ENRICHMENT-INSTRUCTIONS.md` — what to populate and quality bar

**Generate the worklist:**
```bash
node scripts/gen-enrichment-worklist.mjs
```

**Claude instructions (copy-paste to each Claude):**
```
You are enriching repo knowledge. Read these files in order, then start:
1. F:\AI\repo-knowledge\ENRICHMENT-INSTRUCTIONS.md
2. F:\AI\repo-knowledge\ENRICHMENT-WORKLIST.md

Worklist is a table. Claim a repo by changing [ ] to [~] with your name and timestamp.
Every repo gets: thesis note, architecture note, relationships mapped, releases synced.
When done, mark [x] and grab the next repo. Keep rolling.
One repo at a time.
```

### Pass 3: Remediation

**Purpose:** Fix every repo that didn't pass clean. Move needs_attention to healthy. Green CI required.

**Operator files:**
- `REMEDIATION-INSTRUCTIONS.md` — the 8-step workflow + scoring
- `REMEDIATION-WORKLIST.md` — generated claim table (needs_attention repos only)
- `REMEDIATION-CHECKLIST.md` — detailed per-repo findings and fix sheets

**Generate the worklist:**
```bash
node scripts/gen-worklist.mjs
```

**Claude instructions (copy-paste to each Claude):**
```
Read F:\AI\repo-knowledge\REMEDIATION-INSTRUCTIONS.md then start.
Worklist is at F:\AI\repo-knowledge\REMEDIATION-WORKLIST.md.
```

---

## Running a Sweep

### 1. Decide scope

Pick which passes to run. You don't always need all three.

| Trigger | Passes |
|---------|--------|
| Quarterly review | Audit → Enrichment → Remediation |
| New repos added | Audit → Enrichment |
| Standards updated | Audit → Remediation |
| Knowledge gaps found | Enrichment only |
| Backlog cleanup | Remediation only |
| Post-incident hardening | Audit → Remediation |

### 2. Generate worklists

Run the generator script for each pass you're running. The scripts query the live DB and produce clean claim tables.

```bash
cd F:\AI\repo-knowledge

# For audit pass (all repos, or only unaudited/stale)
node scripts/gen-audit-worklist.mjs

# For enrichment pass (repos missing notes/relationships)
node scripts/gen-enrichment-worklist.mjs

# For remediation pass (repos with needs_attention posture)
node scripts/gen-worklist.mjs
```

### 3. Launch Claudes

Spin up as many Claude instances as you want. Give each one the copy-paste instructions for the current pass. They self-coordinate through the worklist file — claim-on-pick prevents collisions.

**Recommended:** 3–6 Claudes per pass. More than that and worklist file contention gets noisy.

### 4. Monitor progress

Check on them:

```bash
# Quick count
grep -c '\[x\]' REMEDIATION-WORKLIST.md   # done
grep -c '\[~\]' REMEDIATION-WORKLIST.md   # in progress
grep -c '\[ \]' REMEDIATION-WORKLIST.md   # unclaimed

# DB-level status
node src/cli.js stats
node src/cli.js audit posture
```

### 5. Generate report

After the sweep, generate the portfolio report:

```bash
node scripts/gen-audit-report.mjs
```

Output: `audit_report.md` — full portfolio snapshot from live DB data.

---

## The Scoring System

Scoring keeps quality up when multiple Claudes work unsupervised. The key insight: **CI failure is the most expensive mistake**, so Claudes learn to test locally first.

| Action | Points |
|--------|--------|
| High finding fixed | +10 |
| Medium finding fixed | +5 |
| Low finding fixed | +2 |
| Failing control flipped to pass | +3 |
| CI passes on first push | +20 (PERFECT PUSH) |
| Posture upgraded to healthy | +25 |
| **CI fails after push** | **-30** |
| **CI fails twice on same repo** | **-50** |
| Skipped high finding without justification | -15 |
| Abandoned repo before finishing | -40 |

Scoring is self-reported per repo in the worklist. Trust but verify — the DB has the real numbers.

---

## The Coordination Model

Multiple Claudes work from the same worklist file. Collision avoidance is simple:

1. Claude opens worklist
2. Finds first `[ ]` row
3. Changes it to `[~]` with name + timestamp
4. Saves immediately
5. Then starts work

If a row already shows `[~]` or `[x]`, skip it. This is optimistic locking — rare collisions are possible but harmless (two Claudes fix the same repo, one overwrites the other's worklist entry, both submit audits, DB keeps the latest).

**One repo at a time. Finish before claiming another. Keep rolling after each completion.**

---

## Infrastructure

Everything lives in `F:\AI\repo-knowledge\`:

```
repo-knowledge/
├── data/
│   ├── knowledge.db              # SQLite — the source of truth
│   └── control-registry.json     # 80 controls, machine-readable
├── scripts/
│   ├── gen-audit-worklist.mjs    # Generates audit claim table
│   ├── gen-enrichment-worklist.mjs # Generates enrichment claim table
│   ├── gen-worklist.mjs          # Generates remediation claim table
│   ├── gen-remediation-checklist.mjs # Detailed per-repo fix sheets
│   ├── gen-audit-report.mjs      # Full portfolio report
│   └── sync-releases.cjs         # GitHub releases → DB
├── src/
│   ├── cli.js                    # CLI interface
│   └── mcp/server.js             # MCP server
├── AUDIT-CONTRACT.md             # The audit standard
├── REMEDIATION-INSTRUCTIONS.md   # Claude operator instructions (remediation)
├── REMEDIATION-WORKLIST.md       # Live claim table (remediation)
├── REMEDIATION-CHECKLIST.md      # Detailed per-repo fix sheets
├── audit_report.md               # Latest portfolio report
└── THE-CLAUDE-GAMES.md           # This file
```

MCP tools available to Claudes:
- `get_repo`, `find_repos`, `search_repos`, `related_repos`
- `repo_summary`, `repos_by_stack`, `repos_needing_work`
- `audit_detail`, `audit_posture`, `audit_submit`
- `audit_controls_list`, `audit_portfolio`, `audit_findings`
- `add_repo_note`, `add_relationship`
- `sync_repos`

---

## After the Sweep

1. **Generate the report** — `node scripts/gen-audit-report.mjs`
2. **Review posture changes** — how many moved from needs_attention to healthy?
3. **Identify stubborn repos** — still needs_attention after remediation? Why?
4. **Update memory** — save sweep results to `memory/org-audit-complete.md`
5. **Identify next programs** — what patterns remain? New remediation tracks?
6. **Schedule the next sweep** — quarterly, or trigger-based

---

## History

| Sweep | Date | Passes | Repos | Result |
|-------|------|--------|-------|--------|
| 1 | March 2026 | Audit + Enrichment + Remediation | 176 | 0 critical, 104 healthy, 71 needs_attention, 5 remediation programs identified |
