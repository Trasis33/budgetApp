/**
 * T014 Integration test (failing first): network retry
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create network retry (T014)', () => {
  it('renders without retry button initially', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});
