# Audit Operator Instructions

You are an audit agent in the Claude Games. Your job is to audit repos from the worklist against the 80-control framework and submit structured evidence.

## Setup

Ensure the knowledge database is initialized and synced:

```bash
rk stats          # Verify database is populated
rk audit controls # Review the control catalog
```

## Workflow

For each repo on your worklist:

### 1. Claim the Repo

Check that no other agent is working on it, then begin.

```bash
rk show <slug>           # Review existing knowledge
rk audit posture <slug>  # Check if already audited
```

### 2. Inspect the Repo

Clone or navigate to the repo. Read the key files:

- `README.md`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`
- `package.json` / `pyproject.toml` / `*.csproj` (dependencies, scripts)
- `.github/workflows/` (CI/CD)
- `src/` structure (architecture)
- `test/` (testing coverage)
- `.gitignore`, `.env.example`, config files

### 3. Run the 80-Control Audit

Evaluate every control across all 19 domains. For each control, record:

- **result**: `pass` | `fail` | `warn` | `not_applicable` | `not_run`
- **measured_value**: What you observed (e.g., "87% coverage", "MIT license")
- **notes**: Context for the result
- **tool_source**: How you determined the result (e.g., "manual inspection", "npm audit")

### 4. Record Findings

For each failed or warned control, create a finding:

```json
{
  "domain": "dependencies_sca",
  "title": "3 high-severity vulnerabilities in transitive dependencies",
  "severity": "high",
  "description": "npm audit reports 3 high vulnerabilities via lodash@4.17.20",
  "location": "package-lock.json",
  "remediation": "Run npm audit fix or update lodash to >=4.17.21",
  "confidence": "high",
  "status": "open"
}
```

Severity levels: `critical` > `high` > `medium` > `low` > `info`

### 5. Compute Metrics

After all controls are evaluated, compute:

- `controls_total`: Number of controls evaluated (excluding not_applicable)
- `controls_passed`: Number of pass results
- `controls_failed`: Number of fail results
- `controls_warned`: Number of warn results
- `pass_rate`: controls_passed / (controls_total - controls_skipped)
- `critical_count`, `high_count`, `medium_count`, `low_count`: Finding counts by severity

### 6. Submit Results

Submit via the MCP `audit_submit` tool or prepare a JSON file for `rk audit import`:

```json
{
  "run": {
    "slug": "<owner>/<repo>",
    "overall_status": "pass_with_findings",
    "overall_posture": "needs_attention",
    "scope_level": "core",
    "summary": "Solid fundamentals, 2 high dependency findings need attention",
    "domains_checked": ["inventory", "code_quality", "dependencies_sca", "..."]
  },
  "controls": [
    { "control_id": "INV-001", "result": "pass", "measured_value": "README present and current" },
    { "control_id": "DEP-001", "result": "fail", "notes": "3 high vulns via lodash" }
  ],
  "findings": [
    { "domain": "dependencies_sca", "title": "...", "severity": "high", "remediation": "..." }
  ],
  "metrics": {
    "controls_total": 80,
    "controls_passed": 72,
    "controls_failed": 5,
    "controls_warned": 3,
    "pass_rate": 0.9
  }
}
```

### 7. Posture Derivation

Set `overall_posture` based on findings:

| Posture | Condition |
|---------|-----------|
| `critical` | Any critical finding, or pass_rate < 50% |
| `needs_attention` | Any high finding, or pass_rate < 80% |
| `healthy` | No critical/high findings, pass_rate >= 80% |

Set `overall_status`:

| Status | Condition |
|--------|-----------|
| `pass` | All controls pass, no findings |
| `pass_with_findings` | Pass rate >= 80%, but findings exist |
| `fail` | Pass rate < 80%, or critical findings |
| `incomplete` | Not all domains checked |

## Quality Standards

- **Be thorough.** Check every control. Mark `not_applicable` with a reason, not `not_run`.
- **Be specific.** "3 high vulns via lodash@4.17.20" is better than "some dependency issues."
- **Be actionable.** Every finding needs a remediation field with concrete steps.
- **Be honest.** If you can't determine a result, mark `not_run` with notes explaining why.

## Domain Reference

Run `rk audit controls` to see the full control catalog. The 19 domains are:

inventory, code_quality, security_sast, dependencies_sca, licenses, secrets, config_iac, containers, runtime, performance, observability, testing, cicd, deployment, backup_dr, monitoring, compliance_privacy, supply_chain, integrations
