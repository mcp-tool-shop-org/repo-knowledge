#!/usr/bin/env node
/**
 * gen-enrichment-worklist.mjs
 * Generates ENRICHMENT-WORKLIST.md — a claimable checklist of repos
 * missing thesis, architecture notes, or relationships.
 */
import Database from 'better-sqlite3';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'data', 'knowledge.db');
const outPath = join(__dirname, '..', 'ENRICHMENT-WORKLIST.md');

const db = new Database(dbPath, { readonly: true });

// All repos with enrichment coverage indicators
const rows = db.prepare(`
  SELECT
    r.slug,
    r.id AS repo_id,
    (SELECT COUNT(*) FROM repo_notes rn WHERE rn.repo_id = r.id AND rn.note_type = 'thesis') AS has_thesis,
    (SELECT COUNT(*) FROM repo_notes rn WHERE rn.repo_id = r.id AND rn.note_type = 'architecture') AS has_arch,
    (SELECT COUNT(*) FROM repo_relationships rr WHERE rr.from_repo_id = r.id OR rr.to_repo_id = r.id) AS rel_count,
    (SELECT COUNT(*) FROM repo_releases rl WHERE rl.repo_id = r.id) AS release_count,
    (SELECT COUNT(*) FROM repo_notes rn WHERE rn.repo_id = r.id) AS note_count
  FROM repos r
  ORDER BY r.slug COLLATE NOCASE
`).all();

// Filter: only repos missing at least one of thesis, architecture, or relationships
const needing = rows.filter(r => r.has_thesis === 0 || r.has_arch === 0 || r.rel_count === 0);

// Sort: most gaps first
// no thesis > no arch > no rels > fewest notes
needing.sort((a, b) => {
  // Count missing items (0 = has it, 1 = missing)
  const missingA = (a.has_thesis === 0 ? 1 : 0) + (a.has_arch === 0 ? 1 : 0) + (a.rel_count === 0 ? 1 : 0);
  const missingB = (b.has_thesis === 0 ? 1 : 0) + (b.has_arch === 0 ? 1 : 0) + (b.rel_count === 0 ? 1 : 0);
  if (missingA !== missingB) return missingB - missingA; // more missing first
  if (a.has_thesis !== b.has_thesis) return a.has_thesis - b.has_thesis; // no thesis first
  if (a.has_arch !== b.has_arch) return a.has_arch - b.has_arch; // no arch first
  if (a.rel_count !== b.rel_count) return a.rel_count - b.rel_count; // fewer rels first
  if (a.note_count !== b.note_count) return a.note_count - b.note_count; // fewer notes first
  return a.slug.localeCompare(b.slug);
});

const count = needing.length;

const tableRows = needing.map(r => {
  const thesis = r.has_thesis > 0 ? 'yes' : 'no';
  const arch = r.has_arch > 0 ? 'yes' : 'no';
  return `| [ ] | ${r.slug} | ${thesis} | ${arch} | ${r.rel_count} | ${r.release_count} | ${r.note_count} |`;
}).join('\n');

const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

const md = `# Enrichment Worklist

**Generated:** ${now}

${count} repos need enrichment. Multiple Claudes working in parallel. Claim rules below.

## How to claim
1. Find a line with \`[ ]\`
2. Change it to \`[~] claimed by <your-name> <timestamp>\`
3. Save immediately
4. If a line already has \`[~]\` or \`[x]\`, skip it — someone else has it

## How to complete
Change \`[~]\` to \`[x] done by <your-name> <timestamp>\`

## What to populate per repo
- Thesis note (required)
- Architecture note (required)
- At least 1 relationship mapped (required where applicable)
- Releases synced (required where releases exist on GitHub)
- Additional notes: conventions, pain points, next steps, warnings (encouraged)

Use MCP tools: add_repo_note, add_relationship, get_repo

---

| Status | Slug | Thesis | Arch | Rels | Releases | Notes |
|--------|------|--------|------|------|----------|-------|
${tableRows}
`;

writeFileSync(outPath, md, 'utf-8');
console.log(`Wrote ${outPath} (${count} repos needing enrichment out of ${rows.length} total)`);
db.close();
