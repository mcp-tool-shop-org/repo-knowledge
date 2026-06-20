/**
 * @mcptoolshop/repo-knowledge — public API
 *
 * Primary usage is via CLI (rk) or MCP server.
 * This module exports key functions for programmatic use.
 */

// Config
export {
  resolveConfig,
  // FT-5: owners-in-config helpers (atomic write, in-place edit).
  readRkConfigFile, writeRkConfigFile,
  listOwners, addOwner, removeOwner,
} from './config.js';
export type { RkConfig } from './config.js';

// Shared enum tuples — single source of truth for CLI + MCP validators.
// Mirror the CHECK constraints in src/db/schema.sql for repo_notes.note_type
// and repo_relationships.relation_type. Declared here (not re-exported from
// cli.js) because importing cli.js would trigger commander.parseAsync at
// module load when index.js is used as a library.
export const NOTE_TYPES = [
  'thesis', 'architecture', 'warning', 'next_step',
  'drift_risk', 'release_summary', 'convention',
  'pain_point', 'command', 'general',
] as const;

export const RELATION_TYPES = [
  'depends_on', 'related_to', 'supersedes',
  'shares_domain_with', 'shares_package_with', 'companion_to',
  // FT-5: cross-tool vocabulary
  // 'wraps' — A is a higher-level wrapper around B (e.g. an MCP server
  //   that wraps a CLI tool).
  // 'collaborated_in_mission' — A and B worked together inside a Role
  //   OS mission (cross-tool cooperation evidence).
  'wraps', 'collaborated_in_mission',
] as const;

// mcp-PH-004: repo lifecycle status values — single source of truth mirroring
// the repos.status CHECK constraint in src/db/schema.sql. Same shared-tuple
// pattern as NOTE_TYPES / RELATION_TYPES: server.ts's find_repos Zod enum
// imports this so the MCP filter can't drift from the DB CHECK by hand.
export const REPO_STATUSES = [
  'active', 'paused', 'archived', 'unknown',
] as const;

export type NoteType = (typeof NOTE_TYPES)[number];
export type RelationType = (typeof RELATION_TYPES)[number];
export type RepoStatus = (typeof REPO_STATUSES)[number];

// Database
export {
  openDb, closeDb, getDb,
  upsertRepo, upsertTech, setTopics, upsertFact, upsertDoc, upsertNote,
  upsertRelease, addRelationship,
  getRepo, findRepos, getRelated, getRepoIdBySlug, getAllRepos, getStats,
  // F-BE-FT1: lifecycle + cross-rig path helpers (migration-006). Surface
  // them from the public API so MCP server and integration tests can
  // reach them without importing from db/init directly.
  upsertRig, getRig, listRigs,
  upsertRepoLocalPath, getRepoLocalPaths,
  deleteRepoBySlug, archiveRepoBySlug, setReplacedBy, findStaleArchived,
  // F-BE-FT2: publish-state helpers (migration-007). Surface bindings +
  // version registry so MCP, sync workers, and CLI all read the same
  // shape from one place.
  upsertPublishedVersion, getLatestPublishedVersion, listPublishedVersions,
  setRepoPackageNames, getReposByNpmPackage,
  PUBLISHER_METHODS, PUBLISHED_VERSION_CHANNELS,
  // FT-3 / FT-3.5: build-health helpers (migrations 008 + 009). Research-
  // grounded — every column / table cited inline in db/init.ts and
  // db/migration-00{8,9}-*.sql to specific 2022-2026 findings.
  upsertDepAuditState, getDepAuditState,
  appendDepAuditHistory, getDepAuditHistory,
  upsertWorkflowAction, listWorkflowActions,
  upsertWorkflowPermissions, listWorkflowPermissions,
  upsertObservedToolchain, listObservedToolchain, getToolchainDrift,
  setRepoCiStatus, setRepoToolchainPin,
  getPortfolioHealth,
  CI_STATUSES, PIN_QUALITIES,
  // FT-4: operational hygiene run tables (migration-010). db_health_runs
  // is the audit trail of `rk fsck` invocations; sync_runs gives the
  // sync surface its missing observability.
  insertDbHealthRun, listDbHealthRuns, getLatestDbHealthRun,
  insertSyncRun, completeSyncRun, listSyncRuns,
  // FT-5: cross-tool vocabulary + forge-vault path (migration-011).
  // setRepoForgeVaultPath / getRepoForgeVaultPath surface the new column
  // for game repos pointing at their forge-vault wing.
  setRepoForgeVaultPath, getRepoForgeVaultPath,
} from './db/init.js';
export type {
  RigRow, RepoLocalPathRow,
  PublishedVersionRow, PublishedVersionUpsert,
  PublisherMethod, PublishedVersionChannel,
  // FT-3 / FT-3.5 types
  DepAuditStateRow, DepAuditStateUpsert,
  DepAuditHistoryRow,
  WorkflowActionRow, WorkflowActionUpsert,
  WorkflowPermissionsRow, WorkflowPermissionsUpsert,
  ObservedToolchainRow, ObservedToolchainUpsert,
  ToolchainDriftRow,
  PortfolioHealthRow,
  CiStatus, PinQuality, ToolchainPin,
  // FT-4 types
  DbHealthRunRow, DbHealthRunInsert,
  SyncRunRow, SyncRunInsert, SyncRunComplete,
} from './db/init.js';

// Sync (publish state)
export {
  syncNpmVersion, syncPyPIVersion, syncGitHubReleases, syncPublishStateForRepo,
} from './sync/publish.js';
export type { PublishedVersionRecord, RepoBindingRow, PublishSyncSummary } from './sync/publish.js';

// Sync (build health — FT-3.5)
export {
  syncNpmAudit, scanWorkflowActions, syncCiStatus,
  scanWorkflowPermissions, observeToolchain, syncBuildHealthForRepo,
} from './sync/build-health.js';
export type {
  NpmAuditResult, WorkflowActionRef, CiStatusResult,
  WorkflowPermissionsScan, ObservedToolchainEntry,
  SyncBuildHealthSummary, RepoForBuildHealth,
} from './sync/build-health.js';

// Health renderers (FT-3.5) + operational hygiene (FT-4)
export {
  buildFeed, renderFeedText,
  buildRepoDoctor, renderDoctorText,
  buildHealthTable, renderHealthTableText,
  // FT-4
  runFsck, renderFsckText,
  getRepoDiff, renderRepoDiffText,
} from './health/index.js';
export type {
  FeedEvent, RepoDoctorReport, HealthTableRow,
  // FT-4
  FsckCheck, FsckReport, FsckOptions,
  RepoDiffReport, RepoDiffOptions,
  NoteAddedEntry, AuditRunEntry,
  DepAuditSnapshotEntry, DepAuditDelta,
  PublishedVersionEntry,
} from './health/index.js';

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
