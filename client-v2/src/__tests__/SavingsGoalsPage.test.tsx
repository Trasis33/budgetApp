import { render, screen } from '@testing-library/react';
import { SavingsGoalsPage } from '../components/SavingsGoalsPage';
import { ScopeProvider } from '../context/ScopeContext';
import { MemoryRouter } from 'react-router-dom';

// Mock savingsService
jest.mock('../api/services/savingsService', () => ({
  savingsService: {
    getGoals: jest.fn().mockResolvedValue([]),
  },
}));

describe('SavingsGoalsPage', () => {
  it('renders the page header', async () => {
    render(
      <MemoryRouter>
        <ScopeProvider>
          <SavingsGoalsPage />
        </ScopeProvider>
      </MemoryRouter>
    );
    
    expect(await screen.findByRole('heading', { name: /Savings Goals/i })).toBeInTheDocument();
  });

  it('renders the scope switcher', async () => {
    render(
      <MemoryRouter>
        <ScopeProvider>
          <SavingsGoalsPage />
        </ScopeProvider>
      </MemoryRouter>
    );
    
    expect(await screen.findByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText(/Mine/i)).toBeInTheDocument();
    expect(screen.getByText(/Partner's/i)).toBeInTheDocument();
    expect(screen.getByText(/Ours/i)).toBeInTheDocument();
  });

  it('shows loading state while fetching goals', () => {
    render(
      <MemoryRouter>
        <ScopeProvider>
          <SavingsGoalsPage />
        </ScopeProvider>
      </MemoryRouter>
    );
    
    // Check for skeletons (usually have animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no goals exist', async () => {
    const { savingsService } = require('../api/services/savingsService');
    savingsService.getGoals.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <ScopeProvider>
          <SavingsGoalsPage />
        </ScopeProvider>
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/No savings goals yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your first savings goal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Goal/i })).toBeInTheDocument();
  });

  it('renders a grid of goal cards when goals exist', async () => {
    const { savingsService } = require('../api/services/savingsService');
    const mockGoals = [
      { id: 1, name: 'New Car', target_amount: 200000, current_amount: 50000, category: 'Travel' },
      { id: 2, name: 'House Downpayment', target_amount: 500000, current_amount: 100000, category: 'Housing' }
    ];
    savingsService.getGoals.mockResolvedValueOnce(mockGoals);

    render(
      <MemoryRouter>
        <ScopeProvider>
          <SavingsGoalsPage />
        </ScopeProvider>
      </MemoryRouter>
    );
    
    expect(await screen.findByText('New Car')).toBeInTheDocument();
    expect(screen.getByText('House Downpayment')).toBeInTheDocument();
  });
});
