import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScopeProvider } from '@/context/ScopeContext';
import ScopeSelector from '../ScopeSelector';

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

const renderWithProvider = (component: React.ReactElement, providerProps = {}) => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => mockSummaryResponse
  });

  return render(
    <ScopeProvider {...providerProps}>
      {component}
    </ScopeProvider>
  );
};

describe('ScopeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockClear();
  });

  describe('default variant', () => {
    it('renders current scope correctly', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      expect(screen.getByText('Our Budget')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /our budget/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /my budget/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /partner's budget/i })).toBeInTheDocument();
    });

    it('changes scope when option is selected', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      const mineOption = screen.getByRole('option', { name: /my budget/i });
      await userEvent.click(mineOption);

      expect(screen.getByRole('button', { name: /my budget/i })).toBeInTheDocument();
    });

    it('calls onScopeChange when scope is changed', async () => {
      const onScopeChange = jest.fn();
      renderWithProvider(<ScopeSelector onScopeChange={onScopeChange} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      const mineOption = screen.getByRole('option', { name: /my budget/i });
      await userEvent.click(mineOption);

      expect(onScopeChange).toHaveBeenCalledWith('mine');
    });
  });

  describe('pills variant', () => {
    it('renders pills correctly', async () => {
      renderWithProvider(<ScopeSelector variant="pills" />);

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      });

      expect(screen.getByRole('radio', { name: /our budget/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /my budget/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /partner's budget/i })).toBeInTheDocument();
    });

    it('highlights selected pill', async () => {
      renderWithProvider(<ScopeSelector variant="pills" />);

      await waitFor(() => {
        const oursRadio = screen.getByRole('radio', { name: /our budget/i });
        expect(oursRadio).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('switches scope when pill is clicked', async () => {
      renderWithProvider(<ScopeSelector variant="pills" />);

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      });

      const mineRadio = screen.getByRole('radio', { name: /my budget/i });
      await userEvent.click(mineRadio);

      expect(mineRadio).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('radio', { name: /our budget/i })).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('accessibility', () => {
    it('supports keyboard navigation', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      button.focus();

      // Open with Enter
      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Navigate with ArrowDown
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');

      // Select with Enter
      await userEvent.keyboard('{Enter}');

      expect(screen.getByRole('button', { name: /partner's budget/i })).toBeInTheDocument();
    });

    it('closes dropdown on Escape', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');

      // Wait for the dropdown to close
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('has proper ARIA attributes', async () => {
      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /our budget/i });
        expect(button).toHaveAttribute('aria-haspopup', 'listbox');
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('disabled states', () => {
    it('disables selector when disabled prop is true', async () => {
      renderWithProvider(<ScopeSelector disabled />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /our budget/i });
        expect(button).toBeDisabled();
      });
    });

    it('disables partner scope when partner is not connected', async () => {
      const disconnectedResponse = {
        ...mockSummaryResponse,
        couple: { ...mockSummaryResponse.couple, connected: false }
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => disconnectedResponse
      });

      renderWithProvider(<ScopeSelector />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      const partnerOption = screen.getByRole('option', { name: /partner's budget/i });
      expect(partnerOption).toBeDisabled();
      expect(partnerOption).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('filtering', () => {
    it('filters scopes based on filter prop', async () => {
      const filter = (scope: any) => scope.id !== 'partner';
      renderWithProvider(<ScopeSelector filter={filter} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(screen.getByRole('option', { name: /our budget/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /my budget/i })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: /partner's budget/i })).not.toBeInTheDocument();
    });
  });

  describe('size variations', () => {
    it('applies correct size classes', async () => {
      const { rerender } = renderWithProvider(<ScopeSelector size="sm" />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /our budget/i });
        expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
      });

      rerender(
        <ScopeProvider>
          <ScopeSelector size="lg" />
        </ScopeProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /our budget/i });
        expect(button).toHaveClass('px-5', 'py-3', 'text-lg');
      });
    });
  });

  describe('loading states', () => {
    it('shows loading state when context is loading', async () => {
      mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProvider(<ScopeSelector loading={true} />);

      const button = screen.getByRole('button', { name: /our budget/i });
      expect(button).toBeDisabled();
    });
  });

  describe('click outside behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      renderWithProvider(
        <div>
          <ScopeSelector />
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outsideElement = screen.getByTestId('outside-element');
      await userEvent.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('descriptions', () => {
    it('shows descriptions when showDescriptions is true', async () => {
      renderWithProvider(<ScopeSelector showDescriptions />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /our budget/i })).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /our budget/i });
      await userEvent.click(button);

      expect(screen.getByText('Shared expenses and combined finances')).toBeInTheDocument();
      expect(screen.getByText('Personal expenses and individual finances')).toBeInTheDocument();
      expect(screen.getByText("Partner's personal expenses and finances")).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', async () => {
      renderWithProvider(<ScopeSelector className="custom-test-class" />);

      await waitFor(() => {
        const container = screen.getByRole('button', { name: /our budget/i }).parentElement;
        expect(container).toHaveClass('custom-test-class');
      });
    });
  });
});
