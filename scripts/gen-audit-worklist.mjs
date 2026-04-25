#!/usr/bin/env node
/**
 * gen-audit-worklist.mjs
 * Generates AUDIT-WORKLIST.md — a claimable checklist of all repos
 * sorted by audit urgency (unaudited first, then oldest audit).
 */
import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'knowledge.db');
const outPath = join(__dirname, '..', 'AUDIT-WORKLIST.md');

const db = new Database(dbPath, { readonly: true });

// All repos with their latest audit info (if any)
const rows = db.prepare(`
  SELECT
    r.slug,
    lr.completed_at,
    lr.overall_posture
  FROM repos r
  LEFT JOIN (
    SELECT ar.*,
           ROW_NUMBER() OVER (PARTITION BY ar.repo_id ORDER BY ar.completed_at DESC) AS rn
    FROM audit_runs ar
  ) lr ON lr.repo_id = r.id AND lr.rn = 1
  ORDER BY
    CASE WHEN lr.completed_at IS NULL THEN 0 ELSE 1 END,
    lr.completed_at ASC,
    r.slug COLLATE NOCASE
`).all();

const total = rows.length;

const tableRows = rows.map(r => {
  const lastAudited = r.completed_at ? r.completed_at.slice(0, 10) : 'never';
  const posture = r.overall_posture || 'unaudited';
  return `| [ ] | ${r.slug} | ${lastAudited} | ${posture} |`;
}).join('\n');

const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

const md = `# Audit Worklist

**Generated:** ${now}

${total} repos. Multiple Claudes working in parallel. Claim rules below.

## How to claim
1. Find a line with \`[ ]\`
2. Change it to \`[~] claimed by <your-name> <timestamp>\`
3. Save immediately
4. If a line already has \`[~]\` or \`[x]\`, skip it — someone else has it

## How to complete
Change \`[~]\` to \`[x] done by <your-name> <timestamp> | posture: <result>\`

---

| Status | Slug | Last Audited | Posture |
|--------|------|-------------|---------|
${tableRows}
`;

writeFileSync(outPath, md, 'utf-8');
console.log(`Wrote ${outPath} (${total} repos)`);
db.close();
