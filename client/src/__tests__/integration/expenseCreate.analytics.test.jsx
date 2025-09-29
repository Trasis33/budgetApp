/**
 * T015 Integration test (failing first): analytics event sequence
 */
import React from 'react';
import { render } from '@testing-library/react';
import { ExpenseCreateModal } from '../../components/expenses/ExpenseCreateModal';
import * as analytics from '../../utils/analytics';

describe('Expense create analytics events (T015)', () => {
  it('emits open -> submit sequence (placeholder)', () => {
    const spy = jest.spyOn(analytics, 'track');
    render(<ExpenseCreateModal isOpen onClose={() => {}} />);
    expect(spy).toHaveBeenCalledWith(analytics.ANALYTICS_EVENTS.EXPENSE_CREATE_OPEN, expect.any(Object)); // fail (no tracking yet)
  });
});
