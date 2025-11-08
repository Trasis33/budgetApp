import { useMemo } from 'react';
import { Budget, Expense } from '../types';
import { BudgetWithSpending, BudgetMetrics, BudgetStats } from '../types/budget';
import {
  enrichBudgetsWithSpending,
  sortBudgetsBySpending,
  calculateBudgetMetrics,
  calculateBudgetStats
} from '../lib/budgetUtils';
import { filterExpensesByMonth } from '../lib/utils';

interface UseBudgetCalculationsReturn {
  budgetsWithSpending: BudgetWithSpending[];
  metrics: BudgetMetrics;
  stats: BudgetStats;
  monthlyExpenses: Expense[];
}

export function useBudgetCalculations(
  budgets: Budget[],
  expenses: Expense[],
  year: number,
  month: number
): UseBudgetCalculationsReturn {
  // Filter expenses for the current month
  const monthlyExpenses = useMemo(
    () => filterExpensesByMonth(expenses, year, month),
    [expenses, year, month]
  );

  // Enrich budgets with spending data
  const budgetsWithSpending = useMemo(
    () => enrichBudgetsWithSpending(budgets, monthlyExpenses),
    [budgets, monthlyExpenses]
  );

  // Sort budgets by spending (highest first)
  const sortedBudgets = useMemo(
    () => sortBudgetsBySpending(budgetsWithSpending),
    [budgetsWithSpending]
  );

  // Calculate overall metrics
  const metrics = useMemo(
    () => calculateBudgetMetrics(budgetsWithSpending),
    [budgetsWithSpending]
  );

  // Calculate budget statistics
  const stats = useMemo(
    () => calculateBudgetStats(budgetsWithSpending),
    [budgetsWithSpending]
  );

  return {
    budgetsWithSpending: sortedBudgets,
    metrics,
    stats,
    monthlyExpenses
  };
}
