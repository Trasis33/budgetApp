/**
 * T008 Component test (failing first): Modal open/close & focus trap
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

describe('ExpenseCreateModal focus & close (T008)', () => {
  it('expects amount field to exist and receive focus (not yet implemented)', () => {
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    const amountField = screen.queryByLabelText(/amount/i);
    expect(amountField).toBeInTheDocument(); // red until field added
  });
});
