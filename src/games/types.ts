/**
 * Types for the Claude Games scoring engine.
 *
 * Parses REMEDIATION-WORKLIST.md tables and scores player performance.
 */

export type StatusState = 'done' | 'blocked' | 'skipped' | 'no_action' | 'claimed' | 'open' | 'unknown';

export interface RowStatus {
  state: StatusState;
  player: string | null;
  timestamp: string | null;
}

export interface Findings {
  high: number;
  medium: number;
  low: number;
}

export interface WorklistRow {
  slug: string;
  status: RowStatus;
  findings: Findings;
  passRate: number;
  raw: string;
}

export interface PlayerScore {
  player: string;
  reposDone: number;
  reposBlocked: number;
  reposSkipped: number;
  highsFixed: number;
  mediumsFixed: number;
  lowsFixed: number;
  totalPoints: number;
  perfectPushes: number;
  ciFails: number;
}

export interface GameSummary {
  totalRepos: number;
  done: number;
  blocked: number;
  open: number;
  claimed: number;
  leaderboard: PlayerScore[];
}
