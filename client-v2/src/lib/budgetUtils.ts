import { BudgetWithSpending, BudgetMetrics, BudgetStats } from '../types/budget';
import { formatCurrency } from './utils';
import { Expense } from '../types';

export function getBudgetStatus(progress: number): 'success' | 'warning' | 'danger' {
  if (progress >= 100) return 'danger';
  if (progress >= 80) return 'warning';
  return 'success';
}

export function getStatusLabel(status: string): string {
  const labels = {
    success: 'Good',
    warning: 'Warning',
    danger: 'Over Budget',
  };
  return labels[status] || 'Unknown';
}

export function getBudgetMessage(spent: number, budgetAmount: number): string {
  const percentage = (spent / budgetAmount) * 100;
  const remaining = formatCurrency(budgetAmount - spent);

  if (percentage <= 50) return `Great start! ${remaining} left`;
  if (percentage <= 80) return `On track with ${remaining} remaining`;
  if (percentage <= 100) return `Getting close - ${remaining} left`;
  return `Over budget by ${formatCurrency(spent - budgetAmount)}`;
}

export function calculateBudgetMetrics(budgets: BudgetWithSpending[]): BudgetMetrics {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    overallProgress,
    overallStatus: getBudgetStatus(overallProgress),
  };
}

export function calculateBudgetStats(budgets: BudgetWithSpending[]): BudgetStats {
  return budgets.reduce(
    (stats, budget) => {
      if (budget.status === 'success') stats.onTrack++;
      else if (budget.status === 'warning') stats.warning++;
      else stats.overBudget++;
      return stats;
    },
    { onTrack: 0, warning: 0, overBudget: 0 }
  );
}

export function calculateCategorySpending(expenses: Expense[], category: string): number {
  return expenses
    .filter((exp) => exp.category_name === category)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
}

export function getStatusFromProgress(progress: number): 'success' | 'warning' | 'danger' {
  return getBudgetStatus(progress);
}
