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

// cds-A-005: pass_rate is stored on two scales across the portfolio —
// some rows are 0-1 fractions, others are 0-100 percentages. The old
// `value <= 1 ? value * 100 : value` heuristic silently renders a true
// 1% (stored as the integer 1) as "100%". We keep the heuristic (the
// data is genuinely mixed-scale) but TAG the value with a leading `~`
// when the fraction branch fired, so a reader can see the percent was
// inferred from a <= 1 value rather than measured. Provenance-on-display.
export function formatPassRate(passRateRaw) {
  if (passRateRaw <= 1) {
    // Inferred-as-fraction branch — mark it so 1 (→ "~100%") is never
    // mistaken for a measured 100%.
    return '~' + Math.round(passRateRaw * 100) + '%';
  }
  return Math.round(passRateRaw) + '%';
}

// Env-gated self-test (cds-A-005 regression). Runs before any DB side
// effect so it works without a built database. `RK_SELFTEST=1 node
// scripts/gen-worklist.mjs` (or `--selftest`) asserts the invariant and exits.
if (process.env.RK_SELFTEST === '1' || process.argv.includes('--selftest')) {
  const assertEq = (actual, expected, label) => {
    if (actual !== expected) {
      console.error(`[gen-worklist selftest] FAIL ${label}: got ${actual}, want ${expected}`);
      process.exit(1);
    }
  };
  // Two-part invariant: a fraction (0.5 → 50%) and a small integer
  // percent (1 → 1%) must render DIFFERENTLY. The bug rendered both as
  // a 50/100-style percent with no way to tell them apart.
  assertEq(formatPassRate(0.5), '~50%', 'fraction 0.5');
  assertEq(formatPassRate(1), '~100%', 'ambiguous 1 is tagged');
  assertEq(formatPassRate(87), '87%', 'percent 87 untagged');
  assertEq(formatPassRate(100), '100%', 'percent 100 untagged');
  // Discriminating assertion: tagged "~100%" (from value 1) must NOT
  // equal untagged "100%" (from value 100). Without the tag both
  // collapse to "100%" — the exact bug being pinned.
  assertEq(formatPassRate(1) === formatPassRate(100), false, 'value 1 distinguishable from value 100');
  console.log('[gen-worklist selftest] OK');
  process.exit(0);
}

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
  // cds-A-005: tagged formatter — a leading `~` marks a value the
  // <= 1 fraction heuristic interpreted, so 1% (stored as 1) is not
  // silently rendered as a bare "100%".
  const passRate = formatPassRate(r.pass_rate_raw);
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
