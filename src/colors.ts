/**
 * Zero-dependency terminal color (Stage D visual polish).
 *
 * Color is enabled ONLY when stdout is an interactive TTY and the operator
 * hasn't opted out — so it auto-disables when output is piped to a file, to
 * jq (`--json`), to a test harness (spawnSync pipes), or over the MCP stdio
 * JSON-RPC channel. ANSI codes therefore never pollute a machine-readable
 * stream. `NO_COLOR` (https://no-color.org) and `TERM=dumb` force it off;
 * `FORCE_COLOR` forces it on (for demos / screenshots).
 *
 * Apply color AFTER width-padding a table cell: the ANSI escapes are
 * zero-width, so wrapping an already-padded string preserves column
 * alignment (pad() counts visible characters only).
 */

export function colorEnabled(): boolean {
  const env = process.env;
  if (env.FORCE_COLOR && env.FORCE_COLOR !== '0') return true;
  if (env.NO_COLOR) return false;
  if (env.TERM === 'dumb') return false;
  return Boolean(process.stdout.isTTY);
}

const wrap = (open: number, close: number) => (s: string): string =>
  colorEnabled() ? `\x1b[${open}m${s}\x1b[${close}m` : s;

export const red = wrap(31, 39);
export const green = wrap(32, 39);
export const yellow = wrap(33, 39);
export const blue = wrap(34, 39);
export const magenta = wrap(35, 39);
export const cyan = wrap(36, 39);
export const gray = wrap(90, 39);
export const bold = wrap(1, 22);
export const dim = wrap(2, 22);

type Colorize = (s: string) => string;

/**
 * Map a health-grade / posture / severity / status word to its conventional
 * color function. Unknown words render uncolored. Case-insensitive.
 */
export function statusColor(word: string): Colorize {
  switch (word.toLowerCase()) {
    case 'green':
    case 'healthy':
    case 'pass':
    case 'passing':
    case 'ok':
    case 'clean':
    case 'fixed':
    case 'low':
      return green;
    case 'yellow':
    case 'needs_attention':
    case 'warn':
    case 'warning':
    case 'medium':
    case 'drift':
    case 'partial':
      return yellow;
    case 'red':
    case 'critical':
    case 'fail':
    case 'failing':
    case 'high':
    case 'broken':
    case 'error':
      return red;
    case 'unknown':
    case 'n/a':
    case 'none':
    case 'info':
    case 'skipped':
      return gray;
    default:
      return (s: string) => s;
  }
}

/** Colorize a (already width-padded) cell according to its status word. */
export function colorByStatus(statusWord: string, display: string): string {
  return statusColor(statusWord)(display);
}
