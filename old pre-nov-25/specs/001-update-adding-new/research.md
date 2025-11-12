# Phase 0 Research: Add Expense Modal

## Objectives
Clarify validation, list update strategy, accessibility, analytics events, and budget remaining retrieval while reusing existing architecture.

## Areas Reviewed
1. API Contract Reuse
2. Client State Update (Optimistic vs Refetch)
3. Validation Rules & Edge Conditions
4. Accessibility & Focus Management
5. Analytics Event Taxonomy
6. Budget Remaining Display Strategy
7. Performance Considerations

## Findings & Decisions

### 1. API Contract Reuse
Decision: Reuse POST /api/expenses with existing fields (date optional → defaults first day of month). No new endpoint.  
Rationale: Minimizes backend changes; spec forbids additional endpoints.  
Alternatives: Add lightweight /api/expenses/preview for budget projections (rejected: unnecessary complexity now).

### 2. Client State Update Strategy
Decision: Prefer optimistic insert (prepend to list respecting sort by date DESC; then reconcile with server response ID & canonical fields). If date differs from currently visible month filter after server normalization, remove from view.  
Rationale: Improves perceived performance (<150ms).  
Fallback: On validation error from server, rollback optimistic entry and surface error.  
Alternatives: Always refetch entire list (rejected: additional load, slower UX) or hybrid diff endpoint (overkill now).

### 3. Validation Rules & Edge Conditions
Client Rules:  
- Amount: numeric > 0 (coerce to 2 decimals).  
- Description: ≤ 140 chars (hard stop).  
- Date: Not in future; default today (or first day-of-month per server if omitted).  
- Split ratios (custom): Sum 100 ±0.5 tolerance.  
- Category, Payer required.  
Server already enforces presence of amount/category/payer and sets default date. Need to add client guard for future date + ratio sum.

### 4. Accessibility & Focus Management
Decision: Implement focus trap (initial focus on amount input). Return focus to trigger on close. ESC closes when pristine or confirms discard if dirty. Backdrop clickable with same rule.  
Alternatives: Disable backdrop close entirely (rejected: reduces discoverability).  
Screen Reader: Provide aria-labelledby for modal title and aria-describedby for validation summary if any blocking errors.

### 5. Analytics Event Taxonomy
Events (all camelCase for consistency with existing patterns planned):  
- expense_create_open  
- expense_create_validation_error { field, error_code }  
- expense_create_submit_start { temp_id }  
- expense_create_submit_success { id, latency_ms }  
- expense_create_submit_error { error_code, latency_ms }  
- expense_create_cancel_discard { dirty }  
- expense_create_save_add_another { sequence_count }
Rationale: Supports measuring time-to-create, validation friction, multi-entry adoption.

### 6. Budget Remaining Display Strategy
Decision: After category select, fire lightweight budgets summary fetch (if not already cached). If response >400ms or failure, silently skip.  
Alternatives: Preload on page load (increased initial payload) | Show skeleton loader (extra complexity). Rejected for now.

### 7. Performance Considerations
- Modal open: Preload form component bundle on first hover/focus of trigger (code-splitting optional future).  
- List reconciliation: O(1) unshift plus re-sort only if new expense date differs from top.  
- Avoid re-render storm: Local form state isolated; lift only final success event up.

## Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Duplicate submissions | Medium | Low | Disable submit during pending; idempotent optimistic rollback |
| Validation mismatch server vs client | Low | Medium | Rely on server error fallback + align rules now |
| Accessibility regressions | High | Low | Add automated jest-axe check (future optional) + manual test |
| Budget fetch latency | Low | Medium | Timeout & silent omission |

## Open (Deferred) Items
- Recurring template creation (future iteration).  
- Offline queue / draft persistence.  
- Multi-user (>2) splits.

## Summary
All clarifications resolved; no further blockers. Ready for Phase 1 design artifact generation.
