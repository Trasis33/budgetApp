import { getLatestVariancePerCategory, getLatestVariancePerCategorySafe, formatMonthLabel } from '../budgetAggregation';
import type { BudgetVariance } from '@/api/services/optimizationService';

describe('budgetAggregation', () => {
  describe('getLatestVariancePerCategory', () => {
    it('returns single entry when only one month exists', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Daycare',
          month: '2024-10',
          budgetAmount: 5000,
          actualAmount: 6000,
          variance: 1000,
          overagePercentage: 20,
          suggestedReduction: 1000,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategory(variances);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Daycare');
      expect(result[0].budgetAmount).toBe(5000);
      expect(result[0].actualAmount).toBe(6000);
    });

    it('returns only the latest month when same category appears multiple times', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Daycare',
          month: '2024-10',
          budgetAmount: 5000,
          actualAmount: 6000,
          variance: 1000,
          overagePercentage: 20,
          suggestedReduction: 1000,
          unusedAmount: 0
        },
        {
          name: 'Daycare',
          month: '2024-11',
          budgetAmount: 5000,
          actualAmount: 5000,
          variance: 0,
          overagePercentage: 0,
          suggestedReduction: 0,
          unusedAmount: 0
        },
        {
          name: 'Daycare',
          month: '2024-12',
          budgetAmount: 5000,
          actualAmount: 7000,
          variance: 2000,
          overagePercentage: 40,
          suggestedReduction: 2000,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategory(variances);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Daycare');
      expect(result[0].month).toBe('2024-12');
      expect(result[0].budgetAmount).toBe(5000); // NOT 15,000
      expect(result[0].actualAmount).toBe(7000); // NOT 18,000
      expect(result[0].overagePercentage).toBe(40); // NOT max of 20,0,40 = 40 (ok but values are correct now)
      expect(result[0].suggestedReduction).toBe(2000); // NOT 3,000
    });

    it('handles different categories correctly', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Daycare',
          month: '2024-12',
          budgetAmount: 5000,
          actualAmount: 7000,
          variance: 2000,
          overagePercentage: 40,
          suggestedReduction: 2000,
          unusedAmount: 0
        },
        {
          name: 'Mortgage',
          month: '2024-12',
          budgetAmount: 10000,
          actualAmount: 10000,
          variance: 0,
          overagePercentage: 0,
          suggestedReduction: 0,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategory(variances);

      expect(result).toHaveLength(2);
      const daycare = result.find(v => v.name === 'Daycare');
      const mortgage = result.find(v => v.name === 'Mortgage');
      expect(daycare).toBeDefined();
      expect(mortgage).toBeDefined();
      expect(daycare?.budgetAmount).toBe(5000);
      expect(mortgage?.budgetAmount).toBe(10000);
    });

    it('handles case-insensitive category names', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Daycare',
          month: '2024-11',
          budgetAmount: 5000,
          actualAmount: 6000,
          variance: 1000,
          overagePercentage: 20,
          suggestedReduction: 1000,
          unusedAmount: 0
        },
        {
          name: 'DAYCARE',
          month: '2024-12',
          budgetAmount: 5000,
          actualAmount: 7000,
          variance: 2000,
          overagePercentage: 40,
          suggestedReduction: 2000,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategory(variances);

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('2024-12');
    });

    it('returns empty array for empty input', () => {
      expect(getLatestVariancePerCategory([])).toEqual([]);
      expect(getLatestVariancePerCategory(null as unknown as BudgetVariance[])).toEqual([]);
      expect(getLatestVariancePerCategory(undefined as unknown as BudgetVariance[])).toEqual([]);
    });

    it('handles unsorted months correctly', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Groceries',
          month: '2024-12',
          budgetAmount: 2000,
          actualAmount: 2500,
          variance: 500,
          overagePercentage: 25,
          suggestedReduction: 500,
          unusedAmount: 0
        },
        {
          name: 'Groceries',
          month: '2024-10',
          budgetAmount: 2000,
          actualAmount: 1800,
          variance: -200,
          overagePercentage: -10,
          suggestedReduction: 0,
          unusedAmount: 200
        },
        {
          name: 'Groceries',
          month: '2024-11',
          budgetAmount: 2000,
          actualAmount: 2200,
          variance: 200,
          overagePercentage: 10,
          suggestedReduction: 200,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategory(variances);

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('2024-12'); // Latest month
    });
  });

  describe('getLatestVariancePerCategorySafe', () => {
    it('skips entries with zero budget', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Test',
          month: '2024-10',
          budgetAmount: 0,
          actualAmount: 500,
          variance: 500,
          overagePercentage: 0,
          suggestedReduction: 0,
          unusedAmount: 0
        },
        {
          name: 'Test',
          month: '2024-11',
          budgetAmount: 1000,
          actualAmount: 1200,
          variance: 200,
          overagePercentage: 20,
          suggestedReduction: 200,
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategorySafe(variances);

      expect(result).toHaveLength(1);
      expect(result[0].budgetAmount).toBe(1000);
    });

    it('clamps suggestedReduction to budgetAmount', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'Expensive',
          month: '2024-12',
          budgetAmount: 1000,
          actualAmount: 2000,
          variance: 1000,
          overagePercentage: 100,
          suggestedReduction: 2000, // More than budget!
          unusedAmount: 0
        }
      ];

      const result = getLatestVariancePerCategorySafe(variances);

      expect(result[0].suggestedReduction).toBe(1000); // Clamped to budget
    });

    it('ensures no negative values for calculated fields', () => {
      const variances: BudgetVariance[] = [
        {
          name: 'UnderBudget',
          month: '2024-12',
          budgetAmount: 1000,
          actualAmount: 800,
          variance: -200,
          overagePercentage: -20,
          suggestedReduction: -100, // Negative!
          unusedAmount: 300
        }
      ];

      const result = getLatestVariancePerCategorySafe(variances);

      expect(result[0].suggestedReduction).toBe(0);
      expect(result[0].overagePercentage).toBe(0);
      expect(result[0].unusedAmount).toBe(300);
    });
  });

  describe('formatMonthLabel', () => {
    it('formats month string correctly', () => {
      expect(formatMonthLabel('2024-12')).toBe('December 2024');
      expect(formatMonthLabel('2024-01')).toBe('January 2024');
      expect(formatMonthLabel('2023-06')).toBe('June 2023');
    });

    it('handles empty or invalid input', () => {
      expect(formatMonthLabel('')).toBe('');
      expect(formatMonthLabel('invalid')).toBe('invalid');
      expect(formatMonthLabel(null as unknown as string)).toBe('');
      expect(formatMonthLabel(undefined as unknown as string)).toBe('');
    });
  });
});
