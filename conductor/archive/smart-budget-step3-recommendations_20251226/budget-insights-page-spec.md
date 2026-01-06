# Budget Insights Page Specification

> **Created:** 2026-01-02
> **Context:** Pivot from Smart Budget Wizard Step 3 to standalone page

## Overview

The Budget Insights page provides budget optimization recommendations and spending analysis. It is accessed **after** the End-of-Month Workflow is complete, allowing users to review their spending patterns and plan for the next month.

## User Story

As a couple managing our budget, after completing our monthly expense reconciliation, we want to see insights about our spending patterns so we can make informed decisions for next month's budget.

## Access Points

1. **Dashboard Card** - "View Budget Insights" link/button
2. **Sidebar Navigation** - "Insights" menu item (if sidebar exists)
3. **Route:** `/insights`

## Page Structure

### Header
- Title: "Budget Insights"
- Subtitle: "Recommendations based on your spending history"
- Back to Dashboard button

### Section 1: Overspending Alerts
- Categories where actual spending exceeded budget by >20%
- Shows: category name, budget amount, actual amount, overage percentage
- Suggested reduction amount with confidence score
- Color: Red/Amber for urgency

### Section 2: Underutilized Budgets
- Categories where <70% of budget was used
- Shows: category name, budget amount, actual amount, unused amount
- Opportunity to reallocate funds
- Color: Green/Emerald for opportunity

### Section 3: Spending Trends
- Categories with notable trends (increasing/decreasing/stable)
- Sparkline chart showing 3-6 months of data
- Percentage change and confidence metrics
- Color coding matches trend direction

### Section 4: Seasonal Patterns
- Categories with strong seasonal patterns
- Alerts for upcoming seasonal spikes (1-2 months ahead)
- Suggested preparation amounts
- Calendar icon with warning indicator

### Summary Panel (Sticky/Fixed)
- Current month totals: Income, Fixed, Variable, Unallocated
- Quick stats: Categories over budget, Categories under budget

## Components to Reuse

From existing Step3Recommendations implementation:
- `OverspendingSection` - overspending alerts display
- `UnderutilizedSection` - underutilized budget display
- `TrendSparkline` - mini chart component
- `SpendingTrendsSection` - trend insights
- `SeasonalPatternsSection` - seasonal alerts
- `BudgetSummaryPanel` - totals display

## Data Requirements

- Requires `optimizationService.getAnalysis()` data
- Should show empty state if insufficient historical data (<2 months)
- Loading skeleton while fetching

## Empty State

When insufficient data exists:
- Friendly message: "Not enough data yet"
- Explanation: "Complete a few monthly budgets to see spending insights"
- Link back to dashboard

## Responsive Design

- Desktop: Multi-column layout for sections
- Mobile: Single column, collapsible sections

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly section headings
- Focus states on all buttons/links

## Success Criteria

1. Page loads with real data from optimization API
2. All four insight sections render correctly
3. Empty state displays when data is insufficient
4. Navigation to/from dashboard works
5. Responsive on mobile and desktop
6. All existing component tests pass
