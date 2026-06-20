/**
 * Worklist markdown parser.
 *
 * Reads a REMEDIATION-WORKLIST.md table and extracts structured row data.
 * Expected format:
 *   | Status | Slug | Findings (H/M/L) | Pass Rate |
 *   | [x] done by <name> <ts> | posture: healthy | CI: green | <slug> | 1H 2M 3L | 85% |
 */

import type { WorklistRow, RowStatus, Findings } from './types.js';

// F-AG-005: the `done` and `no_action` rows share the SAME status cell
// shape — `[x] done by <player> <ts>`. The pipe-delimited `| 0 findings`
// suffix that distinguishes a no-action close lives in a SEPARATE cell,
// because parseWorklist produces the status cell via split('|'): a pipe
// can NEVER appear inside cells[0]. So no_action is NOT detectable from
// the status cell alone — it is classified from the PARSED CELLS in
// parseRow (a `0 findings` cell, or findings that parse to 0H 0M 0L on a
// done row). parseStatus therefore only ever yields `done` for these
// rows; the no_action upgrade happens downstream. Mis-classifying a
// no-action row as a regular done would credit the ~45-pt perfect-push
// for findings work that didn't happen.
const STATUS_PATTERNS: Record<string, RegExp> = {
  done: /^\[x\]\s*done\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  blocked: /^\[x\]\s*BLOCKED\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  skipped: /^\[x\]\s*skipped\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  claimed: /^\[~\]\s*claimed\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  open: /^\[ \]$/,
};

const FINDINGS_PATTERN = /(?<high>\d+)H\s+(?<medium>\d+)M\s+(?<low>\d+)L/;
const PASS_RATE_PATTERN = /(?<rate>\d+)%/;
// A no-action close marks a repo that was already clean: a `done` row
// carrying an explicit "0 findings" cell (e.g. `| 0 findings |`). This
// must be matched against a parsed cell, not the status cell.
const NO_ACTION_PATTERN = /^0\s+findings$/i;

/**
 * Parse a worklist markdown file into structured rows.
 */
export function parseWorklist(markdown: string): WorklistRow[] {
  const lines = markdown.split('\n');
  const rows: WorklistRow[] = [];

  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    // Skip header + separator
    if (line.includes('Status') || line.includes('---')) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length < 4) continue;

    const statusCell = cells[0];
    const row = parseRow(statusCell, cells);
    if (row) rows.push(row);
  }

  return rows;
}

// F-AG-016: a slug looks like owner/repo with only word chars, dots,
// hyphens, and underscores on either side. The previous "cell.includes('/')"
// heuristic happily matched cells containing CI: green/whatever and any
// stray prose with a slash, causing rows to capture the wrong slug (and
// later iterations OVERWRITING a correct slug when another slash-bearing
// cell came along). First valid wins via the explicit break.
const SLUG_PATTERN = /^[\w.-]+\/[\w.-]+$/;

function parseRow(statusCell: string, cells: string[]): WorklistRow | null {
  // Find the slug — it's the cell that matches owner/repo exactly.
  let slug: string | null = null;
  let findingsStr: string | null = null;
  let passRateStr: string | null = null;

  // F-AG-016 + F-AG-006: slug is first-match-wins. F-AG-006: findings and
  // pass-rate are ALSO first-match-wins (=== null guard) to match the slug
  // logic — last-match-wins left them brittle to column reordering (a later
  // stray "NN%" or "NHNMNL" cell would clobber a correct earlier capture).
  let hasNoActionCell = false;
  for (const cell of cells) {
    if (slug === null && SLUG_PATTERN.test(cell)) {
      slug = cell;
      // First valid slug wins — keep scanning for findings + pass-rate.
    }
    if (findingsStr === null && FINDINGS_PATTERN.test(cell)) findingsStr = cell;
    if (passRateStr === null && PASS_RATE_PATTERN.test(cell)) passRateStr = cell;
    if (NO_ACTION_PATTERN.test(cell)) hasNoActionCell = true;
  }

  if (!slug) return null;

  const findings = parseFindings(findingsStr);
  const passRate = parsePassRate(passRateStr);
  let status = parseStatus(statusCell);

  // F-AG-005: upgrade a `done` row to `no_action` when the parsed cells
  // signal no findings work happened — either an explicit "0 findings"
  // cell, or findings that parse to 0H 0M 0L. Detected from the cells,
  // never the status cell (a pipe can't survive split('|') into cells[0]).
  // The scorer must NOT award the perfect-push bonus to these rows.
  if (status.state === 'done') {
    const zeroFindings = findings.high === 0 && findings.medium === 0 && findings.low === 0;
    if (hasNoActionCell || zeroFindings) {
      status = { ...status, state: 'no_action' };
    }
  }

  return { slug, status, findings, passRate, raw: statusCell };
}

function parseFindings(str: string | null): Findings {
  if (!str) return { high: 0, medium: 0, low: 0 };
  const m = str.match(FINDINGS_PATTERN);
  if (!m?.groups) return { high: 0, medium: 0, low: 0 };
  return {
    high: parseInt(m.groups.high, 10),
    medium: parseInt(m.groups.medium, 10),
    low: parseInt(m.groups.low, 10),
  };
}

function parsePassRate(str: string | null): number {
  if (!str) return 0;
  const m = str.match(PASS_RATE_PATTERN);
  return m?.groups ? parseInt(m.groups.rate, 10) : 0;
}

function parseStatus(cell: string): RowStatus {
  for (const [key, pattern] of Object.entries(STATUS_PATTERNS)) {
    const m = cell.match(pattern);
    if (m?.groups) {
      // no_action is never produced here — it's a cell-level upgrade of a
      // `done` row in parseRow. The status cell only carries the base state.
      return {
        state: key as RowStatus['state'],
        player: m.groups.player,
        timestamp: m.groups.timestamp,
      };
    }
  }

  if (/^\[ \]/.test(cell)) {
    return { state: 'open', player: null, timestamp: null };
  }

  // F-AG-006: previous fallback hard-coded specific player handles
  // (claude-opus-4 | opus-N | opus-main | claude-opus), which made
  // unknown players invisible to the leaderboard. Replace with a
  // generic shape that accepts any conventional player handle and
  // surfaces it as state='done' if it leaks through specific patterns.
  const fallback = cell.match(/^\[x\]\s*done\s+by\s+(?<player>[\w.-]+)\s+(?<timestamp>\S+)/i);
  if (fallback?.groups) {
    return { state: 'done', player: fallback.groups.player, timestamp: fallback.groups.timestamp };
  }

  return { state: 'unknown', player: null, timestamp: null };
}
