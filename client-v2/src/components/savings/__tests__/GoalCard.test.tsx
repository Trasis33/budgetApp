import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalCard } from '../GoalCard';
import { SavingsGoal } from '../../../types';

// Mock DualProgressRings
jest.mock('../DualProgressRings', () => ({
  DualProgressRings: ({ amountProgress, timeProgress }: any) => (
    <div data-testid="dual-progress-rings">
      <span>Amount: {amountProgress}%</span>
      <span>Time: {timeProgress}%</span>
    </div>
  ),
}));

// Mock Popover components to avoid Radix UI issues in test environment
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

// Mock DropdownMenu components to avoid Radix UI issues in test environment
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div role="menuitem" data-testid="dropdown-item" onClick={onClick}>{children}</div>
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
    created_at: '2025-01-01',
  };

  const mockCallbacks = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPin: jest.fn(),
    onQuickAddContribution: jest.fn(),
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
    const pinIcon = container.querySelector('.lucide-pin');
    expect(pinIcon).toBeInTheDocument(); 
  });

  test('does not show pin indicator when not pinned', () => {
    const { container } = render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    // Check for the rotate-45 class which is the pin indicator on the card
    const pinIcons = container.querySelectorAll('.rotate-45');
    expect(pinIcons.length).toBe(0);
  });

  test('renders DualProgressRings with correct props', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    const rings = screen.getByTestId('dual-progress-rings');
    expect(rings).toBeInTheDocument();
    expect(screen.getByText('Amount: 25%')).toBeInTheDocument();
  });

  test('pin button shows pin indicator', async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    const menuTrigger = screen.getByLabelText(/goal actions/i);
    await user.click(menuTrigger);
    
    const pinItem = screen.getByText(/pin/i);
    expect(pinItem).toBeInTheDocument();
    
    await user.click(pinItem);
    expect(mockCallbacks.onPin).toHaveBeenCalledWith(mockGoal);
  });

  test('only one goal can be pinned at a time - pin callback is called', async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    const menuTrigger = screen.getByLabelText(/goal actions/i);
    await user.click(menuTrigger);
    
    const pinItem = screen.getByText(/pin/i);
    await user.click(pinItem);
    
    expect(mockCallbacks.onPin).toHaveBeenCalled();
  });

  test('delete item calls onDelete callback', async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    const menuTrigger = screen.getByLabelText(/goal actions/i);
    await user.click(menuTrigger);
    
    const deleteItem = screen.getByText(/delete/i);
    expect(deleteItem).toBeInTheDocument();
    
    await user.click(deleteItem);
    expect(mockCallbacks.onDelete).toHaveBeenCalledWith(mockGoal);
  });

  test('edit item calls onEdit callback', async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    const menuTrigger = screen.getByLabelText(/goal actions/i);
    await user.click(menuTrigger);
    
    const editItem = screen.getByText(/edit/i);
    await user.click(editItem);
    
    expect(mockCallbacks.onEdit).toHaveBeenCalledWith(mockGoal);
  });

  test('quick add button is present', () => {
    render(<GoalCard goal={mockGoal} {...mockCallbacks} />);
    
    const quickAddButton = screen.getByRole('button', { name: /quick add contribution/i });
    expect(quickAddButton).toBeInTheDocument();
  });

  test('card click calls onClick callback', () => {
    const onClick = jest.fn();
    render(<GoalCard goal={mockGoal} {...mockCallbacks} onClick={onClick} />);
    
    const card = screen.getByText('New Car').closest('.group');
    fireEvent.click(card!);
    expect(onClick).toHaveBeenCalled();
  });
});
