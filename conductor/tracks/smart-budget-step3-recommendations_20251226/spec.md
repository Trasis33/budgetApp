# Specification: Smart Budget Wizard - Step 3: Budget Recommendations & Review

## Overview

This track adds Step 3 (Budget Recommendations & Review) to the Smart Budget Wizard, providing data-driven budget optimization insights based on spending patterns, budget variances, and seasonal trends. The step allows users to review personalized suggestions before finalizing their monthly budget plan.

## User Stories

- As a user, I want to see which categories I'm overspending on and receive reduction suggestions.
- As a user, I want to identify underutilized budget categories that could have funds reallocated.
- As a user, I want to understand spending trends (increasing/decreasing) for each category over 3-6 months.
- As a user, I want to be alerted to seasonal spending spikes before they happen.
- As a user, I want to apply specific optimization suggestions with one click, replacing my manual budget amounts.
- As a user, I want to see a confirmation summary of my final budget plan before the wizard closes.

## Functional Requirements

### Backend Integration

- Integrate with existing `/api/optimization/analyze` endpoint to get spending patterns, seasonal trends, and budget variances
- Use backend `BudgetOptimizer` analysis (patterns, enhanced trends, confidence scores)
- Parse and display optimization recommendations from stored tips

### Step 3 Component Features

#### 1. Navigation Integration

- Step 2's "Apply Budget Plan" button becomes "Review Suggestions" button
- Step 3 is optional - user can skip and save directly from Step 2
- Back button from Step 3 returns to Step 2 with all amounts preserved

#### 2. Insight Sections (Middle-ground complexity)

**Overspending Alerts**

- Display categories with >20% over budget
- Show suggested reduction amount with confidence score
- "Apply" button replaces user's budget amount with suggested value
- Color-coded: red/high-amber for urgency

**Underutilized Budget Alerts**

- Display categories with <70% of budget used
- Show unused amount that could be reallocated
- Color-coded: green/emerald for opportunity
- May suggest redirecting to overspending categories

**Spending Trend Insights**

- For categories with 3+ months of data, show trend direction (increasing/decreasing/stable)
- Display mini sparkline chart showing 3-6 month history
- Enhanced trend metrics: percentage change, confidence score
- Color-coded: red for increasing (watch), green for decreasing (good)

**Seasonal Pattern Alerts**

- Show categories with strong seasonal patterns (>15% variance by month)
- Alert for upcoming seasonal spike in next 1-2 months
- Suggested preparation amount
- Calendar icon with warning

#### 3. Suggestion Interaction Model

- Each suggestion has an individual "Apply" button
- Clicking "Apply" updates the specific category's budget amount
- When applied, suggestion is visually marked as "Applied" (checkmark, disabled button)
- User can apply multiple suggestions independently
- "Apply All" button for bulk acceptance of all suggestions

#### 4. Budget Summary Panel

- Real-time display of:
  - Total Income
  - Fixed Expenses Total
  - Variable Budgets Total
  - Unallocated Amount (must be >= 0 to save)
- Color-coded status: green if balanced, red if over-allocated

#### 5. Save Flow & Confirmation

- "Save Budget Plan" button finalizes and saves all budgets
- On save, show confirmation summary screen:
  - Summary card with: Total Budget, Total Fixed, Total Variable, Savings Rate
  - List of categories with amounts applied
  - Success animation
  - "View Dashboard" button closes wizard and navigates to dashboard

### Technical Requirements

#### Component Architecture

- Create `client-v2/src/components/smart-budget/Step3Recommendations.tsx`
- Update `SmartBudgetWizard.tsx` to support step 3 navigation
- Maintain existing `WizardState` interface, add `appliedSuggestions: Record<number, number>`

#### API Integration

- Create `optimizationService.ts` for optimization endpoints
- Call `/api/optimization/analyze` on Step 3 mount
- Cache analysis result to avoid re-fetching during navigation

#### State Management

- Track which suggestions have been applied (`appliedSuggestions` state)
- Update `fixedExpenses` and `variableAllocations` when suggestion applied
- Preserve user manual edits from Step 2 during navigation

#### UI/UX Requirements

- Use shadcn/ui components: Card, Badge, Button, Switch, Progress
- Implement smooth transitions with Framer Motion (existing in wizard)
- Color scheme: Match existing wizard (indigo, teal, amber, rose)
- Responsive design: Mobile-first with grid layout for desktop
- Loading states: Skeleton loaders during analysis fetch
- Empty states: Helpful messages when no suggestions available

#### Performance

- Debounce apply operations to prevent rapid successive updates
- Memoize calculations (trend lines, totals) to avoid re-renders
- Lazy-load charts (only render when visible)

### Technical Constraints

- Must use existing backend `budgetOptimizer.js` analysis engine
- Must not modify backend API - work with `/api/optimization/analyze` as-is
- Frontend must use TypeScript with strict mode
- Component must follow client-v2 design system (shadcn/ui, oklch colors)

### Data Flow

```
Step 2 User Edits
    ↓
User clicks "Review Suggestions"
    ↓
Step 3 Loads
    ↓
Fetch optimization analysis from /api/optimization/analyze
    ↓
Parse patterns, trends, variances, seasonal data
    ↓
Display suggestions in 4 sections (overspending, underutilized, trends, seasonal)
    ↓
User clicks "Apply" on suggestion
    ↓
Update category budget amount in state (replaces existing)
    ↓
Mark suggestion as applied (disable button, show checkmark)
    ↓
Update budget totals in real-time
    ↓
User clicks "Save Budget Plan"
    ↓
Show confirmation summary with success animation
    ↓
Save all budgets via budgetService
    ↓
Close wizard, navigate to dashboard
```

## Acceptance Criteria

1. **Navigation Integration**
   - [ ] Step 2 "Apply Budget Plan" button becomes "Review Suggestions"
   - [ ] Step 3 accessible from Step 2
   - [ ] Back button from Step 3 preserves all Step 2 amounts
   - [ ] Wizard step counter shows "Step 2 of 2" (unchanged, Step 3 is optional)

2. **Insight Display**
   - [ ] Overspending alerts display with reduction suggestions and confidence scores
   - [ ] Underutilized budget alerts show unused amounts
   - [ ] Spending trend insights show direction (increasing/decreasing/stable) with sparkline charts
   - [ ] Seasonal pattern alerts show upcoming spikes with preparation amounts
   - [ ] Each section has appropriate color coding (red/green/amber/indigo)

3. **Suggestion Application**
   - [ ] Individual "Apply" buttons work for each suggestion
   - [ ] Applied suggestions are visually marked (checkmark, disabled)
   - [ ] Applied amounts replace user's existing budget amounts entirely
   - [ ] Budget totals update in real-time after each apply
   - [ ] "Apply All" button accepts all non-dismissed suggestions

4. **Budget Summary**
   - [ ] Real-time totals display (Income, Fixed, Variable, Unallocated)
   - [ ] Unallocated amount color-coded green (≥0) or red (<0)
   - [ ] Summary updates immediately after any suggestion applied

5. **Save & Confirmation**
   - [ ] "Save Budget Plan" button saves all budgets successfully
   - [ ] Confirmation summary displays after save
   - [ ] Summary includes: Total Budget, Fixed, Variable, Savings Rate
   - [ ] Success animation plays on confirmation
   - [ ] "View Dashboard" button closes wizard and navigates correctly

6. **Technical**
   - [ ] TypeScript strict mode with no errors
   - [ ] All tests pass (>80% coverage for new code)
   - [ ] No linting errors
   - [ ] Component uses shadcn/ui components correctly
   - [ ] Responsive design works on mobile and desktop
   - [ ] Loading states display during API fetch

## Out of Scope

- Modifications to backend `budgetOptimizer.js` or API endpoints
- Creation of separate standalone optimization dashboard (will be future track)
- Savings goal goal management UI (backend exists, no frontend)
- Complex "what-if" scenario planning (simplified version only)
- Historical budget comparison beyond 6 months (focus on recent trends)
- Integration with external financial institutions or AI services

## Dependencies

- `client-v2/src/components/smart-budget/Step1Strategy.tsx` - For pattern reference
- `client-v2/src/components/smart-budget/Step2Architect.tsx` - For state management patterns
- `client-v2/src/components/smart-budget/types.ts` - Wizard state interface
- `client-v2/src/api/services/budgetService.ts` - For saving budgets
- `server/routes/optimization.js` - Optimization API endpoints
- `server/utils/budgetOptimizer.js` - Analysis engine
- `client-v2/src/lib/utils.ts` - Utility functions (formatCurrency)
- `client-v2/src/lib/categoryIcons.ts` - Category icons
- `client-v2/src/lib/categoryColors.ts` - Category colors
