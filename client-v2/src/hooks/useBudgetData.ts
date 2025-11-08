import { useState, useEffect } from 'react';
import { Budget, Expense, Category } from '../types';
import { ScopeType } from '../types/scope';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';

interface UseBudgetDataReturn {
  budgets: Budget[];
  expenses: Expense[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBudgetData(
  month: number,
  year: number,
  scope: ScopeType
): UseBudgetDataReturn {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [budgetsData, expensesData, categoriesData] = await Promise.all([
        budgetService.getBudgets(month, year),
        expenseService.getExpenses(scope),
        categoryService.getCategories()
      ]);

      setBudgets(budgetsData);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Having trouble loading budgets. Check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year, scope]);

  return {
    budgets,
    expenses,
    categories,
    loading,
    error,
    refetch: fetchData
  };
}
