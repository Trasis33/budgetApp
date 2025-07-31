# Analytics Charts De-duplication and Refactor

Intent
- Budget performance comparison (budget vs actual) remains in [client/src/components/charts/BudgetActualChart.js](client/src/components/charts/BudgetActualChart.js).
- Category spending distribution (how total spend splits across categories for a month) is shown in [client/src/components/charts/EnhancedCategorySpendingChart.js](client/src/components/charts/EnhancedCategorySpendingChart.js).

Root-cause analysis
- The previous EnhancedCategorySpendingChart mixed “budget context” with stacked segments, overlapping with the purpose of [BudgetActualChart()](client/src/components/charts/BudgetActualChart.js:6), which is already focused on budget vs actual performance by category.
- Both charts ended up communicating similar insights (budget adherence), differing primarily in styling, causing duplication and user confusion.
- Resolution: Redefine EnhancedCategorySpendingChart to focus on distribution (single series of absolute amounts plus share-of-total) while retaining BudgetActualChart as the grouped budget-vs-actual comparator.

What changed
1) EnhancedCategorySpendingChart now shows spending distribution (single series)
   - Component entry: [EnhancedCategorySpendingChart()](client/src/components/charts/EnhancedCategorySpendingChart.js:31)
   - Uses shared utilities from [client/src/components/charts/chartUtils.js](client/src/components/charts/chartUtils.js) to:
     - Build distribution dataset (value and percentage)
     - Compute y-domain with padding
     - Use consistent margins and axis formatters
   - Differences vs BudgetActualChart:
     - Series: single “value” per category (with share-of-total in tooltip)
     - Sorting: by value descending so the largest categories appear first
     - Legend: top-5 categories with percentage labels
     - Layout: tuned bar gaps, maxBarSize for crisp rendering and responsiveness

2) BudgetActualChart is simplified and unified on shared utilities
   - Component entry: [BudgetActualChart()](client/src/components/charts/BudgetActualChart.js:6)
   - Data mapping via shared utility:
     - Build budget vs actual rows from Chart.js-like input
     - Derive variance and classification (over, on-track, under, no-budget)
   - Consistent axis domain, margins, and tick formatting:
     - See import of chart utils at [client/src/components/charts/BudgetActualChart.js:4](client/src/components/charts/BudgetActualChart.js:4)
     - Y domain computed with both “budgeted” and “actual” keys for accurate scale

3) Shared utilities extracted
   - File: [client/src/components/charts/chartUtils.js](client/src/components/charts/chartUtils.js)
   - buildDistributionData: single-series mapping with percentage-of-total
   - buildBudgetActualData: grouped mapping with variance/status
   - computeYDomain: unified padded max domain across keys
   - currencyTickFormatter: resilient wrapper around app’s formatter
   - commonMargins and distributionPalette: consistent look-and-feel

4) Integration update
   - Budget page now passes only distribution-relevant props to [EnhancedCategorySpendingChart()](client/src/components/charts/EnhancedCategorySpendingChart.js:31), removing budgets/categories to avoid crossing concerns: see usage in [client/src/pages/Budget.js](client/src/pages/Budget.js).

Configuration details and differences
- Series configuration:
  - EnhancedCategorySpendingChart: single Bar dataKey="value"
  - BudgetActualChart: two Bars: “budgeted” and “actual” (grouped)
- Stacking vs grouping:
  - Distribution: no stacking, one series
  - Budget vs actual: grouped bars (side-by-side comparison)
- X/Y scales:
  - Both compute y-domain via computeYDomain with sensible headroom
  - Distribution uses keys: ["value"]; BudgetActual uses ["budgeted", "actual"]
- Category ordering:
  - Distribution sorts categories by descending “value”
  - Budget vs actual preserves incoming label order to match the backend/Chart.js source
- Bar padding and bandwidth:
  - Distribution: barCategoryGap="26%", barGap="10%", maxBarSize set for crisp bars
  - BudgetActual: barCategoryGap="30%" for clear grouping
- Margins and container sizing:
  - Shared margins (commonMargins) for uniform spacing
  - Distribution container height ~420px; budget/actual ~350px
- Color contrast and accessibility:
  - Distribution uses a design palette with sufficient contrast for bars and legend chips
  - Budget vs actual uses dynamic color for “actual” by status (error/success/warning) and a stable color for “budgeted”
- Tooltips and legend:
  - Distribution tooltip shows amount + share-of-total
  - Budget vs actual tooltip shows budgeted, actual, variance %, and contextual badge

Verification steps
1) Desktop/Mobile responsiveness:
   - Resize window; ensure bars scale without overlap (barGap + maxBarSize in distribution)
   - Check that X-axis labels (angled) remain legible and not truncated excessively
2) Data correctness:
   - Distribution: sum of underlying values matches the selected month’s total; tooltip share sums ~100%
   - Budget vs actual: actual and budgeted magnitudes accurately reflect dataset values
3) Scale accuracy:
   - Distribution y-axis domain adapts to the highest category value with padding
   - Budget vs actual y-axis domain covers both “budgeted” and “actual” maxima
4) Category ordering:
   - Distribution sorted by value desc; BudgetActual follows source order
5) No overlap/duplication:
   - Distribution communicates relative composition; BudgetActual shows performance comparison
6) Accessibility & contrast:
   - Tooltips readable; bar colors and legend chips distinguishable and accessible

Files changed
- Created: [client/src/components/charts/chartUtils.js](client/src/components/charts/chartUtils.js)
- Updated: [client/src/components/charts/EnhancedCategorySpendingChart.js](client/src/components/charts/EnhancedCategorySpendingChart.js)
- Updated: [client/src/components/charts/BudgetActualChart.js](client/src/components/charts/BudgetActualChart.js)
- Updated usage: [client/src/pages/Budget.js](client/src/pages/Budget.js)

Tests
- Added unit tests for shared utilities:
  - [client/src/components/charts/__tests__/chartUtils.test.js](client/src/components/charts/__tests__/chartUtils.test.js)

Notes
- The project currently does not include Storybook; story files were not added to avoid extra tooling. If desired, we can add minimal Storybook config later with a couple of stories to visualize the two charts side-by-side for visual regression.
- Typings/PropTypes: Components include JSDoc documentation; if runtime prop validation is needed, we can introduce prop-types dependency or convert to TypeScript in a subsequent task.