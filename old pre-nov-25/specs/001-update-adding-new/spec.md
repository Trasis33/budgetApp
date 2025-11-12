# Feature Specification: Add Expense Via In‑Context Modal (Replace Separate Page Flow)

**Feature Branch**: `001-update-adding-new`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "Update adding new expenses from separate page to modal on expenses list page"

## Execution Flow (main)
```
1. Parse user description from Input
	→ Parsed: move expense creation from standalone page to modal on list page
2. Extract key concepts from description
	→ Concepts: expense creation, current separate navigation, proposed modal overlay, preserve context
3. For each unclear aspect:
	→ (Resolved) Trigger placement, field parity, split UX, autosave scope, error states, accessibility, performance, analytics taxonomy
4. Fill User Scenarios & Testing section
	→ Added primary story + acceptance scenarios
5. Generate Functional Requirements
	→ Enumerated FR-001 .. FR-028 with clarification markers where needed
6. Identify Key Entities (data involved)
	→ Expense, Category, User, Split Allocation, Recurring Template (reference), Budget Impact
7. Run Review Checklist
	→ Some [NEEDS CLARIFICATION] remain → spec not yet fully finalized
8. Return: SUCCESS (spec ready for refinement & clarification cycle)
```

---

## ⚡ Quick Guidelines
- ✅ Focused on WHAT & WHY: Reduce friction, keep user in analytical context, speed multi-entry
- ❌ No implementation details (no frameworks, component libs, or code design)
- 👥 Audience: Product & stakeholders evaluating UX improvement to expense capture flow

### Section Requirements
All mandatory sections completed; entities included because data model touched (creating expenses). Optional integration notes omitted until clarified.

### For AI Generation
Ambiguities explicitly marked with [NEEDS CLARIFICATION: …]. No speculative commitments made where information missing.

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a user reviewing my recent expenses on the expenses list page, I want to quickly add a new expense without losing my current filters, scroll position, or analytical context, so that I can rapidly log multiple expenses in sequence and maintain workflow momentum.

### Acceptance Scenarios
1. Given I am on the expenses list with current month filter applied, When I click the "Add Expense" trigger, Then a modal opens centered above the list preserving the underlying page state (no navigation) and focusing the first input field.
2. Given the modal is open and all required fields are valid, When I submit, Then the modal closes (unless I choose "Save & Add Another"), a success confirmation appears, and the new expense appears in the list in the correct sorted position without a full page reload.
3. Given I partially filled the form and attempt to close the modal, When unsaved changes exist, Then I am prompted to confirm discard (or continue editing) to avoid accidental loss.
4. Given a validation error (e.g., negative amount), When I attempt submission, Then the modal remains open, the offending field is highlighted with an accessible error message, and focus management allows keyboard correction.
5. Given I choose an expense split type that requires specifying user ratios, When I input invalid ratios (e.g., not summing to 100%), Then I see an inline validation message explaining the constraint before submission is allowed.
6. Given I create multiple expenses consecutively using "Save & Add Another", When I finish the last one and close the modal, Then the list reflects all new entries inserted at the correct positions and my original scroll position and filters are preserved.
7. Given a network failure during submission, When I press Save, Then I receive a descriptive error state with option to retry without losing entered form values.
8. Given accessibility users (keyboard / screen reader), When they open and interact with the modal, Then all interactive elements are reachable in logical tab order and focus returns to the original trigger upon close.

### Edge Cases
- Modal opened while another creation modal already active → system prevents opening a second instance.
- Extremely long description text near length limit → UI enforces 140 char max (backend implicitly allows longer but unused).
- High-latency submission (>5s) → show non-blocking progress indicator and disable duplicate submit.
- Duplicate rapid submissions (double click) → must not create duplicate expenses.
- User switches month filter underneath while modal open → Allowed; on submit list refresh respects CURRENT active filter.
- Split ratios rounding errors → Only two users supported; enforce sum 100% with ±0.5 tolerance.
- Modal closure via ESC key with unsaved changes → confirm discard guard.
- Connectivity lost mid-submit (offline) → No offline queue. Preserve form values; show retry.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide an in-context modal to create a new expense from the expenses list page.
- **FR-002**: System MUST preserve the underlying page state (filters, scroll position, sorting) while the modal is open.
- **FR-003**: System MUST present all mandatory expense fields currently required in the standalone creation flow (amount, category, payer, date, description, split type, ratios where applicable).
- **FR-004**: System MUST focus the first logical input field (amount or category) upon modal open for rapid entry.
- **FR-005**: System MUST prevent background content from being interactively focusable while the modal is open (focus trap requirement).
- **FR-006**: System MUST allow cancelling the modal via explicit close control, backdrop click, and ESC key with unsaved-change confirmation when data is entered.
- **FR-007**: System MUST validate amount > 0 before submission.
- **FR-008**: System MUST validate category selection present.
- **FR-009**: System MUST validate payer selection present.
- **FR-010**: System MUST validate date is not in the future (<= today) and >= first day of current month default when omitted.
- **FR-011**: System MUST validate split type and, when custom ratios used, enforce ratio sum = 100% with clear error messaging.
- **FR-012**: System MUST display inline validation messages adjacent to fields and not rely solely on color (accessibility requirement).
- **FR-013**: System MUST disable submit action while a valid submission is in progress to prevent duplicates.
- **FR-014**: System MUST display a submission progress state (e.g., loading indicator text) until server response resolves (success or failure) without specifying design.
- **FR-015**: System MUST show a non-intrusive success acknowledgment and insert the new expense into the list without a full page reload.
- **FR-016**: System MUST insert respecting list sort: primary date DESC, secondary created_at DESC.
- **FR-017**: "Save & Add Another" clears amount & description only; retains date, category, payer, split type & ratios.
- **FR-018**: System MUST restore focus to the original trigger element after modal close.
- **FR-019**: System MUST handle server-side errors (e.g., validation mismatch, auth timeout) by showing a descriptive error state without clearing entered data.
- **FR-020**: Authenticated user required; no additional role tiers.
- **FR-021**: Surface category remaining budget after selection if available within 400ms; else silently omit.
- **FR-022 (Deferred)**: Recurring template creation toggle deferred (explicitly out of scope now).
- **FR-023**: System MUST ensure modal is usable on small viewports (mobile) with scrollable content if vertical space constrained (no horizontal scroll).
- **FR-024**: System MUST ensure form labels are programmatically associated to inputs for assistive tech.
- **FR-025**: Limit description to 140 characters; show live remaining counter; block additional input.
- **FR-026**: System SHOULD allow date quick-pick of recent days to accelerate entry.
- **FR-027**: Backdrop click attempts close; if dirty show discard confirmation; if pristine close immediately.
- **FR-028**: Log events: expense_create_open, expense_create_validation_error(field,error_code), expense_create_submit_start, expense_create_submit_success(latency_ms), expense_create_submit_error(error_code,latency_ms), expense_create_cancel_discard, expense_create_save_add_another.

### Key Entities *(include if feature involves data)*
- **Expense**: A financial record with attributes: amount, category reference, payer user reference, date, description, split type, split allocation metadata, creation timestamp.
- **Category**: Classification bucket used to aggregate spending; referenced by expense.
- **User**: Actor creating expense; may differ from payer field (if selecting which user paid).
- **Split Allocation**: Representation of cost distribution between users (e.g., equal, percentage ratios).
- **Recurring Template (Optional Extension)**: Pattern from which recurring expenses are generated; may be optionally created from modal if extended.
- **Budget Impact (Derived / Not Stored Here)**: Computed residual budget for category/month after inclusion of new expense.

---

## Review & Acceptance Checklist
*GATE: Pending clarifications prior to final approval*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No clarification markers remain
- [x] Requirements are testable and unambiguous where specified
- [x] Success criteria measurable (see Success Metrics)
- [x] Scope is clearly bounded (limited to creation UX modality)
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated during drafting*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---

## Resolved Decisions Summary
1. Future-dated expenses: Not allowed.
2. Description length: 140 char cap (UI enforced).
3. Budget remaining: Show if quick; else omit gracefully.
4. Recurring toggle: Deferred.
5. Persist on Save & Add Another: date, category, payer, split config.
6. Sort order: date DESC, created_at DESC.
7. Permissions: Auth only.
8. Offline queue: Not implemented; retry only.
9. Backdrop: Allowed with discard confirm.
10. KPIs: Defined below.
11. Analytics taxonomy defined (FR-028).
12. Two-user model only this release.

## Success Metrics
- Median creation time (open→success) ≤ 7s and ≥30% improvement vs baseline.
- Multi-entry session rate (≥3 entries within 10m) +20% at 30 days.
- Validation failure rate ≤ baseline +5% relative.
- Duplicate submissions: 0 incidents.
- Modal adoption: ≥70% of new expenses via modal by week 2.

## Dependencies
- Auth session (token) required.
- POST /api/expenses (unchanged contract).
- GET /api/categories for category list.
- User context for payer selection.
- Budgets data (optional) for remaining budget panel.
- Expense list state manager capable of optimistic insert or targeted refetch.
- Analytics/event logger.

## Non-Functional Requirements
- Accessibility: WCAG 2.1 AA focus management & labeling.
- Performance: Open <150ms; show loading if submit >300ms.
- Reliability: Duplicate suppression via disabled submit while pending.
- Internationalization readiness for labels.

## Assumptions (Validated)
- Backend model sufficient; no schema change.
- Two-user split stable for iteration.
- Budget data may be unavailable; UI silent fallback.

---

## Removed Section
Prior "Assumptions (To validate)" replaced by validated assumptions above.

---

## Out of Scope (Explicit Exclusions)
- Bulk import or CSV upload.
- Editing existing expenses inside the same modal (future enhancement).
- Advanced recurring scheduling UI (beyond simple toggle if approved).
- Multi-currency handling changes.

---

Specification finalized; ready for implementation planning.

