/**
 * Publish-state sync — pulls version registries from npm, PyPI, and
 * GitHub Releases, then upserts them into repo_published_versions.
 *
 * Every external call is network-graceful: on failure (missing CLI,
 * timeout, parse error, registry 4xx/5xx) the function returns an empty
 * array AND logs a clear stderr message. We never throw an error that
 * could crash the caller's sync loop — partial coverage beats a single
 * broken channel killing everything.
 */
import { execFileSync } from 'child_process';
import { upsertPublishedVersion } from '../db/init.js';

export interface PublishedVersionRecord {
  channel: string;
  version: string;
  published_at: string | null;
  source: string;
}

/**
 * Validate a GitHub owner or repository name shape. Mirrors the helper
 * in sync/github.ts (we don't import it because that file's helper is
 * not exported — duplicating the regex is the cheaper path).
 *
 * GitHub usernames + org names + repo names allow alphanumerics,
 * hyphens, underscores, and dots. Reject anything else BEFORE it reaches
 * the gh CLI's argv — execFileSync prevents shell-substitution already,
 * but malformed input produces unhelpful gh error noise that masks the
 * real cause.
 */
function validateGhIdentifier(value: string, kind: 'owner' | 'name'): void {
  if (!value || typeof value !== 'string') {
    throw new Error(`GitHub ${kind} is required (got: ${JSON.stringify(value)})`);
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
    throw new Error(
      `Invalid GitHub ${kind}: ${JSON.stringify(value)} — only A-Z, a-z, 0-9, ".", "-", "_" allowed`
    );
  }
}

/**
 * Loose validation for an npm package name. The official spec allows
 * scoped (`@scope/name`) and unscoped names with a tight character set.
 * We accept that plus a slash for the scope boundary; everything else
 * is rejected to keep argv hygienic.
 *
 * Empty string is rejected up front — npm view "" returns useless
 * output that looks like a network failure.
 */
function validateNpmName(value: string): void {
  if (!value || typeof value !== 'string') {
    throw new Error(`npm package name is required (got: ${JSON.stringify(value)})`);
  }
  // npm names: lowercase letters, digits, -, _, ., optional @scope/name.
  // We permit uppercase because some legacy packages use it; npm is
  // case-sensitive enough that we don't want to silently lowercase.
  if (!/^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(
      `Invalid npm package name: ${JSON.stringify(value)}`
    );
  }
}

/**
 * Loose validation for a PyPI distribution name. PyPI normalizes names
 * fairly aggressively, but the source name we pass to the JSON API
 * can include letters, digits, hyphens, underscores, and dots per
 * PEP 503.
 */
function validatePypiName(value: string): void {
  if (!value || typeof value !== 'string') {
    throw new Error(`PyPI package name is required (got: ${JSON.stringify(value)})`);
  }
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(
      `Invalid PyPI package name: ${JSON.stringify(value)}`
    );
  }
}

/**
 * Sync npm version history for a package. Returns one record per real
 * version (skipping the `created` / `modified` meta keys that `npm view
 * time` interleaves with version timestamps).
 *
 * Sorted by published_at DESC so callers can take the head for "latest"
 * without a follow-up sort. Versions with null published_at sink to the
 * tail.
 *
 * On any failure (missing npm CLI, network timeout, malformed JSON,
 * non-object payload) returns [] and logs to stderr. NEVER throws.
 */
export function syncNpmVersion(npm_name: string): PublishedVersionRecord[] {
  try {
    validateNpmName(npm_name);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: ${msg}`);
    return [];
  }

  let raw: string;
  try {
    raw = execFileSync('npm', ['view', npm_name, 'time', '--json'], {
      encoding: 'utf-8',
      maxBuffer: 5 * 1024 * 1024,
      timeout: 30000,
    });
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: failed to fetch ${npm_name}: ${msg}`);
    return [];
  }

  if (!raw.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: malformed JSON for ${npm_name}: ${msg}`);
    return [];
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error(`syncNpmVersion: expected object for ${npm_name}, got ${typeof parsed}`);
    return [];
  }

  const records: PublishedVersionRecord[] = [];
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    // npm view time returns: { created, modified, "<version>": "<iso>", ... }
    // Skip the two meta keys; everything else is a version → timestamp.
    if (key === 'created' || key === 'modified') continue;
    if (typeof value !== 'string') continue;
    records.push({
      channel: 'npm',
      version: key,
      published_at: value,
      source: 'npm_view',
    });
  }

  // Sort newest first by published_at. Rows with null timestamps fall
  // to the end (they shouldn't exist here, but defense-in-depth).
  records.sort((a, b) => {
    if (a.published_at && b.published_at) {
      return b.published_at.localeCompare(a.published_at);
    }
    if (a.published_at) return -1;
    if (b.published_at) return 1;
    return 0;
  });

  return records;
}

/**
 * Sync PyPI version history via the JSON API
 * (https://pypi.org/pypi/<name>/json). Returns one record per release
 * key in the `releases` object; the timestamp comes from the first
 * distribution's `upload_time_iso_8601` (PyPI repeats the same
 * timestamp across the distribution list, but we read the first slot
 * defensively in case PyPI surprises us with a missing field).
 *
 * 15s timeout via AbortController. Returns [] on network failure,
 * non-200, malformed JSON, or shape mismatch.
 */
export async function syncPyPIVersion(pypi_name: string): Promise<PublishedVersionRecord[]> {
  try {
    validatePypiName(pypi_name);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncPyPIVersion: ${msg}`);
    return [];
  }

  const url = `https://pypi.org/pypi/${encodeURIComponent(pypi_name)}/json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncPyPIVersion: fetch ${pypi_name} failed: ${msg}`);
    return [];
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    console.error(`syncPyPIVersion: ${pypi_name} returned HTTP ${response.status}`);
    return [];
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncPyPIVersion: malformed JSON for ${pypi_name}: ${msg}`);
    return [];
  }

  if (!parsed || typeof parsed !== 'object') {
    console.error(`syncPyPIVersion: expected object for ${pypi_name}`);
    return [];
  }

  const releases = (parsed as { releases?: unknown }).releases;
  if (!releases || typeof releases !== 'object' || Array.isArray(releases)) {
    console.error(`syncPyPIVersion: missing 'releases' object for ${pypi_name}`);
    return [];
  }

  const records: PublishedVersionRecord[] = [];
  for (const [version, dists] of Object.entries(releases as Record<string, unknown>)) {
    // PyPI represents each release as an array of distribution objects
    // (sdist + each wheel). Empty arrays signal "yanked / no
    // distributions" — we still record the version so the registry
    // shows it existed, but published_at stays null.
    if (!Array.isArray(dists) || dists.length === 0) {
      records.push({
        channel: 'pypi',
        version,
        published_at: null,
        source: 'pip_index',
      });
      continue;
    }
    const firstDist = dists[0];
    let publishedAt: string | null = null;
    if (firstDist && typeof firstDist === 'object') {
      const ts = (firstDist as { upload_time_iso_8601?: unknown }).upload_time_iso_8601;
      if (typeof ts === 'string') publishedAt = ts;
    }
    records.push({
      channel: 'pypi',
      version,
      published_at: publishedAt,
      source: 'pip_index',
    });
  }

  records.sort((a, b) => {
    if (a.published_at && b.published_at) {
      return b.published_at.localeCompare(a.published_at);
    }
    if (a.published_at) return -1;
    if (b.published_at) return 1;
    return 0;
  });

  return records;
}

/**
 * Sync GitHub Releases for a repo via `gh release list`. Up to 100
 * releases per call (the gh default is 30, which is too thrifty for
 * mature repos). Tag names get a leading 'v' stripped if present —
 * "v1.2.3" and "1.2.3" should not produce two distinct rows on the
 * same channel.
 *
 * Network-graceful: missing gh CLI, network failure, non-JSON response,
 * or shape drift all yield [] with a stderr log.
 */
export function syncGitHubReleases(owner: string, repo: string): PublishedVersionRecord[] {
  try {
    validateGhIdentifier(owner, 'owner');
    validateGhIdentifier(repo, 'name');
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncGitHubReleases: ${msg}`);
    return [];
  }

  let raw: string;
  try {
    raw = execFileSync('gh', [
      'release', 'list',
      '--repo', `${owner}/${repo}`,
      '--limit', '100',
      '--json', 'tagName,publishedAt,name',
    ], {
      encoding: 'utf-8',
      maxBuffer: 5 * 1024 * 1024,
      timeout: 30000,
    });
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncGitHubReleases: failed to fetch ${owner}/${repo}: ${msg}`);
    return [];
  }

  if (!raw.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncGitHubReleases: malformed JSON for ${owner}/${repo}: ${msg}`);
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error(`syncGitHubReleases: expected array for ${owner}/${repo}, got ${typeof parsed}`);
    return [];
  }

  const records: PublishedVersionRecord[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as { tagName?: unknown; publishedAt?: unknown };
    const tag = typeof e.tagName === 'string' ? e.tagName : null;
    if (!tag) continue;
    // Strip a single leading 'v' so "v1.2.3" and "1.2.3" don't double-count.
    const version = tag.replace(/^v/, '');
    const publishedAt = typeof e.publishedAt === 'string' ? e.publishedAt : null;
    records.push({
      channel: 'github_release',
      version,
      published_at: publishedAt,
      source: 'gh_release',
    });
  }

  // gh release list returns newest-first by default; preserve that order.
  return records;
}

export interface PublishSyncSummary {
  updated: number;
  errors: string[];
}

/**
 * Minimal shape for the repo argument — only the fields this module
 * actually reads. Callers can pass any wider repo row (from getRepo /
 * findRepos / etc.) and TS will tolerate it.
 */
export interface RepoBindingRow {
  owner?: string | null;
  name?: string | null;
  npm_package_name?: string | null;
  pypi_package_name?: string | null;
}

/**
 * Orchestrate publish-state sync for one repo. For each channel where
 * the repo has a binding:
 *   - if repo.npm_package_name set → syncNpmVersion
 *   - if repo.pypi_package_name set → syncPyPIVersion
 *   - if repo.owner+name set → syncGitHubReleases (always attempted)
 *
 * Every returned record is upserted into repo_published_versions.
 * Per-channel errors are collected and returned in `errors` so the
 * caller can show "GitHub returned 0 — check gh auth" without the
 * other channels' results getting clobbered. The function never
 * throws — the worst case is `{ updated: 0, errors: [...] }`.
 */
export async function syncPublishStateForRepo(
  repo_id: number | bigint,
  repo: RepoBindingRow
): Promise<PublishSyncSummary> {
  const errors: string[] = [];
  let updated = 0;

  const apply = (record: PublishedVersionRecord, channelLabel: string): void => {
    try {
      upsertPublishedVersion({
        repo_id,
        channel: record.channel,
        version: record.version,
        published_at: record.published_at,
        source: record.source,
      });
      updated++;
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e);
      errors.push(`${channelLabel} upsert ${record.version}: ${msg}`);
    }
  };

  // npm
  if (repo.npm_package_name) {
    try {
      const npmRecords = syncNpmVersion(repo.npm_package_name);
      for (const r of npmRecords) apply(r, 'npm');
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e);
      errors.push(`npm sync threw: ${msg}`);
    }
  }

  // PyPI
  if (repo.pypi_package_name) {
    try {
      const pypiRecords = await syncPyPIVersion(repo.pypi_package_name);
      for (const r of pypiRecords) apply(r, 'pypi');
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e);
      errors.push(`pypi sync threw: ${msg}`);
    }
  }

  // GitHub Releases — always attempted when we have owner+name. Even
  // repos that publish to npm/pypi often cut a parallel GitHub release.
  if (repo.owner && repo.name) {
    try {
      const ghRecords = syncGitHubReleases(repo.owner, repo.name);
      for (const r of ghRecords) apply(r, 'github_release');
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? String(e);
      errors.push(`github_release sync threw: ${msg}`);
    }
  }

  return { updated, errors };
}
