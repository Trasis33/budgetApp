import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../api/axios';

const ScopeContext = createContext();
ScopeContext.displayName = 'ScopeContext';

const SCOPE_STORAGE_KEY = 'active-scope';
const SCOPES = ['ours', 'mine', 'partner'];

const sanitizeScope = (candidate) => {
  const normalized = String(candidate || 'ours').toLowerCase();
  return SCOPES.includes(normalized) ? normalized : 'ours';
};

export const ScopeProvider = ({ children }) => {
  const [scope, setScopeState] = useState(() => {
    try {
      const stored = localStorage.getItem(SCOPE_STORAGE_KEY);
      return sanitizeScope(stored);
    } catch (error) {
      return 'ours';
    }
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();

  const fetchSummary = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/couple/summary', { signal: controller.signal });
      setSummary(response.data);
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || controller.signal.aborted) {
        return;
      }
      console.error('Scope summary fetch failed', err);
      setError('Unable to load couple summary');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSummary]);

  const updateScope = useCallback((nextScope) => {
    const sanitized = sanitizeScope(nextScope);
    setScopeState((previous) => {
      if (previous === sanitized) {
        return previous;
      }
      try {
        localStorage.setItem(SCOPE_STORAGE_KEY, sanitized);
      } catch (storageErr) {
        console.warn('Unable to persist scope selection', storageErr);
      }
      return sanitized;
    });
  }, []);

  // Auto-correct partner selection when link missing
  useEffect(() => {
    if (!loading && summary && !summary?.couple?.connected && scope === 'partner') {
      updateScope('ours');
    }
  }, [loading, summary, scope, updateScope]);

  const derivedState = useMemo(() => {
    const totals = summary?.totals || { ours: 0, mine: 0, partner: 0 };
    const couple = summary?.couple || { connected: false, user: null, partner: null };
    const metadata = summary?.metadata || { currency: 'SEK', lastUpdated: null };

    return {
      scope,
      setScope: updateScope,
      totals,
      couple,
      metadata,
      loading,
      error,
      refresh: fetchSummary,
      isPartnerConnected: Boolean(couple.connected),
    };
  }, [error, fetchSummary, loading, scope, summary, updateScope]);

  return <ScopeContext.Provider value={derivedState}>{children}</ScopeContext.Provider>;
};

export const useScope = () => {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error('useScope must be used within a ScopeProvider');
  }
  return context;
};
