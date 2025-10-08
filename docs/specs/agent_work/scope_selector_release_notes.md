# Scope Selector Enhancements – Release Notes (2025-10-08)

## Summary
- Added couple-aware scope totals to the navbar segmented control.
- ExpensesV2 now requests data via `/api/expenses?scope=` and refreshes automatically after mutations.
- Dashboard KPI cards display scope-aware amounts with guidance when partner data is unavailable.
- Introduced `ScopeContext` provider and `useScopedExpenses` hook to share scope state across the client.

## User-Facing Changes
- Scope selection persists across sessions and updates totals without page reloads.
- Partner scope button is disabled until a partner account is linked; helper tooltip explains the requirement.
- Expenses KPI cards label which scope is active and surface server totals for quick validation.
- Dashboard "Total Spending" headline mirrors the active scope and flags missing partner links.

## Operational Notes
- New hook: `client/src/hooks/useScopedExpenses.js` centralizes scoped expense fetching with cancellation support.
- Expenses table and recurring generator call `refreshExpenses()` after mutations to keep scoped data in sync.
- Dashboard retains existing analytics fetch but overlays scope-aware totals; future backend work should add scoped analytics endpoints.

## References
- Manual QA checklist: `docs/specs/agent_work/scope_selector_manual_test_plan.md`
- Planning outline: `docs/specs/agent_work/scope_selector_followup_plan.md`
