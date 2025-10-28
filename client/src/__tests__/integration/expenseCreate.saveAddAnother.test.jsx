/**
 * T010 Integration test (failing first): Save & Add Another persistence
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create Save & Add Another (T010)', () => {
  it('retains category & payer (placeholder)', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    const categorySelect = screen.queryByLabelText(/category/i);
    expect(categorySelect).toBeInTheDocument(); // fail
  });
});
