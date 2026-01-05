import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SavingsGoalDetailPage } from '../SavingsGoalDetailPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { savingsService } from '@/api/services/savingsService';
import { addDays, format } from 'date-fns';

jest.mock('@/api/services/savingsService', () => ({
  savingsService: {
    getGoals: jest.fn(),
    getContributions: jest.fn(),
  },
}));

describe('SavingsGoalDetailPage Header & Pace', () => {
  const futureDate = addDays(new Date(), 30);
  const mockGoal = {
    id: 1,
    name: 'New Car',
    target_amount: 100000,
    current_amount: 50000,
    target_date: format(futureDate, 'yyyy-MM-dd'),
    is_pinned: false,
    color_index: 0,
    category_name: 'Transportation',
    created_at: format(addDays(new Date(), -30), 'yyyy-MM-dd'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (savingsService.getGoals as jest.Mock).mockResolvedValue([mockGoal]);
    (savingsService.getContributions as jest.Mock).mockResolvedValue([]);
  });

  test('displays days remaining until target date', async () => {
    render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Should show approximately 29 or 30 days remaining
      expect(screen.getByText(/30 days remaining|29 days remaining/i)).toBeInTheDocument();
    });
  });

  test('displays pace indicator (ahead/behind/on track)', async () => {
     render(
      <MemoryRouter initialEntries={['/savings/1']}>
        <Routes>
          <Route path="/savings/:goalId" element={<SavingsGoalDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // 50% through time (30 days elapsed out of 60 total)
      // 50% through amount (50k out of 100k)
      // Should be "On Track"
      expect(screen.getByText(/on track/i)).toBeInTheDocument();
    });
  });
});
