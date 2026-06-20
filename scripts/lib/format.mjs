// scripts/lib/format.mjs — shared formatters for the report generators.
//
// PH-AHG-006: gen-audit-report.mjs and gen-worklist.mjs each carried their
// own copy of formatPassRate and the two DIVERGED (one rendered one decimal
// place, the other rounded; only one had a null guard). Two copies of a
// provenance rule drift. This is the single source of truth — both
// generators import from here so the `~`-tag provenance rule + the null
// behavior can't fork again.
//
// cds-A-005 (the rule this preserves): pass_rate is stored on two scales
// across the portfolio — some rows are 0-1 fractions, others are 0-100
// percentages. The old `value <= 1 ? value * 100 : value` heuristic silently
// renders a true 1% (stored as the integer 1) as "100%". We keep the
// heuristic (the data is genuinely mixed-scale) but TAG the value with a
// leading `~` whenever the fraction branch fired, so a reader can see the
// percent interpretation was inferred from a <= 1 value rather than measured.
// Provenance-on-display: the ambiguous case is visible, not hidden.

/**
 * Format a pass-rate value as a tagged percent string.
 *
 * @param {number|null|undefined} passRate - stored value (0-1 fraction OR 0-100 percent)
 * @param {{ decimals?: number }} [opts] - decimals=1 → "~50.0%"; decimals=0 → "~50%"
 * @returns {string} percent string; leading `~` marks an inferred-from-fraction value; `-` for null
 */
export function formatPassRate(passRate, opts = {}) {
  if (passRate == null) return '-';
  const decimals = opts.decimals ?? 0;
  const render = (n) => (decimals > 0 ? n.toFixed(decimals) : String(Math.round(n)));
  if (passRate <= 1) {
    // Inferred-as-fraction branch: mark it so 1 (→ "~100%") is never
    // mistaken for a measured 100%.
    return '~' + render(passRate * 100) + '%';
  }
  return render(passRate) + '%';
}
