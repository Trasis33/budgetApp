// Ratio validation utility (T017)
// Provides tolerance-based validation for two split ratios expected to sum to 100.

export function validateRatios(r1, r2, options = {}) {
  const tolerance = typeof options.tolerance === 'number' ? options.tolerance : 0.5; // ±0.5 default
  const n1 = Number(r1);
  const n2 = Number(r2);
  const sum = n1 + n2;
  if (Number.isNaN(n1) || Number.isNaN(n2)) {
    return { valid: false, reason: 'nan', sum, diff: NaN };
  }
  const diff = Math.abs(100 - sum);
  if (diff <= tolerance) {
    return { valid: true, sum, diff };
  }
  return { valid: false, reason: 'sum_mismatch', sum, diff };
}

export default validateRatios;
