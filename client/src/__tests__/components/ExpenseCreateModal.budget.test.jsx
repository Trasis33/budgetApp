/**
 * T016 Component test (failing first): budget remaining section
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('ExpenseCreateModal budget remaining (T016)', () => {
  it('does not show budget remaining without category selection', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(screen.queryByTestId('budget-remaining')).not.toBeInTheDocument();
  });
});
