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

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'knowledge.db');
const outPath = join(__dirname, '..', 'audit_report.md');

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
           ROW_NUMBER() OVER (PARTITION BY repo_id ORDER BY completed_at DESC) AS rn
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
for (const t of tableCounts) {
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
           ROW_NUMBER() OVER (PARTITION BY ar.repo_id ORDER BY ar.completed_at DESC) AS rn
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
    const pr = r.pass_rate != null
      ? (r.pass_rate <= 1 ? (r.pass_rate * 100).toFixed(1) : r.pass_rate.toFixed(1)) + '%'
      : '-';
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
