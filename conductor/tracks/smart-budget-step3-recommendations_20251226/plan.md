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

## Phase 2: Step 3 Component - Core Layout [checkpoint: 0a1e605]

- [x] Task: Create Step3Recommendations.tsx component file [8c0d916]
- [x] Task: Write failing tests for Step3Recommendations component
  - [x] Test: Component renders without crashing
  - [x] Test: Props interface matches WizardState
  - [x] Test: Back navigation works correctly
- [x] Task: Implement basic component structure with Framer Motion
- [x] Task: Update SmartBudgetWizard.tsx to support step 3 [3160cc0]
  - [x] Write failing test for step 3 navigation
  - [x] Test: Step 3 is accessible from Step 2
  - [x] Test: Back button preserves Step 2 amounts
  - [x] Test: Step counter displays correctly
- [x] Task: Update Step 2 "Apply" button to "Review Suggestions" [6ac54d1]
  - [x] Write failing test for button text change
  - [x] Test: Button text is correct when wizard has Step 3 capability
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Step 3 Component - Core Layout' (Protocol in workflow.md)

## Phase 3: Insight Sections - Overspending & Underutilized [checkpoint: 552fc68]

- [x] Task: Implement overspending alerts section [0d7dd8c]
  - [x] Write failing tests for overspending display
  - [x] Test: Show overspending categories with >20% variance
  - [x] Test: Display reduction amounts with confidence scores
  - [x] Test: Color coding is red/amber for urgency
- [x] Task: Implement overspending suggestion apply button [056358d]
  - [x] Write failing test for apply action
  - [x] Test: Clicking apply updates budget amount
  - [x] Test: Apply button disables after clicking
  - [x] Test: Button shows checkmark when applied
- [x] Task: Implement underutilized budget alerts section [6a8eff6]
  - [x] Write failing tests for underutilized display
  - [x] Test: Show underutilized categories with <70% budget used
  - [x] Test: Display unused amounts correctly
  - [x] Test: Color coding is green/emerald for opportunity
- [x] Task: Add helper function to categorize budget health (overspending/healthy/underutilized) [8f99bbc]
- [x] Task: Fix critical bugs in Step3Recommendations [d85c201]
  - [x] Removed hardcoded mock data causing category duplication
  - [x] Fixed apply button infinite recalculation bug with state tracking
  - [x] Added suggestedAmount field to track original suggestion values
  - [x] Updated tests to expect empty state instead of mock data
- [x] Task: Add trend insights tests [610dfa8]
  - [x] Write failing tests for trend display
  - [x] Test: Show trend direction (increasing/decreasing/stable)
  - [x] Test: Display sparkline chart with 3-6 months
  - [x] Test: Show enhanced metrics (percentage change, confidence)
  - [x] Test: Color coding matches trend direction
- [ ] Task: Implement seasonal pattern alerts section
  - [ ] Write failing tests for seasonal display
  - [ ] Test: Show seasonal patterns with 3-month rolling average
  - [ ] Test: Display high/low/typical spending amounts
  - [ ] Test: Color coding for seasonal anomalies
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Insight Sections - Overspending & Underutilized' (Protocol in workflow.md)

## Phase 4: Insight Sections - Trends & Seasonal [checkpoint: 1536ef2]

- [x] Task: Implement spending trend insights section [69b8231]
  - [x] Write failing tests for trend display
  - [x] Test: Show trend direction (increasing/decreasing/stable)
  - [x] Test: Display sparkline chart with 3-6 months
  - [x] Test: Show enhanced metrics (percentage change, confidence)
  - [x] Test: Color coding matches trend direction
- [x] Task: Create TrendSparkline mini-component for trend visualization [69b8231]
  - [x] Write failing tests for sparkline rendering
  - [x] Test: Renders line chart correctly
  - [x] Test: Handles empty data gracefully
  - [x] Test: Displays correct colors per trend direction
- [x] Task: Implement seasonal pattern alerts section [bc779df]
  - [x] Write failing tests for seasonal display
  - [x] Test: Show categories with strong seasonal patterns
  - [x] Test: Alert for upcoming seasonal spike in 1-2 months
  - [x] Test: Display suggested preparation amount
  - [x] Test: Calendar icon displays with warning

- [x] Task: Implement spending trend insights section [69b8231]
  - [x] Write failing tests for trend display
  - [x] Test: Show trend direction (increasing/decreasing/stable)
  - [x] Test: Display sparkline chart with 3-6 months
  - [x] Test: Show enhanced metrics (percentage change, confidence)
   - [x] Test: Color coding matches trend direction
   - [x] Task: Create TrendSparkline mini-component for trend visualization [69b8231]
   - [x] Write failing tests for sparkline rendering
   - [x] Test: Renders line chart correctly
   - [x] Test: Handles empty data gracefully
   - [x] Test: Displays correct colors per trend direction
   - [x] Task: Implement seasonal pattern alerts section [bc779df]
  - [x] Write failing tests for seasonal display
  - [x] Test: Show categories with strong seasonal patterns
  - [x] Test: Alert for upcoming seasonal spike in 1-2 months
  - [x] Test: Display suggested preparation amount
  - [x] Test: Calendar icon displays with warning
  - [ ] Task: Conductor - User Manual Verification 'Phase 4: Insight Sections - Trends & Seasonal' (Protocol in workflow.md)

## Phase 5: Suggestion Interaction Model [ ]

- [x] Task: Implement individual "Apply" button functionality [0cc1ff0]
  - [x] Write failing tests for apply mechanism
  - [x] Test: Applied suggestion updates fixedExpenses or variableAllocations
  - [x] Test: Applied amount replaces existing amount entirely
  - [x] Test: Suggestions persist in appliedSuggestions state
  - [x] Test: Applied button is disabled and shows checkmark
- [x] Task: Implement "Apply All" bulk functionality [b4eaee8]
  - [x] Write failing test for bulk apply
  - [x] Test: Apply all non-dismissed suggestions
  - [x] Test: Updates all relevant budget amounts
  - [x] Test: Mark all as applied visually
- [x] Task: Add state tracking for applied suggestions (Record<number, number>) [b4eaee8]
- [x] Task: Debounce apply operations to prevent rapid successive updates [b4eaee8]
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Suggestion Interaction Model' (Protocol in workflow.md)

## Phase 6: Budget Summary Panel [checkpoint: b394093]

- [x] Task: Implement budget totals display (Income, Fixed, Variable, Unallocated) [b394093]
  - [x] Write failing tests for totals calculation
  - [x] Test: Total income displays correctly
  - [x] Test: Fixed expenses total calculates correctly
  - [x] Test: Variable budgets total calculates correctly
  - [x] Test: Unallocated amount = income - fixed - variable
- [x] Task: Add color coding for unallocated amount status [b394093]
  - [x] Write failing test for status colors
  - [x] Test: Green color when unallocated >= 0
  - [x] Test: Red color when unallocated < 0 (over-allocated)
- [x] Task: Implement real-time summary updates after suggestion applies [b394093]
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
