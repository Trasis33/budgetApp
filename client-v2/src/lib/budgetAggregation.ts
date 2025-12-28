import type { BudgetVariance } from '@/api/services/optimizationService';

export interface AggregatedVariance {
  name: string;
  month: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  overagePercentage: number;
  suggestedReduction: number;
  unusedAmount: number;
}

/**
 * Given an array of budget variances potentially containing the same category
 * across multiple months, returns only the most recent month for each category.
 * 
 * This prevents meaningless cumulative totals when the same category appears
 * for multiple months (e.g., summing 3 months of 5,000 budget = 15,000).
 */
export function getLatestVariancePerCategory(
  variances: BudgetVariance[]
): AggregatedVariance[] {
  if (!variances || variances.length === 0) {
    return [];
  }

  // Group by normalized category name
  const byCategory = new Map<string, BudgetVariance[]>();

  for (const v of variances) {
    const key = v.name.trim().toLowerCase();
    const existing = byCategory.get(key);
    if (existing) {
      existing.push(v);
    } else {
      byCategory.set(key, [v]);
    }
  }

  // For each category, select the most recent month
  const result: AggregatedVariance[] = [];

  for (const [, entries] of byCategory) {
    // Sort by month descending - latest first
    const sorted = [...entries].sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    const latest = sorted[0];
    result.push({
      name: latest.name,
      month: latest.month,
      budgetAmount: latest.budgetAmount,
      actualAmount: latest.actualAmount,
      variance: latest.variance,
      overagePercentage: latest.overagePercentage,
      suggestedReduction: latest.suggestedReduction,
      unusedAmount: latest.unusedAmount
    });
  }

  return result;
}

/**
 * Get latest variance with comprehensive edge case handling.
 */
export function getLatestVariancePerCategorySafe(
  variances: BudgetVariance[]
): AggregatedVariance[] {
  if (!variances || variances.length === 0) {
    return [];
  }

  const byCategory = new Map<string, BudgetVariance[]>();

  for (const v of variances) {
    // Edge case: Skip entries with no budget - cant calculate meaningful overage
    if (!v.budgetAmount || v.budgetAmount <= 0) {
      console.warn(`[budgetAggregation] Skipping ${v.name}: zero budget`);
      continue;
    }

    const key = v.name.trim().toLowerCase();
    const existing = byCategory.get(key);
    if (existing) {
      existing.push(v);
    } else {
      byCategory.set(key, [v]);
    }
  }

  const result: AggregatedVariance[] = [];

  for (const [, entries] of byCategory) {
    // Sort by month descending
    const sorted = [...entries].sort((a, b) =>
      b.month.localeCompare(a.month)
    );

    const latest = sorted[0];

    // Edge case: Recalculate overage percentage if it seems wrong
    let overagePercentage = latest.overagePercentage;
    if (latest.budgetAmount > 0) {
      const calculated = ((latest.actualAmount - latest.budgetAmount) / latest.budgetAmount) * 100;
      // Use calculated if API value seems off (more than 5% difference)
      if (Math.abs(calculated - overagePercentage) > 5) {
        console.warn(`[budgetAggregation] ${latest.name}: API overage ${overagePercentage}% differs from calculated ${calculated.toFixed(1)}%`);
        overagePercentage = Math.round(calculated);
      }
    }

    // Edge case: Ensure suggestedReduction doesnt exceed budget
    const suggestedReduction = Math.min(
      latest.suggestedReduction,
      latest.budgetAmount
    );

    result.push({
      name: latest.name,
      month: latest.month,
      budgetAmount: latest.budgetAmount,
      actualAmount: latest.actualAmount,
      variance: latest.variance,
      overagePercentage: Math.max(0, overagePercentage), // No negative overage
      suggestedReduction: Math.max(0, suggestedReduction),
      unusedAmount: Math.max(0, latest.unusedAmount)
    });
  }

  return result;
}

/**
 * Format month string to human-readable label (e.g., "2024-12" -> "December 2024")
 */
export function formatMonthLabel(month: string): string {
  if (!month) return '';
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return month;
  }
  return date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
}
