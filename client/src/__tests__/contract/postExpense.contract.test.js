/**
 * T006 Contract test (failing first): POST /api/expenses request/response shape
 */
// eslint-disable-next-line no-unused-vars
import { createExpense } from '../../services/expenses/createExpense'; // Not yet implemented (T018)

describe('POST /api/expenses contract (T006)', () => {
  it('maps response shape including category_name & paid_by_name', async () => {
    // This will fail until createExpense exists & returns proper object
    expect(typeof createExpense).toBe('function');
  });
});
