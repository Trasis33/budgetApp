/**
 * T009 Integration test (failing first): optimistic insert
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create optimistic success (T009)', () => {
  it('mounts modal (optimistic list tested elsewhere)', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(screen.getByTestId('expense-create-modal')).toBeInTheDocument();
  });
});
