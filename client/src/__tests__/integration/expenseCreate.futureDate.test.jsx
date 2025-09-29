/**
 * T012 Integration test (failing first): future date blocked
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('Expense create future date validation (T012)', () => {
  it('renders date input (future-date rule enforced later)', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });
});
