/**
 * T042 Integration test (failing first): description length
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create description length (T042)', () => {
  it('shows error when typing beyond 140 chars', async () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    const desc = screen.getByLabelText(/description/i);
    await userEvent.type(desc, 'x'.repeat(141));
    expect(screen.getByText(/exceeds 140/i)).toBeInTheDocument();
  });
});
