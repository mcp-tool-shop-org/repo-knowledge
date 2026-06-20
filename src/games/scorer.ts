/**
 * Scoring engine for the Claude Games.
 *
 * Points table:
 *   +10 per high finding fixed
 *   +5  per medium finding fixed
 *   +2  per low finding fixed
 *   +25 posture upgraded to healthy
 *   +20 CI passes on first push (PERFECT PUSH)
 *   -30 CI fails after push
 *   -50 CI fails twice on same repo
 */

import type { WorklistRow, PlayerScore, GameSummary } from './types.js';

export const POINTS = {
  HIGH_FIXED: 10,
  MEDIUM_FIXED: 5,
  LOW_FIXED: 2,
  HEALTHY: 25,
  PERFECT_PUSH: 20,
  CI_FAIL: -30,
  CI_FAIL_TWICE: -50,
} as const;

// PH-AHG-005: a fat-fingered worklist cell (e.g. "999999H") parses to a
// huge count that silently skews the leaderboard. No single repo realistically
// has more than a few hundred findings of one severity, so clamp each parsed
// count to a sane ceiling before it accumulates. NaN / negative collapse to 0.
const MAX_FINDINGS_PER_SEVERITY = 999;

function clampFindingCount(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, MAX_FINDINGS_PER_SEVERITY);
}

/**
 * Score a completed worklist.
 */
export function scoreGame(rows: WorklistRow[]): GameSummary {
  const playerMap = new Map<string, PlayerScore>();

  for (const row of rows) {
    const { status, findings } = row;
    if (!status.player) continue;

    if (!playerMap.has(status.player)) {
      playerMap.set(status.player, {
        player: status.player,
        reposDone: 0,
        reposBlocked: 0,
        reposSkipped: 0,
        highsFixed: 0,
        mediumsFixed: 0,
        lowsFixed: 0,
        totalPoints: 0,
        perfectPushes: 0,
        ciFails: 0,
      });
    }

    const p = playerMap.get(status.player)!;

    switch (status.state) {
      case 'done': {
        p.reposDone++;
        // PH-AHG-005: clamp each count so an absurd parsed value (e.g.
        // "999999H") can't skew the board. Done once, then both the
        // counters and the points use the bounded values.
        const high = clampFindingCount(findings.high);
        const medium = clampFindingCount(findings.medium);
        const low = clampFindingCount(findings.low);
        // Assume all findings were fixed for done repos
        p.highsFixed += high;
        p.mediumsFixed += medium;
        p.lowsFixed += low;
        // Points for findings
        p.totalPoints += high * POINTS.HIGH_FIXED;
        p.totalPoints += medium * POINTS.MEDIUM_FIXED;
        p.totalPoints += low * POINTS.LOW_FIXED;
        // Healthy bonus
        p.totalPoints += POINTS.HEALTHY;
        // Assume perfect push (we can't detect CI fails from the worklist alone)
        p.perfectPushes++;
        p.totalPoints += POINTS.PERFECT_PUSH;
        break;
      }
      // F-AG-010: blocked and skipped roll into separate counters so
      // the leaderboard can show "what the player chose not to fix"
      // (blocked = constraint outside their control; skipped = chose
      // to drop) as distinct categories. PlayerScore.reposSkipped is
      // already in the type — this just wires the case label to it.
      case 'blocked':
        p.reposBlocked++;
        break;
      case 'skipped':
        p.reposSkipped++;
        break;
      case 'no_action':
        p.reposDone++;
        break;
    }
  }

  const leaderboard = [...playerMap.values()].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  return {
    totalRepos: rows.length,
    done: rows.filter((r) => r.status.state === 'done' || r.status.state === 'no_action').length,
    blocked: rows.filter((r) => r.status.state === 'blocked' || r.status.state === 'skipped').length,
    open: rows.filter((r) => r.status.state === 'open').length,
    claimed: rows.filter((r) => r.status.state === 'claimed').length,
    leaderboard,
  };
}
