/**
 * Worklist markdown parser.
 *
 * Reads a REMEDIATION-WORKLIST.md table and extracts structured row data.
 * Expected format:
 *   | Status | Slug | Findings (H/M/L) | Pass Rate |
 *   | [x] done by <name> <ts> | posture: healthy | CI: green | <slug> | 1H 2M 3L | 85% |
 */

import type { WorklistRow, RowStatus, Findings } from './types.js';

const STATUS_PATTERNS: Record<string, RegExp> = {
  done: /^\[x\]\s*done\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  blocked: /^\[x\]\s*BLOCKED\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  skipped: /^\[x\]\s*skipped\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  noAction: /^\[x\]\s*done\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)\s*\|\s*0 findings/,
  claimed: /^\[~\]\s*claimed\s+by\s+(?<player>\S+)\s+(?<timestamp>\S+)/,
  open: /^\[ \]$/,
};

const FINDINGS_PATTERN = /(?<high>\d+)H\s+(?<medium>\d+)M\s+(?<low>\d+)L/;
const PASS_RATE_PATTERN = /(?<rate>\d+)%/;

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

function parseRow(statusCell: string, cells: string[]): WorklistRow | null {
  // Find the slug — it's the cell that looks like owner/repo
  let slug: string | null = null;
  let findingsStr: string | null = null;
  let passRateStr: string | null = null;

  for (const cell of cells) {
    if (cell.includes('/') && !cell.startsWith('[') && !cell.includes('posture')) {
      slug = cell;
    }
    const fm = cell.match(FINDINGS_PATTERN);
    if (fm) findingsStr = cell;
    const pm = cell.match(PASS_RATE_PATTERN);
    if (pm) passRateStr = cell;
  }

  if (!slug) return null;

  const findings = parseFindings(findingsStr);
  const passRate = parsePassRate(passRateStr);
  const status = parseStatus(statusCell);

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
      return {
        state: key === 'noAction' ? 'no_action' : key as RowStatus['state'],
        player: m.groups.player,
        timestamp: m.groups.timestamp,
      };
    }
  }

  if (/^\[ \]/.test(cell)) {
    return { state: 'open', player: null, timestamp: null };
  }

  // Fallback for any [x] pattern we didn't match specifically
  const fallback = cell.match(/^\[x\].*?(?<player>claude-opus-4|opus-\d|opus-main|claude-opus)\s+(?<timestamp>\S+)/);
  if (fallback?.groups) {
    return { state: 'done', player: fallback.groups.player, timestamp: fallback.groups.timestamp };
  }

  return { state: 'unknown', player: null, timestamp: null };
}
