---
title: Audit Framework
description: The 80-control, 19-domain audit system for structured security and quality evidence.
sidebar:
  order: 4
---

The audit system provides structured evidence collection across 19 domains with 80 canonical controls. Every audit run produces control results, findings, and metrics — all stored in SQLite and queryable from CLI or MCP tools.

## Domains

| Domain | What it covers |
|--------|---------------|
| `inventory` | Repo metadata, ownership, classification |
| `code_quality` | Linting, formatting, complexity |
| `security_sast` | Static analysis, injection, auth patterns |
| `dependencies_sca` | Vulnerability scanning, dependency currency |
| `licenses` | License compliance, compatibility |
| `secrets` | Secret detection, rotation practices |
| `config_iac` | Infrastructure-as-code hygiene |
| `containers` | Image security, scanning |
| `runtime` | Error handling, resilience |
| `performance` | Profiling, optimization |
| `observability` | Logging, tracing, metrics |
| `testing` | Coverage, test types, CI integration |
| `cicd` | Pipeline security, gates |
| `deployment` | Release process, rollback |
| `backup_dr` | Backup plans, recovery |
| `monitoring` | Alerting, uptime |
| `compliance_privacy` | Data handling, GDPR |
| `supply_chain` | SBOM, provenance |
| `integrations` | API contracts, versioning |

## Control results

Each control produces one of:

| Result | Meaning |
|--------|---------|
| `pass` | Control requirement is met |
| `fail` | Control requirement is not met |
| `warn` | Partial compliance or minor concern |
| `not_applicable` | Control does not apply to this repo |
| `not_run` | Control was not evaluated |
| `error` | Evaluation failed |

## Posture levels

Posture is derived automatically from control results and findings:

- **healthy** — no critical/high findings, pass rate above threshold
- **needs_attention** — some high findings or moderate pass rate
- **critical** — critical findings present or very low pass rate

## Submitting audit results

### Via MCP tool

```json
{
  "run": {
    "slug": "my-org/my-repo",
    "overall_status": "pass_with_findings",
    "overall_posture": "needs_attention",
    "domains_checked": ["code_quality", "testing", "security_sast"]
  },
  "controls": [
    { "control_id": "QUA-001", "result": "pass" },
    { "control_id": "TST-001", "result": "fail", "notes": "No tests found" }
  ],
  "findings": [
    {
      "domain": "testing",
      "title": "No test suite",
      "severity": "high",
      "remediation": "Add vitest with basic coverage"
    }
  ]
}
```

### Via CLI

Place JSON files in a directory following the audit contract schema:

```bash
rk audit import /path/to/audit-results/
```

Required files: `run.json`, `controls.json`. Optional: `findings.json`, `metrics.json`.

## Querying results

```bash
# Portfolio posture overview
rk audit posture

# Single repo audit detail
rk audit posture my-org/my-repo

# All critical findings
rk audit findings --severity critical

# Repos failing a domain
rk audit failing testing

# Repos never audited
rk audit unaudited
```
