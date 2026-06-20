/**
 * Sync orchestrator — runs GitHub sync + local scan + FTS reindex.
 *
 * FT-4: each fullSync invocation now writes a sync_runs row at start +
 * UPDATEs it at completion (or in the catch path on thrown error). The
 * caller sees no signature change; the wrapper is transparent and the
 * row gives the operator a permanent audit trail — closes the
 * silent-zero-sync regression that originated FT-4.
 */
import { syncGitHub } from './github.js';
import type { GitHubSyncResult } from './github.js';
import { scanDirectory } from './local.js';
import type { ScanResult } from './local.js';
import { rebuildIndex } from '../search/fts.js';
import { openDb, getStats, insertSyncRun, completeSyncRun } from '../db/init.js';
import type { DbStats } from '../db/init.js';
import { resolveConfig } from '../config.js';

// FT-2: re-export the publish-state sync entry point so callers (CLI,
// MCP) can import the whole sync surface from one place. The legacy
// fullSync orchestrator deliberately does NOT call syncPublishStateForRepo
// — version-channel sync is an opt-in, per-repo operation surfaced via
// `rk versions <slug> --refresh` rather than a bulk scan, because npm
// view + the PyPI JSON API + gh release list are slow and rate-limited
// enough that running them across every repo on every full sync would
// be hostile to the registries.
export { syncPublishStateForRepo } from './publish.js';
export type {
  PublishedVersionRecord,
  PublishSyncSummary,
  RepoBindingRow,
} from './publish.js';

// FT-3.5: research-grounded build-health workers (npm audit, workflow
// action scan + pin grading, CI status, workflow permissions, observed
// toolchain). Same rationale as publish: opt-in per-repo via `rk health
// --refresh`, never on every fullSync — these workers shell out to npm
// audit + gh and would be hostile to the registries at portfolio scale.
export {
  syncNpmAudit,
  scanWorkflowActions,
  syncCiStatus,
  scanWorkflowPermissions,
  observeToolchain,
  syncBuildHealthForRepo,
} from './build-health.js';
export type {
  NpmAuditResult,
  WorkflowActionRef,
  CiStatusResult,
  WorkflowPermissionsScan,
  ObservedToolchainEntry,
  SyncBuildHealthSummary,
  RepoForBuildHealth,
} from './build-health.js';

export interface SyncConfig {
  dbPath?: string;
  owners?: string[];
  localDirs?: string[];
  /**
   * FT-5: max recursion depth for `scanDirectory` when looking for git
   * repos beneath a localDir. Default 4 — covers the common F:/AI or
   * E:/AI workspace tree without pathological deep-tree blowup. Pass
   * 0 to disable recursion entirely (the legacy pre-FT-5 behavior).
   */
  localDepth?: number;
  includeReleases?: boolean;
  includeForks?: boolean;
  /**
   * sync-A-006 (deepened): archive previously-active repos that vanished from
   * the GitHub listing. DEFAULT false — a routine sync only reports them.
   */
  pruneVanished?: boolean;
}

export interface FullSyncResult {
  github: GitHubSyncResult;
  local: ScanResult;
  indexed: number;
  stats: DbStats;
}

/**
 * Full sync: GitHub orgs → local repos → FTS index.
 *
 * FT-4: writes a sync_runs row at start + UPDATEs at completion (or
 * on thrown error). The wrap is transparent — the FullSyncResult shape
 * is unchanged and tests that exercise the throw-path still see the
 * same propagated error after the sync_runs row is finalized.
 */
export async function fullSync(config: SyncConfig = {}): Promise<FullSyncResult> {
  const resolved = resolveConfig({
    dbPath: config.dbPath,
    owners: config.owners,
    localDirs: config.localDirs,
  });

  openDb(resolved.dbPath);

  const owners = resolved.owners;
  const localDirs = resolved.localDirs;

  // FT-4: record the in-progress row up front. owners_json + dirs_scanned_json
  // are JSON-stringified arrays of the operator's intent. exit_code defaults
  // to 0 so a partial run reads as "no error yet"; the catch path below
  // upgrades it to 1 on a thrown error.
  const runId = insertSyncRun({
    owners_json: JSON.stringify(owners),
    dirs_scanned_json: JSON.stringify(localDirs),
    exit_code: 0,
  });

  try {
    // mcp-PH-001: ALL fullSync output here is PROGRESS / DIAGNOSTIC, not the
    // command's result payload (the result is the returned FullSyncResult,
    // which the CLI/MCP caller serializes). Under the MCP StdioServer
    // transport, STDOUT is the JSON-RPC frame channel — any stray
    // console.log here corrupts the stream. So every progress line goes to
    // console.error (stderr); a human running `rk sync` still sees stderr
    // in their terminal, and `--json` consumers piping stdout to jq stay clean.
    console.error('=== GitHub Sync ===');
    const ghResult = syncGitHub(owners, {
      includeReleases: config.includeReleases ?? false,
      includeForks: config.includeForks ?? false,
      pruneVanished: config.pruneVanished ?? false,
    });
    console.error(`GitHub: ${ghResult.synced} synced, ${ghResult.skipped} skipped`);
    if (ghResult.errors.length) {
      console.error(`Errors: ${ghResult.errors.length}`);
      ghResult.errors.forEach(e => console.error(`  ${e}`));
    }
    // sync-A-006: surface vanished candidates that were NOT archived so the
    // operator can investigate rather than discovering silent lifecycle drift.
    if (!config.pruneVanished && ghResult.vanished.length) {
      console.error(
        `\n⚠ ${ghResult.vanished.length} repo(s) were active before but are absent from the GitHub listing (NOT archived):`
      );
      ghResult.vanished.forEach(s => console.error(`  ${s}`));
      console.error(
        `  These may be deleted, renamed, transferred, or private-but-invisible to your token. ` +
        `Confirm with \`gh repo view <slug>\`, then re-run \`rk sync --prune-vanished\` (with a fully-scoped token) to archive them.`
      );
    }

    console.error('\n=== Local Scan ===');
    const localTotal: ScanResult = { scanned: 0, skipped: 0, errors: [] };
    // FT-5: localDepth=4 default propagates into scanDirectory's
    // recursive .git probe. Operator can override to 0 (legacy
    // single-level) or higher for deeper workspace trees.
    const localDepth = config.localDepth ?? 4;
    for (const dir of localDirs) {
      console.error(`Scanning ${dir}...`);
      const result = scanDirectory(dir, { maxDepth: localDepth });
      localTotal.scanned += result.scanned;
      localTotal.skipped += result.skipped;
      localTotal.errors.push(...result.errors);
    }
    console.error(`Local: ${localTotal.scanned} scanned, ${localTotal.skipped} skipped`);
    if (localTotal.errors.length) {
      console.error(`Errors: ${localTotal.errors.length}`);
      localTotal.errors.slice(0, 10).forEach(e => console.error(`  ${e}`));
    }

    console.error('\n=== Rebuilding FTS Index ===');
    const indexed = rebuildIndex();
    console.error(`Indexed ${indexed} entries`);

    console.error('\n=== Stats ===');
    const stats = getStats();
    console.error(stats);

    // FT-4: complete the row. fullSync result doesn't currently
    // distinguish added vs updated vs skipped at the repo grain (the
    // GitHubSyncResult tracks synced + skipped at the github-fetch
    // layer; localTotal mirrors that for the filesystem layer). We
    // map the available signals as faithfully as possible:
    //   repos_added   = github.synced       (newly upserted from GitHub)
    //   repos_updated = local.scanned       (locally re-scanned)
    //   repos_skipped = github.skipped + local.skipped
    // Any future refinement of these counters at the source can flow
    // through here unchanged because the field types are open.
    const aggregatedErrors = [
      ...ghResult.errors.map(e => ({ source: 'github', message: e })),
      ...localTotal.errors.map(e => ({ source: 'local', message: e })),
    ];
    completeSyncRun(runId, {
      repos_added: ghResult.synced,
      repos_updated: localTotal.scanned,
      repos_skipped: ghResult.skipped + localTotal.skipped,
      errors_json: aggregatedErrors.length > 0 ? JSON.stringify(aggregatedErrors) : null,
      exit_code: 0,
    });

    return { github: ghResult, local: localTotal, indexed, stats };
  } catch (err: unknown) {
    // FT-4: thrown-error path. Record the failure shape in errors_json
    // before re-throwing — the operator gets a permanent audit row
    // even when the run crashes.
    const e = err as Error;
    const payload = {
      message: e?.message ?? String(err),
      stack: e?.stack ?? null,
    };
    try {
      completeSyncRun(runId, {
        errors_json: JSON.stringify(payload),
        exit_code: 1,
      });
    } catch {
      // Best-effort — if the DB is in a bad enough state that even
      // the audit-row write fails, we still want the original error
      // to propagate. Don't mask the root cause.
    }
    throw err;
  }
}
