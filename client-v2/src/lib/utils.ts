import { Expense, Budget } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK'
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
}

export function calculateExpenseShare(expense: Expense, userId: string): number {
  if (expense.split_type === 'personal') {
    return expense.paid_by_user_id === userId ? (expense.amount || 0) : 0;
  }

  if (expense.split_type === 'equal') {
    return (expense.amount || 0) / 2;
  }

  // Custom split
  if (expense.paid_by_user_id === userId) {
    return (expense.amount || 0) * ((expense.custom_split_ratio || 50) / 100);
  } else {
    return (expense.amount || 0) * ((100 - (expense.custom_split_ratio || 50)) / 100);
  }
}

export function calculateBalance(expenses: Expense[], user1Id: string, user2Id: string): number {
  let balance = 0;

  expenses.forEach(expense => {
    const user1Share = calculateExpenseShare(expense, user1Id);
    const user2Share = calculateExpenseShare(expense, user2Id);

    if (expense.paid_by_user_id === user1Id) {
      balance += user2Share;
    } else {
      balance -= user1Share;
    }
  });

  return balance;
}

export function filterExpensesByMonth(expenses: Expense[], year: number, month: number): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
  });
}

export function calculateCategorySpending(expenses: Expense[], category: string): number {
  return expenses
    .filter(exp => exp.category_name === category)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
}

export function getBudgetProgress(budget: Budget, spent: number): number {
  if (!budget.amount || budget.amount === 0) return 0;
  return Math.min((spent / budget.amount) * 100, 100);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
