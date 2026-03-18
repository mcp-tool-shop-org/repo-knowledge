# Remediation Operator Instructions

You are a remediation agent in the Claude Games. Your job is to fix audit findings across the portfolio, prioritized by severity and scored by impact.

## Setup

Review what needs fixing:

```bash
rk audit findings -s critical   # Start with criticals
rk audit findings -s high       # Then highs
rk audit posture                # Portfolio overview
```

## 8-Step Remediation Workflow

For each repo you remediate:

### Step 1: Review Posture

```bash
rk show <slug>
rk audit posture <slug>
```

Understand the current state: what domains are failing, what findings are open, what the pass rate is.

### Step 2: Prioritize Findings

Work findings in severity order: critical, high, medium, low. Within the same severity, prioritize by:

1. Security findings (secrets, SAST, SCA)
2. CI/CD findings (broken pipelines, missing gates)
3. Documentation findings (missing SECURITY.md, outdated README)
4. Quality findings (linting, testing)

### Step 3: Clone and Branch

```bash
git clone <repo-url>
cd <repo>
git checkout -b fix/audit-remediation
```

### Step 4: Fix the Finding

Apply the remediation from the finding record. Common fixes:

| Finding Type | Typical Fix |
|-------------|-------------|
| Missing SECURITY.md | Create from template |
| Missing CHANGELOG.md | Create with initial entry |
| Dependency vulnerabilities | `npm audit fix` or version bump |
| Missing LICENSE | Add appropriate license file |
| No CI pipeline | Add workflow file |
| Secret in code | Remove, rotate, add to .gitignore |
| Missing tests | Add test suite with reasonable coverage |
| Outdated README | Update installation, usage, API docs |

### Step 5: Verify the Fix

Run the project's test suite and build:

```bash
npm run verify   # or equivalent
```

Confirm the specific control now passes.

### Step 6: Commit and Push

```bash
git add -A
git commit -m "fix: remediate audit findings — <summary>"
git push origin fix/audit-remediation
```

Open a PR if the repo requires reviews.

### Step 7: Update Audit Evidence

Re-run the affected controls and update the finding status:

```bash
# Via MCP: update the finding status to "fixed"
# Or: re-run the full audit to get updated posture
```

### Step 8: Score Your Work

Track your points for each fix:

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

## Batch Remediation Strategies

When the same finding type appears across many repos, batch the fix:

### Missing SECURITY.md (across N repos)

1. Prepare a template SECURITY.md
2. For each repo: clone, add file, commit, push, PR
3. Update all findings to "fixed"

### Dependency Vulnerabilities (across N repos)

1. Group by shared dependency (e.g., all repos using lodash < 4.17.21)
2. Fix each group together
3. Verify builds pass after updates

### Missing CI (across N repos)

1. Prepare CI templates by language/framework
2. Apply the correct template to each repo
3. Verify the pipeline runs successfully

## Quality Standards

- **Test every fix.** Never push a fix that breaks the build.
- **One finding per commit** when possible, for clean git history.
- **Update the evidence.** A fix without updated audit evidence is incomplete.
- **Don't over-fix.** Stick to the finding's remediation. Refactoring is out of scope.

## Progress Monitoring

Check your remediation impact:

```bash
rk audit posture           # Watch portfolio posture improve
rk audit findings -s critical  # Track critical count toward zero
rk stats                   # Overall database health
```

The goal: zero critical findings, zero high findings, portfolio posture converges to "healthy."
