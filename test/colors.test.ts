/**
 * Stage D: terminal color discipline. The load-bearing invariant is that color
 * is OFF when output is not an interactive TTY (piped to jq/--json, a test
 * harness, or the MCP stdio JSON-RPC channel) or when NO_COLOR is set — so ANSI
 * codes never pollute a machine-readable stream. A regression here would corrupt
 * --json output and MCP responses, so it is pinned directly.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { colorEnabled, red, green, statusColor, colorByStatus } from '../src/colors.js';

const ORIG = { ...process.env };
const ORIG_TTY = process.stdout.isTTY;

afterEach(() => {
  process.env = { ...ORIG };
  Object.defineProperty(process.stdout, 'isTTY', { value: ORIG_TTY, configurable: true });
});

function setTTY(v: boolean) {
  Object.defineProperty(process.stdout, 'isTTY', { value: v, configurable: true });
}

describe('color discipline (colors.ts)', () => {
  it('is OFF when stdout is not a TTY (piped output, tests, MCP, --json)', () => {
    delete process.env.NO_COLOR; delete process.env.FORCE_COLOR;
    setTTY(false);
    expect(colorEnabled()).toBe(false);
    expect(red('x')).toBe('x'); // no ANSI codes leak into a pipe
  });

  it('respects NO_COLOR even on a TTY', () => {
    setTTY(true);
    process.env.NO_COLOR = '1'; delete process.env.FORCE_COLOR;
    expect(colorEnabled()).toBe(false);
    expect(green('ok')).toBe('ok');
  });

  it('respects TERM=dumb', () => {
    setTTY(true);
    delete process.env.NO_COLOR; delete process.env.FORCE_COLOR;
    process.env.TERM = 'dumb';
    expect(colorEnabled()).toBe(false);
  });

  it('is ON for an interactive TTY without opt-out', () => {
    setTTY(true);
    delete process.env.NO_COLOR; delete process.env.FORCE_COLOR; delete process.env.TERM;
    expect(colorEnabled()).toBe(true);
    expect(red('x')).toContain('\x1b[31m');
  });

  it('FORCE_COLOR forces color on even off a TTY (demos/screenshots)', () => {
    setTTY(false);
    delete process.env.NO_COLOR;
    process.env.FORCE_COLOR = '1';
    expect(colorEnabled()).toBe(true);
  });

  it('maps health/severity words to conventional colors; colorByStatus preserves the visible text when off', () => {
    setTTY(false); delete process.env.FORCE_COLOR; // color off
    // statusColor returns a function; with color off it is identity on content.
    expect(statusColor('critical')('x')).toBe('x');
    expect(statusColor('healthy')('x')).toBe('x');
    // colorByStatus must not alter the (padded) display string when color is off —
    // this is what keeps column alignment + plain-text assertions intact.
    expect(colorByStatus('green', 'green  ')).toBe('green  ');
    expect(colorByStatus('unknown-word', 'cell')).toBe('cell');
  });
});
