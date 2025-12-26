# Implementation Plan: Smart Budget Wizard - Step 3: Budget Recommendations & Review

## Phase 1: Backend API Service Integration [checkpoint: db36e7a]

- [x] Task: Create optimizationService.ts with API methods [377029e]
  - [x] Implement getAnalysis() method to call /api/optimization/analyze
  - [x] Add TypeScript types for optimization data structures
  - [x] Add error handling for failed requests
- [x] Task: Write failing tests for optimizationService methods
  - [x] Test: getAnalysis() calls correct endpoint and returns data
  - [x] Test: handle API errors gracefully
- [x] Task: Implement getAnalysis() method [43ae2c5]
  - [x] Write failing test for data parsing
  - [x] Test: Parse patterns from analysis response
  - [x] Test: Parse budgetVariances from analysis response
  - [x] Test: Parse recommendations from analysis response
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend API Service Integration' (Protocol in workflow.md)

## Phase 2: Step 3 Component - Core Layout [ ]

- [ ] Task: Create Step3Recommendations.tsx component file
- [ ] Task: Write failing tests for Step3Recommendations component
  - [ ] Test: Component renders without crashing
  - [ ] Test: Props interface matches WizardState
  - [ ] Test: Back navigation works correctly
- [ ] Task: Implement basic component structure with Framer Motion
- [ ] Task: Update SmartBudgetWizard.tsx to support step 3
  - [ ] Write failing test for step 3 navigation
  - [ ] Test: Step 3 is accessible from Step 2
  - [ ] Test: Back button preserves Step 2 amounts
  - [ ] Test: Step counter displays correctly
- [ ] Task: Update Step 2 "Apply" button to "Review Suggestions"
  - [ ] Write failing test for button text change
  - [ ] Test: Button text is correct when wizard has Step 3 capability
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Step 3 Component - Core Layout' (Protocol in workflow.md)

## Phase 3: Insight Sections - Overspending & Underutilized [ ]

- [ ] Task: Implement overspending alerts section
  - [ ] Write failing tests for overspending display
  - [ ] Test: Show overspending categories with >20% variance
  - [ ] Test: Display reduction amounts with confidence scores
  - [ ] Test: Color coding is red/amber for urgency
- [ ] Task: Implement overspending suggestion apply button
  - [ ] Write failing test for apply action
  - [ ] Test: Clicking apply updates budget amount
  - [ ] Test: Apply button disables after clicking
  - [ ] Test: Button shows checkmark when applied
- [ ] Task: Implement underutilized budget alerts section
  - [ ] Write failing tests for underutilized display
  - [ ] Test: Show underutilized categories with <70% budget used
  - [ ] Test: Display unused amounts correctly
  - [ ] Test: Color coding is green/emerald for opportunity
- [ ] Task: Add helper function to categorize budget health (overspending/healthy/underutilized)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Insight Sections - Overspending & Underutilized' (Protocol in workflow.md)

## Phase 4: Insight Sections - Trends & Seasonal [ ]

- [ ] Task: Implement spending trend insights section
  - [ ] Write failing tests for trend display
  - [ ] Test: Show trend direction (increasing/decreasing/stable)
  - [ ] Test: Display sparkline chart with 3-6 months
  - [ ] Test: Show enhanced metrics (percentage change, confidence)
  - [ ] Test: Color coding matches trend direction
- [ ] Task: Create TrendSparkline mini-component for trend visualization
  - [ ] Write failing tests for sparkline rendering
  - [ ] Test: Renders line chart correctly
  - [ ] Test: Handles empty data gracefully
  - [ ] Test: Displays correct colors per trend direction
- [ ] Task: Implement seasonal pattern alerts section
  - [ ] Write failing tests for seasonal display
  - [ ] Test: Show categories with strong seasonal patterns
  - [ ] Test: Alert for upcoming seasonal spike in 1-2 months
  - [ ] Test: Display suggested preparation amount
  - [ ] Test: Calendar icon displays with warning
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Insight Sections - Trends & Seasonal' (Protocol in workflow.md)

## Phase 5: Suggestion Interaction Model [ ]

- [ ] Task: Implement individual "Apply" button functionality
  - [ ] Write failing tests for apply mechanism
  - [ ] Test: Applied suggestion updates fixedExpenses or variableAllocations
  - [ ] Test: Applied amount replaces existing amount entirely
  - [ ] Test: Suggestions persist in appliedSuggestions state
  - [ ] Test: Applied button is disabled and shows checkmark
- [ ] Task: Implement "Apply All" bulk functionality
  - [ ] Write failing test for bulk apply
  - [ ] Test: Apply all non-dismissed suggestions
  - [ ] Test: Updates all relevant budget amounts
  - [ ] Test: Mark all as applied visually
- [ ] Task: Add state tracking for applied suggestions (Record<number, number>)
- [ ] Task: Debounce apply operations to prevent rapid successive updates
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Suggestion Interaction Model' (Protocol in workflow.md)

## Phase 6: Budget Summary Panel [ ]

- [ ] Task: Implement budget totals display (Income, Fixed, Variable, Unallocated)
  - [ ] Write failing tests for totals calculation
  - [ ] Test: Total income displays correctly
  - [ ] Test: Fixed expenses total calculates correctly
  - [ ] Test: Variable budgets total calculates correctly
  - [ ] Test: Unallocated amount = income - fixed - variable
- [ ] Task: Add color coding for unallocated amount status
  - [ ] Write failing test for status colors
  - [ ] Test: Green color when unallocated >= 0
  - [ ] Test: Red color when unallocated < 0 (over-allocated)
- [ ] Task: Implement real-time summary updates after suggestion applies
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Budget Summary Panel' (Protocol in workflow.md)

## Phase 7: Save Flow & Confirmation Screen [ ]

- [ ] Task: Implement "Save Budget Plan" button functionality
  - [ ] Write failing tests for save operation
  - [ ] Test: Saves all budgets via budgetService
  - [ ] Test: Validates unallocated >= 0 before saving
  - [ ] Test: Shows error toast if over-allocated
- [ ] Task: Create BudgetConfirmationSummary component
  - [ ] Write failing tests for confirmation display
  - [ ] Test: Shows Total Budget, Fixed, Variable, Savings Rate
  - [ ] Test: Lists all categories with final amounts
  - [ ] Test: Success animation plays on mount
- [ ] Task: Add "View Dashboard" button to close wizard
  - [ ] Write failing test for navigation
  - [ ] Test: Button calls onComplete() callback
  - [ ] Test: Wizard closes after clicking
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Save Flow & Confirmation Screen' (Protocol in workflow.md)

## Phase 8: UI/UX Polish & Performance [ ]

- [ ] Task: Implement loading states with skeleton loaders
- [ ] Task: Add empty states for no suggestions available
- [ ] Task: Implement smooth Framer Motion transitions between sections
- [ ] Task: Optimize component with useMemo for expensive calculations
- [ ] Task: Ensure responsive design for mobile and desktop layouts
- [ ] Task: Verify accessibility (ARIA labels, keyboard navigation, focus states)
- [ ] Task: Conductor - User Manual Verification 'Phase 8: UI/UX Polish & Performance' (Protocol in workflow.md)

## Phase 9: Testing & Quality Assurance [ ]

- [ ] Task: Run all unit tests and ensure >80% coverage for new code
- [ ] Task: Run TypeScript compiler and fix any type errors
- [ ] Task: Run linting (ESLint) and fix all errors
- [ ] Task: Perform manual testing of wizard flow end-to-end
- [ ] Task: Test suggestion apply interactions thoroughly
- [ ] Task: Verify budget persistence after wizard closes
- [ ] Task: Test back navigation preserves user edits
- [ ] Task: Conductor - User Manual Verification 'Phase 9: Testing & Quality Assurance' (Protocol in workflow.md)

## Phase 10: Integration & Documentation [ ]

- [ ] Task: Update client-v2/src/components/smart-budget/types.ts if needed
- [ ] Task: Add JSDoc comments to optimizationService.ts
- [ ] Task: Update AGENTS.md with any new patterns or utilities
- [ ] Task: Verify wizard closes and navigates to dashboard correctly
- [ ] Task: Conductor - User Manual Verification 'Phase 10: Integration & Documentation' (Protocol in workflow.md)
