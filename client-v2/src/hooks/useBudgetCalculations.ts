import { useMemo } from 'react';
import { Budget } from '../types';
import { Expense } from '../types';
import { 
  transformBudgetWithSpending,
  calculateBudgetMetrics,
  calculateBudgetStats,
  sortBudgetsBySpending
} from '../lib/budgetUtils';

export function useBudgetCalculations(
  budgets: Budget[], 
  expenses: Expense[]
) {
  const budgetsWithSpending = useMemo(() => {
    return budgets.map(budget => 
      transformBudgetWithSpending(budget, expenses)
    );
  }, [budgets, expenses]);

  const sortedBudgets = useMemo(() => {
    return sortBudgetsBySpending(budgetsWithSpending);
  }, [budgetsWithSpending]);

  const metrics = useMemo(() => {
    return calculateBudgetMetrics(budgetsWithSpending);
  }, [budgetsWithSpending]);

  const stats = useMemo(() => {
    return calculateBudgetStats(budgetsWithSpending);
  }, [budgetsWithSpending]);

  return {
    budgetsWithSpending,
    sortedBudgets,
    metrics,
    stats
  };
}
