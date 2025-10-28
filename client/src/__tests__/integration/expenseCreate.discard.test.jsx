/**
 * T011 Integration test (failing first): discard confirmation
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create discard confirmation (T011)', () => {
  it('does not show confirmation until user closes dirty form', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument();
  });
});
