import { Budget, BudgetWithSpending, BudgetMetrics, BudgetStats, BudgetStatus } from '../types/budget';
import { Expense } from '../types';
import { BUDGET_STATUS_THRESHOLDS, STATUS_LABELS, CATEGORY_ICONS, STATUS_COLORS } from './constants';

// Calculate budget status based on progress percentage
export function getBudgetStatus(progress: number): BudgetStatus {
  if (progress >= BUDGET_STATUS_THRESHOLDS.WARNING_MAX) return 'danger';
  if (progress >= BUDGET_STATUS_THRESHOLDS.SUCCESS_MAX) return 'warning';
  return 'success';
}

// Get status label for display
export function getStatusLabel(status: BudgetStatus): string {
  return STATUS_LABELS[status] || 'Unknown';
}

// Get status color for styling
export function getStatusColor(status: BudgetStatus): string {
  return STATUS_COLORS[status] || STATUS_COLORS.success;
}

// Calculate comprehensive budget metrics
export function calculateBudgetMetrics(budgets: BudgetWithSpending[]): BudgetMetrics {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  return {
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    overallProgress,
    overallStatus: getBudgetStatus(overallProgress)
  };
}

// Calculate budget statistics for footer
export function calculateBudgetStats(budgets: BudgetWithSpending[]): BudgetStats {
  return budgets.reduce((stats, budget) => {
    if (budget.status === 'success') stats.onTrack++;
    else if (budget.status === 'warning') stats.warning++;
    else stats.overBudget++;
    return stats;
  }, { onTrack: 0, warning: 0, overBudget: 0 });
}

// Transform budget with spending calculations
export function transformBudgetWithSpending(
  budget: Budget, 
  expenses: Expense[]
): BudgetWithSpending {
  const spent = calculateCategorySpending(expenses, budget.category_name);
  const remaining = budget.amount - spent;
  const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
  const status = getBudgetStatus(progress);
  const expenseCount = expenses.filter(e => e.category_name === budget.category_name).length;

  return {
    ...budget,
    spent,
    remaining,
    progress,
    status,
    expenseCount
  };
}

// Calculate category spending (existing utility, re-exported)
export function calculateCategorySpending(expenses: Expense[], category: string): number {
  return expenses
    .filter(exp => exp.category_name === category)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
}

// Get budget status message based on progress
export function getBudgetStatusMessage(progress: number): string {
  if (progress <= 50) return "Great start! You're well within budget";
  if (progress <= 80) return "Looking good! You're using your budget wisely";
  if (progress <= 100) return "Getting close to your limit";
  return "You've reached your budget goal";
}

// Get overall budget message
export function getOverallBudgetMessage(overallProgress: number): string {
  if (overallProgress <= 50) return "Excellent! You're staying well within your budgets";
  if (overallProgress <= 80) return "Nice work! You're managing your budgets well";
  if (overallProgress <= 100) return "You're approaching your total budget limit";
  return "You've exceeded your total budget – let's review and adjust";
}

// Get category icon and color
export function getCategoryIcon(categoryName: string) {
  return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS['Other'];
}

// Sort budgets by spending (highest first)
export function sortBudgetsBySpending(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return [...budgets].sort((a, b) => b.spent - a.spent);
}

// Sort budgets by progress (highest first)
export function sortBudgetsByProgress(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return [...budgets].sort((a, b) => b.progress - a.progress);
}

// Sort budgets by name (alphabetical)
export function sortBudgetsByName(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return [...budgets].sort((a, b) => a.category_name.localeCompare(b.category_name));
}

// Get budgets that need attention (warning or danger status)
export function getBudgetsNeedingAttention(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return budgets.filter(budget => budget.status === 'warning' || budget.status === 'danger');
}

// Get budgets that are on track
export function getBudgetsOnTrack(budgets: BudgetWithSpending[]): BudgetWithSpending[] {
  return budgets.filter(budget => budget.status === 'success');
}

// Calculate budget utilization percentage
export function calculateBudgetUtilization(budgets: BudgetWithSpending[]): number {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
}

// Get top spending categories
export function getTopSpendingCategories(budgets: BudgetWithSpending[], limit: number = 5): BudgetWithSpending[] {
  return sortBudgetsBySpending(budgets).slice(0, limit);
}

// Validate budget amount
export function isValidBudgetAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 999999.99;
}

// Format budget amount for display (with currency)
export function formatBudgetAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Calculate savings amount (positive remaining)
export function calculateSavingsAmount(budgets: BudgetWithSpending[]): number {
  return budgets.reduce((sum, budget) => {
    return sum + Math.max(0, budget.remaining);
  }, 0);
}

// Calculate overspend amount (negative remaining)
export function calculateOverspendAmount(budgets: BudgetWithSpending[]): number {
  return budgets.reduce((sum, budget) => {
    return sum + Math.min(0, budget.remaining);
  }, 0);
}
