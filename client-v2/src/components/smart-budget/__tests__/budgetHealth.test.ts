import { categorizeBudgetHealth, BudgetHealthCategory } from '../budgetHealth';

describe('budgetHealth - Budget Health Categorization', () => {
  it('categorizes overspending categories (>20% over budget)', () => {
    const result = categorizeBudgetHealth({
      categoryId: 1,
      categoryName: 'Groceries',
      budgetAmount: 1000,
      actualSpending: 1300,
      categoryColor: 'teal'
    });

    expect(result.category).toBe(BudgetHealthCategory.OVERSPENDING);
    expect(result.usagePercentage).toBe(130);
    expect(result.varianceAmount).toBe(300);
  });

  it('categorizes healthy categories (70-120% usage)', () => {
    const result = categorizeBudgetHealth({
      categoryId: 2,
      categoryName: 'Dining Out',
      budgetAmount: 500,
      actualSpending: 450,
      categoryColor: 'amber'
    });

    expect(result.category).toBe(BudgetHealthCategory.HEALTHY);
    expect(result.usagePercentage).toBe(90);
    expect(result.varianceAmount).toBe(-50);
  });

  it('categorizes underutilized categories (<70% usage)', () => {
    const result = categorizeBudgetHealth({
      categoryId: 3,
      categoryName: 'Entertainment',
      budgetAmount: 300,
      actualSpending: 100,
      categoryColor: 'emerald'
    });

    expect(result.category).toBe(BudgetHealthCategory.UNDERUTILIZED);
    expect(result.usagePercentage).toBe(33);
    expect(result.varianceAmount).toBe(-200);
  });

  it('categorizes exactly at threshold (70% usage) as healthy', () => {
    const result = categorizeBudgetHealth({
      categoryId: 4,
      categoryName: 'Utilities',
      budgetAmount: 800,
      actualSpending: 560,
      categoryColor: 'indigo'
    });

    expect(result.category).toBe(BudgetHealthCategory.HEALTHY);
    expect(result.usagePercentage).toBe(70);
  });

  it('categorizes exactly at overspending threshold (120% usage) as healthy', () => {
    const result = categorizeBudgetHealth({
      categoryId: 5,
      categoryName: 'Transportation',
      budgetAmount: 600,
      actualSpending: 720,
      categoryColor: 'rose'
    });

    expect(result.category).toBe(BudgetHealthCategory.HEALTHY);
    expect(result.usagePercentage).toBe(120);
  });
});
