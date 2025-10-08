import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../api/axios';
import { useScope } from '../context/ScopeContext';

const normalizeExpenses = (payload) => {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.filter(Boolean);
};

const useScopedExpenses = () => {
  const { scope } = useScope();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef();

  const fetchExpenses = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/expenses', {
        params: { scope },
        signal: controller.signal,
      });
      setExpenses(normalizeExpenses(response.data));
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || controller.signal.aborted) {
        return;
      }
      console.error('Failed to load scoped expenses', err);
      setError('Unable to load expenses');
      setExpenses([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [scope]);

  useEffect(() => {
    fetchExpenses();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchExpenses]);

  const refresh = useCallback(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    scope,
    expenses,
    loading,
    error,
    refresh,
  };
};

export default useScopedExpenses;
