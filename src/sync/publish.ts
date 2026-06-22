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

// ─── SYNC-PH-03: shared transient-retry helper ───────────────────────────────
//
// Every external worker here and in build-health.ts was single-shot: one
// execFileSync/fetch, and ANY failure (including a transient 429 / 503 /
// ECONNRESET / ETIMEDOUT blip) logged + returned []/null — so a flaky network
// looked identical to "no data on the registry." This helper lets the network
// workers retry a small number of times on TRANSIENT signals only (never on a
// 404 / parse error / validation error, which are deterministic), with
// exponential backoff, and distinguishes a transient-after-retries give-up from
// a genuine empty result.

/** Substrings/codes that mark an error as worth retrying. */
const TRANSIENT_SIGNALS = ['429', '503', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ECONNREFUSED'];

/**
 * Classify whether an error (or an HTTP status number) is a transient network
 * failure worth retrying. Matches on the error message + common Node error
 * `.code` fields, plus a raw status number when the caller already has one.
 */
export function isTransientError(err: unknown, httpStatus?: number): boolean {
  if (httpStatus === 429 || httpStatus === 503) return true;
  const code = (err as { code?: unknown })?.code;
  if (typeof code === 'string' && TRANSIENT_SIGNALS.includes(code)) return true;
  const msg = (err as Error)?.message ?? String(err ?? '');
  return TRANSIENT_SIGNALS.some(sig => msg.includes(sig));
}

/**
 * Outcome of a retried worker call. `ok` carries the value on success;
 * `transient` is true ONLY when every attempt failed with a transient signal —
 * the caller uses it to report "network flaky, retried N times" DISTINCTLY from
 * a clean empty/absent result, so a flaky registry never masquerades as
 * "no published versions."
 */
export interface RetryResult<T> {
  ok: boolean;
  value?: T;
  transient: boolean;
  attempts: number;
  lastError?: string;
}

export interface RetryOptions {
  /** Max attempts including the first. Default 3. */
  attempts?: number;
  /** Base backoff in ms; attempt N waits base * 2^(N-1). Default 250. */
  baseDelayMs?: number;
  /**
   * Sleep injection seam — tests pass a no-op so backoff doesn't slow the
   * suite. Defaults to a real setTimeout-backed sleep.
   */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export interface RetrySyncOptions {
  attempts?: number;
  baseDelayMs?: number;
  /**
   * Synchronous backoff seam. Defaults to a busy-wait (the retry count is
   * bounded to 2-3, so the wall-clock cost is negligible and we avoid pulling
   * in a blocking-sleep dependency). Tests pass a no-op to keep the suite fast.
   */
  sleep?: (ms: number) => void;
}

const defaultSyncSleep = (ms: number): void => {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* bounded busy-wait; attempts <= 3 */ }
};

/**
 * Synchronous sibling of withTransientRetry for the execFileSync-based workers
 * (syncCiStatus, syncNpmAudit, …) that can't go async without changing their
 * call signature. Same transient-only retry contract.
 */
export function withTransientRetrySync<T>(
  fn: () => T,
  opts: RetrySyncOptions = {},
): RetryResult<T> {
  const maxAttempts = Math.max(1, opts.attempts ?? 3);
  const baseDelay = opts.baseDelayMs ?? 250;
  const sleep = opts.sleep ?? defaultSyncSleep;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = fn();
      return { ok: true, value, transient: false, attempts: attempt };
    } catch (e: unknown) {
      lastError = e;
      if (!isTransientError(e)) throw e;
      if (attempt < maxAttempts) sleep(baseDelay * 2 ** (attempt - 1));
    }
  }
  return {
    ok: false,
    transient: true,
    attempts: maxAttempts,
    lastError: (lastError as Error)?.message ?? String(lastError),
  };
}

/**
 * Run `fn` with transient-only retry. A non-transient throw (404, parse error,
 * validation) propagates immediately — retrying a deterministic failure just
 * wastes time and rate-limit budget. Returns a RetryResult so the caller can
 * tell "succeeded", "failed transiently after N tries", and (for a thrown
 * non-transient) it re-throws to preserve the existing single-shot semantics.
 */
export async function withTransientRetry<T>(
  fn: () => T | Promise<T>,
  opts: RetryOptions = {},
): Promise<RetryResult<T>> {
  const maxAttempts = Math.max(1, opts.attempts ?? 3);
  const baseDelay = opts.baseDelayMs ?? 250;
  const sleep = opts.sleep ?? defaultSleep;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await fn();
      return { ok: true, value, transient: false, attempts: attempt };
    } catch (e: unknown) {
      lastError = e;
      if (!isTransientError(e)) {
        // Deterministic failure — don't retry, re-throw so the worker's own
        // catch block produces its existing structured message.
        throw e;
      }
      if (attempt < maxAttempts) {
        await sleep(baseDelay * 2 ** (attempt - 1));
      }
    }
  }
  return {
    ok: false,
    transient: true,
    attempts: maxAttempts,
    lastError: (lastError as Error)?.message ?? String(lastError),
  };
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
 * version (skipping the `created` / `modified` meta keys that the npm
 * registry's `time` object interleaves with version timestamps).
 *
 * Sorted by published_at DESC so callers can take the head for "latest"
 * without a follow-up sort. Versions with null published_at sink to the
 * tail.
 *
 * Sourced from the npm registry HTTP API (https://registry.npmjs.org/<name>),
 * NOT a `npm view` subprocess. The packument's top-level `time` object carries
 * the exact same per-version timestamp map the old `npm view time --json` did,
 * so the parsing is unchanged — but the fetch path is cross-platform and has no
 * PATH/CLI dependency. The subprocess form was unspawnable on Windows (npm is a
 * `.cmd` shim — see exec-bin.ts) so `versions --refresh` only ever synced the
 * npm channel on POSIX; this also brings npm into line with the PyPI sibling,
 * which already used `fetch`.
 *
 * On any failure (network timeout, non-2xx, malformed JSON, non-object
 * payload) returns [] and logs to stderr. NEVER throws.
 */
export async function syncNpmVersion(
  npm_name: string,
  opts?: { retry?: RetryOptions }
): Promise<PublishedVersionRecord[]> {
  try {
    validateNpmName(npm_name);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: ${msg}`);
    return [];
  }

  // The registry accepts a scoped name's `/` as a literal path segment
  // (`@scope/name`); validateNpmName already constrains the charset to a
  // URL-safe set, so no further encoding is required.
  const url = `https://registry.npmjs.org/${npm_name}`;

  // SYNC-PH-03: retry the fetch on transient signals only (mirrors
  // syncPyPIVersion). A 429/503 is thrown INSIDE the retried fn so it triggers
  // a retry; a deterministic non-2xx (404) is handled below.
  let response: Response;
  try {
    const outcome = await withTransientRetry<Response>(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (res.status === 429 || res.status === 503) {
          throw new Error(`${res.status} transient from npm registry for ${npm_name}`);
        }
        return res;
      } finally {
        clearTimeout(timer);
      }
    }, opts?.retry);
    if (!outcome.ok) {
      console.error(
        `syncNpmVersion: ${npm_name} transient failure after ${outcome.attempts} attempts: ${outcome.lastError}`
      );
      return [];
    }
    response = outcome.value as Response;
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: fetch ${npm_name} failed: ${msg}`);
    return [];
  }

  if (!response.ok) {
    console.error(`syncNpmVersion: ${npm_name} returned HTTP ${response.status}`);
    return [];
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncNpmVersion: malformed JSON for ${npm_name}: ${msg}`);
    return [];
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.error(`syncNpmVersion: expected object for ${npm_name}, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`);
    return [];
  }

  const time = (parsed as { time?: unknown }).time;
  if (!time || typeof time !== 'object' || Array.isArray(time)) {
    // A reserved-but-never-published name (placeholder packument) can lack a
    // `time` map. Treat as "no versions yet" rather than an error.
    return [];
  }

  const records: PublishedVersionRecord[] = [];
  for (const [key, value] of Object.entries(time as Record<string, unknown>)) {
    // The `time` object is { created, modified, "<version>": "<iso>", ... }.
    // Skip the two meta keys; everything else is a version → timestamp.
    if (key === 'created' || key === 'modified') continue;
    if (typeof value !== 'string') continue;
    records.push({
      channel: 'npm',
      version: key,
      published_at: value,
      // Retained label for continuity with rows the old `npm view` path wrote.
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
export async function syncPyPIVersion(
  pypi_name: string,
  opts?: { retry?: RetryOptions }
): Promise<PublishedVersionRecord[]> {
  try {
    validatePypiName(pypi_name);
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncPyPIVersion: ${msg}`);
    return [];
  }

  const url = `https://pypi.org/pypi/${encodeURIComponent(pypi_name)}/json`;

  // SYNC-PH-03: retry the fetch on transient signals. A 429/503 response is
  // thrown as a transient error INSIDE the retried fn so it triggers a retry
  // (rather than being read as a clean "no versions"); a non-2xx that isn't
  // transient (404) is thrown too, but isTransientError returns false for it,
  // so withTransientRetry re-throws immediately and we handle it below.
  let response: Response;
  try {
    const outcome = await withTransientRetry<Response>(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (res.status === 429 || res.status === 503) {
          // Mark transient via the message so isTransientError matches.
          throw new Error(`${res.status} transient from PyPI for ${pypi_name}`);
        }
        return res;
      } finally {
        clearTimeout(timer);
      }
    }, opts?.retry);
    if (!outcome.ok) {
      console.error(
        `syncPyPIVersion: ${pypi_name} transient failure after ${outcome.attempts} attempts: ${outcome.lastError}`
      );
      return [];
    }
    response = outcome.value as Response;
  } catch (e: unknown) {
    const msg = (e as Error)?.message ?? String(e);
    console.error(`syncPyPIVersion: fetch ${pypi_name} failed: ${msg}`);
    return [];
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
      const npmRecords = await syncNpmVersion(repo.npm_package_name);
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
