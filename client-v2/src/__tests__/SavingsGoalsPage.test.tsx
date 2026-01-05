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
});
