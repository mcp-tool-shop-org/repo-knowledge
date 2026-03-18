/**
 * Claude Games — scoring engine for remediation speedruns.
 */

export { parseWorklist } from './parser.js';
export { scoreGame, POINTS } from './scorer.js';
export { renderReport, renderJSON, renderMarkdown } from './render.js';
export type {
  StatusState,
  RowStatus,
  Findings,
  WorklistRow,
  PlayerScore,
  GameSummary,
} from './types.js';
