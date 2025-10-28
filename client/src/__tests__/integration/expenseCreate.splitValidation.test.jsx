/**
 * T013 Integration test (failing first): custom split validation
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create split ratio validation (T013)', () => {
  it('shows error when custom ratios do not sum to 100', async () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole('radio', { name: /custom/i }));
    const r1 = screen.getByLabelText(/user 1 ratio/i);
    const r2 = screen.getByLabelText(/user 2 ratio/i);
    await userEvent.type(r1, '60');
    await userEvent.type(r2, '30');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.getByText(/must sum 100/i)).toBeInTheDocument();
  });
});
