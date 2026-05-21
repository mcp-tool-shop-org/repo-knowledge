/**
 * GitHub sync — pulls repo metadata, topics, releases, and languages via gh CLI.
 */
import { execFileSync } from 'child_process';
import { upsertRepo, upsertRelease, setTopics, upsertFact, getDb } from '../db/init.js';

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
 * Sync all repos for given owners into the database.
 */
export function syncGitHub(owners: string[], opts: GitHubSyncOptions = {}): GitHubSyncResult {
  const results: GitHubSyncResult = { synced: 0, skipped: 0, errors: [] };

  for (const owner of owners) {
    console.log(`Syncing ${owner}...`);
    const repos = fetchGitHubRepos(owner, opts);

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

        results.synced++;
        process.stdout.write('.');
      } catch (e: any) {
        results.errors.push(`${repo.owner}/${repo.name}: ${e.message}`);
      }
    }
    console.log();
  }

  return results;
}
