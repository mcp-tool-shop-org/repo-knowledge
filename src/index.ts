/**
 * @mcptoolshop/repo-knowledge — public API
 *
 * Primary usage is via CLI (rk) or MCP server.
 * This module exports key functions for programmatic use.
 */

// Config
export { resolveConfig } from './config.js';
export type { RkConfig } from './config.js';

// Database
export {
  openDb, closeDb, getDb,
  upsertRepo, upsertTech, setTopics, upsertFact, upsertDoc, upsertNote,
  upsertRelease, addRelationship,
  getRepo, findRepos, getRelated, getRepoIdBySlug, getAllRepos, getStats,
} from './db/init.js';

// Search
export { rebuildIndex, search, searchRepos } from './search/fts.js';

// Sync
export { fullSync } from './sync/index.js';
export { scanLocalRepo, ingestLocalRepo, scanDirectory, detectTech, indexDocs } from './sync/local.js';
export { fetchGitHubRepos, fetchReleases, syncGitHub } from './sync/github.js';

// Audit
export { DOMAINS, CONTROLS, seedControls, getApplicableControls } from './audit/controls.js';
export { importAudit, importAuditInline } from './audit/import.js';
export {
  getLatestAudit, getAuditPosture, getPortfolioPosture,
  findByAuditStatus, getOpenFindings, getExceptions, compareRuns,
} from './audit/queries.js';

// Types
export type { Control, Domain } from './audit/controls.js';
export type {
  AuditRunInput, ControlResultInput, FindingInput, MetricsInput,
  ImportResult,
} from './audit/import.js';
export type {
  AuditRun, AuditControlResult, AuditFinding, AuditMetrics,
  AuditPosture, PortfolioEntry, RunComparison,
} from './audit/queries.js';
export type { GitHubRepo, GitHubSyncResult, ReleaseInfo } from './sync/github.js';
export type { TechProfile, DocEntry, ScannedRepo, ScanResult, IngestResult } from './sync/local.js';
export type { SearchResult, RepoSearchResult } from './search/fts.js';

// Games (scoring engine)
export * from './games/index.js';
