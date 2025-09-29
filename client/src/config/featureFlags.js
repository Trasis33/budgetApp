// Feature Flags
// Add new feature toggles here. Prefer build-time (static) flags for dead-code elimination
// where possible. Runtime env-based flags can be wired later if needed.

// Set default true, but allow override via process.env for test scenarios
export const ENABLE_EXPENSE_MODAL = process.env.REACT_APP_ENABLE_EXPENSE_MODAL === 'false' ? false : true; // Controls visibility of the new Expense Create Modal trigger

// NOTE: If disabling, ensure related tests (e.g., feature flag off behavior) are updated
// and the legacy navigation path (if any) remains accessible.
