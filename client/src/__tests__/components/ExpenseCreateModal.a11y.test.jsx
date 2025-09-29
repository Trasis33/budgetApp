import React from 'react';
import { render, screen } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';

test('modal has dialog role and labelled title (T029)', () => {
  render(<ExpenseCreateModal isOpen onClose={()=>{}} />);
  const dialog = screen.getByRole('dialog');
  const title = screen.getByRole('heading', { name: /add expense/i });
  expect(dialog).toHaveAttribute('aria-labelledby', title.id);
});
