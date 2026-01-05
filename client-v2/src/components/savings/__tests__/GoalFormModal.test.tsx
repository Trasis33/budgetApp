import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GoalFormModal } from '../GoalFormModal';
import { SavingsGoal } from '../../../types';
import userEvent from '@testing-library/user-event';

// Mock Dialog to avoid Radix UI complexity in tests
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog-root">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('GoalFormModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
  };

  const mockGoal: SavingsGoal = {
    id: 1,
    name: 'Vacation',
    target_amount: 10000,
    current_amount: 1000,
    target_date: '2026-12-31',
    is_pinned: false,
    color_index: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create mode with empty fields', () => {
    render(<GoalFormModal {...defaultProps} />);
    
    expect(screen.getByText(/create savings goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal name/i)).toHaveValue('');
    expect(screen.getByLabelText(/target amount/i)).toHaveValue(0);
  });

  test('renders edit mode with pre-filled fields', () => {
    render(<GoalFormModal {...defaultProps} goal={mockGoal} />);
    
    expect(screen.getByText(/edit savings goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal name/i)).toHaveValue('Vacation');
    expect(screen.getByLabelText(/target amount/i)).toHaveValue(10000);
  });

  test('calls onClose when clicking cancel', () => {
    render(<GoalFormModal {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('shows validation errors for required fields on empty submit', async () => {
    const user = userEvent.setup();
    render(<GoalFormModal {...defaultProps} />);
    
    // Clear amount if it defaults to 0 and we want to trigger required
    // Actually, default 0 is valid for number input but our validation says min 1
    
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    await waitFor(() => {
      expect(screen.getByText(/goal name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/target date is required/i)).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('shows error for non-positive target amount', async () => {
    const user = userEvent.setup();
    render(<GoalFormModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/goal name/i), 'Test Goal');
    await user.clear(screen.getByLabelText(/target amount \(sek\)/i));
    await user.type(screen.getByLabelText(/target amount \(sek\)/i), '-100');
    await user.type(screen.getByLabelText(/target date/i), '2026-12-31');
    
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('shows error for target date in the past', async () => {
    const user = userEvent.setup();
    render(<GoalFormModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/goal name/i), 'Test Goal');
    await user.type(screen.getByLabelText(/target amount \(sek\)/i), '1000');
    
    // Type a past date
    await user.type(screen.getByLabelText(/target date/i), '2020-01-01');
    
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    await waitFor(() => {
      expect(screen.getByText(/target date must be in the future/i)).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<GoalFormModal {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/goal name/i), 'New Laptop');
    await user.type(screen.getByLabelText(/target amount \(sek\)/i), '15000');
    await user.type(screen.getByLabelText(/target date/i), '2026-12-31');
    await user.type(screen.getByLabelText(/category \(optional\)/i), 'Tech');
    
    await user.click(screen.getByRole('button', { name: /create goal/i }));

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'New Laptop',
        target_amount: 15000,
        target_date: '2026-12-31',
        category_name: 'Tech',
      });
    });
  });
});
