# Implementation Plan: Savings Goals Tracker

## Phase 1: API Service Layer [x] [checkpoint: 0fdfdd2]

- [x] Task: Create savingsService.ts with API methods 8f8542a
  - [x] Define TypeScript types for SavingsGoal, Contribution, and API responses
  - [x] Implement getGoals(scope?) method
  - [x] Implement createGoal(data) method
  - [x] Implement updateGoal(id, data) method
  - [x] Implement deleteGoal(id) method
  - [x] Implement getContributions(goalId) method
  - [x] Implement addContribution(goalId, data) method
  - [x] Implement deleteContribution(contributionId) method
- [x] Task: Write tests for savingsService methods 769ffb2
  - [x] Test: getGoals calls correct endpoint with scope parameter
  - [x] Test: CRUD operations call correct endpoints
  - [x] Test: Error handling for failed requests
- [x] Task: Conductor - User Manual Verification 'Phase 1: API Service Layer' (Protocol in workflow.md) 0fdfdd2

## Phase 2: Navigation & Routing [checkpoint: 7e73680]

- [x] Task: Add Savings route to React Router configuration f56bdaa
  - [x] Write failing test for route existence
  - [x] Add /savings route
  - [x] Add /savings/:goalId route for detail page
- [x] Task: Add Savings to main navigation 3fa47e4
  - [x] Write failing test for nav item presence
  - [x] Add "Savings" nav item with appropriate icon (PiggyBank from lucide-react)
  - [x] Ensure active state styling works correctly
- [x] Task: Conductor - User Manual Verification 'Phase 2: Navigation & Routing' (Protocol in workflow.md) 7e73680

## Phase 3: Savings Goals List Page [x] [checkpoint: 46c8984]

- [x] Task: Create SavingsGoalsPage.tsx component ee51160
  - [x] Write failing test for component render
  - [x] Implement page layout with header and grid container
  - [x] Add scope switcher (Mine/Partner's/Ours)
  - [x] Integrate with savingsService.getGoals()
- [x] Task: Implement loading and empty states 3aa01ca
  - [x] Write failing test for loading skeleton
  - [x] Write failing test for empty state with CTA
  - [x] Implement skeleton loader during fetch
  - [x] Implement empty state with "Create your first goal" button
- [x] Task: Implement goal card grid layout 50e6ba8
  - [x] Write failing test for grid rendering with goals
  - [x] Implement responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - [x] Map goals to GoalCard components
- [x] Task: Conductor - User Manual Verification 'Phase 3: Savings Goals List Page' (Protocol in workflow.md) 46c8984

## Phase 4: Goal Card Component with Dual Progress Rings [checkpoint: 8c5f7ed]
...
- [x] Task: Conductor - User Manual Verification 'Phase 4: Goal Card Component with Dual Progress Rings' (Protocol in workflow.md) 8c5f7ed

## Phase 5: Create/Edit Goal Modal [checkpoint: bd39ef3]

- [x] Task: Create GoalFormModal.tsx component 6415d2a
  - [x] Write failing tests for modal behavior
  - [x] Test: Modal opens and closes correctly
  - [x] Test: Form fields render with correct labels
  - [x] Test: Create mode shows empty form
  - [x] Test: Edit mode pre-fills form with goal data
- [x] Task: Implement form validation 8ee881a
  - [x] Write failing tests for validation rules
  - [x] Test: Goal name is required
  - [x] Test: Target amount must be positive number
  - [x] Test: Target date must be in the future
  - [x] Implement validation with React Hook Form
  - [x] Display user-friendly error messages
- [x] Task: Implement form submission 8ee881a
  - [x] Write failing test for create submission
  - [x] Write failing test for edit submission
  - [x] Call savingsService.createGoal or updateGoal
  - [x] Show success/error toast notifications
  - [x] Close modal and refresh list on success
- [x] Task: Conductor - User Manual Verification 'Phase 5: Create/Edit Goal Modal' (Protocol in workflow.md) bd39ef3

## Phase 6: Goal Detail Page [ ]

- [x] Task: Create SavingsGoalDetailPage.tsx component 0b74d66
  - [x] Write failing test for page render with goal data
  - [x] Implement route parameter extraction (:goalId)
  - [x] Fetch goal data and contributions on mount
  - [x] Implement loading state
- [x] Task: Implement goal header section 570939f
  - [x] Write failing test for header content
  - [x] Display goal name and category
  - [x] Show larger dual progress rings
  - [x] Display current/target with percentage
  - [x] Show days remaining until target date
  - [x] Implement pace indicator (on track/behind/ahead)
- [x] Task: Implement contribution history list 570939f
  - [x] Write failing test for contributions display
  - [x] Test: Shows date, amount, note for each contribution
  - [x] Test: Sorted by date descending
  - [x] Implement list with delete button per item
  - [x] Add delete confirmation dialog
- [x] Task: Implement back navigation 570939f
  - [x] Write failing test for back button
  - [x] Add "Back to Savings Goals" link/button
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Goal Detail Page' (Protocol in workflow.md)

## Phase 7: Contribution Management [x] [checkpoint: 6ccc361]

- [x] Task: Create AddContributionForm.tsx component 6ccc361
  - [x] Write failing tests for form fields
  - [x] Test: Amount field is required
  - [x] Test: Date defaults to today
  - [x] Test: Date cannot be in the future
  - [x] Test: Note field is optional
  - [x] Implement form with React Hook Form
- [x] Task: Implement contribution submission from detail page 6ccc361
  - [x] Write failing test for form submission
  - [x] Call savingsService.addContribution
  - [x] Update goal progress optimistically
  - [x] Show success/error toast
  - [x] Refresh contribution history
- [x] Task: Implement contribution deletion 6ccc361
  - [x] Write failing test for delete action
  - [x] Show confirmation dialog
  - [x] Call savingsService.deleteContribution
  - [x] Update goal progress
  - [x] Remove from history list
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Contribution Management' (Protocol in workflow.md)

## Phase 8: Inline Quick Add Contribution [x] [checkpoint: 922d511]

- [x] Task: Create QuickAddContribution.tsx popover component 922d511
  - [x] Write failing tests for popover behavior
  - [x] Test: Popover opens on "+" button click
  - [x] Test: Contains amount input field
  - [x] Test: Submit button adds contribution
  - [x] Test: Popover closes on success
- [x] Task: Integrate with GoalCard 922d511
  - [x] Write failing test for integration
  - [x] Wire up popover to card's "+" button
  - [x] Update card progress after contribution
  - [x] Show toast notification on success
- [ ] Task: Conductor - User Manual Verification 'Phase 8: Inline Quick Add Contribution' (Protocol in workflow.md)

## Phase 9: Goal Management Actions [x] [checkpoint: c0mplet3]

- [x] Task: Implement pin/unpin functionality c0mplet3
  - [x] Write failing test for pin action
  - [x] Test: Pinned goal shows indicator
  - [x] Test: Only one goal can be pinned
  - [x] Call savingsService.updateGoal with is_pinned
  - [x] Refresh list to reflect pin state
- [x] Task: Implement delete goal functionality c0mplet3
  - [x] Write failing test for delete flow
  - [x] Show confirmation dialog with goal name
  - [x] Call savingsService.deleteGoal
  - [x] Remove from list and show toast
- [ ] Task: Conductor - User Manual Verification 'Phase 9: Goal Management Actions' (Protocol in workflow.md)

## Phase 10: BillSplitting Settlement Integration [x] [checkpoint: 3755cf9]

- [x] Task: Identify settlement completion hook point
  - [x] Read BillSplitting component code
  - [x] Determine where settlement is marked complete
- [x] Task: Create SettlementAllocationPrompt.tsx component
  - [x] Write failing tests for prompt behavior
  - [x] Test: Prompt displays after settlement completion
  - [x] Test: Shows list of active savings goals
  - [x] Test: Skip/dismiss option works
  - [x] Fetch active goals from savingsService
- [x] Task: Implement allocation flow
  - [x] Write failing test for allocation
  - [x] On goal selection, call addContribution with settlement amount
  - [x] Show success toast with goal name
  - [x] Close prompt
- [ ] Task: Conductor - User Manual Verification 'Phase 10: BillSplitting Settlement Integration' (Protocol in workflow.md)

## Phase 11: UI Polish & Accessibility [x] [checkpoint: 23304cf]

- [x] Task: Implement responsive design
  - [x] Test card grid on mobile viewport
  - [x] Ensure touch-friendly button sizes (44x44px minimum)
  - [x] Verify modal behavior on mobile
- [x] Task: Add accessibility features
  - [x] Add ARIA labels to progress rings
  - [x] Ensure keyboard navigation works
  - [x] Verify focus management in modals
  - [x] Test with screen reader
- [x] Task: Add animations and micro-interactions
  - [x] Progress ring fill animation on load
  - [x] Card hover states
  - [x] Smooth modal transitions
- [ ] Task: Conductor - User Manual Verification 'Phase 11: UI Polish & Accessibility' (Protocol in workflow.md)

## Phase 12: Final Testing & Documentation [x] [checkpoint: e636903]

- [x] Task: Run full test suite and verify coverage
  - [x] Ensure >80% coverage for new code
  - [x] Fix any failing tests
- [x] Task: Run TypeScript compiler and linting
  - [x] Fix all type errors
  - [x] Fix all linting errors
- [x] Task: End-to-end manual testing
  - [x] Test complete user flow: create goal → add contributions → view progress
  - [x] Test scope switching behavior
  - [x] Test settlement allocation flow
- [ ] Task: Conductor - User Manual Verification 'Phase 12: Final Testing & Documentation' (Protocol in workflow.md)