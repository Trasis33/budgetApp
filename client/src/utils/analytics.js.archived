// Analytics Utility (extension placeholder for Expense Create Modal feature)
// Phase 3.1: Define event name constants only. Emission logic added in T024.

export const ANALYTICS_EVENTS = {
  EXPENSE_CREATE_OPEN: 'expense_create_open',
  EXPENSE_CREATE_VALIDATION_ERROR: 'expense_create_validation_error',
  EXPENSE_CREATE_SUBMIT_START: 'expense_create_submit_start',
  EXPENSE_CREATE_SUBMIT_SUCCESS: 'expense_create_submit_success',
  EXPENSE_CREATE_SUBMIT_ERROR: 'expense_create_submit_error',
  EXPENSE_CREATE_CANCEL_DISCARD: 'expense_create_cancel_discard',
  EXPENSE_CREATE_SAVE_ADD_ANOTHER: 'expense_create_save_add_another'
};

// Placeholder no-op emit function to be replaced/enhanced later.
export function track(eventName, payload = {}) {
  // TODO(T024): Implement actual analytics pipeline (console, network, or adapter dispatch)
  if (process.env.NODE_ENV === 'development') {
    // Keep side effect minimal in scaffold phase
    // eslint-disable-next-line no-console
    console.debug('[analytics][scaffold]', eventName, payload);
  }
}
