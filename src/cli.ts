#!/usr/bin/env node
/**
 * repo-knowledge CLI — rk
 *
 * Commands:
 *   init              Initialize rk.config.json + data directory + seed controls
 *   sync              Full sync (GitHub + local + FTS)
 *   scan <dir>        Scan a single local repo
 *   show <slug>       Show full repo knowledge (with audit posture)
 *   list              List all repos
 *   find <query>      Search across all indexed content
 *   related <slug>    Show related repos
 *   note <slug>       Add a note to a repo
 *   stats             Show database statistics
 *   reindex           Rebuild FTS index
 *
 * Audit commands:
 *   audit import <dir>       Import audit results from JSON contract files
 *   audit seed-controls      Seed canonical control catalog
 *   audit posture [slug]     Show audit posture (one repo or portfolio)
 *   audit findings           List open findings across portfolio
 *   audit controls           List canonical controls
 *   audit unaudited          List repos with no audit runs
 */
import { program } from 'commander';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openDb, getDb, closeDb, getRepo, findRepos, getRelated, getAllRepos, getStats, upsertNote, addRelationship } from './db/init.js';
import { fullSync } from './sync/index.js';
import { ingestLocalRepo } from './sync/local.js';
import { rebuildIndex, searchRepos } from './search/fts.js';
import { seedControls } from './audit/controls.js';
import { importAudit } from './audit/import.js';
import { getAuditPosture, getPortfolioPosture, findByAuditStatus, getOpenFindings } from './audit/queries.js';
import { resolveConfig } from './config.js';

import type Database from 'better-sqlite3';

type DatabaseType = Database.Database;

const config = resolveConfig();

program
  .name('rk')
  .description('Repo Knowledge System — know your repos')
  .version('0.1.0');

// ─── init ────────────────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize rk.config.json, data directory, DB, and seed controls')
  .action((): void => {
    const configPath = join(process.cwd(), 'rk.config.json');
    const dataDir = join(process.cwd(), 'data');

    // Create rk.config.json if it doesn't exist
    if (!existsSync(configPath)) {
      const example = {
        dbPath: 'data/knowledge.db',
        owners: ['your-github-org'],
        localDirs: ['.'],
        artifactsRoot: 'data/artifacts',
      };
      writeFileSync(configPath, JSON.stringify(example, null, 2) + '\n', 'utf-8');
      console.log(`Created ${configPath}`);
    } else {
      console.log(`Already exists: ${configPath}`);
    }

    // Create data/ directory
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`Created ${dataDir}/`);
    } else {
      console.log(`Already exists: ${dataDir}/`);
    }

    // Open DB (runs migrations)
    const freshConfig = resolveConfig();
    const db = openDb(freshConfig.dbPath);
    console.log(`Database ready: ${freshConfig.dbPath}`);

    // Seed controls
    const count = seedControls(db);
    console.log(`Seeded ${count} canonical controls`);

    closeDb();
    console.log('\nDone! Edit rk.config.json to set your GitHub owners and local dirs.');
  });

// ─── sync ────────────────────────────────────────────────────────────────────
program
  .command('sync')
  .description('Full sync: GitHub orgs + local repos + FTS index')
  .option('--owners <owners>', 'Comma-separated GitHub owners', '')
  .option('--local <dirs>', 'Comma-separated local directories', '.')
  .option('--releases', 'Also sync releases (slower)', false)
  .option('--forks', 'Include forked repos', false)
  .action(async (opts: { owners: string; local: string; releases: boolean; forks: boolean }): Promise<void> => {
    openDb(config.dbPath);
    await fullSync({
      owners: opts.owners ? opts.owners.split(',') : undefined,
      localDirs: opts.local ? opts.local.split(',') : undefined,
      includeReleases: opts.releases,
      includeForks: opts.forks,
    });
    closeDb();
  });

// ─── scan ────────────────────────────────────────────────────────────────────
program
  .command('scan <path>')
  .description('Scan a single local repo directory')
  .action((path: string): void => {
    openDb(config.dbPath);
    const result = ingestLocalRepo(path);
    console.log(`Scanned: ${result.name} (${result.docs} docs indexed)`);
    rebuildIndex();
    closeDb();
  });

// ─── show ────────────────────────────────────────────────────────────────────
program
  .command('show <slug>')
  .description('Show full repo knowledge (owner/name or partial name)')
  .action((slug: string): void => {
    openDb(config.dbPath);
    // Try exact match first, then partial
    let repo = getRepo(slug);
    if (!repo) {
      const all = getAllRepos();
      const match = all.find((r: Record<string, any>) => r.slug.includes(slug) || r.slug.endsWith('/' + slug));
      if (match) repo = getRepo(match.slug);
    }

    if (!repo) {
      console.error(`Repo not found: ${slug}`);
      closeDb();
      process.exit(1);
    }

    console.log('\n' + formatRepo(repo));
    closeDb();
  });

// ─── list ────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all repos')
  .option('--status <status>', 'Filter by status')
  .option('--category <category>', 'Filter by category')
  .option('--language <lang>', 'Filter by primary language')
  .option('--framework <fw>', 'Filter by framework')
  .option('--shape <shape>', 'Filter by app shape')
  .option('--owner <owner>', 'Filter by owner')
  .action((opts: Record<string, string>): void => {
    openDb(config.dbPath);
    const filters: Record<string, string> = { ...opts };
    if (filters.shape) { filters.app_shape = filters.shape; delete filters.shape; }
    const repos = findRepos(filters);

    if (!repos.length) {
      console.log('No repos found matching filters.');
      closeDb();
      return;
    }

    console.log(`\n${repos.length} repos:\n`);
    for (const r of repos) {
      const lang = r.primary_language ? ` [${r.primary_language}]` : '';
      const shape = r.app_shape ? ` (${r.app_shape})` : '';
      const status = r.status !== 'unknown' ? ` {${r.status}}` : '';
      console.log(`  ${r.slug}${lang}${shape}${status}`);
      if (r.description) console.log(`    ${r.description}`);
    }
    closeDb();
  });

// ─── find ────────────────────────────────────────────────────────────────────
program
  .command('find <query...>')
  .description('Search across all indexed content')
  .option('-n, --limit <n>', 'Max results', '10')
  .action((queryParts: string[], opts: { limit: string }): void => {
    openDb(config.dbPath);
    const query = queryParts.join(' ');
    const results = searchRepos(query, { limit: parseInt(opts.limit) });

    if (!results.length) {
      console.log(`No results for: ${query}`);
      closeDb();
      return;
    }

    console.log(`\nResults for "${query}":\n`);
    for (const r of results) {
      console.log(`  ${r.slug} (${r.matches.length} matches)`);
      for (const m of r.matches.slice(0, 3)) {
        const snippet = m.snippet?.replace(/\n/g, ' ').slice(0, 120) || '';
        console.log(`    [${m.source_type}] ${m.title}: ${snippet}`);
      }
    }
    closeDb();
  });

// ─── related ─────────────────────────────────────────────────────────────────
program
  .command('related <slug>')
  .description('Show repos related to a given repo')
  .action((slug: string): void => {
    openDb(config.dbPath);
    const repoId = resolveRepoId(slug);
    if (!repoId) {
      console.error(`Repo not found: ${slug}`);
      closeDb();
      process.exit(1);
    }

    const related = getRelated(repoId);
    if (!related.length) {
      console.log(`No relationships recorded for: ${slug}`);
      closeDb();
      return;
    }

    console.log(`\nRelationships for ${slug}:\n`);
    for (const r of related) {
      console.log(`  ${r.relation_type} → ${r.slug}`);
      if (r.description) console.log(`    ${r.description}`);
      if (r.note) console.log(`    Note: ${r.note}`);
    }
    closeDb();
  });

// ─── note ────────────────────────────────────────────────────────────────────
program
  .command('note <slug>')
  .description('Add a note to a repo')
  .requiredOption('-t, --type <type>', 'Note type: thesis|architecture|warning|next_step|drift_risk|release_summary|convention|pain_point|command|general')
  .requiredOption('-c, --content <content>', 'Note content')
  .option('--title <title>', 'Optional note title')
  .action((slug: string, opts: { type: string; content: string; title?: string }): void => {
    openDb(config.dbPath);
    const repoId = resolveRepoId(slug);
    if (!repoId) {
      console.error(`Repo not found: ${slug}`);
      closeDb();
      process.exit(1);
    }

    upsertNote(repoId, opts.type, opts.title || opts.type, opts.content);
    console.log(`Note added to ${slug}`);
    rebuildIndex();
    closeDb();
  });

// ─── relate ──────────────────────────────────────────────────────────────────
program
  .command('relate <from> <type> <to>')
  .description('Add a relationship between repos')
  .option('--note <note>', 'Optional relationship note')
  .action((from: string, type: string, to: string, opts: { note?: string }): void => {
    openDb(config.dbPath);
    const fromId = resolveRepoId(from);
    const toId = resolveRepoId(to);
    if (!fromId) { console.error(`Repo not found: ${from}`); closeDb(); process.exit(1); }
    if (!toId) { console.error(`Repo not found: ${to}`); closeDb(); process.exit(1); }

    addRelationship(fromId, type, toId, opts.note);
    console.log(`Relationship added: ${from} ${type} ${to}`);
    closeDb();
  });

// ─── stats ───────────────────────────────────────────────────────────────────
program
  .command('stats')
  .description('Show database statistics')
  .action((): void => {
    openDb(config.dbPath);
    const stats = getStats();
    console.log('\nRepo Knowledge Stats:');
    console.log(`  Repos:         ${stats.repos}`);
    console.log(`  Notes:         ${stats.notes}`);
    console.log(`  Documents:     ${stats.docs}`);
    console.log(`  Facts:         ${stats.facts}`);
    console.log(`  Releases:      ${stats.releases}`);
    console.log(`  Relationships: ${stats.relationships}`);
    if (stats.audit_runs !== undefined) {
      console.log(`\nAudit Stats:`);
      console.log(`  Controls:      ${stats.audit_controls}`);
      console.log(`  Audit runs:    ${stats.audit_runs}`);
      console.log(`  Findings:      ${stats.audit_findings}`);
      console.log(`  Repos audited: ${stats.audited_repos} / ${stats.repos}`);
    }
    closeDb();
  });

// ─── reindex ─────────────────────────────────────────────────────────────────
program
  .command('reindex')
  .description('Rebuild the full-text search index')
  .action((): void => {
    openDb(config.dbPath);
    const count = rebuildIndex();
    console.log(`Indexed ${count} entries`);
    closeDb();
  });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveRepoId(slug: string): number | null {
  const db = getDb();
  // Try exact slug
  let row = db.prepare('SELECT id FROM repos WHERE slug = ?').get(slug) as { id: number } | undefined;
  if (row) return row.id;

  // Try partial match
  row = db.prepare('SELECT id FROM repos WHERE slug LIKE ? OR name = ?').get(`%${slug}%`, slug) as { id: number } | undefined;
  return row?.id || null;
}

function formatRepo(repo: Record<string, any>): string {
  const lines: string[] = [];
  lines.push(`═══ ${repo.slug} ═══`);
  lines.push(`URL:      ${repo.github_url || 'n/a'}`);
  lines.push(`Local:    ${repo.local_path || 'not found locally'}`);
  lines.push(`Status:   ${repo.status}  |  Stage: ${repo.stage || 'n/a'}  |  Category: ${repo.category || 'n/a'}`);
  lines.push(`Stars:    ${repo.stars}  |  Forks: ${repo.forks}  |  Issues: ${repo.open_issues}`);
  if (repo.description) lines.push(`Desc:     ${repo.description}`);
  if (repo.purpose) lines.push(`Purpose:  ${repo.purpose}`);
  if (repo.license) lines.push(`License:  ${repo.license}`);

  if (repo.tech) {
    lines.push('\n─── Tech ───');
    lines.push(`Language: ${repo.tech.primary_language || 'n/a'}`);
    if (repo.tech.frameworks) {
      const fws: string[] = typeof repo.tech.frameworks === 'string'
        ? JSON.parse(repo.tech.frameworks) : repo.tech.frameworks;
      if (fws.length) lines.push(`Frames:   ${fws.join(', ')}`);
    }
    lines.push(`Shape:    ${repo.tech.app_shape || 'n/a'}  |  Deploy: ${repo.tech.deployment_shape || 'n/a'}`);
    lines.push(`Runtime:  ${repo.tech.runtime || 'n/a'}  |  PkgMgr: ${repo.tech.package_manager || 'n/a'}`);
    if (repo.tech.platform_targets) {
      const pts: string[] = typeof repo.tech.platform_targets === 'string'
        ? JSON.parse(repo.tech.platform_targets) : repo.tech.platform_targets;
      if (pts?.length) lines.push(`Targets:  ${pts.join(', ')}`);
    }
  }

  if (repo.topics?.length) {
    lines.push(`\n─── Topics ───`);
    lines.push(`  ${repo.topics.join(', ')}`);
  }

  if (repo.notes?.length) {
    lines.push(`\n─── Notes (${repo.notes.length}) ───`);
    for (const n of repo.notes) {
      lines.push(`  [${n.note_type}] ${n.title || ''}`);
      lines.push(`    ${n.content.slice(0, 200)}`);
    }
  }

  if (repo.releases?.length) {
    lines.push(`\n─── Releases (recent) ───`);
    for (const r of repo.releases) {
      lines.push(`  ${r.tag} — ${r.title || ''} (${r.published_at || 'n/a'})`);
    }
  }

  if (repo.relationships?.length) {
    lines.push(`\n─── Relationships ───`);
    for (const r of repo.relationships) {
      lines.push(`  ${r.relation_type} → ${r.target_slug}`);
      if (r.note) lines.push(`    ${r.note}`);
    }
  }

  if (repo.facts?.length) {
    lines.push(`\n─── Facts (${repo.facts.length}) ───`);
    const byType: Record<string, Array<{ key: string }>> = {};
    for (const f of repo.facts) {
      if (!byType[f.fact_type]) byType[f.fact_type] = [];
      byType[f.fact_type].push(f);
    }
    for (const [type, facts] of Object.entries(byType)) {
      lines.push(`  ${type}: ${facts.map(f => f.key).join(', ')}`);
    }
  }

  // Audit posture
  const posture = getAuditPosture(repo.id);
  if (posture) {
    lines.push(`\n─── Audit Posture ───`);
    lines.push(`  Last audited:  ${posture.last_audited} (${posture.scope_level})`);
    lines.push(`  Commit:        ${posture.commit_sha || 'n/a'}`);
    lines.push(`  Status:        ${posture.overall_status}  |  Posture: ${posture.overall_posture}`);
    lines.push(`  Blocking:      ${posture.blocking_release ? 'YES' : 'no'}`);
    lines.push(`  Pass rate:     ${posture.pass_rate != null ? (posture.pass_rate * 100).toFixed(0) + '%' : 'n/a'} (${posture.controls_passed}/${posture.controls_total})`);
    const openStr = Object.entries(posture.open_findings).map(([s, c]) => `${s}:${c}`).join(' ');
    if (openStr) lines.push(`  Open findings: ${openStr}`);
    if (posture.failed_domains.length) lines.push(`  Failed:        ${posture.failed_domains.join(', ')}`);
    if (posture.summary) lines.push(`  Summary:       ${posture.summary}`);
  } else {
    lines.push(`\n─── Audit Posture ───`);
    lines.push(`  Not yet audited`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT SUBCOMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

const audit = program.command('audit').description('Audit evidence system');

// ─── audit seed-controls ─────────────────────────────────────────────────────
audit
  .command('seed-controls')
  .description('Seed/update the canonical control catalog')
  .action((): void => {
    openDb(config.dbPath);
    const count = seedControls(getDb());
    console.log(`Seeded ${count} canonical controls`);
    closeDb();
  });

// ─── audit import ────────────────────────────────────────────────────────────
audit
  .command('import <dir>')
  .description('Import audit results from a directory with JSON contract files')
  .action((dir: string): void => {
    openDb(config.dbPath);
    try {
      const result = importAudit(dir);
      console.log(`Imported audit run #${result.runId}:`);
      console.log(`  Controls: ${result.controls}`);
      console.log(`  Findings: ${result.findings}`);
      console.log(`  Artifacts: ${result.artifacts}`);
    } catch (e: unknown) {
      console.error(`Import failed: ${(e as Error).message}`);
      process.exit(1);
    }
    closeDb();
  });

// ─── audit posture ───────────────────────────────────────────────────────────
audit
  .command('posture [slug]')
  .description('Show audit posture for one repo or the full portfolio')
  .action((slug?: string): void => {
    openDb(config.dbPath);
    if (slug) {
      const repoId = resolveRepoId(slug);
      if (!repoId) { console.error(`Repo not found: ${slug}`); closeDb(); process.exit(1); }
      const posture = getAuditPosture(repoId);
      if (!posture) { console.log(`${slug}: not yet audited`); closeDb(); return; }
      console.log(`\n${slug} — ${posture.overall_posture.toUpperCase()}`);
      console.log(`  Last audited: ${posture.last_audited}`);
      console.log(`  Status: ${posture.overall_status} | Pass rate: ${posture.pass_rate != null ? (posture.pass_rate * 100).toFixed(0) + '%' : 'n/a'}`);
      console.log(`  Blocking: ${posture.blocking_release ? 'YES' : 'no'}`);
      const openStr = Object.entries(posture.open_findings).map(([s, c]: [string, unknown]) => `${s}:${c}`).join(' ');
      if (openStr) console.log(`  Open findings: ${openStr}`);
      if (posture.failed_domains.length) console.log(`  Failed domains: ${posture.failed_domains.join(', ')}`);
      if (posture.summary) console.log(`  ${posture.summary}`);
    } else {
      const portfolio = getPortfolioPosture();
      const audited = portfolio.filter((r) => r.overall_posture);
      const unaudited = portfolio.filter((r) => !r.overall_posture);

      console.log(`\nPortfolio Posture (${audited.length} audited, ${unaudited.length} unaudited)\n`);

      if (audited.length) {
        const byPosture: Record<string, typeof audited> = {};
        for (const r of audited) {
          if (!byPosture[r.overall_posture!]) byPosture[r.overall_posture!] = [];
          byPosture[r.overall_posture!].push(r);
        }
        for (const [posture, repos] of Object.entries(byPosture)) {
          console.log(`  ${posture.toUpperCase()} (${repos.length}):`);
          for (const r of repos) {
            const crit = r.critical_count ? ` crit:${r.critical_count}` : '';
            const high = r.high_count ? ` high:${r.high_count}` : '';
            const rate = r.pass_rate != null ? ` ${(r.pass_rate * 100).toFixed(0)}%` : '';
            console.log(`    ${r.slug}${rate}${crit}${high}`);
          }
        }
      }
    }
    closeDb();
  });

// ─── audit findings ──────────────────────────────────────────────────────────
audit
  .command('findings')
  .description('List open findings across the portfolio')
  .option('-s, --severity <severity>', 'Filter by severity')
  .option('-d, --domain <domain>', 'Filter by domain')
  .option('-n, --limit <n>', 'Max results', '50')
  .action((opts: { severity?: string; domain?: string; limit: string }): void => {
    openDb(config.dbPath);
    const findings = getOpenFindings({
      severity: opts.severity,
      domain: opts.domain,
      limit: parseInt(opts.limit),
    });

    if (!findings.length) {
      console.log('No open findings matching filters.');
      closeDb();
      return;
    }

    console.log(`\n${findings.length} open findings:\n`);
    for (const f of findings) {
      const sev = (f.severity as string).toUpperCase().padEnd(8);
      console.log(`  [${sev}] ${f.slug}: ${f.title}`);
      if (f.remediation) console.log(`           Fix: ${(f.remediation as string).slice(0, 100)}`);
    }
    closeDb();
  });

// ─── audit controls ─────────────────────────────────────────────────────────
audit
  .command('controls')
  .description('List canonical controls')
  .option('-d, --domain <domain>', 'Filter by domain')
  .action((opts: { domain?: string }): void => {
    openDb(config.dbPath);
    const db = getDb();
    let controls: Array<Record<string, any>>;
    if (opts.domain) {
      controls = db.prepare('SELECT * FROM audit_controls WHERE domain = ? ORDER BY id').all(opts.domain) as Array<Record<string, any>>;
    } else {
      controls = db.prepare('SELECT * FROM audit_controls ORDER BY domain, id').all() as Array<Record<string, any>>;
    }

    if (!controls.length) {
      console.log('No controls found. Run: rk audit seed-controls');
      closeDb();
      return;
    }

    let lastDomain = '';
    for (const c of controls) {
      if (c.domain !== lastDomain) {
        console.log(`\n─── ${c.domain} ───`);
        lastDomain = c.domain;
      }
      const auto = c.automated ? ' [auto]' : '';
      console.log(`  ${c.id}  ${c.title} (${c.severity})${auto}`);
    }
    closeDb();
  });

// ─── audit unaudited ─────────────────────────────────────────────────────────
audit
  .command('unaudited')
  .description('List repos with no audit runs')
  .action((): void => {
    openDb(config.dbPath);
    const repos = findByAuditStatus({ unaudited: true });
    console.log(`\n${repos.length} unaudited repos:\n`);
    for (const r of repos) {
      const lang = r.primary_language ? ` [${r.primary_language}]` : '';
      const shape = r.app_shape ? ` (${r.app_shape})` : '';
      console.log(`  ${r.slug}${lang}${shape}`);
    }
    closeDb();
  });

// ─── audit failing ───────────────────────────────────────────────────────────
audit
  .command('failing <domain>')
  .description('List repos failing a specific audit domain')
  .action((domain: string): void => {
    openDb(config.dbPath);
    const repos = findByAuditStatus({ domain_failing: domain });
    if (!repos.length) {
      console.log(`No repos failing domain: ${domain}`);
      closeDb();
      return;
    }
    console.log(`\nRepos failing ${domain}:\n`);
    for (const r of repos) {
      console.log(`  ${r.slug}: ${r.control_id} ${r.title} — ${r.result}`);
      if (r.notes) console.log(`    ${r.notes}`);
    }
    closeDb();
  });

program.parse();
