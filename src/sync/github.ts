/**
 * GitHub sync — pulls repo metadata, topics, releases, and languages via gh CLI.
 */
import { execFileSync } from 'child_process';
import {
  upsertRepo, upsertRelease, setTopics, upsertFact, getDb,
  // FT-5: listing-absence → lifecycle_status='archived' + warning note.
  // (NOT an individual 404 probe — sync-A-001: the candidate merely
  // failed to appear in `gh repo list`.) Uses the existing FT-1 archiver
  // helper so the lifecycle column + deprecated_at are bumped in one place.
  archiveRepoBySlug, upsertNote,
} from '../db/init.js';

/**
 * Validate a GitHub owner or repository name shape.
 *
 * GitHub usernames + org names + repo names allow alphanumerics, hyphens,
 * underscores, and dots. We reject anything else BEFORE it reaches the
 * `gh` CLI's argv — execFileSync already prevents shell-substitution
 * injection because no shell is spawned, but a malformed name (e.g.
 * containing whitespace or `;`) can still produce surprising gh errors
 * that look like the tool failed when really the input was wrong.
 *
 * Reject empty strings up-front: gh accepts them but produces unhelpful
 * "No such repo" output that masks the real cause.
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

export interface GitHubRepo {
  owner: string;
  name: string;
  github_url: string | null;
  description: string | null;
  visibility: string;
  archived: boolean;
  is_fork: boolean;
  default_branch: string;
  stars: number;
  forks: number;
  open_issues: number;
  license: string | null;
  topics: string[];
  primary_language: string | null;
  languages: Record<string, number>;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
}

export interface GitHubSyncOptions {
  limit?: number;
  includeReleases?: boolean;
  includeForks?: boolean;
  /**
   * sync-A-006 (deepened): when true, previously-active repos absent from
   * this sync's `gh repo list` are soft-archived (lifecycle_status='archived').
   * DEFAULT false — a routine `rk sync` only DETECTS and reports vanished
   * candidates; it never mutates lifecycle state on listing-absence alone.
   * Absence is an ambiguous signal (deleted / renamed / transferred / private-
   * but-invisible-to-an-under-scoped-token), so the destructive-leaning
   * archival is opt-in. The operator passing this flag asserts a complete,
   * fully-scoped view of the owner.
   */
  pruneVanished?: boolean;
}

export interface GitHubSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  /**
   * Slugs that were active before this sync but absent from the listing.
   * Always populated (detection runs regardless of pruneVanished); when
   * pruneVanished is false these were NOT archived — the caller surfaces
   * them as a warning so the operator can investigate or re-run with the flag.
   */
  vanished: string[];
}

export interface ReleaseInfo {
  tag: string;
  title: string;
  body: string;
  prerelease: boolean;
  published_at: string;
}

/**
 * Fetch all repos for an owner (org or user) from GitHub.
 */
export function fetchGitHubRepos(owner: string, opts: GitHubSyncOptions = {}): GitHubRepo[] {
  const limit = opts.limit || 200;

  // GraphQL quoting doesn't work reliably on Windows; go straight to the simpler approach
  return fetchGitHubReposSimple(owner, limit);
}

/**
 * Simple fallback using gh repo list.
 *
 * F-DB-003: switched from execSync (which interpolates argv into a shell
 * command string) to execFileSync (which passes argv directly to the
 * spawned process with no shell). Combined with validateGhIdentifier on
 * the owner, this closes the command-injection surface even if a caller
 * passes an attacker-controlled owner string.
 */
function fetchGitHubReposSimple(owner: string, limit: number): GitHubRepo[] {
  validateGhIdentifier(owner, 'owner');

  const args = [
    'repo', 'list', owner,
    '--limit', String(limit),
    '--json', 'name,owner,description,url,isArchived,isPrivate,isFork,defaultBranchRef,stargazerCount,forkCount,createdAt,updatedAt,pushedAt,primaryLanguage,repositoryTopics,licenseInfo',
  ];

  let result: string;
  try {
    result = execFileSync('gh', args, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60000,
    });
  } catch (e: any) {
    console.error(`Failed to fetch repos for ${owner}: ${e.message}`);
    return [];
  }

  // F-DB-017: gh can return malformed JSON if the network blips or the
  // CLI errored partway. Guard the parse so we degrade to "no repos" with
  // a clear stderr message instead of crashing the sync.
  let repos: any[];
  try {
    const parsed = JSON.parse(result);
    if (!Array.isArray(parsed)) {
      console.error(`Failed to parse repos for ${owner}: expected array, got ${typeof parsed}`);
      return [];
    }
    repos = parsed;
  } catch (e: any) {
    console.error(`Failed to parse repos JSON for ${owner}: ${e.message}`);
    return [];
  }

  return repos.map(r => ({
    owner: r.owner?.login || owner,
    name: r.name,
    github_url: r.url || null,
    description: r.description || null,
    visibility: r.isPrivate ? 'private' : 'public',
    archived: r.isArchived || false,
    is_fork: r.isFork || false,
    default_branch: r.defaultBranchRef?.name || 'main',
    stars: r.stargazerCount || 0,
    forks: r.forkCount || 0,
    open_issues: 0,
    license: r.licenseInfo?.spdxId || r.licenseInfo?.key || null,
    topics: (r.repositoryTopics || []).map((t: any) => typeof t === 'string' ? t : t.name),
    primary_language: r.primaryLanguage?.name || null,
    languages: {},
    created_at: r.createdAt || null,
    updated_at: r.updatedAt || null,
    pushed_at: r.pushedAt || null,
  }));
}

/**
 * Fetch releases for a specific repo.
 *
 * F-DB-003: same command-injection-avoidance fix as fetchGitHubReposSimple.
 * The owner + name are now passed as discrete argv entries; the API path
 * is built locally AFTER validation so a malicious owner can't escape into
 * `--header` or other gh flags.
 *
 * F-DB-018: parse releases line by line with per-line try/catch so a
 * single malformed JSON line doesn't drop the entire release history.
 * The outer catch now warns to stderr instead of silently returning [].
 */
export function fetchReleases(owner: string, name: string): ReleaseInfo[] {
  try {
    validateGhIdentifier(owner, 'owner');
    validateGhIdentifier(name, 'name');

    const apiPath = `repos/${owner}/${name}/releases`;
    const args = [
      'api', apiPath,
      '--jq', '.[] | {tag_name, name, body, prerelease, published_at}',
    ];
    const result = execFileSync('gh', args, {
      encoding: 'utf-8',
      maxBuffer: 5 * 1024 * 1024,
      timeout: 30000,
    });
    if (!result.trim()) return [];

    // gh --jq outputs one JSON object per line. Per-line try/catch so a
    // single malformed line doesn't drop the whole release list.
    const releases: ReleaseInfo[] = [];
    for (const line of result.trim().split('\n')) {
      try {
        const r = JSON.parse(line);
        releases.push({
          tag: r.tag_name,
          title: r.name,
          body: r.body,
          prerelease: r.prerelease,
          published_at: r.published_at,
        });
      } catch (e: any) {
        console.error(`Skipped malformed release JSON line for ${owner}/${name}: ${e.message}`);
        continue;
      }
    }
    return releases;
  } catch (e: any) {
    console.error(`Failed to fetch releases for ${owner}/${name}: ${e.message}`);
    return [];
  }
}

interface PriorActiveRepo {
  id: number;
  slug: string;          // original casing, for storage/display
  visibility: string | null;
}

/**
 * FT-5: snapshot the set of (owner, name) slugs for previously-active
 * repos under the given owner. Used to compute the "vanished from
 * GitHub" diff after the sync: previously-active minus seen-this-sync
 * is the candidate-archived set.
 *
 * We deliberately scope by owner, not by the whole DB, because a sync
 * targeting one org should never archive repos the OPERATOR didn't ask
 * to sync. Joining across orgs would risk archiving a competitor's
 * mirror just because we didn't fetch their org this round.
 *
 * sync-A-004: keyed by the LOWERCASED slug because GitHub identity is
 * case-insensitive — a casing mismatch between the stored slug and the
 * fetched one (Org/Repo vs org/repo) must NOT be read as "vanished."
 * The map VALUE keeps the original-cased slug for storage/display.
 *
 * sync-A-001 / sync-A-006: we also carry `visibility` so the archiver
 * can refuse to soft-archive a repo whose last-recorded visibility was
 * private. An under-scoped token (missing the `repo` scope) returns only
 * public repos and silently omits private ones; archiving those would
 * stamp a live private repo "may be deleted."
 *
 * Returns a Map<lowercased-slug, PriorActiveRepo> so the post-sync
 * archiver doesn't have to re-query.
 */
function snapshotActiveSlugsByOwner(owner: string): Map<string, PriorActiveRepo> {
  const db = getDb();
  // Guard against fixtures that lack the lifecycle_status column (e.g.
  // pre-migration-006 schemas in tests). We probe for the column and
  // fall back to status='active' when missing. The COALESCE keeps the
  // post-migration path identical: lifecycle_status='active' selects
  // exactly the same rows.
  const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
  const hasLifecycle = cols.some(c => c.name === 'lifecycle_status');
  const sql = hasLifecycle
    ? `SELECT id, slug, visibility FROM repos WHERE owner = ? AND coalesce(lifecycle_status, 'active') = 'active'`
    : `SELECT id, slug, visibility FROM repos WHERE owner = ? AND coalesce(status, 'active') = 'active'`;
  const rows = db.prepare(sql).all(owner) as { id: number; slug: string; visibility: string | null }[];
  const m = new Map<string, PriorActiveRepo>();
  for (const r of rows) m.set(r.slug.toLowerCase(), { id: r.id, slug: r.slug, visibility: r.visibility });
  return m;
}

/**
 * FT-5: archive a vanished repo + add a warning note explaining why.
 *
 * Soft-archive (lifecycle_status='archived' via archiveRepoBySlug) so
 * the operator can re-discover the row + decide whether to run `rk
 * delete <slug>` for the hard cleanup. The note is the audit trail —
 * it surfaces in `rk show <slug>` and in FTS so the operator can find
 * "what disappeared from GitHub" weeks later.
 *
 * sync-A-001: the candidate was NOT individually 404-probed — it merely
 * failed to appear in the owner-level `gh repo list`. That can happen
 * for a deleted repo, a renamed repo, a transferred repo, or (most
 * dangerously) one omitted because the token's scope didn't cover it.
 * So the note no longer asserts "GitHub returned 404 … may be deleted";
 * it states only what we actually observed (absent from the listing)
 * and leaves the cause open.
 */
function archiveVanishedRepo(slug: string, repoId: number, owner: string, name: string): void {
  archiveRepoBySlug(slug, { reason: 'absent-from-gh-listing-during-sync' });
  const now = new Date().toISOString();
  const note = `Not present in GitHub's repo listing for ${owner} at ${now}; was previously active. Possible causes: deleted, renamed, transferred, made private, or omitted by an under-scoped token. Confirm with \`gh repo view ${slug}\` before running \`rk delete ${slug}\`.`;
  upsertNote(
    repoId,
    'warning',
    `GitHub listing absence — ${owner}/${name}`,
    note,
    'sync-github'
  );
}

/**
 * Sync all repos for given owners into the database.
 *
 * FT-5: when a previously-active repo is not present in this sync's fetch
 * results (the owner-level `gh repo list` no longer includes it), it is a
 * VANISHED candidate. A routine sync only DETECTS and reports these (in
 * `result.vanished`); it archives them (`lifecycle_status='archived'`) ONLY
 * when `opts.pruneVanished` is set.
 *
 * Why archival is opt-in (sync-A-006, deepened): listing-absence is an
 * AMBIGUOUS signal. `gh repo list` with a token lacking `repo` scope omits
 * private repos exactly the way it omits deleted ones, and GitHub returns 404
 * (not 403) for a private repo you can't see, so even a per-candidate probe
 * can't tell them apart. The `repos.visibility` column is not a reliable
 * discriminator either — local-scanned repos default to 'public'. So a routine
 * `rk sync` must never mutate lifecycle state on absence alone; the operator
 * opts in with `--prune-vanished` to assert a complete, fully-scoped view.
 *
 * Detection guards (always applied):
 *  - we only treat repos as vanished when the owner's fetch produced AT LEAST
 *    ONE successful repo entry. If the entire owner-level fetch failed (rate
 *    limit, network blip, auth missing), fetchGitHubRepos returns []; we treat
 *    that as "no signal" rather than "everything vanished."
 *  - sync-A-004: seen/snapshot membership is compared case-insensitively
 *    because GitHub identity is case-insensitive — Org/Repo and org/repo are
 *    the same repo and a casing skew must not look like a vanish.
 * Under --prune-vanished, a row recorded as private is still never archived
 * (defense-in-depth), and the warning note states only the observed fact.
 */
export function syncGitHub(owners: string[], opts: GitHubSyncOptions = {}): GitHubSyncResult {
  const results: GitHubSyncResult = { synced: 0, skipped: 0, errors: [], vanished: [] };

  for (const owner of owners) {
    // mcp-PH-001: progress/diagnostic output goes to STDERR. Under the MCP
    // StdioServer transport STDOUT carries the JSON-RPC frames, and `--json`
    // CLI consumers pipe STDOUT to jq — the "Syncing X...", per-repo sync
    // dots, and vanished/archived notices below are all progress about the
    // sync, not its result, so they must never touch STDOUT.
    console.error(`Syncing ${owner}...`);
    // FT-5: snapshot BEFORE we fetch so we know what was active going
    // in. Whatever's not in the fetch results is a vanished candidate.
    const priorActive = snapshotActiveSlugsByOwner(owner);

    const repos = fetchGitHubRepos(owner, opts);
    const seenSlugs = new Set<string>();

    // SYNC-PH-04: a listing whose length exactly hits the effective limit is
    // LIKELY TRUNCATED — `gh repo list` returns at most --limit rows and gives
    // no "there are more" signal. A truncated page can't be distinguished from
    // a complete one, so a repo that simply fell past the cutoff would look
    // "vanished" and, under --prune-vanished, get wrongly archived. We mirror
    // the same effective limit fetchGitHubRepos uses (opts.limit || 200).
    const effectiveLimit = opts.limit || 200;
    const listingTruncated = repos.length >= effectiveLimit;

    for (const repo of repos) {
      try {
        if (repo.is_fork && !opts.includeForks) {
          results.skipped++;
          continue;
        }

        // F-DB-011: wrap the per-repo write block in a transaction so
        // a partial failure (e.g. a single topic violating a constraint)
        // does not leave half-written state. Also yields 10-100x bulk
        // insert speedup on large topic / release lists.
        //
        // Releases are fetched OUTSIDE the transaction because they hit
        // the network; we don't want network latency to hold a write
        // lock open on the SQLite file.
        const releases = opts.includeReleases ? fetchReleases(repo.owner, repo.name) : [];

        const db = getDb();
        const tx = db.transaction(() => {
          const repoId = upsertRepo(repo);

          // Topics
          if (repo.topics?.length) {
            setTopics(repoId, repo.topics, 'github');
          }

          // Language facts
          if (repo.primary_language) {
            upsertFact(repoId, 'language', 'primary', repo.primary_language, 'detected');
          }
          if (repo.languages) {
            for (const [lang, bytes] of Object.entries(repo.languages)) {
              upsertFact(repoId, 'language', lang, String(bytes), 'detected');
            }
          }

          // Releases (optional, slower — fetched above outside the tx).
          for (const rel of releases) {
            upsertRelease(repoId, rel);
          }
        });
        tx();

        // sync-A-004: store the lowercased slug so the vanished diff
        // below is case-insensitive (GitHub identity is).
        seenSlugs.add(`${repo.owner}/${repo.name}`.toLowerCase());
        results.synced++;
        // mcp-PH-001: sync dots are progress — write them to STDERR so they
        // don't interleave with the JSON-RPC frame channel on STDOUT.
        process.stderr.write('.');
      } catch (e: any) {
        results.errors.push(`${repo.owner}/${repo.name}: ${e.message}`);
      }
    }
    console.error();

    // SYNC-PH-04: when the listing is likely truncated, suppress the prune
    // step for THIS owner. We still DETECT and report vanished candidates
    // (they may be genuinely gone), but we never archive on a page we can't
    // prove is complete — a repo past the --limit cutoff is absent for the
    // same reason a deleted one is. Warn the operator to raise --limit first.
    const pruneForOwner = (opts.pruneVanished ?? false) && !listingTruncated;
    if (opts.pruneVanished && listingTruncated) {
      console.error(
        `  ⚠ ${owner}: fetched ${repos.length} repos — exactly the --limit cap, so the listing is likely TRUNCATED. ` +
        `Skipping --prune-vanished archival for this owner to avoid archiving repos that merely fell past the cutoff. ` +
        `Re-run with a higher --limit to prune safely.`
      );
    }

    // FT-5: vanished-repo DETECTION. Only runs when this owner-fetch
    // produced at least one result — empty fetch = ambient failure, not
    // signal. Archival is opt-in (see below).
    if (repos.length > 0) {
      for (const [lowerSlug, prior] of priorActive.entries()) {
        // sync-A-004: case-insensitive membership — the seenSlugs set is
        // already lowercased, and so is `lowerSlug`.
        if (seenSlugs.has(lowerSlug)) continue;

        // The slug was active before this sync but not in this sync's GitHub
        // listing — a vanished candidate. Record it regardless of whether we
        // archive, so the caller can surface "what disappeared."
        results.vanished.push(prior.slug);

        // sync-A-006 (deepened): archival is OPT-IN. Listing-absence is an
        // ambiguous signal — a private repo invisible to an under-scoped
        // token is absent for the same reason a deleted one is. The visibility
        // column is NOT a reliable discriminator (local-scanned repos default
        // to 'public'), so a routine `rk sync` must NOT mutate lifecycle state
        // here. Only archive when the operator explicitly opted in via
        // --prune-vanished, asserting a complete, fully-scoped view.
        //
        // SYNC-PH-04: pruneForOwner folds in the truncation guard — a
        // truncated listing disables archival for this owner even under the
        // flag (the warning above already told the operator to raise --limit).
        if (!pruneForOwner) {
          console.error(`  vanished (absent from gh listing, NOT archived — pass --prune-vanished to archive): ${prior.slug}`);
          continue;
        }

        // Opt-in archival. Keep the visibility guard as defense-in-depth: if a
        // row WAS github-confirmed private, never archive it even under the flag.
        if (prior.visibility === 'private') {
          console.error(`  kept (recorded private, absent from listing): ${prior.slug}`);
          continue;
        }
        const [vOwner, vName] = prior.slug.split('/', 2);
        try {
          archiveVanishedRepo(prior.slug, prior.id, vOwner ?? owner, vName ?? prior.slug);
          console.error(`  archived (--prune-vanished, absent from gh listing): ${prior.slug}`);
        } catch (e: unknown) {
          results.errors.push(`archive ${prior.slug}: ${(e as Error).message}`);
        }
      }
    }
  }

  return results;
}
