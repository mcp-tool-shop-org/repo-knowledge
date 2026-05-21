/**
 * GitHub sync — pulls repo metadata, topics, releases, and languages via gh CLI.
 */
import { execFileSync } from 'child_process';
import {
  upsertRepo, upsertRelease, setTopics, upsertFact, getDb,
  // FT-5: 404 → lifecycle_status='archived' + warning note. Uses the
  // existing FT-1 archiver helper so the lifecycle column + deprecated_at
  // are bumped in one place.
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
}

export interface GitHubSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
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
 * Returns a Map<slug, repo_id> so the post-sync archiver doesn't have
 * to re-query.
 */
function snapshotActiveSlugsByOwner(owner: string): Map<string, number> {
  const db = getDb();
  // Guard against fixtures that lack the lifecycle_status column (e.g.
  // pre-migration-006 schemas in tests). We probe for the column and
  // fall back to status='active' when missing. The COALESCE keeps the
  // post-migration path identical: lifecycle_status='active' selects
  // exactly the same rows.
  const cols = db.prepare("PRAGMA table_info(repos)").all() as { name: string }[];
  const hasLifecycle = cols.some(c => c.name === 'lifecycle_status');
  const sql = hasLifecycle
    ? `SELECT id, slug FROM repos WHERE owner = ? AND coalesce(lifecycle_status, 'active') = 'active'`
    : `SELECT id, slug FROM repos WHERE owner = ? AND coalesce(status, 'active') = 'active'`;
  const rows = db.prepare(sql).all(owner) as { id: number; slug: string }[];
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.slug, r.id);
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
 */
function archiveVanishedRepo(slug: string, repoId: number, owner: string, name: string): void {
  archiveRepoBySlug(slug, { reason: 'gh-404-during-sync' });
  const now = new Date().toISOString();
  const note = `GitHub returned 404 at ${now}; repo may be deleted, private, or renamed. Investigate or run \`rk delete ${slug}\` to remove.`;
  upsertNote(
    repoId,
    'warning',
    `GitHub 404 — ${owner}/${name}`,
    note,
    'sync-github'
  );
}

/**
 * Sync all repos for given owners into the database.
 *
 * FT-5: when a previously-active repo is not present in this sync's
 * fetch results (GitHub returned 404 for it, or the org no longer lists
 * it), we mark `lifecycle_status='archived'` and add a warning note.
 *
 * Defense against false positives: we only archive when the owner's
 * fetch produced AT LEAST ONE successful repo entry. If the entire
 * owner-level fetch failed (rate limit, network blip, auth missing),
 * fetchGitHubRepos returns []; we treat that as "no signal" rather
 * than "everything vanished." This is the load-bearing distinction
 * between a single repo 404 (real signal) and a whole-org fetch failure
 * (operational noise).
 */
export function syncGitHub(owners: string[], opts: GitHubSyncOptions = {}): GitHubSyncResult {
  const results: GitHubSyncResult = { synced: 0, skipped: 0, errors: [] };

  for (const owner of owners) {
    console.log(`Syncing ${owner}...`);
    // FT-5: snapshot BEFORE we fetch so we know what was active going
    // in. Whatever's not in the fetch results is a vanished candidate.
    const priorActive = snapshotActiveSlugsByOwner(owner);

    const repos = fetchGitHubRepos(owner, opts);
    const seenSlugs = new Set<string>();

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

        seenSlugs.add(`${repo.owner}/${repo.name}`);
        results.synced++;
        process.stdout.write('.');
      } catch (e: any) {
        results.errors.push(`${repo.owner}/${repo.name}: ${e.message}`);
      }
    }
    console.log();

    // FT-5: vanished-repo archival. Only fires when this owner-fetch
    // produced at least one result — empty fetch = ambient failure,
    // not signal.
    if (repos.length > 0) {
      for (const [slug, repoId] of priorActive.entries()) {
        if (seenSlugs.has(slug)) continue;
        // The slug was active before this sync but not in this sync's
        // GitHub results — treat as vanished.
        const [vOwner, vName] = slug.split('/', 2);
        try {
          archiveVanishedRepo(slug, repoId, vOwner ?? owner, vName ?? slug);
          console.log(`  archived (gh-404): ${slug}`);
        } catch (e: unknown) {
          results.errors.push(`archive ${slug}: ${(e as Error).message}`);
        }
      }
    }
  }

  return results;
}
