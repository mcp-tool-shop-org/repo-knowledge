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
import { upsertFact, getRepoIdBySlug, getDb } from '../db/init.js';
import { syncSwarmControlPlane, type SwarmSyncResult } from './swarm.js';

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
  swarm?: SwarmSyncResult;
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

/**
 * Compute freshness in days from an ISO timestamp.
 *
 * F-DB-016: validate the input — if Date.parse returns NaN (empty string,
 * malformed input, or any value the runtime can't parse), return null so
 * the caller can record the surface as "unknown" rather than the silent
 * sentinel value 'NaN' (which downstream string-vs-number comparisons can
 * mistake for a real measurement, especially when sort-by-freshness lands
 * NaN-stringified rows at unpredictable positions).
 */
function computeFreshnessDays(finishedAt: string): number | null {
  const ts = Date.parse(finishedAt);
  if (!Number.isFinite(ts)) return null;
  return Math.floor((Date.now() - ts) / 86400000);
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
    // sync-A-002: a bare JSON.parse on a missing/truncated index file
    // surfaces a terse ENOENT or "Unexpected end of JSON input" with no
    // path context. Wrap read+parse so the operator gets a structured,
    // actionable message (mirrors the guard already present at
    // github.ts:122 and publish.ts:120).
    let raw: string;
    try {
      raw = readFileSync(indexPath, 'utf-8');
    } catch (e: unknown) {
      throw new Error(
        `dogfood index at ${indexPath} is missing or unreadable: ${(e as Error).message}`,
        { cause: e },
      );
    }
    try {
      return JSON.parse(raw) as DogfoodIndex;
    } catch (e: unknown) {
      throw new Error(
        `dogfood index at ${indexPath} is malformed: ${(e as Error).message}`,
        { cause: e },
      );
    }
  }
  return fetchJson(options.indexUrl ?? DEFAULT_INDEX_URL);
}

async function loadEnforcement(
  repo: string,
  options: DogfoodSyncOptions,
): Promise<string> {
  // SYNC-PH-06: derive the policy filename from the slug's last path
  // segment. A malformed key (empty string, trailing slash → '', or
  // whitespace) would yield a bad policy path, so we
  // guard the non-null assertion explicitly: on an empty derived name we
  // skip the enforcement lookup and default to 'required' (the same value
  // a missing policy file resolves to), logging the malformed key to stderr.
  const repoName = repo.split('/').pop()?.trim() ?? '';
  if (!repoName) {
    console.error(
      `[dogfood-sync] malformed repo key "${repo}" — cannot derive a policy filename; defaulting enforcement to 'required'`,
    );
    return 'required';
  }
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

  // Load enforcement for every repo up-front (it can hit the network on
  // the remote path). The per-repo transaction below does pure SQLite
  // writes so we don't hold a write lock while awaiting fetches.
  const enforcementByRepo = new Map<string, string>();
  for (const repo of Object.keys(index)) {
    if (!getRepoIdBySlug(repo)) continue;
    enforcementByRepo.set(repo, await loadEnforcement(repo, options));
  }

  const db = getDb();
  for (const [repo, surfaces] of Object.entries(index)) {
    // sync-A-003: a drifted index value that is null or not a plain
    // object (e.g. a string, number, or array from a corrupt export)
    // would throw mid-walk at Object.entries(surfaces) below — or, for
    // an array, iterate numeric keys and corrupt the surface rollup.
    // Validate the top-level shape and skip-with-warning instead
    // (mirrors the per-repo shape guards at publish.ts:128/138).
    if (surfaces === null || typeof surfaces !== 'object' || Array.isArray(surfaces)) {
      skipped.push(`${repo} — malformed surfaces value in dogfood index (expected object, got ${Array.isArray(surfaces) ? 'array' : surfaces === null ? 'null' : typeof surfaces})`);
      console.error(
        `[dogfood-sync] ${repo}: malformed surfaces value in dogfood index — skipping`,
      );
      continue;
    }

    const repoId = getRepoIdBySlug(repo);
    if (!repoId) {
      // Stage C humanization: nudge users toward the most likely fix
      // when their dogfood index references a repo we don't know about
      // (usually: `rk sync` wasn't run, or the slug got renamed).
      skipped.push(`${repo} — not in repo-knowledge DB (run \`rk sync\` to ingest)`);
      continue;
    }

    repoCount++;
    const enforcement = enforcementByRepo.get(repo) ?? 'required';

    // SYNC-PH-01: the per-surface ENTRY is not validated upstream — a
    // drifted export can carry a surface whose `verified` / `run_id` /
    // `finished_at` is undefined (or the value isn't a plain object at
    // all). upsertFact binds those directly into a prepared statement, and
    // better-sqlite3 throws "SQLite3 can't bind undefined" — which, without
    // a guard, would abort the ENTIRE sync-dogfood at the first bad surface.
    // We validate each entry, skip-with-note the malformed ones, and ALSO
    // wrap the per-repo tx() in try/catch so a repo that still throws is
    // recorded in `skipped` and the walk continues to the next repo.
    //
    // We count facts into a per-repo local and only fold it into the running
    // total AFTER tx() commits, so a rolled-back transaction never inflates
    // facts_upserted.
    let repoFacts = 0;
    const tx = db.transaction(() => {
      repoFacts = 0;
      const surfaceNames: string[] = [];
      let worstStatus = 'pass';

      for (const [surface, entry] of Object.entries(surfaces)) {
        // SYNC-PH-01: validate the surface entry shape. The static type says
        // IndexEntry, but the JSON came from disk/network and can drift — a
        // non-object entry, or one missing the required string fields, is
        // skipped-with-note rather than allowed to throw at the bind below.
        // We widen to unknown so the runtime checks are honest about that.
        const e = entry as unknown;
        if (
          e === null || typeof e !== 'object' || Array.isArray(e) ||
          typeof (e as Record<string, unknown>).verified !== 'string' ||
          typeof (e as Record<string, unknown>).run_id !== 'string' ||
          typeof (e as Record<string, unknown>).finished_at !== 'string'
        ) {
          skipped.push(`${repo} surface ${surface} — malformed entry (missing verified/run_id/finished_at string)`);
          console.error(
            `[dogfood-sync] ${repo} surface ${surface}: malformed entry — skipping (expected verified/run_id/finished_at strings)`,
          );
          continue;
        }

        surfaceNames.push(surface);
        const freshness = computeFreshnessDays(entry.finished_at);

        // F-DB-016: store 'unknown' literal when freshness couldn't be
        // computed (bad finished_at). A 'NaN' string would compare oddly
        // against real numeric values in downstream sorts.
        const freshnessValue = freshness === null ? 'unknown' : String(freshness);
        if (freshness === null) {
          console.error(
            `[dogfood-sync] ${repo} surface ${surface}: bad finished_at "${entry.finished_at}" — storing freshness=unknown`,
          );
        }

        upsertFact(repoId, 'dogfood', `surface:${surface}:verified`, entry.verified, 'detected', SOURCE_PATH);
        upsertFact(repoId, 'dogfood', `surface:${surface}:enforcement`, enforcement, 'detected', SOURCE_PATH);
        upsertFact(repoId, 'dogfood', `surface:${surface}:freshness_days`, freshnessValue, 'detected', SOURCE_PATH);
        upsertFact(repoId, 'dogfood', `surface:${surface}:run_id`, entry.run_id, 'detected', SOURCE_PATH);
        upsertFact(repoId, 'dogfood', `surface:${surface}:finished_at`, entry.finished_at, 'detected', SOURCE_PATH);
        repoFacts += 5;

        // F-DB-016: a bad-timestamp surface downgrades to 'unknown'
        // rather than silently passing — masking missing freshness as
        // a pass is the silent-wrong shape we are preventing.
        if (entry.verified !== 'pass') {
          worstStatus = 'fail';
        } else if (freshness === null && worstStatus === 'pass') {
          worstStatus = 'unknown';
        } else if (freshness !== null && freshness > DEFAULT_MAX_AGE && worstStatus === 'pass') {
          worstStatus = 'stale';
        }
      }

      // Rollup facts
      upsertFact(repoId, 'dogfood', 'status', worstStatus, 'detected', SOURCE_PATH);
      upsertFact(repoId, 'dogfood', 'surfaces', surfaceNames.join(','), 'detected', SOURCE_PATH);
      repoFacts += 2;
    });
    try {
      tx();
      factsUpserted += repoFacts;
    } catch (e: unknown) {
      // SYNC-PH-01: one bad repo must not abort the whole sync. Record it
      // and continue — the transaction already rolled back, so no partial
      // facts linger and the counter (folded in only on success) is exact.
      skipped.push(`${repo} — sync failed: ${(e as Error).message}`);
      console.error(`[dogfood-sync] ${repo}: sync failed, skipping repo — ${(e as Error).message}`);
    }
  }

  // --- Intelligence layer sync ---
  let intelligence: IntelligenceSyncResult | undefined;
  try {
    intelligence = await syncIntelligence(options);
  } catch (e: unknown) {
    // F-DB-009: intelligence sync is optional, but a silent catch hides
    // genuine failures from the operator. Surface the cause to stderr
    // so a fresh install with a broken intelligence-export file shows
    // up instead of looking like a success.
    console.error('Intelligence sync skipped:', (e as Error).message);
  }

  // --- Swarm control-plane sync ---
  // Raw swarm audit findings from swarms/control-plane.db. Local-only:
  // the control plane never leaves the dogfood-labs checkout.
  let swarm: SwarmSyncResult | undefined;
  if (options.localPath) {
    try {
      swarm = syncSwarmControlPlane(options.localPath) ?? undefined;
    } catch (e: unknown) {
      console.error('Swarm control-plane sync skipped:', (e as Error).message);
    }
  }

  return { repos: repoCount, facts_upserted: factsUpserted, skipped, intelligence, swarm };
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
    //
    // F-DB-006: use execFileSync, not execSync — the cli path is derived
    // from a known candidate list (not user-controlled), but we still
    // want zero shell interpolation in case a future caller pipes a
    // user-supplied path through here.
    //
    // F-DB-005: when the LEGACY tools/findings/cli.js fallback fires we
    // warn to stderr — the migration window from dogfood-labs to
    // testing-os is now load-bearing, and silent fallback masks the
    // need for callers to update their checkouts.
    const { execFileSync } = await import('child_process');
    const candidates: { cliPath: string; isLegacy: boolean }[] = [
      { cliPath: 'packages/findings/cli.js', isLegacy: false }, // dogfood-lab/testing-os
      { cliPath: 'tools/findings/cli.js', isLegacy: true },     // mcp-tool-shop-org/dogfood-labs (legacy)
    ];
    for (const { cliPath, isLegacy } of candidates) {
      if (!existsSync(join(options.localPath, cliPath))) continue;
      if (isLegacy) {
        console.error(
          `[dogfood-sync] legacy dogfood-labs layout detected at ${cliPath} — ` +
          `please migrate to dogfood-lab/testing-os (packages/findings/)`,
        );
      }
      try {
        const output = execFileSync('node', [cliPath, 'sync-export', '--json'], {
          cwd: options.localPath,
          encoding: 'utf-8',
          timeout: 30000,
          // Capture the child's stderr instead of inheriting it — a crashing
          // exporter would otherwise dump its full stack trace into our
          // output before we get to print the one-line skip message.
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        return JSON.parse(output);
      } catch (e: unknown) {
        // F-DB-005: surface the cause instead of returning null silently.
        // Most operator errors here are "CLI script not executable",
        // "intelligence DB not yet built", or "JSON parse failure" — all
        // of which read better with a hint than a 0-finding result.
        // First line only: execFileSync appends the child's whole stderr
        // to the message, and the stack trace adds nothing here.
        const cause = (e as Error).message.split('\n')[0];
        console.error(
          `[dogfood-sync] sync-export skipped (${cliPath}): ${cause}`,
        );
        const stderr = (e as { stderr?: string }).stderr ?? '';
        if (stderr.includes('ERR_MODULE_NOT_FOUND')) {
          console.error(
            `[dogfood-sync] hint: exporter dependencies missing — run \`npm ci\` in ${join(options.localPath, cliPath, '..')}`,
          );
        }
        // Try the next layout candidate rather than giving up — the legacy
        // layout may still work when the testing-os one is broken.
        continue;
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

  // Sync patterns — these are portfolio-level facts. F-DB-008: index
  // each pattern on EVERY repo that contributes a source finding, not
  // just the first one. Patterns are cross-repo by definition; pinning
  // them to a single repo makes `rk show <slug>` blind to portfolio
  // findings that materially affect that repo. Use a per-pattern
  // seenRepos guard so the SAME repo doesn't get redundant upserts
  // when multiple findings on it feed into the pattern.
  for (const p of exp.patterns) {
    const surfaces = p.dimensions?.product_surfaces || [];
    const surfaceKey = surfaces.join(',') || 'general';
    const seenRepos = new Set<number>();
    for (const f of exp.findings) {
      if (!p.source_finding_ids.includes(f.finding_id)) continue;
      const repoId = getRepoIdBySlug(f.repo);
      if (!repoId) continue;
      if (seenRepos.has(repoId as number)) continue;
      seenRepos.add(repoId as number);
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
    }
  }

  // Sync recommendations — F-DB-008: index each recommendation on every
  // contributing repo whose surface matches, with seenRepos dedup.
  for (const r of exp.recommendations) {
    const surfaces = r.applies_to?.product_surfaces || [];
    const seenRepos = new Set<number>();
    for (const f of exp.findings) {
      if (!surfaces.includes(f.product_surface)) continue;
      const repoId = getRepoIdBySlug(f.repo);
      if (!repoId) continue;
      if (seenRepos.has(repoId as number)) continue;
      seenRepos.add(repoId as number);
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
    }
  }

  // Sync doctrine — F-DB-008: doctrine is org-wide, index it on every
  // repo represented in the findings list so `rk show <slug>` surfaces
  // applicable org-wide rules. seenRepos dedup keeps it idempotent.
  for (const d of exp.doctrine) {
    const seenRepos = new Set<number>();
    for (const f of exp.findings) {
      const repoId = getRepoIdBySlug(f.repo);
      if (!repoId) continue;
      if (seenRepos.has(repoId as number)) continue;
      seenRepos.add(repoId as number);
      upsertFact(repoId, 'dogfood.doctrine', d.doctrine_id, JSON.stringify({
        title: d.title,
        doctrine_kind: d.doctrine_kind,
        strength: d.strength,
        statement: d.statement,
        transfer_scope: d.transfer_scope,
        based_on: d.based_on_pattern_ids.join(','),
      }), 'detected', INTELLIGENCE_SOURCE);
      factsUpserted++;
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
