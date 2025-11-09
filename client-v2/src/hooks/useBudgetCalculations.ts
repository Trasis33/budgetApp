import { useMemo } from 'react';
import { BudgetWithSpending } from '../types/budget';
import { Budget, Expense } from '../types';
import { calculateCategorySpending, getStatusFromProgress } from '../lib/budgetUtils';

export function useBudgetCalculations(budgets: Budget[], expenses: Expense[]): BudgetWithSpending[] {
  return useMemo(() => {
    return budgets.map((budget) => {
      const spent = calculateCategorySpending(expenses, budget.category_name);
      const remaining = budget.amount - spent;
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = getStatusFromProgress(progress);
      const expenseCount = expenses.filter((e) => e.category_name === budget.category_name).length;

      return {
        ...budget,
        spent,
        remaining,
        progress,
        status,
        expenseCount,
      };
    });
  }, [budgets, expenses]);
}
