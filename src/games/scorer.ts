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
        // Assume all findings were fixed for done repos
        p.highsFixed += findings.high;
        p.mediumsFixed += findings.medium;
        p.lowsFixed += findings.low;
        // Points for findings
        p.totalPoints += findings.high * POINTS.HIGH_FIXED;
        p.totalPoints += findings.medium * POINTS.MEDIUM_FIXED;
        p.totalPoints += findings.low * POINTS.LOW_FIXED;
        // Healthy bonus
        p.totalPoints += POINTS.HEALTHY;
        // Assume perfect push (we can't detect CI fails from the worklist alone)
        p.perfectPushes++;
        p.totalPoints += POINTS.PERFECT_PUSH;
        break;
      }
      case 'blocked':
      case 'skipped':
        p.reposBlocked++;
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
