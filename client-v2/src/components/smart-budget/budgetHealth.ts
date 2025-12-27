export enum BudgetHealthCategory {
  OVERSPENDING = 'OVERSPENDING',
  HEALTHY = 'HEALTHY',
  UNDERUTILIZED = 'UNDERUTILIZED'
}

interface BudgetHealthInput {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  actualSpending: number;
  categoryColor: string;
}

interface BudgetHealthResult {
  category: BudgetHealthCategory;
  categoryId: number;
  categoryName: string;
  usagePercentage: number;
  varianceAmount: number;
  categoryColor: string;
}

export function categorizeBudgetHealth(input: BudgetHealthInput): BudgetHealthResult {
  const { categoryId, categoryName, budgetAmount, actualSpending, categoryColor } = input;

  const usagePercentage = Math.round((actualSpending / budgetAmount) * 100);
  const varianceAmount = actualSpending - budgetAmount;

  let category: BudgetHealthCategory;

  if (usagePercentage > 120) {
    category = BudgetHealthCategory.OVERSPENDING;
  } else if (usagePercentage < 70) {
    category = BudgetHealthCategory.UNDERUTILIZED;
  } else {
    category = BudgetHealthCategory.HEALTHY;
  }

  return {
    category,
    categoryId,
    categoryName,
    usagePercentage,
    varianceAmount,
    categoryColor
  };
}
