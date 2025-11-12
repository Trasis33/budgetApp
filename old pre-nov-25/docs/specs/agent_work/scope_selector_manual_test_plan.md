# Scope Selector Manual Test Plan

## Preconditions
- Two demo users (`user1@example.com`, `user2@example.com`) exist and are linked via setup script.
- Application server and client are running (`npm run dev`).
- Tester is authenticated as `user1@example.com`.

## Test Matrix
| Scenario | Steps | Expected Result |
| --- | --- | --- |
| Shared scope default | Load dashboard after login | Navbar shows `Shared scope` totals, Expenses page lists shared entries only |
| Switch to Mine | Click `Mine` in scope selector | Totals update to reflect expenses paid by logged-in user; Expenses table filters automatically without reload |
| Switch to Partner | Click `Partner` in scope selector | If partner linked: totals updates to partner-paid expenses; if not linked: option disabled with helper tooltip |
| Toggle filters | Apply month/category filters on Expenses page while in `Mine` | Filtered table updates without breaking scope; KPI cards continue to show scoped totals |
| Dashboard badges | With `Partner` scope active, view dashboard KPIs | “Total Spending” headline reflects partner totals, displays helper if partner scope disabled |
| Recurring generation | Trigger `Generate for month` in recurring panel | Scoped expenses refetch; new entries respect active scope |
| Expense create | Add new expense via modal while in `Mine` | New entry appears after optimistic flow and remains filtered according to scope |
| Deletion | Delete an expense while in `Ours` | Row disappears, totals update after refresh |

## Regression Checklist
- Scope selection persists across refresh via localStorage.
- Disabled Partner state surfaces guidance tooltip/title.
- Scope changes cancel in-flight expense requests (no duplicate fetch errors in console).
- Dashboard analytics continue to load without runtime errors.
- Mobile segmented control mirrors desktop selection and respects disabled state.
