import { Expense, Budget } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function calculateExpenseShare(expense: Expense, userId: string): number {
  if (expense.splitType === 'personal') {
    return expense.paidBy === userId ? expense.amount : 0;
  }
  
  if (expense.splitType === 'equal') {
    return expense.amount / 2;
  }
  
  // Custom split
  if (expense.paidBy === userId) {
    return expense.amount * ((expense.splitRatio || 50) / 100);
  } else {
    return expense.amount * ((100 - (expense.splitRatio || 50)) / 100);
  }
}

export function calculateBalance(expenses: Expense[], user1Id: string, user2Id: string): number {
  let balance = 0;
  
  expenses.forEach(expense => {
    const user1Share = calculateExpenseShare(expense, user1Id);
    const user2Share = calculateExpenseShare(expense, user2Id);
    
    if (expense.paidBy === user1Id) {
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
    .filter(exp => exp.category === category)
    .reduce((sum, exp) => sum + exp.amount, 0);
}

export function getBudgetProgress(budget: Budget, spent: number): number {
  return Math.min((spent / budget.monthlyAmount) * 100, 100);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
