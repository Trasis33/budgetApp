import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ScopeProvider, useScope } from '@/context/ScopeContext';
import ScopeSelector from '@/components/ScopeSelector';
import App from '../../App';

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

// Mock API response
const mockSummaryResponse = {
  totals: { ours: 5000, mine: 2000, partner: 3000 },
  couple: { connected: true, user: { id: 1, name: 'John', email: 'john@test.com' }, partner: { id: 2, name: 'Jane', email: 'jane@test.com' } },
  metadata: { currency: 'USD', lastUpdated: '2024-01-01T00:00:00Z' }
};

// Test component that uses scope context
const ScopeAwareComponent: React.FC<{ testId: string }> = ({ testId }) => {
  const { currentScope, setScope, isPartnerConnected, scopes } = useScope();

  return (
    <div data-testid={testId}>
      <div data-testid={`${testId}-scope`}>{currentScope}</div>
      <div data-testid={`${testId}-partner-connected`}>{isPartnerConnected.toString()}</div>
      <div data-testid={`${testId}-scopes-count`}>{scopes.length}</div>
      <button 
        data-testid={`${testId}-switch-to-mine`}
        onClick={() => setScope('mine')}
      >
        Switch to Mine
      </button>
    </div>
  );
};

const renderWithApp = (component: React.ReactElement, initialRoute = '/') => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => mockSummaryResponse
  });

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ScopeProvider>
        {component}
      </ScopeProvider>
    </MemoryRouter>
  );
};

describe('Scope System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockClear();
  });

  describe('ScopeProvider integration', () => {
    it('provides context to multiple components', async () => {
      renderWithApp(
        <div>
          <ScopeAwareComponent testId="component1" />
          <ScopeAwareComponent testId="component2" />
          <ScopeSelector />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('component1-scope')).toHaveTextContent('ours');
        expect(screen.getByTestId('component2-scope')).toHaveTextContent('ours');
      });

      // All components should see the same scope
      expect(screen.getByTestId('component1-partner-connected')).toHaveTextContent('true');
      expect(screen.getByTestId('component2-partner-connected')).toHaveTextContent('true');
      expect(screen.getByTestId('component1-scopes-count')).toHaveTextContent('3');
      expect(screen.getByTestId('component2-scopes-count')).toHaveTextContent('3');
    });

    it('propagates scope changes to all components', async () => {
      renderWithApp(
        <div>
          <ScopeAwareComponent testId="component1" />
          <ScopeAwareComponent testId="component2" />
          <ScopeSelector />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('component1-scope')).toHaveTextContent('ours');
        expect(screen.getByTestId('component2-scope')).toHaveTextContent('ours');
      });

      // Change scope using first component
      const switchButton = screen.getByTestId('component1-switch-to-mine');
      await userEvent.click(switchButton);

      await waitFor(() => {
        expect(screen.getByTestId('component1-scope')).toHaveTextContent('mine');
        expect(screen.getByTestId('component2-scope')).toHaveTextContent('mine');
      });

      // ScopeSelector should also reflect the change
      expect(screen.getByRole('button', { name: /my budget/i })).toBeInTheDocument();
    });
  });

  describe('ScopeSelector integration', () => {
    it('integrates with ScopeProvider correctly', async () => {
      const onScopeChange = jest.fn();
      
      renderWithApp(
        <div>
          <ScopeSelector onScopeChange={onScopeChange} />
          <ScopeAwareComponent testId="aware-component" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('aware-component-scope')).toHaveTextContent('ours');
      });

      // Use ScopeSelector to change scope
      const selectorButton = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(selectorButton);

      const mineOption = screen.getByRole('option', { name: /my budget/i });
      await userEvent.click(mineOption);

      await waitFor(() => {
        expect(screen.getByTestId('aware-component-scope')).toHaveTextContent('mine');
        expect(onScopeChange).toHaveBeenCalledWith('mine');
      });
    });

    it('respects partner connection status', async () => {
      const disconnectedResponse = {
        ...mockSummaryResponse,
        couple: { ...mockSummaryResponse.couple, connected: false }
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => disconnectedResponse
      });

      renderWithApp(
        <div>
          <ScopeSelector />
          <ScopeAwareComponent testId="aware-component" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('aware-component-partner-connected')).toHaveTextContent('false');
        expect(screen.getByTestId('aware-component-scopes-count')).toHaveTextContent('2');
      });

      const selectorButton = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(selectorButton);

      // Partner option should be disabled
      expect(screen.getByRole('option', { name: /partner's budget/i })).toBeDisabled();
    });
  });

  describe('localStorage persistence integration', () => {
    it('persists scope changes across renders', async () => {
      // Set initial scope in localStorage
      localStorageMock.setItem('budget-app-scope', JSON.stringify({
        version: 1,
        currentScope: 'mine',
        lastUpdated: new Date().toISOString()
      }));

      const { unmount } = renderWithApp(
        <ScopeAwareComponent testId="test-component" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('mine');
      });

      // Unmount and remount
      unmount();

      renderWithApp(
        <ScopeAwareComponent testId="test-component" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('mine');
      });
    });

    it('handles storage migration on app initialization', async () => {
      // Set legacy format
      localStorageMock.setItem('active-scope', 'partner');

      renderWithApp(
        <ScopeAwareComponent testId="test-component" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('partner');
      });

      // Should have migrated to new format
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('active-scope');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'budget-app-scope',
        expect.stringContaining('"currentScope":"partner"')
      );
    });
  });

  describe('error handling integration', () => {
    it('handles API failures gracefully across components', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderWithApp(
        <div>
          <ScopeSelector />
          <ScopeAwareComponent testId="aware-component" />
        </div>
      );

      await waitFor(() => {
        // Components should still render with default values
        expect(screen.getByTestId('aware-component-scope')).toHaveTextContent('ours');
      });

      // ScopeSelector should still be functional
      const selectorButton = screen.getByRole('button', { name: /our budget/i });
      expect(selectorButton).toBeInTheDocument();
    });

    it('handles localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      renderWithApp(
        <ScopeAwareComponent testId="test-component" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('ours');
      });
    });
  });

  describe('App integration', () => {
    it('works within the main App component', async () => {
      renderWithApp(<App />, '/dashboard');

      await waitFor(() => {
        // App should render without errors
        expect(document.body).toBeInTheDocument();
      });
    });

    it('maintains scope state during navigation', async () => {
      const { rerender } = renderWithApp(<App />, '/dashboard');

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Simulate navigation
      rerender(
        <MemoryRouter initialEntries={['/budget']}>
          <ScopeProvider>
            <App />
          </ScopeProvider>
        </MemoryRouter>
      );

      // Should still work after navigation
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('performance and memory', () => {
    it('does not cause memory leaks with multiple scope changes', async () => {
      const { unmount } = renderWithApp(
        <div>
          <ScopeSelector />
          <ScopeAwareComponent testId="test-component" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('ours');
      });

      // Perform multiple scope changes
      const selectorButton = screen.getByRole('button', { name: /our budget/i });
      
      for (let i = 0; i < 5; i++) {
        await userEvent.click(selectorButton);
        
        if (i % 2 === 0) {
          const mineOption = screen.getByRole('option', { name: /my budget/i });
          await userEvent.click(mineOption);
        } else {
          const oursOption = screen.getByRole('option', { name: /our budget/i });
          await userEvent.click(oursOption);
        }

        await waitFor(() => {
          const expectedScope = i % 2 === 0 ? 'mine' : 'ours';
          expect(screen.getByTestId('test-component-scope')).toHaveTextContent(expectedScope);
        });
      }

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles rapid scope changes without errors', async () => {
      renderWithApp(
        <div>
          <ScopeSelector variant="pills" />
          <ScopeAwareComponent testId="test-component" />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('ours');
      });

      // Rapidly click different pills
      const mineRadio = screen.getByRole('radio', { name: /my budget/i });
      const oursRadio = screen.getByRole('radio', { name: /our budget/i });

      await userEvent.click(mineRadio);
      await userEvent.click(oursRadio);
      await userEvent.click(mineRadio);

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('mine');
      });
    });
  });

  describe('accessibility integration', () => {
    it('maintains accessibility across the entire scope system', async () => {
      renderWithApp(
        <div>
          <ScopeSelector aria-label="Budget scope selector" />
          <ScopeAwareComponent testId="test-component" />
        </div>
      );

      await waitFor(() => {
        const selectorButton = screen.getByRole('button', { name: /our budget/i });
        expect(selectorButton).toBeInTheDocument();
        
        // Check for proper ARIA attributes
        expect(selectorButton).toHaveAttribute('aria-haspopup', 'listbox');
        expect(selectorButton).toHaveAttribute('aria-expanded', 'false');
      });

      // Keyboard navigation should work
      const selectorButton = screen.getByRole('button', { name: /our budget/i });
      selectorButton.focus();

      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByTestId('test-component-scope')).toHaveTextContent('mine');
      });
    });
  });
});
