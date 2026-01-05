import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from '../GoalCard';
import { SavingsGoal } from '../../../types';
import userEvent from '@testing-library/user-event';

// Mock DualProgressRings
jest.mock('../DualProgressRings', () => ({
  DualProgressRings: ({ amountProgress, timeProgress }: any) => (
    <div data-testid="dual-progress-rings">
      <span>Amount: {amountProgress}%</span>
      <span>Time: {timeProgress}%</span>
    </div>
  ),
}));

// Mock DropdownMenu components to avoid Radix UI issues in test environment
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" onClick={onClick}>{children}</div>
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

  const mockCallbacks = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPin: jest.fn(),
    onAddContribution: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders goal name and category', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    expect(screen.getByText('New Car')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  test('renders current and target amounts formatted', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    expect(screen.getByText(/50\s?000/)).toBeInTheDocument();
    expect(screen.getByText(/200\s?000/)).toBeInTheDocument();
  });

  test('renders target date', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  test('renders pin indicator when pinned', () => {
    const pinnedGoal = { ...mockGoal, is_pinned: true };
    const { container } = render(<GoalCard goal={pinnedGoal} {...mockCallbacks} />);
    // Look for pin icon
    const pinIcon = container.querySelector('.lucide-pin');
    expect(pinIcon).toBeInTheDocument(); 
  });

  test('renders DualProgressRings with correct props', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    const rings = screen.getByTestId('dual-progress-rings');
    expect(rings).toBeInTheDocument();
    expect(screen.getByText('Amount: 25%')).toBeInTheDocument();
  });

  test('renders quick-add button and calls callback', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    const addButton = screen.getByRole('button', { name: /add contribution/i });
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    expect(mockCallbacks.onAddContribution).toHaveBeenCalled();
  });

  test('renders actions menu and calls callbacks', async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    // Find menu trigger (usually "More options" or ellipsis icon)
    // Assuming generic button or looking for lucide-more-vertical icon
    // or we can look for role="button" with specific name if we add aria-label
    // Let's assume we add aria-label="Goal actions"
    const menuTrigger = screen.getByLabelText(/goal actions/i);
    await user.click(menuTrigger);
    
    // Check menu items
    const editItem = screen.getByText(/edit/i);
    const deleteItem = screen.getByText(/delete/i);
    const pinItem = screen.getByText(/pin/i);
    
    expect(editItem).toBeInTheDocument();
    expect(deleteItem).toBeInTheDocument();
    expect(pinItem).toBeInTheDocument();

    // Click Edit
    await user.click(editItem);
    expect(mockCallbacks.onEdit).toHaveBeenCalled();
  });
});
