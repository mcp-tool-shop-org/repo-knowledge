/**
 * GitHub sync — pulls repo metadata, topics, releases, and languages via gh CLI.
 */
import { execSync } from 'child_process';
import { upsertRepo, upsertRelease, setTopics, upsertFact } from '../db/init.js';

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
 */
function fetchGitHubReposSimple(owner: string, limit: number): GitHubRepo[] {
  const cmd = `gh repo list ${owner} --limit ${limit} --json name,owner,description,url,isArchived,isPrivate,isFork,defaultBranchRef,stargazerCount,forkCount,createdAt,updatedAt,pushedAt,primaryLanguage,repositoryTopics,licenseInfo`;

  let result: string;
  try {
    result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024, timeout: 60000 });
  } catch (e: any) {
    console.error(`Failed to fetch repos for ${owner}: ${e.message}`);
    return [];
  }

  const repos = JSON.parse(result) as any[];
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
 */
export function fetchReleases(owner: string, name: string): ReleaseInfo[] {
  try {
    const cmd = `gh api repos/${owner}/${name}/releases --jq '.[] | {tag_name, name, body, prerelease, published_at}'`;
    const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024, timeout: 30000 });
    if (!result.trim()) return [];

    // gh --jq outputs one JSON object per line
    return result.trim().split('\n').map(line => {
      const r = JSON.parse(line);
      return {
        tag: r.tag_name,
        title: r.name,
        body: r.body,
        prerelease: r.prerelease,
        published_at: r.published_at,
      };
    });
  } catch {
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

        // Releases (optional, slower)
        if (opts.includeReleases) {
          const releases = fetchReleases(repo.owner, repo.name);
          for (const rel of releases) {
            upsertRelease(repoId, rel);
          }
        }

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
