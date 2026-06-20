#!/usr/bin/env node
// Sync all GitHub releases into repo_releases table
const { execSync } = require('child_process');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'knowledge.db');
const db = new Database(DB_PATH);

// Build slug -> repo_id map
const repoMap = new Map();
for (const row of db.prepare('SELECT id, slug FROM repos').all()) {
  repoMap.set(row.slug, row.id);
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO repo_releases (repo_id, tag, title, body, prerelease, published_at)
  VALUES (@repo_id, @tag, @title, @body, @prerelease, @published_at)
`);

const insertMany = db.transaction((releases) => {
  let inserted = 0;
  for (const r of releases) {
    const info = insert.run(r);
    if (info.changes > 0) inserted++;
  }
  return inserted;
});

// PH-AHG-004: a fetch failure used to be swallowed silently — gh()
// returned null, listRepos/listReleases returned [], and a stale sync
// printed "Done" looking successful. We now (a) log gh's stderr so the
// operator can see WHAT failed, and (b) bump a module-level counter so the
// summary can report the failure and the process can exit non-zero —
// letting CI gate on a degraded sync instead of trusting a green run.
let ghFailures = 0;

function gh(args) {
  try {
    return execSync(`gh api --paginate ${args}`, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 60000,
    });
  } catch (e) {
    ghFailures++;
    // execSync surfaces gh's stderr on e.stderr; fall back to e.message.
    const detail = (e && e.stderr ? String(e.stderr).trim() : '') || (e && e.message) || 'unknown error';
    console.warn(`gh failed: api --paginate ${args}\n  ${detail}`);
    return null;
  }
}

function listRepos(owner, isOrg) {
  const endpoint = isOrg ? `/orgs/${owner}/repos` : `/users/${owner}/repos`;
  const raw = gh(`"${endpoint}?per_page=100" -q ".[].full_name"`);
  if (!raw) return [];
  return raw.trim().split('\n').filter(Boolean);
}

function listReleases(fullName) {
  const raw = gh(`"/repos/${fullName}/releases?per_page=100"`);
  if (!raw) return [];
  try {
    // gh --paginate with JSON returns concatenated arrays, parse them
    const parsed = JSON.parse('[' + raw.replace(/\]\s*\[/g, ',') + ']');
    // If the outer parse gave us nested arrays, flatten
    return Array.isArray(parsed[0]) ? parsed.flat() : parsed;
  } catch {
    // Try line-by-line JSON (jq output)
    try {
      return raw.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    } catch {
      return [];
    }
  }
}

const owners = [
  { name: 'mcp-tool-shop-org', isOrg: true },
  { name: 'mcp-tool-shop', isOrg: false },
];

let totalInserted = 0;
let totalSkipped = 0;

for (const { name: owner, isOrg } of owners) {
  console.log(`\n=== Fetching repos for ${owner} (${isOrg ? 'org' : 'user'}) ===`);
  const repos = listRepos(owner, isOrg);
  console.log(`Found ${repos.length} repos`);

  for (const fullName of repos) {
    const slug = fullName; // full_name is already owner/name
    const repoId = repoMap.get(slug);
    if (!repoId) {
      console.log(`  SKIP ${slug} — not in repos table`);
      continue;
    }

    const releases = listReleases(fullName);
    if (releases.length === 0) continue;

    const rows = releases.map(r => ({
      repo_id: repoId,
      tag: r.tag_name,
      title: r.name || null,
      body: r.body || null,
      prerelease: r.prerelease ? 1 : 0,
      published_at: r.published_at || null,
    }));

    const inserted = insertMany(rows);
    totalInserted += inserted;
    totalSkipped += rows.length - inserted;
    console.log(`  ${slug}: ${releases.length} releases (${inserted} new, ${rows.length - inserted} dupes)`);
  }
}

console.log(`\n=== Done ===`);
console.log(`Inserted: ${totalInserted}, Skipped (dupes): ${totalSkipped}`);
console.log(`Total in table: ${db.prepare('SELECT COUNT(*) as c FROM repo_releases').get().c}`);

db.close();

// PH-AHG-004: surface degraded-sync state. If any owner/repo fetch errored,
// the run is incomplete (some releases may be missing) — say so loudly and
// exit non-zero so a caller / CI does not treat a partial sync as success.
if (ghFailures > 0) {
  console.error(`\nWARNING: ${ghFailures} GitHub fetch(es) failed — this sync is INCOMPLETE (some releases may be missing).`);
  process.exit(1);
}
