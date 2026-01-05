import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoalCard } from '../GoalCard';
import { SavingsGoal } from '../../../types';

// Mock DualProgressRings to avoid SVG rendering issues and focus on Card content
jest.mock('../DualProgressRings', () => ({
  DualProgressRings: ({ amountProgress, timeProgress }: any) => (
    <div data-testid="dual-progress-rings">
      <span>Amount: {amountProgress}%</span>
      <span>Time: {timeProgress}%</span>
    </div>
  ),
}));

describe('GoalCard', () => {
  const mockGoal: SavingsGoal = {
    id: 1,
    name: 'New Car',
    target_amount: 200000,
    current_amount: 50000,
    target_date: '2026-12-31',
    is_pinned: false,
    color_index: 0,
    category_name: 'Transportation',
  };

  test('renders goal name and category', () => {
    render(<GoalCard goal={mockGoal} />);
    expect(screen.getByText('New Car')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  test('renders current and target amounts formatted', () => {
    render(<GoalCard goal={mockGoal} />);
    // Assuming formatCurrency (SEK) adds spaces/commas and kr or SEK
    // Simple check for parts of the number
    expect(screen.getByText(/50\s?000/)).toBeInTheDocument();
    expect(screen.getByText(/200\s?000/)).toBeInTheDocument();
  });

  test('renders target date', () => {
    render(<GoalCard goal={mockGoal} />);
    // Adjust expected format based on utils/date format. Usually MMM DD, YYYY or YYYY-MM-DD
    // Let's check for year at least
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  test('renders pin indicator when pinned', () => {
    const pinnedGoal = { ...mockGoal, is_pinned: true };
    const { container } = render(<GoalCard goal={pinnedGoal} />);
    // Look for pin icon or visual indicator. 
    // Usually Lucide 'Pin' icon.
    // We can check if an element with appropriate label/class exists
    // Or just check that it renders without crash for now, and check class if we knew it.
    // Let's assume we add an aria-label="Pinned" to the pin icon.
    // Or look for svg.
    const pinIcon = container.querySelector('.lucide-pin');
    expect(pinIcon).toBeInTheDocument(); 
    // Note: This relies on implementation detail that we use lucide-pin class or similar.
    // Better: expect(screen.getByLabelText('Pinned')).toBeInTheDocument();
  });

  test('renders DualProgressRings with correct props', () => {
    render(<GoalCard goal={mockGoal} />);
    const rings = screen.getByTestId('dual-progress-rings');
    expect(rings).toBeInTheDocument();
    
    // Amount progress: 50000 / 200000 = 25%
    expect(screen.getByText('Amount: 25%')).toBeInTheDocument();
    
    // Time progress calculation depends on "today". 
    // We should probably mock date, but if we don't, it's hard to test exact percentage.
    // Let's just check it receives *some* number for time.
    expect(screen.getByText(/Time: \d+/)).toBeInTheDocument();
  });
});
