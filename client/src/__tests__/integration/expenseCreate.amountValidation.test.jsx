/**
 * T041 Integration test (failing first): amount validation
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create amount validation (T041)', () => {
  it('shows error after submit attempt with empty amount', async () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(screen.getByText(/amount required/i)).toBeInTheDocument();
  });
});
