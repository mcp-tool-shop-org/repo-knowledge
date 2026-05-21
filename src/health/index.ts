/**
 * Build-health renderers — barrel module.
 *
 * Three primitives (Treude & Storey 2010 dichotomy):
 *   - feed:   change since last sync (default surface; high engagement)
 *   - doctor: single-repo deep-dive (decision moment)
 *   - table:  portfolio rollup (JSON-first per McIlroy 1978 / jq design)
 */
export { buildFeed, renderFeedText } from './feed.js';
export type { FeedEvent } from './feed.js';

export { buildRepoDoctor, renderDoctorText } from './doctor.js';
export type { RepoDoctorReport } from './doctor.js';

export { buildHealthTable, renderHealthTableText } from './table.js';
export type { HealthTableRow } from './table.js';
