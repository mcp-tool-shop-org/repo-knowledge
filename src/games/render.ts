/**
 * Leaderboard and summary renderer.
 *
 * Outputs a terminal-friendly leaderboard with alignment,
 * or JSON / markdown alternatives.
 */

import type { GameSummary } from './types.js';

const MEDALS = ['[1st]', '[2nd]', '[3rd]'];
const BAR_CHAR = '#';
const BAR_WIDTH = 20;

/**
 * Render the full game report (ASCII terminal).
 */
export function renderReport(summary: GameSummary): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('='.repeat(60));
  lines.push('  CLAUDE GAMES -- REMEDIATION SPEEDRUN');
  lines.push('='.repeat(60));
  lines.push('');

  // Overview
  lines.push(`  Total repos:  ${summary.totalRepos}`);
  lines.push(`  Completed:    ${summary.done}`);
  lines.push(`  Blocked:      ${summary.blocked}`);
  lines.push(`  Open:         ${summary.open}`);
  lines.push(`  In progress:  ${summary.claimed}`);
  lines.push('');

  // F-AG-009: defend the completion math against an empty worklist.
  // The previous code did `(done + blocked) / 0 * 100` producing NaN%
  // and then `String.repeat(NaN)` threw a RangeError on the bar block.
  // Empty input is a legitimate state (just-started game, or a worklist
  // with only open rows) — guard the divide-by-zero and clamp the bar
  // block count so repeat() always sees a finite non-negative integer.
  const completionPct = summary.totalRepos > 0
    ? Math.round(((summary.done + summary.blocked) / summary.totalRepos) * 100)
    : 0;
  lines.push(`  Completion:   ${completionPct}%`);
  const blocks = Math.max(0, Math.min(20, Math.round(completionPct / 5)));
  lines.push(`  ${'#'.repeat(blocks)}${'·'.repeat(20 - blocks)}`);
  lines.push('');

  // Leaderboard
  lines.push('-'.repeat(60));
  lines.push('  LEADERBOARD');
  lines.push('-'.repeat(60));
  lines.push('');

  // F-AG-009: Math.max(1, ...) was already here, but we also need to
  // ensure maxPts is positive even when leaderboard[0].totalPoints is
  // exactly 0 (all-blocked game). `|| 1` covered that case, but the
  // explicit Math.max keeps the intent visible.
  const maxPts = Math.max(1, summary.leaderboard[0]?.totalPoints || 1);

  for (let i = 0; i < summary.leaderboard.length; i++) {
    const p = summary.leaderboard[i];
    const medal = i < 3 ? MEDALS[i] : `[${i + 1}th]`;
    const barLen = Math.max(1, Math.min(BAR_WIDTH, Math.round((p.totalPoints / maxPts) * BAR_WIDTH)));
    const bar = BAR_CHAR.repeat(barLen);

    lines.push(`  ${medal.padEnd(6)} ${p.player.padEnd(20)} ${String(p.totalPoints).padStart(5)} pts  ${bar}`);
    // F-AG-010: blocked and skipped are distinct states and now distinct
    // counters. Show both so a player who blocks 5 repos and skips 0
    // doesn't look identical to one who skips 5 and blocks 0.
    lines.push(
      `         repos: ${p.reposDone} done, ${p.reposBlocked} blocked, ${p.reposSkipped} skipped` +
      ` | H:${p.highsFixed} M:${p.mediumsFixed} L:${p.lowsFixed} fixed`
    );
    lines.push('');
  }

  // Stats
  lines.push('-'.repeat(60));
  lines.push('  STATS');
  lines.push('-'.repeat(60));
  lines.push('');

  const totalH = summary.leaderboard.reduce((s, p) => s + p.highsFixed, 0);
  const totalM = summary.leaderboard.reduce((s, p) => s + p.mediumsFixed, 0);
  const totalL = summary.leaderboard.reduce((s, p) => s + p.lowsFixed, 0);
  const totalPts = summary.leaderboard.reduce((s, p) => s + p.totalPoints, 0);

  lines.push(`  Total findings fixed:  ${totalH}H ${totalM}M ${totalL}L  (${totalH + totalM + totalL} total)`);
  lines.push(`  Total points scored:   ${totalPts}`);
  lines.push(`  Players:               ${summary.leaderboard.length}`);
  lines.push('');
  lines.push('='.repeat(60));
  lines.push('');

  return lines.join('\n');
}

/**
 * Render as JSON.
 */
export function renderJSON(summary: GameSummary): string {
  return JSON.stringify(summary, null, 2);
}

/**
 * Render as markdown table.
 */
export function renderMarkdown(summary: GameSummary): string {
  const lines: string[] = [];

  lines.push('# Claude Games Results\n');
  lines.push('| Rank | Player | Points | Repos Done | Blocked | H Fixed | M Fixed | L Fixed |');
  lines.push('|------|--------|--------|------------|---------|---------|---------|---------|');

  for (let i = 0; i < summary.leaderboard.length; i++) {
    const p = summary.leaderboard[i];
    const medal = i < 3 ? MEDALS[i] : `${i + 1}`;
    lines.push(
      `| ${medal} | ${p.player} | ${p.totalPoints} | ${p.reposDone} | ${p.reposBlocked} | ${p.highsFixed} | ${p.mediumsFixed} | ${p.lowsFixed} |`,
    );
  }

  lines.push('');
  lines.push(`**Total repos:** ${summary.totalRepos} | **Completed:** ${summary.done} | **Blocked:** ${summary.blocked}`);
  lines.push('');

  return lines.join('\n');
}
