import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScopeProvider, useScope, useCurrentScope } from '../ScopeContext';
import type { ScopeContextValue } from '@/types/scope';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to access context
const TestComponent: React.FC<{ onContextUpdate?: (context: ScopeContextValue) => void }> = ({ 
  onContextUpdate 
}) => {
  const context = useScope();
  
  React.useEffect(() => {
    onContextUpdate?.(context);
  }, [context, onContextUpdate]);
  
  return (
    <div>
      <div data-testid="current-scope">{context.currentScope}</div>
      <div data-testid="loading">{context.isLoading.toString()}</div>
      <div data-testid="error">{context.error || 'no-error'}</div>
      <div data-testid="partner-connected">{context.isPartnerConnected.toString()}</div>
      <div data-testid="scopes-count">{context.scopes.length}</div>
      
      <button 
        data-testid="set-ours" 
        onClick={() => context.setScope('ours')}
      >
        Set Ours
      </button>
      <button 
        data-testid="set-mine" 
        onClick={() => context.setScope('mine')}
      >
        Set Mine
      </button>
      <button 
        data-testid="set-partner" 
        onClick={() => context.setScope('partner')}
      >
        Set Partner
      </button>
      <button 
        data-testid="refresh" 
        onClick={() => context.refresh()}
      >
        Refresh
      </button>
    </div>
  );
};

const TestHookComponent: React.FC = () => {
  const currentScope = useCurrentScope();
  return <div data-testid="hook-scope">{currentScope}</div>;
};

// Mock API response
const mockSummaryResponse = {
  totals: { ours: 5000, mine: 2000, partner: 3000 },
  couple: { connected: true, user: { id: 1, name: 'John', email: 'john@test.com' }, partner: { id: 2, name: 'Jane', email: 'jane@test.com' } },
  metadata: { currency: 'USD', lastUpdated: '2024-01-01T00:00:00Z' }
};

describe('ScopeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockClear();
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSummaryResponse,
      text: async () => JSON.stringify(mockSummaryResponse)
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ScopeProvider', () => {
    it('provides default context values', async () => {
      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('partner-connected')).toHaveTextContent('true');
      expect(screen.getByTestId('scopes-count')).toHaveTextContent('3');
    });

    it('loads initial scope from localStorage', async () => {
      localStorageMock.setItem('budget-app-scope', JSON.stringify({
        version: 1,
        currentScope: 'mine',
        lastUpdated: new Date().toISOString()
      }));

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('mine');
      });
    });

    it('migrates legacy storage format', async () => {
      localStorageMock.setItem('active-scope', 'partner');

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('partner');
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('active-scope');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budget-app-scope',
        expect.stringContaining('"currentScope":"partner"')
      );
    });

    it('falls back to default scope for invalid stored values', async () => {
      localStorageMock.setItem('budget-app-scope', JSON.stringify({
        version: 1,
        currentScope: 'invalid-scope',
        lastUpdated: new Date().toISOString()
      }));

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      });
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });

    it('auto-corrects partner scope when partner is disconnected', async () => {
      const disconnectedResponse = {
        ...mockSummaryResponse,
        couple: { ...mockSummaryResponse.couple, connected: false }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => disconnectedResponse
      });

      localStorageMock.setItem('budget-app-scope', JSON.stringify({
        version: 1,
        currentScope: 'partner',
        lastUpdated: new Date().toISOString()
      }));

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      });
    });

    it('supports custom storage key', async () => {
      const customKey = 'custom-scope-key';
      localStorageMock.setItem(customKey, JSON.stringify({
        version: 1,
        currentScope: 'mine',
        lastUpdated: new Date().toISOString()
      }));

      render(
        <ScopeProvider storageKey={customKey}>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('mine');
      });
    });
  });

  describe('useScope hook', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useScope must be used within a ScopeProvider');
      
      consoleSpy.mockRestore();
    });

    it('allows scope switching', async () => {
      let contextValue: ScopeContextValue | undefined;

      render(
        <ScopeProvider>
          <TestComponent onContextUpdate={(ctx) => contextValue = ctx} />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(contextValue?.currentScope).toBe('ours');
      });

      const mineButton = screen.getByTestId('set-mine');
      await userEvent.click(mineButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('mine');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budget-app-scope',
        expect.stringContaining('"currentScope":"mine"')
      );
    });

    it('prevents duplicate scope changes', async () => {
      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      });

      const oursButton = screen.getByTestId('set-ours');
      await userEvent.click(oursButton);

      // Should not call localStorage again for same scope
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });

    it('handles refresh functionality', async () => {
      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const refreshButton = screen.getByTestId('refresh');
      await userEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('convenience hooks', () => {
    it('useCurrentScope returns current scope', async () => {
      render(
        <ScopeProvider>
          <TestHookComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hook-scope')).toHaveTextContent('ours');
      });
    });
  });

  describe('accessibility', () => {
    it('filters scopes based on partner connection', async () => {
      const disconnectedResponse = {
        ...mockSummaryResponse,
        couple: { ...mockSummaryResponse.couple, connected: false }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => disconnectedResponse
      });

      let contextValue: ScopeContextValue | undefined;

      render(
        <ScopeProvider>
          <TestComponent onContextUpdate={(ctx) => contextValue = ctx} />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(contextValue?.scopes.length).toBe(2); // ours and mine only
      });

      expect(contextValue?.canAccessScope('partner')).toBe(false);
      expect(contextValue?.canAccessScope('ours')).toBe(true);
      expect(contextValue?.canAccessScope('mine')).toBe(true);
    });
  });

  describe('auto-refresh', () => {
    jest.useFakeTimers();

    it('sets up auto-refresh when enabled', async () => {
      render(
        <ScopeProvider autoRefresh={true} refreshInterval={1000}>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('does not auto-refresh when disabled', async () => {
      render(
        <ScopeProvider autoRefresh={false}>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('handles localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      });

      // Should not throw error, just continue with default
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('handles malformed localStorage data', async () => {
      localStorageMock.setItem.mockReturnValueOnce(undefined);
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      render(
        <ScopeProvider>
          <TestComponent />
        </ScopeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-scope')).toHaveTextContent('ours');
      });
    });
  });
});
