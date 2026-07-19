// Small date helpers for the FSD §5 rules (Module 2.D). FleetLink dates are ISO 'YYYY-MM-DD' strings
// (see the seed and the model). Because ISO dates sort lexicographically, `a <= b` on the strings is a
// correct date comparison — we only need real date maths for the "within N days" SLA window (rule 6).
export function todayIso(clock) {
  // `clock` lets tests pin a deterministic server "today"; production passes nothing and uses the real one.
  if (clock) return clock;
  return new Date().toISOString().slice(0, 10);
}

export function isIsoDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

// Whole days from `from` to `to` (both ISO strings). Positive when `to` is after `from`.
export function diffDays(from, to) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(to) - Date.parse(from)) / MS);
}
