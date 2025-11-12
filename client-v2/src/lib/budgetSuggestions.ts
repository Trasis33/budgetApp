import { Expense } from '../types';

export interface BudgetSuggestions {
  matchAvg: number;
  matchSpending?: number;
  plusTen: number;
  minusTen: number;
  rounded: number;
}

export function calculateCategorySuggestions(
  categoryName: string,
  expenses: Expense[],
  currentSpending?: number
): BudgetSuggestions | null {
  const categoryExpenses = expenses
    .filter(e => e.category_name === categoryName)
    .slice(0, 90) // Last ~3 months of data
    .map(e => e.amount);

  if (categoryExpenses.length < 3 && currentSpending === undefined) return null;

  const baseAmount = currentSpending !== undefined ? currentSpending : 
    categoryExpenses.reduce((sum, amt) => sum + amt, 0) / categoryExpenses.length;

  return {
    matchAvg: Math.round(baseAmount),
    matchSpending: currentSpending ? Math.round(currentSpending) : undefined,
    plusTen: Math.round(baseAmount * 1.1 / 10) * 10,
    minusTen: Math.round(baseAmount * 0.9 / 10) * 10,
    rounded: Math.ceil(baseAmount / 50) * 50
  };
}

export interface EditBudgetSuggestion {
  label: string;
  value: number;
}

export function getEditBudgetSuggestions(
  currentAmount: number,
  currentSpending: number
): EditBudgetSuggestion[] {
  const increaseByTenPercent = Math.round(currentAmount * 1.1 / 10) * 10;
  const decreaseByTenPercent = Math.round(currentAmount * 0.9 / 10) * 10;
  const roundedToNearestFifty = Math.ceil(currentAmount / 50) * 50;

  return [
    { label: `Match spending: kr${Math.round(currentSpending)}`, value: Math.round(currentSpending) },
    { label: `+10%: kr${increaseByTenPercent}`, value: increaseByTenPercent },
    { label: `-10%: kr${decreaseByTenPercent}`, value: decreaseByTenPercent },
    { label: `Round to kr${roundedToNearestFifty}`, value: roundedToNearestFifty }
  ];
}

export function getAlertPreferences(userId: number) {
  const stored = localStorage.getItem(`budgetAlertPrefs_${userId}`);
  return stored
    ? JSON.parse(stored)
    : { alertAt80Percent: true, alertOnExceed: true };
}

export function saveAlertPreferences(
  userId: number,
  prefs: { alertAt80Percent: boolean; alertOnExceed: boolean }
) {
  localStorage.setItem(`budgetAlertPrefs_${userId}`, JSON.stringify(prefs));
}
