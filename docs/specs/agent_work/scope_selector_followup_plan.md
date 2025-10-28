# Scope Selector Follow-up Plan (2025-10-08)

## Objective
Extend the scope selector implementation across client data views and supporting documentation so that all expense analytics respond to the selected context and the rollout is well communicated.

## Workstreams

1. **Expense Data Integration (scope-task-005)**
   - Audit components currently reading expenses (e.g., `ExpensesV2`, `CategoryBoard`, recurrent generators) and identify required scope filtering hooks.
   - Introduce a shared hook (e.g., `useScopedExpenses`) leveraging `ScopeContext` and the `/api/expenses?scope=` query parameter.
   - Update KPI cards and recurring sections to consume scoped totals from `ScopeContext` and refetch on `scope` changes.
   - Validate loading states for rapid scope toggles; ensure AbortController cancels overlapping requests.

2. **Analytics & Dashboard Alignment**
   - Propagate scope totals into `ModernEnhancedDashboard` and child cards (`KPISummaryCards`, `SpendingPatternsChart`) with fallback messaging when partner link is absent.
   - Confirm `/api/analytics/*` endpoints support scope filtering or derive per-scope views client-side until server support exists.
   - Add aria-live regions or subtle toasts indicating when data reflects “Ours”, “Mine”, or “Partner”.

3. **Regression Coverage & Documentation (scope-task-006)**
   - Draft manual QA checklist covering scope toggles, disabled state, and totals accuracy across pages.
   - Update specs/README sections referencing the navbar to describe scope functionality and partner linking requirements.
   - Capture known gaps (e.g., analytics API scope support) in MIGRATION_CHANGELOG.md for future follow-up.

## Sequencing

- Complete Expense Data Integration before Analytics work to avoid duplicate refactors.
- Documentation updates follow once UI changes are verified.
- Coordinate with future backend tasks if additional scope endpoints are required.

## Open Questions

- Do analytics endpoints require backend scope parameters or can client post-process? (Pending investigation.)
- Should partner linking UX live in Settings or via inline CTA on the navbar? (Needs design input.)
