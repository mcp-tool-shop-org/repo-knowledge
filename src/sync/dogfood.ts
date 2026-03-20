/**
 * Dogfood sync — one-way read from dogfood-labs into repo_facts.
 *
 * Reads the dogfood index (local file or GitHub raw URL) and policy files,
 * then upserts structured facts into the repo_facts table.
 *
 * dogfood-labs remains sole write authority.
 * repo-knowledge is a read model only.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { upsertFact, getRepoIdBySlug } from '../db/init.js';

const DEFAULT_INDEX_URL =
  'https://raw.githubusercontent.com/mcp-tool-shop-org/dogfood-labs/main/indexes/latest-by-repo.json';
const DEFAULT_POLICIES_URL_BASE =
  'https://raw.githubusercontent.com/mcp-tool-shop-org/dogfood-labs/main/policies/repos/mcp-tool-shop-org';
const DEFAULT_MAX_AGE = 30;
const SOURCE_PATH = 'dogfood-labs/indexes/latest-by-repo.json';

// --- Types ---

interface IndexEntry {
  run_id: string;
  verified: string;
  verification_status: string;
  finished_at: string;
  path: string;
}

type DogfoodIndex = Record<string, Record<string, IndexEntry>>;

interface PolicyEnforcement {
  mode: string;
}

export interface DogfoodSyncResult {
  repos: number;
  facts_upserted: number;
  skipped: string[];
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

  return { repos: repoCount, facts_upserted: factsUpserted, skipped };
}
