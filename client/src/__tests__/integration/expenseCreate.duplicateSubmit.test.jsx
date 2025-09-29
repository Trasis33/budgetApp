/**
 * T043 Integration test (failing first): duplicate submit prevention
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create duplicate submit prevention (T043)', () => {
  it('submit button enabled before interaction', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    const saveBtn = screen.getByRole('button', { name: /^save$/i });
    expect(saveBtn).not.toBeDisabled();
  });
});
