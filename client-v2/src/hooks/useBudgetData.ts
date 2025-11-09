import { useState, useEffect } from 'react';
import { Budget } from '../types';
import { useAuth } from '../context/AuthContext';

export function useBudgetData() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentScope } = useAuth();

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/budgets', {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentScope) {
      loadBudgets();
    }
  }, [currentScope]);

  return { budgets, loading, error, refetch: loadBudgets };
}
