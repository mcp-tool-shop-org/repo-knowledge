/**
 * Build-health renderers — barrel module.
 *
 * Three primitives (Treude & Storey 2010 dichotomy):
 *   - feed:   change since last sync (default surface; high engagement)
 *   - doctor: single-repo deep-dive (decision moment)
 *   - table:  portfolio rollup (JSON-first per McIlroy 1978 / jq design)
 *
 * FT-4 adds two operational-hygiene primitives that live on the same
 * surface (CLI under `rk fsck` / `rk diff`):
 *   - fsck:   DB-integrity checker — writes an audit row per run
 *   - diff:   per-repo DB-entry change history within a time window
 */
export { buildFeed, renderFeedText } from './feed.js';
export type { FeedEvent } from './feed.js';

export { buildRepoDoctor, renderDoctorText } from './doctor.js';
export type { RepoDoctorReport } from './doctor.js';

export { buildHealthTable, renderHealthTableText } from './table.js';
export type { HealthTableRow } from './table.js';

// FT-4: operational hygiene — fsck (DB-integrity audit) + diff
// (per-repo change history).
export { runFsck, renderFsckText } from './fsck.js';
export type { FsckCheck, FsckReport, FsckOptions } from './fsck.js';

export { getRepoDiff, renderRepoDiffText } from './diff.js';
export type {
  RepoDiffReport, RepoDiffOptions,
  NoteAddedEntry, AuditRunEntry,
  DepAuditSnapshotEntry, DepAuditDelta,
  PublishedVersionEntry,
} from './diff.js';
