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

## Phase 3: Savings Goals List Page [ ]

- [x] Task: Create SavingsGoalsPage.tsx component ee51160
  - [ ] Write failing test for component render
  - [ ] Implement page layout with header and grid container
  - [ ] Add scope switcher (Mine/Partner's/Ours)
  - [ ] Integrate with savingsService.getGoals()
- [x] Task: Implement loading and empty states 3aa01ca
  - [ ] Write failing test for loading skeleton
  - [ ] Write failing test for empty state with CTA
  - [ ] Implement skeleton loader during fetch
  - [ ] Implement empty state with "Create your first goal" button
- [x] Task: Implement goal card grid layout 50e6ba8
  - [ ] Write failing test for grid rendering with goals
  - [ ] Implement responsive grid (3 cols desktop, 2 tablet, 1 mobile)
  - [ ] Map goals to GoalCard components
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Savings Goals List Page' (Protocol in workflow.md)

## Phase 4: Goal Card Component with Dual Progress Rings [ ]

- [ ] Task: Create DualProgressRings.tsx component
  - [ ] Write failing tests for progress ring rendering
  - [ ] Test: Amount ring shows correct percentage
  - [ ] Test: Time ring shows correct percentage
  - [ ] Test: Rings display different colors (amount vs time)
  - [ ] Implement SVG-based circular progress indicators
  - [ ] Add percentage labels in center
- [ ] Task: Create GoalCard.tsx component
  - [ ] Write failing tests for card content
  - [ ] Test: Displays goal name and category
  - [ ] Test: Shows current/target amounts formatted as SEK
  - [ ] Test: Shows target date
  - [ ] Test: Shows pin indicator when pinned
  - [ ] Implement card layout with DualProgressRings
- [ ] Task: Add card action buttons
  - [ ] Write failing test for quick-add button presence
  - [ ] Write failing test for edit/delete menu
  - [ ] Implement "+" quick-add button
  - [ ] Implement dropdown menu with Edit, Pin/Unpin, Delete options
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Goal Card Component with Dual Progress Rings' (Protocol in workflow.md)

## Phase 5: Create/Edit Goal Modal [ ]

- [ ] Task: Create GoalFormModal.tsx component
  - [ ] Write failing tests for modal behavior
  - [ ] Test: Modal opens and closes correctly
  - [ ] Test: Form fields render with correct labels
  - [ ] Test: Create mode shows empty form
  - [ ] Test: Edit mode pre-fills form with goal data
- [ ] Task: Implement form validation
  - [ ] Write failing tests for validation rules
  - [ ] Test: Goal name is required
  - [ ] Test: Target amount must be positive number
  - [ ] Test: Target date must be in the future
  - [ ] Implement validation with React Hook Form
  - [ ] Display user-friendly error messages
- [ ] Task: Implement form submission
  - [ ] Write failing test for create submission
  - [ ] Write failing test for edit submission
  - [ ] Call savingsService.createGoal or updateGoal
  - [ ] Show success/error toast notifications
  - [ ] Close modal and refresh list on success
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Create/Edit Goal Modal' (Protocol in workflow.md)

## Phase 6: Goal Detail Page [ ]

- [ ] Task: Create SavingsGoalDetailPage.tsx component
  - [ ] Write failing test for page render with goal data
  - [ ] Implement route parameter extraction (:goalId)
  - [ ] Fetch goal data and contributions on mount
  - [ ] Implement loading state
- [ ] Task: Implement goal header section
  - [ ] Write failing test for header content
  - [ ] Display goal name and category
  - [ ] Show larger dual progress rings
  - [ ] Display current/target with percentage
  - [ ] Show days remaining until target date
  - [ ] Implement pace indicator (on track/behind/ahead)
- [ ] Task: Implement contribution history list
  - [ ] Write failing test for contributions display
  - [ ] Test: Shows date, amount, note for each contribution
  - [ ] Test: Sorted by date descending
  - [ ] Implement list with delete button per item
  - [ ] Add delete confirmation dialog
- [ ] Task: Implement back navigation
  - [ ] Write failing test for back button
  - [ ] Add "Back to Savings Goals" link/button
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Goal Detail Page' (Protocol in workflow.md)

## Phase 7: Contribution Management [ ]

- [ ] Task: Create AddContributionForm.tsx component
  - [ ] Write failing tests for form fields
  - [ ] Test: Amount field is required
  - [ ] Test: Date defaults to today
  - [ ] Test: Date cannot be in the future
  - [ ] Test: Note field is optional
  - [ ] Implement form with React Hook Form
- [ ] Task: Implement contribution submission from detail page
  - [ ] Write failing test for form submission
  - [ ] Call savingsService.addContribution
  - [ ] Update goal progress optimistically
  - [ ] Show success/error toast
  - [ ] Refresh contribution history
- [ ] Task: Implement contribution deletion
  - [ ] Write failing test for delete action
  - [ ] Show confirmation dialog
  - [ ] Call savingsService.deleteContribution
  - [ ] Update goal progress
  - [ ] Remove from history list
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Contribution Management' (Protocol in workflow.md)

## Phase 8: Inline Quick Add Contribution [ ]

- [ ] Task: Create QuickAddContribution.tsx popover component
  - [ ] Write failing tests for popover behavior
  - [ ] Test: Popover opens on "+" button click
  - [ ] Test: Contains amount input field
  - [ ] Test: Submit button adds contribution
  - [ ] Test: Popover closes on success
- [ ] Task: Integrate with GoalCard
  - [ ] Write failing test for integration
  - [ ] Wire up popover to card's "+" button
  - [ ] Update card progress after contribution
  - [ ] Show toast notification on success
- [ ] Task: Conductor - User Manual Verification 'Phase 8: Inline Quick Add Contribution' (Protocol in workflow.md)

## Phase 9: Goal Management Actions [ ]

- [ ] Task: Implement pin/unpin functionality
  - [ ] Write failing test for pin action
  - [ ] Test: Pinned goal shows indicator
  - [ ] Test: Only one goal can be pinned
  - [ ] Call savingsService.updateGoal with is_pinned
  - [ ] Refresh list to reflect pin state
- [ ] Task: Implement delete goal functionality
  - [ ] Write failing test for delete flow
  - [ ] Show confirmation dialog with goal name
  - [ ] Call savingsService.deleteGoal
  - [ ] Remove from list and show toast
- [ ] Task: Conductor - User Manual Verification 'Phase 9: Goal Management Actions' (Protocol in workflow.md)

## Phase 10: BillSplitting Settlement Integration [ ]

- [ ] Task: Identify settlement completion hook point
  - [ ] Read BillSplitting component code
  - [ ] Determine where settlement is marked complete
- [ ] Task: Create SettlementAllocationPrompt.tsx component
  - [ ] Write failing tests for prompt behavior
  - [ ] Test: Prompt displays after settlement completion
  - [ ] Test: Shows list of active savings goals
  - [ ] Test: Skip/dismiss option works
  - [ ] Fetch active goals from savingsService
- [ ] Task: Implement allocation flow
  - [ ] Write failing test for allocation
  - [ ] On goal selection, call addContribution with settlement amount
  - [ ] Show success toast with goal name
  - [ ] Close prompt
- [ ] Task: Conductor - User Manual Verification 'Phase 10: BillSplitting Settlement Integration' (Protocol in workflow.md)

## Phase 11: UI Polish & Accessibility [ ]

- [ ] Task: Implement responsive design
  - [ ] Test card grid on mobile viewport
  - [ ] Ensure touch-friendly button sizes (44x44px minimum)
  - [ ] Verify modal behavior on mobile
- [ ] Task: Add accessibility features
  - [ ] Add ARIA labels to progress rings
  - [ ] Ensure keyboard navigation works
  - [ ] Verify focus management in modals
  - [ ] Test with screen reader
- [ ] Task: Add animations and micro-interactions
  - [ ] Progress ring fill animation on load
  - [ ] Card hover states
  - [ ] Smooth modal transitions
- [ ] Task: Conductor - User Manual Verification 'Phase 11: UI Polish & Accessibility' (Protocol in workflow.md)

## Phase 12: Final Testing & Documentation [ ]

- [ ] Task: Run full test suite and verify coverage
  - [ ] Ensure >80% coverage for new code
  - [ ] Fix any failing tests
- [ ] Task: Run TypeScript compiler and linting
  - [ ] Fix all type errors
  - [ ] Fix all linting errors
- [ ] Task: End-to-end manual testing
  - [ ] Test complete user flow: create goal → add contributions → view progress
  - [ ] Test scope switching behavior
  - [ ] Test settlement allocation flow
- [ ] Task: Conductor - User Manual Verification 'Phase 12: Final Testing & Documentation' (Protocol in workflow.md)
