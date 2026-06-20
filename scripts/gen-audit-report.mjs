#!/usr/bin/env node
/**
 * gen-audit-report.mjs
 * Generates audit_report.md — a comprehensive portfolio audit report
 * from the repo-knowledge database.
 */
import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// PH-AHG-006: formatPassRate now lives in one shared module so the
// provenance (`~`-tag) rule + null behavior can't drift between the two
// generators. This script renders with one decimal place (decimals: 1).
import { formatPassRate as formatPassRateShared } from './lib/format.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'knowledge.db');
const outPath = join(__dirname, '..', 'audit_report.md');

// This report renders pass rates with one decimal ("~50.0%"). The
// provenance/null rule itself lives in scripts/lib/format.mjs (cds-A-005).
export function formatPassRate(passRate) {
  return formatPassRateShared(passRate, { decimals: 1 });
}

// Env-gated self-test (cds-A-005 regression). Runs before any DB side
// effect so it works without a built database. `RK_SELFTEST=1 node
// scripts/gen-audit-report.mjs` (or `--selftest`) asserts the invariant and exits.
if (process.env.RK_SELFTEST === '1' || process.argv.includes('--selftest')) {
  const assertEq = (actual, expected, label) => {
    if (actual !== expected) {
      console.error(`[gen-audit-report selftest] FAIL ${label}: got ${actual}, want ${expected}`);
      process.exit(1);
    }
  };
  // The two-part invariant: a fraction (0.5 → 50%) and a small integer
  // percent (1 → 1%) must render DIFFERENTLY. The bug rendered both as
  // a 50/100-style percent with no way to tell them apart.
  assertEq(formatPassRate(0.5), '~50.0%', 'fraction 0.5');
  assertEq(formatPassRate(1), '~100.0%', 'ambiguous 1 is tagged');
  assertEq(formatPassRate(87), '87.0%', 'percent 87 untagged');
  assertEq(formatPassRate(100), '100.0%', 'percent 100 untagged');
  assertEq(formatPassRate(null), '-', 'null renders dash');
  // The discriminating assertion: tagged "~100.0%" (from value 1) must
  // NOT equal untagged "100.0%" (from value 100). Without the tag both
  // collapse to "100.0%" — this is the exact bug being pinned.
  assertEq(formatPassRate(1) === formatPassRate(100), false, 'value 1 distinguishable from value 100');
  console.log('[gen-audit-report selftest] OK');
  process.exit(0);
}

const db = new Database(dbPath, { readonly: true });

const lines = [];
const push = (...args) => lines.push(...args);
const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

// ── Helpers ──

function pct(n, total) {
  if (total === 0) return '0.0%';
  return (n / total * 100).toFixed(1) + '%';
}

// ── 1. Executive Summary ──

const totalRepos = db.prepare('SELECT COUNT(*) AS c FROM repos').get().c;
const auditedRepos = db.prepare(`
  SELECT COUNT(DISTINCT repo_id) AS c FROM audit_runs
`).get().c;
const unauditedRepos = totalRepos - auditedRepos;

const postureCounts = db.prepare(`
  WITH latest AS (
    SELECT repo_id, overall_posture,
           -- PH-AHG-001: match the queries.ts "latest run" contract
           -- (started_at DESC, id DESC). completed_at is nullable, so an
           -- ORDER BY completed_at with no tiebreak picked an arbitrary
           -- row for in-progress/legacy runs and diverged from Stage A.
           ROW_NUMBER() OVER (PARTITION BY repo_id ORDER BY started_at DESC, id DESC) AS rn
    FROM audit_runs
  )
  SELECT overall_posture, COUNT(*) AS c
  FROM latest WHERE rn = 1
  GROUP BY overall_posture
`).all();
const postureMap = {};
for (const r of postureCounts) postureMap[r.overall_posture] = r.c;

const totalFindings = db.prepare('SELECT COUNT(*) AS c FROM audit_findings').get().c;
const openFindings = db.prepare("SELECT COUNT(*) AS c FROM audit_findings WHERE status = 'open'").get().c;

push('# Portfolio Audit Report');
push('');
push(`**Generated:** ${now}  `);
push(`**Source:** repo-knowledge DB (\`data/knowledge.db\`)  `);
push('');
push('---');
push('');
push('## 1. Executive Summary');
push('');
push(`- **Total repos:** ${totalRepos}`);
push(`- **Audited:** ${auditedRepos} (${pct(auditedRepos, totalRepos)})`);
push(`- **Unaudited:** ${unauditedRepos} (${pct(unauditedRepos, totalRepos)})`);
push(`- **Healthy:** ${postureMap['healthy'] || 0}`);
push(`- **Needs attention:** ${postureMap['needs_attention'] || 0}`);
push(`- **Critical:** ${postureMap['critical'] || 0}`);
push(`- **Total findings:** ${totalFindings} (${openFindings} open)`);
push('');

// ── 2. Database Completeness ──

push('## 2. Database Completeness');
push('');

const tableCounts = [
  'repos', 'repo_notes', 'repo_relationships', 'repo_releases',
  'repo_facts', 'repo_docs', 'repo_tech', 'repo_topics',
  'audit_runs', 'audit_findings', 'audit_control_results', 'audit_controls', 'audit_metrics'
];
push('| Table | Rows |');
push('|-------|------|');
// PH-AHG-007: degrade gracefully on a pre-migration DB — a table the
// generator expects may not exist yet (e.g. running against an old DB before
// the audit migrations ran). Probe sqlite_master so a missing table renders
// "n/a" instead of throwing a raw "no such table" stack.
const tableExists = (t) =>
  db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?").get(t) != null;
for (const t of tableCounts) {
  if (!tableExists(t)) { push(`| ${t} | n/a (absent) |`); continue; }
  const c = db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
  push(`| ${t} | ${c} |`);
}
push('');

// Note type breakdown
const noteTypes = db.prepare(`
  SELECT note_type, COUNT(*) AS c FROM repo_notes GROUP BY note_type ORDER BY c DESC
`).all();
push('**Note types:**');
push('');
push('| Type | Count |');
push('|------|-------|');
for (const r of noteTypes) push(`| ${r.note_type} | ${r.c} |`);
push('');

// Relationship type breakdown
const relTypes = db.prepare(`
  SELECT relation_type, COUNT(*) AS c FROM repo_relationships GROUP BY relation_type ORDER BY c DESC
`).all();
push('**Relationship types:**');
push('');
push('| Type | Count |');
push('|------|-------|');
for (const r of relTypes) push(`| ${r.relation_type} | ${r.c} |`);
push('');

// Coverage: repos with thesis, arch, rels
const withThesis = db.prepare("SELECT COUNT(DISTINCT repo_id) AS c FROM repo_notes WHERE note_type = 'thesis'").get().c;
const withArch = db.prepare("SELECT COUNT(DISTINCT repo_id) AS c FROM repo_notes WHERE note_type = 'architecture'").get().c;
const withRels = db.prepare("SELECT COUNT(DISTINCT from_repo_id) AS c FROM repo_relationships").get().c;
const withReleases = db.prepare("SELECT COUNT(DISTINCT repo_id) AS c FROM repo_releases").get().c;

push('**Knowledge coverage:**');
push('');
push(`- Repos with thesis note: ${withThesis}/${totalRepos} (${pct(withThesis, totalRepos)})`);
push(`- Repos with architecture note: ${withArch}/${totalRepos} (${pct(withArch, totalRepos)})`);
push(`- Repos with relationships: ${withRels}/${totalRepos} (${pct(withRels, totalRepos)})`);
push(`- Repos with releases: ${withReleases}/${totalRepos} (${pct(withReleases, totalRepos)})`);
push('');

// ── 3. Portfolio Posture ──

push('## 3. Portfolio Posture');
push('');
push('| Posture | Count | % of Audited |');
push('|---------|-------|-------------|');
const postureOrder = ['healthy', 'needs_attention', 'critical', 'unknown'];
for (const p of postureOrder) {
  const c = postureMap[p] || 0;
  if (c > 0) push(`| ${p} | ${c} | ${pct(c, auditedRepos)} |`);
}
if (unauditedRepos > 0) push(`| unaudited | ${unauditedRepos} | - |`);
push('');

// ── 4. Findings Summary ──

push('## 4. Findings Summary');
push('');

// By severity
const findingsBySeverity = db.prepare(`
  SELECT severity, status, COUNT(*) AS c
  FROM audit_findings
  GROUP BY severity, status
  ORDER BY
    CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 WHEN 'info' THEN 4 END,
    status
`).all();

// Pivot: severity -> open/closed/etc
const sevMap = {};
for (const r of findingsBySeverity) {
  if (!sevMap[r.severity]) sevMap[r.severity] = {};
  sevMap[r.severity][r.status] = r.c;
}

push('**By severity:**');
push('');
push('| Severity | Open | Fixed | Accepted Risk | False Positive | Other | Total |');
push('|----------|------|-------|---------------|----------------|-------|-------|');
for (const sev of ['critical', 'high', 'medium', 'low', 'info']) {
  const m = sevMap[sev] || {};
  const open = m['open'] || 0;
  const fixed = m['fixed'] || 0;
  const accepted = m['accepted_risk'] || 0;
  const fp = m['false_positive'] || 0;
  const other = Object.entries(m).reduce((s, [k, v]) => {
    if (!['open', 'fixed', 'accepted_risk', 'false_positive'].includes(k)) return s + v;
    return s;
  }, 0);
  const total = Object.values(m).reduce((s, v) => s + v, 0);
  if (total > 0) push(`| ${sev} | ${open} | ${fixed} | ${accepted} | ${fp} | ${other} | ${total} |`);
}
push('');

// By domain
const findingsByDomain = db.prepare(`
  SELECT domain, COUNT(*) AS total,
    SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_count
  FROM audit_findings
  GROUP BY domain
  ORDER BY total DESC
`).all();

push('**By domain:**');
push('');
push('| Domain | Total | Open |');
push('|--------|-------|------|');
for (const r of findingsByDomain) push(`| ${r.domain} | ${r.total} | ${r.open_count} |`);
push('');

// ── 5. Top High-Severity Findings ──

push('## 5. High-Severity Findings');
push('');

const highFindings = db.prepare(`
  SELECT af.*, r.slug
  FROM audit_findings af
  JOIN audit_runs ar ON ar.id = af.audit_run_id
  JOIN repos r ON r.id = ar.repo_id
  WHERE af.severity IN ('critical', 'high')
    AND af.status = 'open'
  ORDER BY
    CASE af.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 END,
    r.slug, af.domain, af.title
`).all();

if (highFindings.length === 0) {
  push('No open critical or high findings.');
} else {
  push(`${highFindings.length} open critical/high findings:`);
  push('');
  push('| Severity | Repo | Domain | Title | Remediation |');
  push('|----------|------|--------|-------|-------------|');
  for (const f of highFindings) {
    const rem = f.remediation ? f.remediation.replace(/\n/g, ' ').replace(/\|/g, '/').slice(0, 120) : '-';
    push(`| ${f.severity} | ${f.slug} | ${f.domain} | ${f.title.replace(/\|/g, '/')} | ${rem} |`);
  }
}
push('');

// ── 6. Most Common Patterns ──

push('## 6. Most Common Patterns');
push('');

const patterns = db.prepare(`
  SELECT title, severity, COUNT(*) AS affected_repos, domain
  FROM audit_findings
  WHERE status = 'open'
  GROUP BY title
  HAVING affected_repos > 1
  ORDER BY affected_repos DESC, title
  LIMIT 30
`).all();

if (patterns.length === 0) {
  push('No recurring patterns found.');
} else {
  push('| Finding | Severity | Domain | Repos Affected |');
  push('|---------|----------|--------|----------------|');
  for (const p of patterns) {
    push(`| ${p.title.replace(/\|/g, '/')} | ${p.severity} | ${p.domain} | ${p.affected_repos} |`);
  }
}
push('');

// ── 7. Control Pass Rates ──

push('## 7. Control Pass Rates');
push('');

const controls = db.prepare(`
  SELECT
    ac.id,
    ac.domain,
    ac.title,
    SUM(CASE WHEN acr.result = 'pass' THEN 1 ELSE 0 END) AS pass_count,
    SUM(CASE WHEN acr.result = 'fail' THEN 1 ELSE 0 END) AS fail_count,
    SUM(CASE WHEN acr.result = 'warn' THEN 1 ELSE 0 END) AS warn_count,
    SUM(CASE WHEN acr.result = 'not_applicable' THEN 1 ELSE 0 END) AS na_count,
    SUM(CASE WHEN acr.result NOT IN ('pass','fail','warn','not_applicable') THEN 1 ELSE 0 END) AS other_count,
    COUNT(*) AS total
  FROM audit_controls ac
  LEFT JOIN audit_control_results acr ON acr.control_id = ac.id
  GROUP BY ac.id
  ORDER BY ac.domain, ac.id
`).all();

push('| Control | Domain | Title | Pass | Fail | Warn | N/A | Rate |');
push('|---------|--------|-------|------|------|------|-----|------|');
for (const c of controls) {
  const applicable = c.total - c.na_count;
  const rate = applicable > 0 ? pct(c.pass_count, applicable) : '-';
  const title = (c.title || '').slice(0, 50).replace(/\|/g, '/');
  push(`| ${c.id} | ${c.domain} | ${title} | ${c.pass_count} | ${c.fail_count} | ${c.warn_count} | ${c.na_count} | ${rate} |`);
}
push('');

// Best and worst
const sorted = controls
  .filter(c => (c.total - c.na_count) > 0)
  .map(c => ({ ...c, rate: c.pass_count / (c.total - c.na_count) }))
  .sort((a, b) => a.rate - b.rate);

if (sorted.length > 0) {
  push('**Worst performing controls (lowest pass rate):**');
  push('');
  for (const c of sorted.slice(0, 10)) {
    push(`- ${c.id}: ${c.title || '-'} (${(c.rate * 100).toFixed(1)}% pass)`);
  }
  push('');

  const best = [...sorted].reverse();
  push('**Best performing controls (highest pass rate):**');
  push('');
  for (const c of best.slice(0, 10)) {
    push(`- ${c.id}: ${c.title || '-'} (${(c.rate * 100).toFixed(1)}% pass)`);
  }
  push('');
}

// ── 8. Repos by Posture ──

push('## 8. Repos by Posture');
push('');

const reposByPosture = db.prepare(`
  WITH latest AS (
    SELECT ar.repo_id, ar.overall_posture, ar.overall_status, ar.summary,
           am.pass_rate, am.high_count, am.medium_count, am.low_count,
           -- PH-AHG-001: match the queries.ts "latest run" contract
           -- (started_at DESC, id DESC); completed_at is nullable.
           ROW_NUMBER() OVER (PARTITION BY ar.repo_id ORDER BY ar.started_at DESC, ar.id DESC) AS rn
    FROM audit_runs ar
    LEFT JOIN audit_metrics am ON am.audit_run_id = ar.id
  )
  SELECT r.slug, l.overall_posture, l.overall_status, l.pass_rate,
         COALESCE(l.high_count, 0) AS high_count,
         COALESCE(l.medium_count, 0) AS medium_count,
         COALESCE(l.low_count, 0) AS low_count
  FROM repos r
  LEFT JOIN latest l ON l.repo_id = r.id AND l.rn = 1
  ORDER BY
    CASE l.overall_posture
      WHEN 'critical' THEN 0
      WHEN 'needs_attention' THEN 1
      WHEN 'healthy' THEN 2
      ELSE 3
    END,
    r.slug COLLATE NOCASE
`).all();

for (const posture of ['critical', 'needs_attention', 'healthy']) {
  const group = reposByPosture.filter(r => r.overall_posture === posture);
  if (group.length === 0) continue;

  push(`### ${posture} (${group.length} repos)`);
  push('');
  push('| Slug | Pass Rate | High | Medium | Low |');
  push('|------|-----------|------|--------|-----|');
  for (const r of group) {
    // cds-A-005: tagged formatter — a leading `~` marks a value the
    // <= 1 fraction heuristic interpreted, so 1% (stored as 1) is not
    // silently rendered as a bare "100.0%".
    const pr = formatPassRate(r.pass_rate);
    push(`| ${r.slug} | ${pr} | ${r.high_count} | ${r.medium_count} | ${r.low_count} |`);
  }
  push('');
}

const unaudited = reposByPosture.filter(r => r.overall_posture == null);
if (unaudited.length > 0) {
  push(`### unaudited (${unaudited.length} repos)`);
  push('');
  for (const r of unaudited) push(`- ${r.slug}`);
  push('');
}

// ── 9. Knowledge Layer Summary ──

push('## 9. Knowledge Layer Summary');
push('');

const totalNotes = db.prepare('SELECT COUNT(*) AS c FROM repo_notes').get().c;
const totalRels = db.prepare('SELECT COUNT(*) AS c FROM repo_relationships').get().c;
const totalReleases = db.prepare('SELECT COUNT(*) AS c FROM repo_releases').get().c;
const totalFacts = db.prepare('SELECT COUNT(*) AS c FROM repo_facts').get().c;
const totalDocs = db.prepare('SELECT COUNT(*) AS c FROM repo_docs').get().c;

push(`- **Notes:** ${totalNotes} across ${withThesis + withArch} repos with thesis/arch coverage`);
push(`- **Relationships:** ${totalRels} mapped`);
push(`- **Releases:** ${totalReleases} tracked across ${withReleases} repos`);
push(`- **Facts:** ${totalFacts}`);
push(`- **Docs indexed:** ${totalDocs}`);
push('');

// Repos with most notes
const topNoted = db.prepare(`
  SELECT r.slug, COUNT(*) AS c
  FROM repo_notes rn
  JOIN repos r ON r.id = rn.repo_id
  GROUP BY rn.repo_id
  ORDER BY c DESC
  LIMIT 10
`).all();

push('**Most annotated repos:**');
push('');
for (const r of topNoted) push(`- ${r.slug}: ${r.c} notes`);
push('');

// ── 10. Recommendations ──

push('## 10. Recommendations');
push('');

// Auto-generate recommendations from data
const recommendations = [];

if (unauditedRepos > 0) {
  recommendations.push(`**Audit remaining ${unauditedRepos} repos.** ${pct(unauditedRepos, totalRepos)} of the portfolio has no audit data.`);
}

if ((postureMap['critical'] || 0) > 0) {
  recommendations.push(`**Remediate ${postureMap['critical']} critical-posture repos immediately.** These represent the highest risk.`);
}

if ((postureMap['needs_attention'] || 0) > 0) {
  recommendations.push(`**Address ${postureMap['needs_attention']} needs-attention repos.** Prioritize by finding severity.`);
}

if (sorted.length > 0) {
  const worstControls = sorted.slice(0, 5).map(c => c.id).join(', ');
  recommendations.push(`**Improve lowest-performing controls:** ${worstControls}. These have the lowest pass rates across the portfolio.`);
}

if (patterns.length > 0) {
  const topPattern = patterns[0];
  recommendations.push(`**Address recurring pattern "${topPattern.title}"** which affects ${topPattern.affected_repos} repos.`);
}

const noThesis = totalRepos - withThesis;
const noArch = totalRepos - withArch;
if (noThesis > 0 || noArch > 0) {
  recommendations.push(`**Enrich knowledge layer:** ${noThesis} repos lack a thesis note, ${noArch} lack architecture notes.`);
}

if (recommendations.length === 0) {
  push('Portfolio is in good shape. Continue regular audit cycles.');
} else {
  for (let i = 0; i < recommendations.length; i++) {
    push(`${i + 1}. ${recommendations[i]}`);
  }
}
push('');

writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log(`Wrote ${outPath} (${lines.length} lines)`);
db.close();
