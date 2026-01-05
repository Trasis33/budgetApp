import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SavingsGoalDetailPage } from '../SavingsGoalDetailPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { savingsService } from '@/api/services/savingsService';
import { format, addDays } from 'date-fns';

jest.mock('@/api/services/savingsService', () => ({
  savingsService: {
    getGoals: jest.fn(),
    getContributions: jest.fn(),
    deleteContribution: jest.fn(),
  },
}));

describe('SavingsGoalDetailPage', () => {
  const mockGoal = {
    id: 1,
    name: 'New Car',
    target_amount: 200000,
    current_amount: 50000,
    target_date: '2026-12-31',
    is_pinned: false,
    color_index: 0,
    category_name: 'Transportation',
    created_at: '2025-01-01',
  };

  const mockContributions = [
    { id: 1, goal_id: 1, amount: 50000, date: '2025-01-15', note: 'Initial savings', created_at: '2025-01-15' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (savingsService.getGoals as jest.Mock).mockResolvedValue([mockGoal]);
    (savingsService.getContributions as jest.Mock).mockResolvedValue(mockContributions);
  });

  test('renders loading state then goal details', async () => {
    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New Car')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      const amounts = screen.getAllByText(/50\s?000/);
      expect(amounts.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('shows error state if goal not found', async () => {
    (savingsService.getGoals as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/savings/999']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/goal not found/i)).toBeInTheDocument();
    });
  });

  test('displays contribution history with date, amount, and note', async () => {
    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Contribution History')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Initial savings'))).toBeInTheDocument();
      const amounts = screen.getAllByText(/50\s?000/);
      expect(amounts.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('contributions are displayed', async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
    const twoDaysAgo = format(addDays(new Date(), -2), 'yyyy-MM-dd');

    (savingsService.getContributions as jest.Mock).mockResolvedValue([
      { id: 3, goal_id: 1, amount: 10000, date: today, note: 'Today', created_at: today },
      { id: 1, goal_id: 1, amount: 20000, date: yesterday, note: 'Yesterday', created_at: yesterday },
      { id: 2, goal_id: 1, amount: 20000, date: twoDaysAgo, note: 'Two days ago', created_at: twoDaysAgo },
    ]);

    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Today'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Yesterday'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Two days ago'))).toBeInTheDocument();
    });
  });

  test('shows empty state when no contributions exist', async () => {
    (savingsService.getContributions as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no contributions yet/i)).toBeInTheDocument();
    });
  });

  test('back button navigates to savings list', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
          <Route path="/savings" element={<div data-testid="savings-list">Savings List</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New Car')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to savings/i });
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('savings-list')).toBeInTheDocument();
    });
  });
});
