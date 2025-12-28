import { calculateWeightedAllocations, getCategoryWeight, DEFAULT_CATEGORY_WEIGHTS } from '../budgetAllocation';
import { Category } from '../../types';

describe('calculateWeightedAllocations', () => {
  it('distributes budget proportionally to weights', () => {
    const categories: Category[] = [
      { id: 1, name: 'Groceries', budget_weight: 0.80 },
      { id: 2, name: 'Subscriptions', budget_weight: 0.20 },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Weights: 0.80 + 0.20 = 1.0
    // Share: Groceries 80%, Subscriptions 20%
    expect(result[0].allocatedAmount).toBe(8000);
    expect(result[1].allocatedAmount).toBe(2000);
    expect(result[0].percentOfBucket).toBeCloseTo(80);
    expect(result[1].percentOfBucket).toBeCloseTo(20);
  });

  it('uses default weight of 0.5 when weight is undefined', () => {
    const categories: Category[] = [
      { id: 1, name: 'Category A' }, // No weight specified
      { id: 2, name: 'Category B' },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Both should split equally (0.5 + 0.5 = 1.0)
    expect(result[0].allocatedAmount).toBe(5000);
    expect(result[1].allocatedAmount).toBe(5000);
  });

  it('enforces minimum floor constraints', () => {
    const categories: Category[] = [
      { id: 1, name: 'Groceries', budget_weight: 0.30, budget_min_pct: 0.40 },
      { id: 2, name: 'Other', budget_weight: 0.70 },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Groceries: normally 30% (3000), but minimum 40% (4000)
    expect(result[0].allocatedAmount).toBeGreaterThanOrEqual(4000);
    expect(result[0].constraintApplied).toBe('min');
    
    // Other should get the remainder
    expect(result[0].allocatedAmount + result[1].allocatedAmount).toBe(10000);
  });

  it('enforces maximum cap constraints', () => {
    const categories: Category[] = [
      { id: 1, name: 'Entertainment', budget_weight: 0.90, budget_max_pct: 0.15 },
      { id: 2, name: 'Other', budget_weight: 0.10 },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Entertainment: normally 90% (9000), but capped at 15% (1500)
    expect(result[0].allocatedAmount).toBeLessThanOrEqual(1500);
    expect(result[0].constraintApplied).toBe('max');
    
    // Other should get the remainder
    expect(result[0].allocatedAmount + result[1].allocatedAmount).toBe(10000);
  });

  it('handles empty category list gracefully', () => {
    const result = calculateWeightedAllocations([], 10000);
    expect(result).toEqual([]);
  });

  it('handles zero budget gracefully', () => {
    const categories: Category[] = [{ id: 1, name: 'Test', budget_weight: 0.5 }];
    const result = calculateWeightedAllocations(categories, 0);
    expect(result).toEqual([]);
  });

  it('handles negative budget gracefully', () => {
    const categories: Category[] = [{ id: 1, name: 'Test', budget_weight: 0.5 }];
    const result = calculateWeightedAllocations(categories, -1000);
    expect(result).toEqual([]);
  });

  it('applies both min and max constraints correctly', () => {
    const categories: Category[] = [
      { id: 1, name: 'Category A', budget_weight: 0.8, budget_min_pct: 0.30, budget_max_pct: 0.50 },
      { id: 2, name: 'Category B', budget_weight: 0.2 },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Category A: weight suggests 80%, constrained to 30-50%
    expect(result[0].allocatedAmount).toBeGreaterThanOrEqual(3000); // min
    expect(result[0].allocatedAmount).toBeLessThanOrEqual(5000); // max
    expect(result[0].constraintApplied).toBe('max');
  });

  it('correctly normalizes budget after constraints', () => {
    const categories: Category[] = [
      { id: 1, name: 'Essential', budget_weight: 0.5, budget_min_pct: 0.50 },
      { id: 2, name: 'Discretionary', budget_weight: 0.5, budget_max_pct: 0.30 },
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    // Ensure total equals original budget (accounting for rounding)
    const total = result.reduce((sum, r) => sum + r.allocatedAmount, 0);
    expect(total).toBe(10000);
  });

  it('handles multiple categories with mixed constraints', () => {
    const categories: Category[] = [
      { id: 1, name: 'Groceries', budget_weight: 0.80, budget_min_pct: 0.20 },
      { id: 2, name: 'Dining', budget_weight: 0.50, budget_max_pct: 0.15 },
      { id: 3, name: 'Entertainment', budget_weight: 0.40, budget_max_pct: 0.10 },
      { id: 4, name: 'Other', budget_weight: 0.30 },
    ];
    
    const result = calculateWeightedAllocations(categories, 20000);
    
    // Total should equal budget
    const total = result.reduce((sum, r) => sum + r.allocatedAmount, 0);
    expect(total).toBe(20000);
    
    // Check that caps were enforced
    expect(result[1].allocatedAmount).toBeLessThanOrEqual(3000); // Dining max 15%
    expect(result[2].allocatedAmount).toBeLessThanOrEqual(2000); // Entertainment max 10%
  });

  it('allocates zero to categories with zero allocation correctly', () => {
    const categories: Category[] = [
      { id: 1, name: 'Category A', budget_weight: 1.0 },
      { id: 2, name: 'Category B', budget_weight: 0.0 }, // Zero weight
    ];
    
    const result = calculateWeightedAllocations(categories, 10000);
    
    expect(result[0].allocatedAmount).toBe(10000);
    expect(result[1].allocatedAmount).toBe(0);
  });

  it('produces percentages that sum to ~100%', () => {
    const categories: Category[] = [
      { id: 1, name: 'A', budget_weight: 0.60 },
      { id: 2, name: 'B', budget_weight: 0.25 },
      { id: 3, name: 'C', budget_weight: 0.15 },
    ];
    
    const result = calculateWeightedAllocations(categories, 15000);
    
    const totalPercent = result.reduce((sum, r) => sum + r.percentOfBucket, 0);
    expect(totalPercent).toBeCloseTo(100, 1);
  });
});

describe('getCategoryWeight', () => {
  it('returns database weight if available', () => {
    const category: Category = {
      id: 1,
      name: 'Groceries',
      budget_weight: 0.75,
    };
    
    expect(getCategoryWeight(category)).toBe(0.75);
  });

  it('matches category name to default weights', () => {
    const groceries: Category = { id: 1, name: 'Weekly Groceries' };
    const subscriptions: Category = { id: 2, name: 'Subscriptions' };
    
    expect(getCategoryWeight(groceries)).toBe(0.80);
    expect(getCategoryWeight(subscriptions)).toBe(0.20);
  });

  it('falls back to spending_role default', () => {
    const needCategory: Category = { id: 1, name: 'Unknown Need', spending_role: 'need' };
    const saveCategory: Category = { id: 2, name: 'Unknown Save', spending_role: 'save' };
    const wantCategory: Category = { id: 3, name: 'Unknown Want', spending_role: 'want' };
    
    expect(getCategoryWeight(needCategory)).toBe(0.65);
    expect(getCategoryWeight(saveCategory)).toBe(0.85);
    expect(getCategoryWeight(wantCategory)).toBe(0.40);
  });

  it('clamps weight to 0-1 range', () => {
    const overMax: Category = { id: 1, name: 'Test', budget_weight: 1.5 };
    const underMin: Category = { id: 2, name: 'Test', budget_weight: -0.5 };
    
    expect(getCategoryWeight(overMax)).toBe(1);
    expect(getCategoryWeight(underMin)).toBe(0);
  });

  it('prefers database weight over name matching', () => {
    const category: Category = {
      id: 1,
      name: 'Groceries',
      budget_weight: 0.30, // Lower than typical groceries weight
    };
    
    expect(getCategoryWeight(category)).toBe(0.30);
  });

  it('handles case-insensitive name matching', () => {
    const category: Category = { id: 1, name: 'DINING OUT' };
    expect(getCategoryWeight(category)).toBe(0.50);
  });
});

describe('DEFAULT_CATEGORY_WEIGHTS', () => {
  it('contains weights for common grocery categories', () => {
    expect(DEFAULT_CATEGORY_WEIGHTS['groceries']).toBe(0.80);
  });

  it('contains weights for discretionary categories', () => {
    expect(DEFAULT_CATEGORY_WEIGHTS['subscriptions']).toBe(0.20);
    expect(DEFAULT_CATEGORY_WEIGHTS['streaming']).toBe(0.15);
  });

  it('contains weights for housing', () => {
    expect(DEFAULT_CATEGORY_WEIGHTS['mortgage']).toBe(0.90);
    expect(DEFAULT_CATEGORY_WEIGHTS['rent']).toBe(0.90);
  });

  it('all weights are between 0 and 1', () => {
    for (const [name, weight] of Object.entries(DEFAULT_CATEGORY_WEIGHTS)) {
      expect(weight).toBeGreaterThanOrEqual(0);
      expect(weight).toBeLessThanOrEqual(1);
    }
  });
});
