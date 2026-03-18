import { describe, it, expect } from 'vitest';
import { parseWorklist } from '../src/games/parser.js';
import { scoreGame, POINTS } from '../src/games/scorer.js';
import { renderReport, renderJSON, renderMarkdown } from '../src/games/render.js';
import type { GameSummary, WorklistRow } from '../src/games/types.js';

// ─── Parser Tests ────────────────────────────────────────────────────────────

describe('parseWorklist', () => {
  it('parses a done row', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [x] done by claude-opus-4 2026-03-18T19:47 | posture: healthy | CI: green | mcp-tool-shop-org/backprop | 0H 3M 2L | 84% |`;

    const rows = parseWorklist(md);
    expect(rows.length).toBe(1);
    expect(rows[0].slug).toBe('mcp-tool-shop-org/backprop');
    expect(rows[0].status.state).toBe('done');
    expect(rows[0].status.player).toBe('claude-opus-4');
    expect(rows[0].findings.high).toBe(0);
    expect(rows[0].findings.medium).toBe(3);
    expect(rows[0].findings.low).toBe(2);
    expect(rows[0].passRate).toBe(84);
  });

  it('parses a blocked row', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [x] BLOCKED claude-opus-4 2026-03-18T20:04 | repo not on GitHub | mcp-tool-shop-org/mcp-personify | 0H 2M 2L | 77% |`;

    const rows = parseWorklist(md);
    expect(rows.length).toBe(1);
    expect(rows[0].status.state).toBe('blocked');
    expect(rows[0].status.player).toBe('claude-opus-4');
  });

  it('parses an open row', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [ ] | mcp-tool-shop-org/some-repo | 1H 2M 1L | 62% |`;

    const rows = parseWorklist(md);
    expect(rows.length).toBe(1);
    expect(rows[0].status.state).toBe('open');
    expect(rows[0].status.player).toBeNull();
    expect(rows[0].findings.high).toBe(1);
  });

  it('parses a claimed row', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [~] claimed by opus-2 2026-03-18T20:03 | mcp-tool-shop-org/npm-xrpl-camp | 2H 2M 0L | 49% |`;

    const rows = parseWorklist(md);
    expect(rows.length).toBe(1);
    expect(rows[0].status.state).toBe('claimed');
    expect(rows[0].status.player).toBe('opus-2');
  });

  it('handles multiple rows', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [x] done by opus-1 2026-03-18T19:40 | posture: healthy | CI: green | mcp-tool-shop-org/CodeClone-Desktop | 4H 2M 0L | 51% |
| [ ] | mcp-tool-shop-org/commandui | 0H 3M 2L | 66% |
| [x] BLOCKED claude-opus 2026-03-18T19:53 | repo not on GitHub | mcp-tool-shop-org/homevault | 1H 1M 2L | 81% |`;

    const rows = parseWorklist(md);
    expect(rows.length).toBe(3);
    expect(rows[0].status.state).toBe('done');
    expect(rows[1].status.state).toBe('open');
    expect(rows[2].status.state).toBe('blocked');
  });

  it('returns empty array for no table', () => {
    const rows = parseWorklist('# Just a heading\nSome text');
    expect(rows.length).toBe(0);
  });

  it('parses findings correctly', () => {
    const md = `| Status | Slug | Findings | Pass Rate |
|--------|------|----------|-----------|
| [ ] | org/repo | 3H 1M 3L | 64% |`;

    const rows = parseWorklist(md);
    expect(rows[0].findings).toEqual({ high: 3, medium: 1, low: 3 });
  });
});

// ─── Scorer Tests ────────────────────────────────────────────────────────────

describe('scoreGame', () => {
  it('scores a single done repo', () => {
    const rows: WorklistRow[] = [
      {
        slug: 'org/repo',
        status: { state: 'done', player: 'claude-opus-4', timestamp: '2026-03-18T19:47' },
        findings: { high: 1, medium: 2, low: 3 },
        passRate: 84,
        raw: '',
      },
    ];

    const summary = scoreGame(rows);
    expect(summary.leaderboard.length).toBe(1);

    const p = summary.leaderboard[0];
    expect(p.player).toBe('claude-opus-4');
    expect(p.reposDone).toBe(1);
    expect(p.highsFixed).toBe(1);
    expect(p.mediumsFixed).toBe(2);
    expect(p.lowsFixed).toBe(3);

    const expected =
      1 * POINTS.HIGH_FIXED +
      2 * POINTS.MEDIUM_FIXED +
      3 * POINTS.LOW_FIXED +
      POINTS.HEALTHY +
      POINTS.PERFECT_PUSH;
    expect(p.totalPoints).toBe(expected);
  });

  it('scores blocked repos without points', () => {
    const rows: WorklistRow[] = [
      {
        slug: 'org/blocked',
        status: { state: 'blocked', player: 'opus-1', timestamp: '2026-03-18T20:00' },
        findings: { high: 2, medium: 1, low: 0 },
        passRate: 0,
        raw: '',
      },
    ];

    const summary = scoreGame(rows);
    const p = summary.leaderboard[0];
    expect(p.reposBlocked).toBe(1);
    expect(p.totalPoints).toBe(0);
  });

  it('ranks players by total points', () => {
    const rows: WorklistRow[] = [
      {
        slug: 'org/a',
        status: { state: 'done', player: 'opus-1', timestamp: 't1' },
        findings: { high: 3, medium: 0, low: 0 },
        passRate: 80,
        raw: '',
      },
      {
        slug: 'org/b',
        status: { state: 'done', player: 'opus-2', timestamp: 't2' },
        findings: { high: 0, medium: 1, low: 0 },
        passRate: 90,
        raw: '',
      },
    ];

    const summary = scoreGame(rows);
    expect(summary.leaderboard[0].player).toBe('opus-1');
    expect(summary.leaderboard[1].player).toBe('opus-2');
  });

  it('counts summary stats correctly', () => {
    const rows: WorklistRow[] = [
      { slug: 'a', status: { state: 'done', player: 'p1', timestamp: 't' }, findings: { high: 0, medium: 0, low: 0 }, passRate: 0, raw: '' },
      { slug: 'b', status: { state: 'blocked', player: 'p1', timestamp: 't' }, findings: { high: 0, medium: 0, low: 0 }, passRate: 0, raw: '' },
      { slug: 'c', status: { state: 'open', player: null, timestamp: null }, findings: { high: 0, medium: 0, low: 0 }, passRate: 0, raw: '' },
      { slug: 'd', status: { state: 'claimed', player: 'p2', timestamp: 't' }, findings: { high: 0, medium: 0, low: 0 }, passRate: 0, raw: '' },
    ];

    const summary = scoreGame(rows);
    expect(summary.totalRepos).toBe(4);
    expect(summary.done).toBe(1);
    expect(summary.blocked).toBe(1);
    expect(summary.open).toBe(1);
    expect(summary.claimed).toBe(1);
  });
});

// ─── Render Tests ────────────────────────────────────────────────────────────

const MOCK_SUMMARY: GameSummary = {
  totalRepos: 71,
  done: 55,
  blocked: 12,
  open: 2,
  claimed: 2,
  leaderboard: [
    { player: 'claude-opus-4', reposDone: 14, reposBlocked: 8, reposSkipped: 0, highsFixed: 3, mediumsFixed: 25, lowsFixed: 18, totalPoints: 804, perfectPushes: 11, ciFails: 3 },
    { player: 'opus-2', reposDone: 12, reposBlocked: 1, reposSkipped: 0, highsFixed: 15, mediumsFixed: 18, lowsFixed: 10, totalPoints: 720, perfectPushes: 10, ciFails: 2 },
    { player: 'opus-1', reposDone: 10, reposBlocked: 1, reposSkipped: 0, highsFixed: 12, mediumsFixed: 12, lowsFixed: 6, totalPoints: 650, perfectPushes: 9, ciFails: 1 },
  ],
};

describe('renderReport', () => {
  it('includes the header', () => {
    const out = renderReport(MOCK_SUMMARY);
    expect(out).toContain('CLAUDE GAMES');
    expect(out).toContain('LEADERBOARD');
  });

  it('shows all players', () => {
    const out = renderReport(MOCK_SUMMARY);
    expect(out).toContain('claude-opus-4');
    expect(out).toContain('opus-2');
    expect(out).toContain('opus-1');
  });

  it('shows repo counts', () => {
    const out = renderReport(MOCK_SUMMARY);
    expect(out).toContain('71');
    expect(out).toContain('55');
  });

  it('shows medals', () => {
    const out = renderReport(MOCK_SUMMARY);
    expect(out).toContain('[1st]');
    expect(out).toContain('[2nd]');
    expect(out).toContain('[3rd]');
  });
});

describe('renderJSON', () => {
  it('produces valid JSON', () => {
    const out = renderJSON(MOCK_SUMMARY);
    const parsed = JSON.parse(out);
    expect(parsed.totalRepos).toBe(71);
    expect(parsed.leaderboard.length).toBe(3);
  });
});

describe('renderMarkdown', () => {
  it('produces a markdown table', () => {
    const out = renderMarkdown(MOCK_SUMMARY);
    expect(out).toContain('| Rank |');
    expect(out).toContain('[1st]');
    expect(out).toContain('claude-opus-4');
  });
});
