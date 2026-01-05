import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SavingsGoalDetailPage } from '../SavingsGoalDetailPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { savingsService } from '@/api/services/savingsService';

// Mock the savingsService
jest.mock('@/api/services/savingsService', () => ({
  savingsService: {
    getGoalById: jest.fn(), // We might need this new method or use getGoals and filter
    getGoals: jest.fn(),
    getContributions: jest.fn(),
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

    // Initial loading state (assuming we use Skeleton or text)
    // expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('New Car')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
      // Check current amount - use getAll to confirm multiple occurrences
      expect(screen.getAllByText(/50\s?000/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/200\s?000/)[0]).toBeInTheDocument();
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
});
