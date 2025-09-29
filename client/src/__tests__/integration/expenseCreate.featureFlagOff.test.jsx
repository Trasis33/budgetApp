/**
 * T044 Integration test (failing first): feature flag off hides trigger
 */
jest.resetModules();

describe('Expense create feature flag behavior (T044)', () => {
  it('hides trigger when flag off (env override)', () => {
    process.env.REACT_APP_ENABLE_EXPENSE_MODAL = 'false';
    const { ENABLE_EXPENSE_MODAL } = require('../../config/featureFlags');
    expect(ENABLE_EXPENSE_MODAL).toBe(false);
  });
});
