import { Category } from '../types';

export interface AllocationResult {
  categoryId: number;
  categoryName: string;
  allocatedAmount: number;
  percentOfBucket: number;
  constraintApplied?: 'min' | 'max' | null;
}

interface AllocationState {
  categoryId: number;
  categoryName: string;
  weight: number;
  minPct?: number;
  maxPct?: number;
  rawShare: number;
  allocatedAmount: number;
  percentOfBucket: number;
  constraintApplied: 'min' | 'max' | null;
  isFixed?: boolean;
}

/**
 * Helper function to determine if rounding should be applied to a category.
 * Fixed expenses (is_fixed = true) should retain precise calculated values.
 * Flexible expenses should be rounded to nearest 10 for cleaner budget numbers.
 */
function shouldRoundToTen(category: Category): boolean {
  // Fixed expenses get precise values, flexible categories get rounded
  return !category.is_fixed;
}

/**
 * Apply rounding to a budget amount based on category type.
 * Fixed expenses: no rounding (precise)
 * Flexible expenses: round to nearest 10
 */
function roundBudgetAmount(amount: number, category: Category): number {
  if (shouldRoundToTen(category)) {
    return Math.round(amount / 10) * 10;
  }
  return amount;
}

/**
 * Apply rounding to a budget amount based on isFixed flag.
 * Fixed expenses: no rounding (precise)
 * Flexible expenses: round to nearest 10
 */
function roundBudgetAmountByFlag(amount: number, isFixed: boolean | undefined): number {
  if (!isFixed) {
    return Math.round(amount / 10) * 10;
  }
  return amount;
}

/**
 * Calculate weighted allocations for categories within a spending role bucket.
 * 
 * Algorithm:
 * 1. Sum all category weights in the bucket
 * 2. Calculate proportional share for each category
 * 3. Apply min/max guardrails iteratively
 * 4. Re-normalize remaining budget for unconstrained categories
 * 
 * @param categories Categories to allocate budget across
 * @param bucketBudget Total budget to distribute
 * @returns Final allocation results with constraints applied
 */
export function calculateWeightedAllocations(
  categories: Category[],
  bucketBudget: number
): AllocationResult[] {
  if (categories.length === 0 || bucketBudget <= 0) {
    return [];
  }

  // Step 1: Calculate total weight
  const totalWeight = categories.reduce(
    (sum, cat) => sum + (cat.budget_weight ?? 0.5),
    0
  );

  // Step 2: Initial proportional allocation
  let allocations: AllocationState[] = categories.map(cat => {
    const weight = cat.budget_weight ?? 0.5;
    const share = totalWeight > 0 ? weight / totalWeight : 1 / categories.length;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      weight,
      minPct: cat.budget_min_pct,
      maxPct: cat.budget_max_pct,
      rawShare: share,
      allocatedAmount: roundBudgetAmount(bucketBudget * share, cat),
      percentOfBucket: share * 100,
      constraintApplied: null,
      isFixed: cat.is_fixed,
    };
  });

  // Step 3: Apply guardrails with redistribution
  let iterations = 0;
  const maxIterations = 5; // Prevent infinite loops
  let needsRebalance = true;

  while (needsRebalance && iterations < maxIterations) {
    needsRebalance = false;
    iterations++;

    let lockedBudget = 0;
    let unlockedWeight = 0;
    const lockedCategories = new Set<number>();

    // Check min constraints
    for (const alloc of allocations) {
      if (alloc.minPct !== undefined && alloc.minPct !== null) {
        const minAmount = bucketBudget * alloc.minPct;
        if (alloc.allocatedAmount < minAmount) {
          alloc.allocatedAmount = roundBudgetAmountByFlag(minAmount, alloc.isFixed);
          alloc.constraintApplied = 'min';
          lockedCategories.add(alloc.categoryId);
          needsRebalance = true;
        }
      }
    }

    // Check max constraints
    for (const alloc of allocations) {
      if (alloc.maxPct !== undefined && alloc.maxPct !== null) {
        const maxAmount = bucketBudget * alloc.maxPct;
        if (alloc.allocatedAmount > maxAmount) {
          alloc.allocatedAmount = roundBudgetAmountByFlag(maxAmount, alloc.isFixed);
          alloc.constraintApplied = 'max';
          lockedCategories.add(alloc.categoryId);
          needsRebalance = true;
        }
      }
    }

    // Redistribute if needed
    if (needsRebalance) {
      // Calculate locked vs unlocked budget
      for (const alloc of allocations) {
        if (lockedCategories.has(alloc.categoryId)) {
          lockedBudget += alloc.allocatedAmount;
        } else {
          unlockedWeight += alloc.weight;
        }
      }

      const remainingBudget = bucketBudget - lockedBudget;

      // Redistribute to unlocked categories
      for (const alloc of allocations) {
        if (!lockedCategories.has(alloc.categoryId)) {
          const share = unlockedWeight > 0
            ? alloc.weight / unlockedWeight
            : 1 / (allocations.length - lockedCategories.size);
          alloc.allocatedAmount = roundBudgetAmountByFlag(remainingBudget * share, alloc.isFixed);
          alloc.percentOfBucket = (alloc.allocatedAmount / bucketBudget) * 100;
        }
      }
    }
  }

  // Update final percentages and return results
  return allocations.map(a => ({
    categoryId: a.categoryId,
    categoryName: a.categoryName,
    allocatedAmount: Math.max(0, a.allocatedAmount), // Prevent negative from rounding
    percentOfBucket: bucketBudget > 0 ? (a.allocatedAmount / bucketBudget) * 100 : 0,
    constraintApplied: a.constraintApplied,
  }));
}

/**
 * Fallback weights for common category names when database weight is missing.
 * Used for graceful degradation and new category suggestions.
 * 
 * Weights are on 0.0-1.0 scale, where higher = greater priority within the bucket.
 */
export const DEFAULT_CATEGORY_WEIGHTS: Record<string, number> = {
  // Needs - High Priority
  'groceries': 0.80,
  'mortgage': 0.90,
  'rent': 0.90,
  'utilities': 0.70,
  'transportation': 0.60,
  'healthcare': 0.75,
  'insurance': 0.70,
  'internet': 0.60,
  'phone': 0.55,
  'gas': 0.65,
  'electricity': 0.70,
  'water': 0.65,
  
  // Wants - Variable Priority
  'dining out': 0.50,
  'dining': 0.50,
  'restaurants': 0.50,
  'entertainment': 0.40,
  'movies': 0.35,
  'cinema': 0.35,
  'kids clothes': 0.55,
  'clothing': 0.45,
  'clothes': 0.45,
  'household items': 0.45,
  'household': 0.45,
  'home': 0.45,
  'shopping': 0.40,
  'subscriptions': 0.20,
  'streaming': 0.15,
  'apps': 0.15,
  'hobbies': 0.35,
  'hobby': 0.35,
  'gifts': 0.30,
  'personal': 0.35,
  'miscellaneous': 0.30,
  'misc': 0.30,
  'other': 0.25,
  
  // Savings - High Priority
  'savings': 0.90,
  'savings account': 0.90,
  'emergency fund': 0.95,
  'emergency': 0.95,
  'investments': 0.85,
  'retirement': 0.90,
  'pension': 0.90,
  'investment': 0.85,
};

/**
 * Get weight for a category, using database value or falling back to defaults.
 * 
 * Priority:
 * 1. Database budget_weight field
 * 2. Name-based lookup in DEFAULT_CATEGORY_WEIGHTS
 * 3. spending_role-based default
 * 4. Generic fallback (0.40)
 */
export function getCategoryWeight(category: Category): number {
  // Use database value if available
  if (category.budget_weight !== undefined && category.budget_weight !== null) {
    return Math.max(0, Math.min(1, category.budget_weight)); // Clamp to 0-1
  }
  
  // Try name-based lookup
  const nameKey = category.name.toLowerCase().trim();
  for (const [pattern, weight] of Object.entries(DEFAULT_CATEGORY_WEIGHTS)) {
    if (nameKey.includes(pattern)) {
      return weight;
    }
  }
  
  // Fallback based on spending_role
  switch (category.spending_role) {
    case 'need': return 0.65;
    case 'save': return 0.85;
    case 'want': 
    default: return 0.40;
  }
}

/**
 * Get constraint values (min/max percentages) for a category.
 * Uses database values if available, otherwise returns sensible defaults.
 */
export function getCategoryConstraints(category: Category): { minPct?: number; maxPct?: number } {
  // Use database constraints if available
  if (category.budget_min_pct !== undefined || category.budget_max_pct !== undefined) {
    return {
      minPct: category.budget_min_pct,
      maxPct: category.budget_max_pct,
    };
  }

  // Apply sensible defaults based on category type
  const nameLower = category.name.toLowerCase();
  
  // Essential needs should have high minimums
  if (category.spending_role === 'need') {
    if (nameLower.includes('groc') || nameLower.includes('food')) {
      return { minPct: 0.15 }; // At least 15% of needs
    }
    if (nameLower.includes('util') || nameLower.includes('mortgage') || nameLower.includes('rent')) {
      return {}; // No practical max on essentials
    }
  }

  // Discretionary categories should have caps
  if (category.spending_role === 'want') {
    if (nameLower.includes('subscr') || nameLower.includes('stream') || nameLower.includes('app')) {
      return { maxPct: 0.05 }; // Cap at 5% of wants
    }
    if (nameLower.includes('entertain') || nameLower.includes('movie')) {
      return { maxPct: 0.12 }; // Cap at 12% of wants
    }
    if (nameLower.includes('dining') || nameLower.includes('restau')) {
      return { maxPct: 0.20 }; // Cap at 20% of wants
    }
  }

  // Savings should have minimum
  if (category.spending_role === 'save') {
    return { minPct: 0.10 }; // At least 10% of savings
  }

  return {};
}
