/**
 * Dogfood sync — one-way read from the testing-os evidence store into repo_facts.
 *
 * Reads the dogfood index (local file or GitHub raw URL) and policy files,
 * then upserts structured facts into the repo_facts table.
 *
 * testing-os remains sole write authority.
 * repo-knowledge is a read model only.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { upsertFact, getRepoIdBySlug } from '../db/init.js';

const DEFAULT_INDEX_URL =
  'https://raw.githubusercontent.com/dogfood-lab/testing-os/main/indexes/latest-by-repo.json';
const DEFAULT_POLICIES_URL_BASE =
  'https://raw.githubusercontent.com/dogfood-lab/testing-os/main/policies/repos/mcp-tool-shop-org';
const DEFAULT_MAX_AGE = 30;
const SOURCE_PATH = 'testing-os/indexes/latest-by-repo.json';
const INTELLIGENCE_SOURCE = 'testing-os/intelligence-export';

// --- Types ---

interface IndexEntry {
  run_id: string;
  verified: string;
  verification_status: string;
  finished_at: string;
  path: string;
}

type DogfoodIndex = Record<string, Record<string, IndexEntry>>;

export interface DogfoodSyncResult {
  repos: number;
  facts_upserted: number;
  skipped: string[];
  intelligence?: IntelligenceSyncResult;
}

export interface IntelligenceSyncResult {
  findings: number;
  patterns: number;
  recommendations: number;
  doctrine: number;
  facts_upserted: number;
}

// --- Intelligence layer types ---

interface IntelligenceExport {
  exported_at: string;
  source: string;
  counts: { findings: number; patterns: number; recommendations: number; doctrine: number };
  findings: IntelligenceFinding[];
  patterns: IntelligencePattern[];
  recommendations: IntelligenceRecommendation[];
  doctrine: IntelligenceDoctrine[];
}

interface IntelligenceFinding {
  finding_id: string;
  title: string;
  repo: string;
  product_surface: string;
  issue_kind: string;
  root_cause_kind: string;
  remediation_kind: string;
  transfer_scope: string;
  summary: string;
  doctrine_statement?: string;
}

interface IntelligencePattern {
  pattern_id: string;
  title: string;
  pattern_kind: string;
  pattern_strength: string;
  transfer_scope: string;
  summary: string;
  source_finding_ids: string[];
  dimensions: { product_surfaces?: string[]; issue_kinds?: string[] };
  support: { finding_count: number; repo_count: number; surface_count?: number };
}

interface IntelligenceRecommendation {
  recommendation_id: string;
  title: string;
  recommendation_kind: string;
  confidence: string;
  applies_to: { product_surfaces?: string[]; execution_modes?: string[] };
  action: { type: string; target?: string; details: string };
  based_on_pattern_ids: string[];
}

interface IntelligenceDoctrine {
  doctrine_id: string;
  title: string;
  doctrine_kind: string;
  strength: string;
  statement: string;
  rationale: string;
  transfer_scope: string;
  based_on_pattern_ids: string[];
}

// --- Policy parsing (regex, same as shipcheck/portfolio) ---

function parseEnforcementMode(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n');
  const match = normalized.match(/enforcement:\s*\n\s+mode:\s*(\S+)/);
  return match ? match[1] : 'required';
}

// --- Freshness ---

function computeFreshnessDays(finishedAt: string): number {
  return Math.floor((Date.now() - new Date(finishedAt).getTime()) / 86400000);
}

// --- Index loading ---

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

async function loadIndex(options: DogfoodSyncOptions): Promise<DogfoodIndex> {
  if (options.localPath) {
    const indexPath = join(options.localPath, 'indexes', 'latest-by-repo.json');
    return JSON.parse(readFileSync(indexPath, 'utf-8'));
  }
  return fetchJson(options.indexUrl ?? DEFAULT_INDEX_URL);
}

async function loadEnforcement(
  repo: string,
  options: DogfoodSyncOptions,
): Promise<string> {
  const repoName = repo.split('/').pop()!;
  if (options.localPath) {
    const policyPath = join(
      options.localPath,
      'policies',
      'repos',
      'mcp-tool-shop-org',
      `${repoName}.yaml`,
    );
    if (!existsSync(policyPath)) return 'required';
    return parseEnforcementMode(readFileSync(policyPath, 'utf-8'));
  }
  const url = `${options.policiesUrlBase ?? DEFAULT_POLICIES_URL_BASE}/${repoName}.yaml`;
  const text = await fetchText(url);
  if (!text) return 'required';
  return parseEnforcementMode(text);
}

// --- Main sync ---

export interface DogfoodSyncOptions {
  localPath?: string;
  indexUrl?: string;
  policiesUrlBase?: string;
}

export async function syncDogfood(
  options: DogfoodSyncOptions = {},
): Promise<DogfoodSyncResult> {
  const index = await loadIndex(options);
  const skipped: string[] = [];
  let factsUpserted = 0;
  let repoCount = 0;

  for (const [repo, surfaces] of Object.entries(index)) {
    const repoId = getRepoIdBySlug(repo);
    if (!repoId) {
      skipped.push(repo);
      continue;
    }

    repoCount++;
    const enforcement = await loadEnforcement(repo, options);
    const surfaceNames: string[] = [];
    let worstStatus = 'pass';

    for (const [surface, entry] of Object.entries(surfaces)) {
      surfaceNames.push(surface);
      const freshness = computeFreshnessDays(entry.finished_at);

      upsertFact(repoId, 'dogfood', `surface:${surface}:verified`, entry.verified, 'detected', SOURCE_PATH);
      upsertFact(repoId, 'dogfood', `surface:${surface}:enforcement`, enforcement, 'detected', SOURCE_PATH);
      upsertFact(repoId, 'dogfood', `surface:${surface}:freshness_days`, String(freshness), 'detected', SOURCE_PATH);
      upsertFact(repoId, 'dogfood', `surface:${surface}:run_id`, entry.run_id, 'detected', SOURCE_PATH);
      upsertFact(repoId, 'dogfood', `surface:${surface}:finished_at`, entry.finished_at, 'detected', SOURCE_PATH);
      factsUpserted += 5;

      if (entry.verified !== 'pass') worstStatus = 'fail';
      if (freshness > DEFAULT_MAX_AGE && worstStatus === 'pass') worstStatus = 'stale';
    }

    // Rollup facts
    upsertFact(repoId, 'dogfood', 'status', worstStatus, 'detected', SOURCE_PATH);
    upsertFact(repoId, 'dogfood', 'surfaces', surfaceNames.join(','), 'detected', SOURCE_PATH);
    factsUpserted += 2;
  }

  // --- Intelligence layer sync ---
  let intelligence: IntelligenceSyncResult | undefined;
  try {
    intelligence = await syncIntelligence(options);
  } catch {
    // Intelligence sync is optional — don't fail the whole sync if export is missing
  }

  return { repos: repoCount, facts_upserted: factsUpserted, skipped, intelligence };
}

// --- Intelligence layer sync ---

async function loadIntelligenceExport(options: DogfoodSyncOptions): Promise<IntelligenceExport | null> {
  if (options.localPath) {
    // Run sync-export locally via the CLI
    const exportPath = join(options.localPath, '.intelligence-export.json');
    // Try to read a pre-generated export file first
    if (existsSync(exportPath)) {
      return JSON.parse(readFileSync(exportPath, 'utf-8'));
    }
    // Fall back to running the export command. Try the testing-os layout
    // (packages/findings/) first; fall back to the legacy dogfood-labs layout
    // (tools/findings/) so users with `--local /path/to/dogfood-labs` scripts
    // keep working during the cutover window.
    const { execSync } = await import('child_process');
    const candidates = [
      'packages/findings/cli.js', // dogfood-lab/testing-os
      'tools/findings/cli.js',    // mcp-tool-shop-org/dogfood-labs (legacy)
    ];
    for (const cliPath of candidates) {
      if (!existsSync(join(options.localPath, cliPath))) continue;
      try {
        const output = execSync(`node ${cliPath} sync-export --json`, {
          cwd: options.localPath,
          encoding: 'utf-8',
          timeout: 30000,
        });
        return JSON.parse(output);
      } catch {
        return null;
      }
    }
    return null;
  }
  return null; // Remote intelligence export not yet supported
}

async function syncIntelligence(options: DogfoodSyncOptions): Promise<IntelligenceSyncResult> {
  const exp = await loadIntelligenceExport(options);
  if (!exp) return { findings: 0, patterns: 0, recommendations: 0, doctrine: 0, facts_upserted: 0 };

  let factsUpserted = 0;

  // Sync findings — keyed by repo so they land on the right repo_id
  for (const f of exp.findings) {
    const repoId = getRepoIdBySlug(f.repo);
    if (!repoId) continue;

    upsertFact(repoId, 'dogfood.finding', f.finding_id, JSON.stringify({
      title: f.title,
      issue_kind: f.issue_kind,
      root_cause_kind: f.root_cause_kind,
      remediation_kind: f.remediation_kind,
      transfer_scope: f.transfer_scope,
      summary: f.summary,
    }), 'detected', INTELLIGENCE_SOURCE);
    factsUpserted++;
  }

  // Sync patterns — these are portfolio-level, attach to first repo in support
  for (const p of exp.patterns) {
    const surfaces = p.dimensions?.product_surfaces || [];
    const surfaceKey = surfaces.join(',') || 'general';
    // Patterns are cross-repo, store on each relevant repo via findings
    // But also store as org-level facts on any repo that has the surface
    for (const f of exp.findings) {
      if (p.source_finding_ids.includes(f.finding_id)) {
        const repoId = getRepoIdBySlug(f.repo);
        if (!repoId) continue;
        upsertFact(repoId, 'dogfood.pattern', p.pattern_id, JSON.stringify({
          title: p.title,
          pattern_kind: p.pattern_kind,
          pattern_strength: p.pattern_strength,
          transfer_scope: p.transfer_scope,
          summary: p.summary,
          surfaces: surfaceKey,
          finding_count: p.support.finding_count,
          repo_count: p.support.repo_count,
        }), 'detected', INTELLIGENCE_SOURCE);
        factsUpserted++;
        break; // one repo is enough for pattern indexing
      }
    }
  }

  // Sync recommendations — attach to first repo whose surface matches
  for (const r of exp.recommendations) {
    const surfaces = r.applies_to?.product_surfaces || [];
    let stored = false;
    for (const f of exp.findings) {
      if (surfaces.includes(f.product_surface) && !stored) {
        const repoId = getRepoIdBySlug(f.repo);
        if (!repoId) continue;
        upsertFact(repoId, 'dogfood.recommendation', r.recommendation_id, JSON.stringify({
          title: r.title,
          recommendation_kind: r.recommendation_kind,
          confidence: r.confidence,
          surfaces: surfaces.join(','),
          action_type: r.action.type,
          action_details: r.action.details,
          based_on: r.based_on_pattern_ids.join(','),
        }), 'detected', INTELLIGENCE_SOURCE);
        factsUpserted++;
        stored = true;
      }
    }
  }

  // Sync doctrine — org-wide, attach to first available repo
  for (const d of exp.doctrine) {
    let stored = false;
    for (const f of exp.findings) {
      if (!stored) {
        const repoId = getRepoIdBySlug(f.repo);
        if (!repoId) continue;
        upsertFact(repoId, 'dogfood.doctrine', d.doctrine_id, JSON.stringify({
          title: d.title,
          doctrine_kind: d.doctrine_kind,
          strength: d.strength,
          statement: d.statement,
          transfer_scope: d.transfer_scope,
          based_on: d.based_on_pattern_ids.join(','),
        }), 'detected', INTELLIGENCE_SOURCE);
        factsUpserted++;
        stored = true;
      }
    }
  }

  return {
    findings: exp.findings.length,
    patterns: exp.patterns.length,
    recommendations: exp.recommendations.length,
    doctrine: exp.doctrine.length,
    facts_upserted: factsUpserted,
  };
}
