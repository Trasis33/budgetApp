import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalFormModal } from '../GoalFormModal';
import { SavingsGoal } from '../../../types';

// Mock Dialog to avoid Radix UI complexity in tests
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div>{children}</div> : null,
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
    target_date: '2026-06-01',
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
});
