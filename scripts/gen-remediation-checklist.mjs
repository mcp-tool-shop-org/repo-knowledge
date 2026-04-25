#!/usr/bin/env node
/**
 * gen-remediation-checklist.mjs
 * Queries the repo-knowledge DB and generates REMEDIATION-CHECKLIST.md
 */

import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'knowledge.db');
const OUT_PATH = join(__dirname, '..', 'REMEDIATION-CHECKLIST.md');

const db = new Database(DB_PATH, { readonly: true });

// ── 1. Get latest audit run per repo where posture = needs_attention ──

const latestRuns = db.prepare(`
  SELECT ar.*, r.slug, r.name AS repo_name, r.github_url, r.status AS repo_status
  FROM audit_runs ar
  JOIN repos r ON r.id = ar.repo_id
  WHERE ar.id = (
    SELECT ar2.id FROM audit_runs ar2
    WHERE ar2.repo_id = ar.repo_id
    ORDER BY ar2.completed_at DESC
    LIMIT 1
  )
  AND ar.overall_posture = 'needs_attention'
  ORDER BY r.slug
`).all();

console.log(`Found ${latestRuns.length} repos with posture = needs_attention`);

// ── 2. For each run, get metrics, failing controls, open findings ──

const getMetrics = db.prepare(`
  SELECT * FROM audit_metrics WHERE audit_run_id = ?
`);

const getFailingControls = db.prepare(`
  SELECT acr.*, ac.title AS control_title, ac.domain AS control_domain
  FROM audit_control_results acr
  LEFT JOIN audit_controls ac ON ac.id = acr.control_id
  WHERE acr.audit_run_id = ?
  AND acr.result IN ('fail', 'warn')
  ORDER BY acr.control_id
`);

const getOpenFindings = db.prepare(`
  SELECT * FROM audit_findings
  WHERE audit_run_id = ?
  AND status = 'open'
  ORDER BY
    CASE severity
      WHEN 'critical' THEN 0
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
      WHEN 'info' THEN 4
    END,
    title
`);

// ── Program definitions ──
const PROGRAMS = {
  'CI baseline rollout': ['CIC-001', 'CIC-002', 'CIC-003', 'CIC-004', 'CIC-005'],
  'Dependency hygiene': ['DEP-001', 'DEP-002', 'DEP-003', 'DEP-004', 'DEP-005', 'DEP-006'],
  'Supply-chain hardening': ['SUP-001', 'SUP-002', 'SUP-003', 'SUP-004'],
  'SAST rollout': ['SEC-001', 'SEC-002', 'SEC-003', 'SEC-004', 'SEC-005', 'SEC-006'],
  'Test floor enforcement': ['TST-001', 'TST-002', 'TST-003', 'TST-004', 'TST-005'],
};

// ── Build per-repo data ──
const repoData = [];
const programCounts = {};
for (const p of Object.keys(PROGRAMS)) programCounts[p] = 0;

for (const run of latestRuns) {
  const metrics = getMetrics.get(run.id);
  const failingControls = getFailingControls.all(run.id);
  const openFindings = getOpenFindings.all(run.id);

  const failingIds = new Set(failingControls.map(c => c.control_id));

  const programs = {};
  for (const [name, ids] of Object.entries(PROGRAMS)) {
    const matched = ids.some(id => failingIds.has(id));
    programs[name] = matched;
    if (matched) programCounts[name]++;
  }

  const highCount = openFindings.filter(f => f.severity === 'high').length;
  const medCount = openFindings.filter(f => f.severity === 'medium').length;
  const lowCount = openFindings.filter(f => f.severity === 'low').length;
  const critCount = openFindings.filter(f => f.severity === 'critical').length;
  const infoCount = openFindings.filter(f => f.severity === 'info').length;

  repoData.push({
    slug: run.slug,
    github_url: run.github_url,
    passRate: metrics?.pass_rate ?? 0,
    openFindings,
    findingCounts: { critical: critCount, high: highCount, medium: medCount, low: lowCount, info: infoCount },
    totalFindings: openFindings.length,
    failingControls,
    programs,
  });
}

// ── Generate markdown ──
const lines = [];
const push = (...args) => lines.push(...args);

const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

push('# Portfolio Remediation Checklist');
push('');
push(`**Generated:** ${now}  `);
push(`**Source:** repo-knowledge DB (\`data/knowledge.db\`)  `);
push(`**Scope:** all repos with posture = needs_attention  `);
push(`**Repos in scope:** ${repoData.length}`);
push('');
push('---');
push('');

// ── Program Summary ──
push('## Program Summary');
push('');
push('| # | Program | Repos affected |');
push('|---|---------|---------------|');
let i = 1;
for (const [name, count] of Object.entries(programCounts)) {
  push(`| ${i++} | ${name} | ${count} |`);
}
push('');

// Severity summary
const totalHigh = repoData.reduce((s, r) => s + r.findingCounts.high, 0);
const totalMed = repoData.reduce((s, r) => s + r.findingCounts.medium, 0);
const totalLow = repoData.reduce((s, r) => s + r.findingCounts.low, 0);
const totalCrit = repoData.reduce((s, r) => s + r.findingCounts.critical, 0);
const totalInfo = repoData.reduce((s, r) => s + r.findingCounts.info, 0);
const totalFindings = repoData.reduce((s, r) => s + r.totalFindings, 0);
const totalFailingControls = repoData.reduce((s, r) => s + r.failingControls.length, 0);

push(`**Total open findings across all repos:** ${totalFindings} (${totalCrit} critical, ${totalHigh} high, ${totalMed} medium, ${totalLow} low, ${totalInfo} info)  `);
push(`**Total failing/warning controls:** ${totalFailingControls}`);
push('');
push('---');
push('');

// ── Per-Repo Sections ──
for (const repo of repoData) {
  push(`### ${repo.slug}`);
  push('');
  push(`- **Posture:** needs_attention`);
  push(`- **Pass rate:** ${(repo.passRate ?? 0).toFixed(1)}%`);

  const fc = repo.findingCounts;
  const parts = [];
  if (fc.critical > 0) parts.push(`${fc.critical} critical`);
  if (fc.high > 0) parts.push(`${fc.high} high`);
  if (fc.medium > 0) parts.push(`${fc.medium} medium`);
  if (fc.low > 0) parts.push(`${fc.low} low`);
  if (fc.info > 0) parts.push(`${fc.info} info`);
  push(`- **Open findings:** ${repo.totalFindings}${parts.length ? ' (' + parts.join(', ') + ')' : ''}`);
  push('');

  // Programs needed
  push('**Programs needed:**');
  const programNames = Object.entries(repo.programs);
  const applicablePrograms = programNames.filter(([, v]) => v);
  if (applicablePrograms.length === 0) {
    push('- _None of the 5 standard programs triggered (other controls failing)_');
  } else {
    for (const [name, applicable] of programNames) {
      if (applicable) {
        push(`- [ ] ${name}`);
      }
    }
  }
  push('');

  // Failing controls
  push('**Failing controls:**');
  if (repo.failingControls.length === 0) {
    push('- _None_');
  } else {
    for (const ctrl of repo.failingControls) {
      const title = ctrl.control_title || ctrl.control_id;
      const notes = ctrl.notes ? ` (${ctrl.notes.slice(0, 120)})` : '';
      push(`- [ ] ${ctrl.control_id}: ${title} — ${ctrl.result}${notes}`);
    }
  }
  push('');

  // Open findings
  push('**Open findings:**');
  if (repo.openFindings.length === 0) {
    push('- _None_');
  } else {
    for (const f of repo.openFindings) {
      const rem = f.remediation ? ` — ${f.remediation.replace(/\n/g, ' ').slice(0, 200)}` : '';
      push(`- [ ] [${f.severity}] ${f.title}${rem}`);
    }
  }
  push('');

  // Fix sheet
  push('**Fix sheet:**');
  push('- [ ] Repo classified correctly');
  push('- [ ] Audit findings reviewed');
  push('- [ ] Open highs identified');
  push('- [ ] Program buckets assigned');
  push('- [ ] Fixes implemented');
  push('- [ ] Regression tests added for every fix');
  push('- [ ] CI updated');
  push('- [ ] Docs updated');
  push('- [ ] Audit rerun after fixes');
  push('- [ ] Findings closed or moved to accepted_risk');
  push('- [ ] Posture recomputed');
  push('');
  push('---');
  push('');
}

// ── Order of Operations ──
push('## Order of Operations');
push('');
push('1. Fix missing CI first (enforcement rail for everything else)');
push('2. Lock dependency hygiene');
push('3. Harden supply chain');
push('4. Roll out SAST');
push('5. Raise test floor + regression coverage');
push('6. Clean up inventory/license/security-doc gaps');
push('');

// ── Definition of Done ──
push('## Definition of Done');
push('');
push('A repo is not "fixed" because code changed. It is fixed when:');
push('');
push('- relevant findings are closed in the DB');
push('- failing controls now pass or are formally excepted');
push('- CI enforces the new baseline');
push('- tests protect the change');
push('- docs are updated where needed');
push('- posture improves honestly');
push('- no temporary patch leaves the same class of failure open');
push('');

// ── Success Criteria ──
push('## Success Criteria');
push('');
push('**CI baseline done when:** no active repo lacks CI, no active repo skips build/test in CI');
push('');
push('**Dependency hygiene done when:** no active repo lacks expected lockfiles, no unresolved high dependency findings remain without exception');
push('');
push('**Supply chain done when:** SBOM generation exists for active repos, Actions pinned, signing where applicable');
push('');
push('**SAST rollout done when:** all applicable active repos run SAST in CI, open high-severity code findings closed or excepted');
push('');
push('**Test floor done when:** no active core-code repo has zero tests, every audit-found bug fixed has a regression test');
push('');

writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
console.log(`Written ${lines.length} lines to ${OUT_PATH}`);

db.close();
