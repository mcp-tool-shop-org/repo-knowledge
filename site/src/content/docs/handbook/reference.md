---
title: Reference
description: Data model, configuration schema, and audit contract reference.
sidebar:
  order: 6
---

## Data model

```
repos
 +-- tech (language, framework, shape, runtime)
 +-- notes (thesis, architecture, warning, convention, ...)
 +-- docs (README, CHANGELOG, indexed content)
 +-- facts (dependencies, config keys, endpoints)
 +-- relationships (depends_on, related_to, supersedes, ...)
 +-- audit_runs
      +-- audit_control_results (per-control pass/fail)
      +-- audit_findings (title, severity, remediation)
      +-- audit_metrics (pass_rate, coverage, counts)
```

## Note types

| Type | Purpose |
|------|---------|
| `thesis` | What the repo is and why it exists |
| `architecture` | How it's built, key components, data flow |
| `convention` | Important patterns or rules specific to this repo |
| `warning` | Known issues or things that could break |
| `next_step` | What should happen next |
| `drift_risk` | Things that could diverge from intended state |
| `release_summary` | Summary of a release |
| `command` | Key commands to build, test, deploy |
| `pain_point` | Known developer experience issues |
| `general` | Anything else |

## Relationship types

| Type | Meaning |
|------|---------|
| `depends_on` | Hard dependency |
| `related_to` | Soft association |
| `supersedes` | Replaces an older repo |
| `shares_domain_with` | Same problem domain |
| `shares_package_with` | Shared npm/pip package |
| `companion_to` | Designed to work together |

## Configuration

`rk.config.json` in the workspace root:

```json
{
  "owners": ["my-github-org"],
  "localDirs": ["/path/to/repos"],
  "dbPath": "data/knowledge.db",
  "artifactsRoot": "data/artifacts"
}
```

## Audit contract schema

The audit import contract expects a directory with these files:

### `run.json` (required)

```json
{
  "slug": "my-org/my-repo",
  "overall_status": "pass_with_findings",
  "overall_posture": "needs_attention",
  "domains_checked": ["code_quality", "testing"],
  "auditor": "claude",
  "started_at": "2026-03-18T10:00:00Z",
  "completed_at": "2026-03-18T10:05:00Z"
}
```

### `controls.json` (required)

```json
[
  { "control_id": "QUA-001", "result": "pass" },
  { "control_id": "TST-001", "result": "fail", "notes": "No tests" }
]
```

### `findings.json` (optional)

```json
[
  {
    "domain": "testing",
    "title": "No test suite",
    "severity": "high",
    "remediation": "Add vitest"
  }
]
```

### `metrics.json` (optional)

```json
{
  "controls_total": 80,
  "controls_passed": 65,
  "controls_failed": 10,
  "pass_rate": 81.25,
  "critical_count": 0,
  "high_count": 3
}
```

### `artifacts.json` (optional)

References to raw report files on disk. Files are not imported into the database — only their metadata is stored.

```json
[
  {
    "artifact_type": "eslint_report",
    "path": "reports/eslint.json",
    "generated_by": "eslint",
    "format": "json"
  }
]
```

## Audit control IDs

Control IDs follow the pattern `DOMAIN-NNN`:

| Prefix | Domain |
|--------|--------|
| `INV` | inventory |
| `QUA` | code_quality |
| `SEC` | security_sast |
| `DEP` | dependencies_sca |
| `LIC` | licenses |
| `SCR` | secrets |
| `CFG` | config_iac |
| `CON` | containers |
| `RUN` | runtime |
| `PRF` | performance |
| `OBS` | observability |
| `TST` | testing |
| `CIC` | cicd |
| `DPL` | deployment |
| `BDR` | backup_dr |
| `MON` | monitoring |
| `CPR` | compliance_privacy |
| `SUP` | supply_chain |
| `INT` | integrations |

Use `rk audit controls --domain <domain>` to see all controls for a domain.

## Error shape

All errors from the programmatic API follow a structured shape:

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Machine-readable error code |
| `message` | string | Human-readable error message |
| `hint` | string? | Suggested fix or next step |
| `cause` | string? | Underlying cause |
| `retryable` | boolean | Whether the operation can be retried |

## Environment variables

| Variable | Description |
|----------|-------------|
| `RK_DB_PATH` | Path to the SQLite database file |
| `RK_OWNERS` | Comma-separated list of GitHub org owners |
| `RK_LOCAL_DIRS` | Comma-separated list of local directories to scan |
