# Scorecard

> Score a repo before remediation. Fill this out first, then use SHIP_GATE.md to fix.

**Repo:** repo-knowledge
**Date:** 2026-06-20
**Type tags:** [npm] [mcp] [cli]

## Assessment (post dogfood-swarm health pass — 0 CRIT / 0 HIGH)

| Category | Score | Notes |
|----------|-------|-------|
| A. Security | 10/10 | SECURITY.md + README threat model; stdio-only MCP (no egress); `delete_repo` confirm-gated, CLI destructive ops prompt/`--yes`; no secrets, no telemetry; FTS metachar + ambiguous-slug hardening landed this swarm. |
| B. Error Handling | 10/10 | Structured `RepoKnowledgeError` (code/message/hint/cause/retryable); CLI exit codes 0/1/2; global `parseAsync` catch prints clean error + exit 2, stacks only on `--debug`; MCP returns structured isError, never crashes; sync-export crash degrades gracefully. |
| C. Operator Docs | 10/10 | README current (refreshed); CHANGELOG Keep-a-Changelog with [2.1.0]; MIT LICENSE; accurate commander `--help`; all 30 MCP tools documented; HANDBOOK.md + Starlight handbook pages. |
| D. Shipping Hygiene | 10/10 | `verify` script (typecheck+lint+test+test:scripts); version 2.1.0 matches tag with consistency tests; CI `npm audit` step; dependabot.yml (monthly, grouped); `files` field ships dist/README/CHANGELOG/LICENSE; engines.node >=20; lockfile committed. |
| E. Identity (soft) | 10/10 | Logo in README header; 8-language READMEs; Astro landing page + Starlight handbook deployed via pages.yml; GitHub metadata mirrored from package.json. |
| **Overall** | **50/50** | All hard gates A–D pass; soft gate E complete. Ready to tag/publish v2.1.0. |

## Key Gaps

None blocking. This repo completed a comprehensive four-stage health pass (bug/security → proactive → humanization → visual) plus a feature wave with 0 CRIT / 0 HIGH outstanding (tests 377 → 515). Every hard-gate item verified against real code/files.

Minor (non-blocking) notes:

1. CI `npm audit` is advisory (`continue-on-error`) by design — surfaces findings to the Step Summary without failing the build. Acceptable per the noise-reduction posture (npm audit is ~68% unreachable noise); the build-health subsystem provides the deeper signal.
2. Dependabot batches all deps into one monthly grouped PR — intentional to limit notification fatigue and CI spend, consistent with the workspace's GitHub Actions cost rules.

## Remediation Priority

| Priority | Item | Estimated effort |
|----------|------|-----------------|
| — | No remediation required — all hard gates pass | — |

## Post-Remediation

<!-- This scorecard reflects the post-swarm state; "Before" captured the blank-template shipcheck reading (3%), "After" is the verified real state. -->

| Category | Before | After |
|----------|--------|-------|
| A. Security | 0/10 | 10/10 |
| B. Error Handling | 0/10 | 10/10 |
| C. Operator Docs | 0/10 | 10/10 |
| D. Shipping Hygiene | 0/10 | 10/10 |
| E. Identity (soft) | 0/10 | 10/10 |
| **Overall** | 0/50 | 50/50 |
