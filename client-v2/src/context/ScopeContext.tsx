import React, { 
  createContext, 
  useCallback, 
  useContext, 
  useEffect, 
  useMemo, 
  useRef, 
  useState
} from 'react';
import type {
  Scope,
  ScopeContextValue,
  ScopeSummary,
  ScopeStorageState,
  ScopeProviderProps,
  ScopeType
} from '@/types/scope';
import { apiClient } from '@/api/axios';

const ScopeContext = createContext<ScopeContextValue | undefined>(undefined);
ScopeContext.displayName = 'ScopeContext';

// Default scope configuration
const DEFAULT_SCOPES: Scope[] = [
  {
    id: 'ours',
    label: 'Our Budget',
    description: 'Shared expenses and combined finances',
    icon: '👥',
    requiresPartner: false
  },
  {
    id: 'mine',
    label: 'My Budget',
    description: 'Personal expenses and individual finances',
    icon: '👤',
    requiresPartner: false
  },
  {
    id: 'partner',
    label: "Partner's Budget",
    description: "Partner's personal expenses and finances",
    icon: '❤️',
    requiresPartner: true
  }
];

// Storage and migration constants
const STORAGE_VERSION = 1;
const DEFAULT_STORAGE_KEY = 'budget-app-scope';
const LEGACY_STORAGE_KEY = 'active-scope';

// Utility functions
const sanitizeScope = (candidate: string | null): ScopeType => {
  const normalized = String(candidate || 'ours').toLowerCase();
  return DEFAULT_SCOPES.some(scope => scope.id === normalized) 
    ? normalized as ScopeType 
    : 'ours';
};

const createStorageState = (scope: ScopeType): ScopeStorageState => ({
  version: STORAGE_VERSION,
  currentScope: scope,
  lastUpdated: new Date().toISOString()
});

const migrateLegacyStorage = (storageKey: string): ScopeType | null => {
  try {
    const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyValue) {
      const sanitized = sanitizeScope(legacyValue);
      // Write to new format
      const newState = createStorageState(sanitized);
      localStorage.setItem(storageKey, JSON.stringify(newState));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return sanitized;
    }
  } catch (error) {
    console.warn('Failed to migrate legacy scope storage:', error);
  }
  return null;
};

const loadScopeFromStorage = (storageKey: string): ScopeType => {
  try {
    // Try new format first
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed: ScopeStorageState = JSON.parse(stored);
      
      // Handle version migration
      if (parsed.version !== STORAGE_VERSION) {
        // Future migration logic can go here
        const migrated = sanitizeScope(parsed.currentScope);
        const newState = createStorageState(migrated);
        localStorage.setItem(storageKey, JSON.stringify(newState));
        return migrated;
      }
      
      return sanitizeScope(parsed.currentScope);
    }
    
    // Try legacy format
    const migrated = migrateLegacyStorage(storageKey);
    if (migrated) {
      return migrated;
    }
  } catch (error) {
    console.warn('Failed to load scope from storage:', error);
  }
  
  return 'ours';
};

const saveScopeToStorage = (storageKey: string, scope: ScopeType): void => {
  try {
    const state = createStorageState(scope);
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save scope to storage:', error);
  }
};

const fetchCoupleSummary = async (signal: AbortSignal): Promise<ScopeSummary> => {
  // Use authenticated API client instead of native fetch
  const data = await apiClient.get<any>('/couple/summary', { signal });
  
  return {
    totals: {
      ours: data.totals?.ours || 0,
      mine: data.totals?.mine || 0,
      partner: data.totals?.partner || 0
    },
    couple: {
      connected: Boolean(data.couple?.connected),
      user: data.couple?.user || null,
      partner: data.couple?.partner || null
    },
    metadata: {
      currency: data.metadata?.currency || 'USD',
      lastUpdated: data.metadata?.lastUpdated || null
    }
  };
};

export const ScopeProvider: React.FC<ScopeProviderProps> = ({
  children,
  defaultScope = 'ours',
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  storageKey = DEFAULT_STORAGE_KEY
}) => {
  const [currentScope, setCurrentScopeState] = useState<ScopeType>(() => {
    if (typeof window === 'undefined') {
      return defaultScope; // SSR safety
    }
    return loadScopeFromStorage(storageKey);
  });
  
  const [summary, setSummary] = useState<ScopeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCoupleSummary(controller.signal);
      setSummary(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Silently handle aborts
      }
      console.error('Scope summary fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Unable to load budget summary');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Skip on SSR
    }
    
    refresh();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || typeof window === 'undefined') {
      return;
    }

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(refresh, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // Auto-correct partner scope when partner is disconnected
  useEffect(() => {
    if (!isLoading && summary && !summary.couple.connected && currentScope === 'partner') {
      setScope('ours');
    }
  }, [isLoading, summary, currentScope]);

  const setScope = useCallback((nextScope: ScopeType) => {
    const sanitized = sanitizeScope(nextScope);
    
    setCurrentScopeState((previous) => {
      if (previous === sanitized) {
        return previous;
      }
      
      if (typeof window !== 'undefined') {
        saveScopeToStorage(storageKey, sanitized);
      }
      
      return sanitized;
    });
  }, [storageKey]);

  const canAccessScope = useCallback((scope: ScopeType): boolean => {
    const scopeConfig = DEFAULT_SCOPES.find(s => s.id === scope);
    if (!scopeConfig) {
      return false;
    }
    
    if (scopeConfig.requiresPartner) {
      return Boolean(summary?.couple.connected);
    }
    
    return true;
  }, [summary]);

  const availableScopes = useMemo(() => {
    return DEFAULT_SCOPES.filter(scope => 
      !scope.disabled && canAccessScope(scope.id)
    );
  }, [canAccessScope]);

  const contextValue = useMemo<ScopeContextValue>(() => ({
    currentScope,
    scopes: availableScopes,
    setScope,
    isLoading,
    error,
    summary,
    refresh,
    isPartnerConnected: Boolean(summary?.couple.connected),
    canAccessScope
  }), [
    currentScope,
    availableScopes,
    setScope,
    isLoading,
    error,
    summary,
    refresh,
    canAccessScope
  ]);

  return (
    <ScopeContext.Provider value={contextValue}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = (): ScopeContextValue => {
  const context = useContext(ScopeContext);
  
  if (context === undefined) {
    throw new Error('useScope must be used within a ScopeProvider');
  }
  
  return context;
};

// Additional hooks for convenience
export const useCurrentScope = (): ScopeType => {
  const { currentScope } = useScope();
  return currentScope;
};

export const useScopeSummary = (): ScopeSummary | null => {
  const { summary } = useScope();
  return summary;
};

export const useIsPartnerConnected = (): boolean => {
  const { isPartnerConnected } = useScope();
  return isPartnerConnected;
};
