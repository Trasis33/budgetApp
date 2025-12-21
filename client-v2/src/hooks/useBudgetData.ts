import { useState, useEffect, useCallback } from 'react';
import { Budget, Expense } from '../types';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { useScope } from '../context/ScopeContext';

export function useBudgetData(month?: number, year?: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentScope } = useScope();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      const targetMonth = month ?? now.getMonth() + 1;
      const targetYear = year ?? now.getFullYear();
      
      const [budgetsData, expensesData] = await Promise.all([
        budgetService.getBudgets(targetMonth, targetYear),
        expenseService.getExpenses(currentScope)
      ]);
      
      // Filter expenses for the specific month
      // use raw date string comparison to avoid timezone issues
      const monthlyExpenses = expensesData.filter(expense => {
        if (!expense.date) return false;
        
        // Handle YYYY-MM-DD string format directly
        if (typeof expense.date === 'string' && expense.date.includes('-')) {
          const [yearStr, monthStr] = expense.date.split('-');
          const expYear = parseInt(yearStr);
          const expMonth = parseInt(monthStr); // 1-12
          
          if (!isNaN(expYear) && !isNaN(expMonth)) {
            return expYear === targetYear && expMonth === targetMonth;
          }
        }
        
        // Fallback to Date object parsing
        const d = new Date(expense.date);
        return d.getFullYear() === targetYear && d.getMonth() === (targetMonth - 1);
      });
      
      setBudgets(budgetsData);
      setExpenses(monthlyExpenses);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load budgets');
      setError(error);
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year, currentScope]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    budgets,
    expenses,
    loading,
    error,
    refetch
  };
}
