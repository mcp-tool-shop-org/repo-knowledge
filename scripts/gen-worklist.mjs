#!/usr/bin/env node
/**
 * Generates REMEDIATION-WORKLIST.md from the audit database.
 * Lists repos with posture='needs_attention' from their most recent audit run.
 */
import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'knowledge.db');
const outPath = join(__dirname, '..', 'REMEDIATION-WORKLIST.md');

const db = new Database(dbPath, { readonly: true });

// Get repos whose latest audit has posture = 'needs_attention'
// Join with metrics for pass_rate, and count open findings by severity
const rows = db.prepare(`
  WITH latest_runs AS (
    SELECT ar.*,
           ROW_NUMBER() OVER (PARTITION BY ar.repo_id ORDER BY ar.completed_at DESC) AS rn
    FROM audit_runs ar
  )
  SELECT
    r.slug,
    COALESCE(am.findings_open_high, am.high_count, 0) AS high,
    COALESCE(am.findings_open_medium, am.medium_count, 0) AS medium,
    COALESCE(am.findings_open_low, am.low_count, 0) AS low,
    COALESCE(am.pass_rate, 0) AS pass_rate_raw
  FROM latest_runs lr
  JOIN repos r ON r.id = lr.repo_id
  LEFT JOIN audit_metrics am ON am.audit_run_id = lr.id
  WHERE lr.rn = 1
    AND lr.overall_posture = 'needs_attention'
  ORDER BY r.slug COLLATE NOCASE
`).all();

const count = rows.length;

const tableRows = rows.map(r => {
  const findings = `${r.high}H ${r.medium}M ${r.low}L`;
  // Normalize: some pass_rate values are 0-1 (decimal), others are 0-100 (percent)
  const pct = r.pass_rate_raw <= 1 ? Math.round(r.pass_rate_raw * 100) : Math.round(r.pass_rate_raw);
  const passRate = `${pct}%`;
  return `| [ ] | ${r.slug} | ${findings} | ${passRate} |`;
}).join('\n');

const md = `# Remediation Worklist

${count} repos. Multiple Claudes working in parallel. Claim rules below.

## How to claim
1. Find a line with \`[ ]\`
2. Change it to \`[~] claimed by <your-name> <timestamp>\`
3. Save immediately
4. If a line already has \`[~]\` or \`[x]\`, skip it — someone else has it

## How to complete
Change \`[~]\` to \`[x] done by <your-name> <timestamp> | posture: healthy | CI: green\`

---

| Status | Slug | Findings (H/M/L) | Pass Rate |
|--------|------|-------------------|-----------|
${tableRows}
`;

writeFileSync(outPath, md, 'utf-8');
console.log(`Wrote ${outPath} (${count} repos)`);
db.close();
