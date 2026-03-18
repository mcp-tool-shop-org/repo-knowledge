/**
 * Sync orchestrator — runs GitHub sync + local scan + FTS reindex.
 */
import { syncGitHub } from './github.js';
import type { GitHubSyncResult } from './github.js';
import { scanDirectory, ingestLocalRepo } from './local.js';
import type { ScanResult } from './local.js';
import { rebuildIndex } from '../search/fts.js';
import { openDb, getStats } from '../db/init.js';
import type { DbStats } from '../db/init.js';
import { resolveConfig } from '../config.js';
import type { RkConfig } from '../config.js';

export interface SyncConfig {
  dbPath?: string;
  owners?: string[];
  localDirs?: string[];
  includeReleases?: boolean;
  includeForks?: boolean;
}

export interface FullSyncResult {
  github: GitHubSyncResult;
  local: ScanResult;
  indexed: number;
  stats: DbStats;
}

/**
 * Full sync: GitHub orgs → local repos → FTS index.
 */
export async function fullSync(config: SyncConfig = {}): Promise<FullSyncResult> {
  const resolved = resolveConfig({
    dbPath: config.dbPath,
    owners: config.owners,
    localDirs: config.localDirs,
  });

  const db = openDb(resolved.dbPath);

  const owners = resolved.owners;
  const localDirs = resolved.localDirs;

  console.log('=== GitHub Sync ===');
  const ghResult = syncGitHub(owners, {
    includeReleases: config.includeReleases ?? false,
    includeForks: config.includeForks ?? false,
  });
  console.log(`GitHub: ${ghResult.synced} synced, ${ghResult.skipped} skipped`);
  if (ghResult.errors.length) {
    console.log(`Errors: ${ghResult.errors.length}`);
    ghResult.errors.forEach(e => console.log(`  ${e}`));
  }

  console.log('\n=== Local Scan ===');
  let localTotal: ScanResult = { scanned: 0, skipped: 0, errors: [] };
  for (const dir of localDirs) {
    console.log(`Scanning ${dir}...`);
    const result = scanDirectory(dir);
    localTotal.scanned += result.scanned;
    localTotal.skipped += result.skipped;
    localTotal.errors.push(...result.errors);
  }
  console.log(`Local: ${localTotal.scanned} scanned, ${localTotal.skipped} skipped`);
  if (localTotal.errors.length) {
    console.log(`Errors: ${localTotal.errors.length}`);
    localTotal.errors.slice(0, 10).forEach(e => console.log(`  ${e}`));
  }

  console.log('\n=== Rebuilding FTS Index ===');
  const indexed = rebuildIndex();
  console.log(`Indexed ${indexed} entries`);

  console.log('\n=== Stats ===');
  const stats = getStats();
  console.log(stats);

  return { github: ghResult, local: localTotal, indexed, stats };
}
