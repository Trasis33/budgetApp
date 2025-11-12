# Tasks: Add Expense Via In‑Context Modal

**Input**: Design documents from `/specs/001-update-adding-new/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/expense-modal.md, quickstart.md

## Execution Flow (main)
```
1. Load plan & design docs (DONE)
2. Generate setup tasks
3. Generate test-first tasks (contract, unit, integration)
4. Generate implementation tasks (models/services/hooks/components)
5. Generate integration & analytics tasks
6. Generate polish & documentation tasks
7. Output ordered list with dependencies & parallel markers
```

## Legend
- [P] → Task may run in parallel (distinct files, no ordering dependency)
- Paths are relative to repo root unless otherwise stated

## Phase 3.1: Setup
| ID | Task |
|----|------|
| T001 | (X) Verify existing backend route `server/routes/expenses.js` supports needed fields (no change expected); annotate inline TODO comments for modal considerations (optimistic id reconciliation) |
| T002 | (X) Add feature flag constant (if needed later) placeholder `client/src/config/featureFlags.js` with `export const ENABLE_EXPENSE_MODAL = true;` |
| T003 [P] | (X) Create modal component file scaffold `client/src/components/expenses/ExpenseCreateModal.jsx` (no logic yet) |
| T004 [P] | (X) Create form state hook scaffold `client/src/hooks/useExpenseCreateForm.js` with placeholder return structure |
| T005 | (X) Add analytics event utility extension in `client/src/utils/analytics.js` (append event constants; no implementation logic yet) |

## Phase 3.2: Tests First (TDD)
(Write tests so they FAIL before implementing; do not implement production logic yet.)
| ID | Task |
|----|------|
| T006 [P] | (X) Contract test for POST /api/expenses request/response shape: `client/src/__tests__/contract/postExpense.contract.test.js` (mock fetch, assert required fields, success mapping) |
| T007 [P] | (X) Unit test ratio validation util: `client/src/__tests__/unit/ratioValidation.test.js` (cases: valid 50/50, invalid 60/30, tolerance 49.8/50.2 accepted) |
| T008 [P] | (X) Component test: modal open/close & focus trap `client/src/__tests__/components/ExpenseCreateModal.focus.test.jsx` |
| T009 [P] | (X) Integration test: successful expense creation optimistic insert `client/src/__tests__/integration/expenseCreate.success.test.jsx` |
| T010 [P] | (X) Integration test: Save & Add Another persistence `client/src/__tests__/integration/expenseCreate.saveAddAnother.test.jsx` |
| T011 [P] | (X) Integration test: discard confirmation on ESC with dirty form `client/src/__tests__/integration/expenseCreate.discard.test.jsx` |
| T012 [P] | (X) Integration test: future date blocked `client/src/__tests__/integration/expenseCreate.futureDate.test.jsx` |
| T013 [P] | (X) Integration test: custom split ratios sum enforcement `client/src/__tests__/integration/expenseCreate.splitValidation.test.jsx` |
| T014 [P] | (X) Integration test: network failure & retry retains values `client/src/__tests__/integration/expenseCreate.retry.test.jsx` |
| T015 [P] | (X) Analytics events test: verify emitted sequence for success & validation error `client/src/__tests__/integration/expenseCreate.analytics.test.jsx` |
| T016 | (X) Snapshot/DOM test for budget remaining conditional rendering `client/src/__tests__/components/ExpenseCreateModal.budget.test.jsx` (not parallel: same component file as T008) |
| T041 [P] | (X) Integration test: amount required & negative amount blocked `client/src/__tests__/integration/expenseCreate.amountValidation.test.jsx` |
| T042 [P] | (X) Integration test: description length 141 chars rejected & counter stops at 0 `client/src/__tests__/integration/expenseCreate.descriptionLimit.test.jsx` |
| T043 [P] | (X) Integration test: duplicate rapid submissions prevented (button disabled after first click) `client/src/__tests__/integration/expenseCreate.duplicateSubmit.test.jsx` |
| T044 [P] | (X) Integration test: feature flag off hides Add Expense trigger `client/src/__tests__/integration/expenseCreate.featureFlagOff.test.jsx` |

## Phase 3.3: Core Implementation
| ID | Depends | Task |
|----|---------|------|
| T017 | T007 | (X) Implement ratio validation util `client/src/utils/ratioValidation.js` (export validateRatios with tolerance logic) |
| T018 | T006 | (X) Implement API client function `client/src/services/expenses/createExpense.js` handling POST & response normalization |
| T019 | T003,T004 | (X) Implement modal component structure (static layout, aria attributes, focus trap skeleton) |
| T020 | T004,T007 | (X) Implement form hook logic (state, validation triggers, dirty tracking, Save & Add Another reset rules) |
| T021 | T018,T020 | (X) Wire submit handling with optimistic insert (update expenses list state) in `client/src/components/expenses/ExpenseCreateModal.jsx` |
| T022 | T018 | (X) Add expense list insertion helper `client/src/utils/expensesListUtils.js` (sort insertion date DESC) |
| T023 | T021 | (X) Implement discard confirmation flow (backdrop & ESC) |
| T024 | T018 | (X) Implement analytics event emissions in `analytics.js` for defined taxonomy |
| T025 | T019 | (X) Implement budget remaining fetch (timeout 400ms) logic in modal (graceful suppression) |
| T026 | T019 | (X) Implement description length counter & enforcement (140 char hard stop) |
| T027 | T018,T020 | (X) Implement Save & Add Another field persistence rules |
| T028 | T018 | (X) Add retry logic & optimistic rollback on failure |

## Phase 3.4: Integration & Refinement
| ID | Depends | Task |
|----|---------|------|
| T029 | T021 | (X) Add accessibility audit (aria labels, role=dialog, aria-modal) test in `client/src/__tests__/components/ExpenseCreateModal.a11y.test.jsx` (simple assertions) |
| T030 | T024 | (X) Add analytics latency measurement (capture start/end timestamps) |
| T031 | T021 | (X) Refactor to isolate pure form reducer (if complexity > threshold) in `client/src/hooks/useExpenseCreateForm.js` |
| T032 | T022 | (X) Add unit tests for list insertion helper `client/src/__tests__/unit/expensesListUtils.test.js` |
| T033 | T025 | (X) Add timeout abort controller for budget fetch (cleanup on unmount) |

## Phase 3.5: Polish & Documentation
| ID | Depends | Task |
|----|---------|------|
| T034 | T028 | (X) Remove legacy navigation link to old expense page (if exists) & add redirect fallback comment |
| T035 | T029 | (X) Add inline JSDoc comments (ratio util, modal component, form hook) |
| T036 | T024 | (X) Update `docs/` or README modal section: usage, events, rollback plan `docs/expense-modal.md` |
| T037 | T021 | (X) Add manual test script `scripts/manual-expense-modal.md` (copy from quickstart & extend with analytics) |
| T038 | T021 | (X) Add basic performance measurement (console.time around submit) with TODO to integrate formal metrics later |
| T039 | T021 | (X) Ensure feature flag env guard (if turned off, hide trigger) in `client/src/config/featureFlags.js` |
| T040 | T034 | (X) Final dependency audit & ensure no unused imports introduced |

## Dependencies Summary
- Tests (T006–T016) must be authored before implementation tasks (T017+)
- Additional tests (T041–T044) also precede implementation where relevant
- Ratio util (T017) before hook/form validation using it
- API client (T018) before submit/insertion (T021)
- Modal skeleton (T019) before advanced features (budget, description counter)
- Analytics emission (T024) before latency enhancement (T030)
- Optimistic logic (T021,T022) before retry (T028)

## Parallel Execution Examples
```
# Example 1: Initial test wave
Run in parallel: T006 T007 T008 T009 T010 T011 T012 T013 T014 T015

# Example 2: Early implementation wave after tests
Run in parallel: T017 T018 T019

# Example 3: Mid-feature utilities
Run in parallel: T022 T024 T026
```

## Validation Checklist
- [ ] All contract interactions have at least one contract test (T006 covers POST /api/expenses)
- [ ] All entities relevant to feature (Expense) covered by integration tests
- [ ] Tests precede implementation (ordering maintained)
- [ ] Parallel tasks modify distinct files
- [ ] Analytics events tested (T015)
- [ ] Accessibility test included (T029)
- [ ] Amount validation test present (T041)
- [ ] Description length enforcement test present (T042)
- [ ] Duplicate submission prevention test present (T043)
- [ ] Feature flag off behavior test present (T044)

## Rollback Notes
- Revert modal component & feature flag (T019,T039)
- Restore navigation to legacy page (inverse of T034)
- Remove analytics events additions (T024)

## Completion Definition
Feature considered DONE when:
- All tasks through T039 complete
- All tests green; new tests cover edge cases (future date, ratio mismatch, discard)
- Quickstart manual steps pass
- Performance goals (open <150ms) visually confirmed

*** End of tasks.md ***