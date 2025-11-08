import { formatCurrency } from './utils';
import { BudgetWithSpending, BudgetMetrics, BudgetStats } from '../types/budget';
import { Budget, Expense } from '../types';
import { BUDGET_THRESHOLDS, STATUS_LABELS, CATEGORY_ICONS, ICON_COLORS } from './constants';

/**
 * Determine budget status based on progress percentage
 */
export function getBudgetStatus(progress: number): 'success' | 'warning' | 'danger' {
  if (progress >= BUDGET_THRESHOLDS.DANGER) return 'danger';
  if (progress >= BUDGET_THRESHOLDS.WARNING) return 'warning';
  return 'success';
}

/**
 * Get status label text
 */
export function getStatusLabel(status: 'success' | 'warning' | 'danger'): string {
  return STATUS_LABELS[status] || 'Unknown';
}

/**
 * Get contextual budget message with SEK amounts
 */
export function getBudgetMessage(spent: number, budgetAmount: number): string {
  const percentage = (spent / budgetAmount) * 100;
  const remaining = formatCurrency(budgetAmount - spent);
  
  if (percentage <= 50) return `Great start! ${remaining} left`;
  if (percentage <= 80) return `On track with ${remaining} remaining`;
  if (percentage <= 100) return `Getting close - ${remaining} left`;
  return `Over budget by ${formatCurrency(spent - budgetAmount)}`;
}

/**
 * Get overall budget message
 */
export function getOverallMessage(progress: number, totalSpent: number, totalBudget: number): string {
  if (progress <= 50) return "Excellent! You're staying well within your budgets";
  if (progress <= 80) return "Nice work! You're managing your budgets well";
  if (progress <= 100) return "You're approaching your total budget limit";
  return `You've exceeded your total budget by ${formatCurrency(totalSpent - totalBudget)}`;
}

/**
 * Calculate budget metrics from budgets array
 */
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

/**
 * Calculate budget statistics (counts by status)
 */
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

/**
 * Get category icon name (for lucide-react)
 */
export function getCategoryIcon(categoryName: string): string {
  return CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Other;
}

/**
 * Get category icon color
 */
export function getCategoryIconColor(categoryName: string): 'green' | 'blue' | 'amber' | 'purple' | 'pink' {
  const color = ICON_COLORS[categoryName as keyof typeof ICON_COLORS] || ICON_COLORS.Other;
  return color as 'green' | 'blue' | 'amber' | 'purple' | 'pink';
}

/**
 * Calculate spending for a specific category
 */
export function calculateCategorySpending(expenses: Expense[], categoryName: string): number {
  return expenses
    .filter(exp => exp.category_name === categoryName)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

/**
 * Enrich budgets with spending data and computed properties
 */
export function enrichBudgetsWithSpending(
  budgets: Budget[],
  expenses: Expense[]
): BudgetWithSpending[] {
  return budgets.map(budget => {
    const spent = calculateCategorySpending(expenses, budget.category_name);
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    const status = getBudgetStatus(progress);
    const expenseCount = expenses.filter(e => e.category_name === budget.category_name).length;

    return {
      ...budget,
      spent,
      progress,
      remaining,
      status,
      expenseCount,
    };
  });
}

/**
 * Sort budgets by spending (highest first)
 */
export function sortBudgetsBySpending(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return [...budgets].sort((a, b) => b.spent - a.spent);
}

/**
 * Format progress percentage with 1 decimal place
 */
export function formatProgress(progress: number): string {
  return `${Math.min(progress, 999).toFixed(1)}%`;
}
