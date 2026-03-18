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

  const completionPct = Math.round(
    ((summary.done + summary.blocked) / summary.totalRepos) * 100,
  );
  lines.push(`  Completion:   ${completionPct}%`);
  lines.push(`  ${'#'.repeat(Math.round(completionPct / 5))}${'·'.repeat(20 - Math.round(completionPct / 5))}`);
  lines.push('');

  // Leaderboard
  lines.push('-'.repeat(60));
  lines.push('  LEADERBOARD');
  lines.push('-'.repeat(60));
  lines.push('');

  const maxPts = summary.leaderboard[0]?.totalPoints || 1;

  for (let i = 0; i < summary.leaderboard.length; i++) {
    const p = summary.leaderboard[i];
    const medal = i < 3 ? MEDALS[i] : `[${i + 1}th]`;
    const barLen = Math.max(1, Math.round((p.totalPoints / maxPts) * BAR_WIDTH));
    const bar = BAR_CHAR.repeat(barLen);

    lines.push(`  ${medal.padEnd(6)} ${p.player.padEnd(20)} ${String(p.totalPoints).padStart(5)} pts  ${bar}`);
    lines.push(`         repos: ${p.reposDone} done, ${p.reposBlocked} blocked | H:${p.highsFixed} M:${p.mediumsFixed} L:${p.lowsFixed} fixed`);
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
