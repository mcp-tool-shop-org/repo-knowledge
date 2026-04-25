# Audit Import Contract

This document defines the JSON contract for submitting audit results to repo-knowledge.

## Overview

Each audit run produces structured data in three layers:

1. **Run metadata** — the envelope (who, when, what scope, overall result)
2. **Normalized findings** — per-control results and concrete issues
3. **Raw artifacts** — scanner outputs, SARIF, logs stay on disk; only references in DB

## Import Methods

### 1. MCP Tool: `audit_submit`

The primary path for Claude auditors. Submit inline JSON:

```json
{
  "run": { ... },
  "controls": [ ... ],
  "findings": [ ... ],
  "metrics": { ... }
}
```

### 2. CLI: `rk audit import <dir>`

Import from a directory containing these files:

```
audit-output/
  run.json
  controls.json
  findings.json
  metrics.json
  artifacts.json          (optional, references to raw files)
  raw/                    (optional, raw scanner outputs)
    semgrep.sarif
    npm-audit.json
    gitleaks.json
    ...
```

### 3. Programmatic: `importAuditInline()`

Direct JS API for custom integrations.

---

## Schema: run.json

```json
{
  "slug": "mcp-tool-shop-org/glyphstudio",
  "commit_sha": "abc123",
  "branch": "main",
  "auditor": "claude",
  "scope_level": "core",
  "overall_status": "pass_with_findings",
  "overall_posture": "needs_attention",
  "domains_checked": ["inventory", "code_quality", "security_sast", "dependencies_sca", "secrets", "testing", "cicd"],
  "summary": "GlyphStudio passes core inventory and security checks. 2 medium dependency findings. CI lacks SAST integration.",
  "blocking_release": false,
  "started_at": "2026-03-18T10:00:00Z",
  "completed_at": "2026-03-18T10:45:00Z"
}
```

### Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| slug | string | yes | `owner/name` |
| commit_sha | string | no | git SHA audited |
| branch | string | no | branch name |
| auditor | string | no | default: `claude` |
| scope_level | enum | no | `core` \| `full` \| `deep` |
| overall_status | enum | yes | `pass` \| `pass_with_findings` \| `fail` \| `incomplete` |
| overall_posture | enum | yes | `healthy` \| `needs_attention` \| `critical` \| `unknown` |
| domains_checked | string[] | no | array of domain enums |
| summary | string | no | one-paragraph computed summary |
| blocking_release | boolean | no | default: false |
| started_at | ISO 8601 | no | auto-set if omitted |
| completed_at | ISO 8601 | no | |

---

## Schema: controls.json

Array of per-control check results:

```json
[
  {
    "control_id": "INV-001",
    "result": "pass",
    "notes": "README.md present, 45 lines, last updated 2026-03-15",
    "tool_source": "filesystem",
    "measured_value": "45 lines"
  },
  {
    "control_id": "SEC-001",
    "result": "pass",
    "notes": "gitleaks found 0 secrets",
    "tool_source": "gitleaks"
  },
  {
    "control_id": "CI-002",
    "result": "fail",
    "notes": "No SAST tool found in .github/workflows/",
    "tool_source": "workflow-files"
  }
]
```

### Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| control_id | string | yes | e.g. `SEC-001`, `DEP-004` |
| result | enum | yes | `pass` \| `fail` \| `warn` \| `not_applicable` \| `not_run` \| `error` |
| notes | string | no | evidence or explanation |
| evidence_ref | string | no | path to artifact |
| tool_source | string | no | tool that produced this |
| measured_value | string | no | e.g. "87%", "3 findings" |

### Canonical Control IDs

Run `rk audit controls` or use `audit_controls_list` MCP tool to get the full catalog.

---

## Schema: findings.json

Array of concrete issues:

```json
[
  {
    "domain": "dependencies_sca",
    "control_id": "DEP-002",
    "title": "High CVE in express@4.17.1",
    "description": "CVE-2024-XXXX: prototype pollution in qs dependency",
    "severity": "high",
    "confidence": "high",
    "status": "open",
    "location": "package.json",
    "tool_source": "npm-audit",
    "remediation": "Upgrade express to ^4.18.2",
    "cve_id": "CVE-2024-XXXX",
    "cvss_score": 7.5
  }
]
```

### Fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| domain | enum | yes | one of the 19 domains |
| control_id | string | no | canonical control ID |
| title | string | yes | short finding title |
| description | string | no | detailed description |
| severity | enum | yes | `critical` \| `high` \| `medium` \| `low` \| `info` |
| confidence | enum | no | `high` \| `medium` \| `low` (default: high) |
| status | enum | no | `open` \| `in_progress` \| `fixed` \| `accepted_risk` \| `false_positive` \| `mitigated` (default: open) |
| location | string | no | file:line or path |
| tool_source | string | no | tool that found this |
| remediation | string | no | recommended fix |
| cve_id | string | no | if applicable |
| cvss_score | number | no | CVSS score |

---

## Schema: metrics.json

Snapshot metrics for the run:

```json
{
  "critical_count": 0,
  "high_count": 2,
  "medium_count": 3,
  "low_count": 1,
  "info_count": 0,
  "coverage_percent": 78.5,
  "test_count": 24,
  "outdated_dependencies": 5,
  "vulnerable_dependencies": 2,
  "secrets_found": 0,
  "sbom_present": false,
  "backup_plan_present": false,
  "license_issues": 0,
  "controls_passed": 38,
  "controls_failed": 4,
  "controls_warned": 2,
  "controls_skipped": 12,
  "controls_total": 56,
  "pass_rate": 0.68
}
```

---

## Schema: artifacts.json

References to raw files on disk:

```json
[
  {
    "artifact_type": "sarif",
    "path": "raw/semgrep.sarif",
    "generated_by": "semgrep",
    "format": "sarif"
  },
  {
    "artifact_type": "json",
    "path": "raw/npm-audit.json",
    "generated_by": "npm-audit",
    "format": "json"
  }
]
```

---

## Domains (fixed enum)

```
inventory, code_quality, security_sast, dependencies_sca,
licenses, secrets, config_iac, containers, runtime,
performance, observability, testing, cicd, deployment,
backup_dr, monitoring, compliance_privacy, supply_chain,
integrations
```

---

## Workflow for Claude Auditors

1. Get the control catalog: `audit_controls_list`
2. Get repo info: `get_repo` to understand the repo's tech stack
3. Run applicable checks (automated + manual review)
4. Submit results: `audit_submit` with run, controls, findings, metrics
5. The system computes posture and makes it queryable

## Querying Results

- `audit_posture` — single repo posture
- `audit_portfolio` — all repos, grouped by posture
- `audit_findings` — open findings across portfolio
- `audit_detail` — full audit for one repo
- `audit_unaudited` — repos not yet audited
