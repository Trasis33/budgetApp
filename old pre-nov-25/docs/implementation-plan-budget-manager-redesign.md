# Budget Manager Design Integration - Implementation Plan

**Document Version:** 1.0  
**Date:** November 8, 2025  
**Target Component:** `client-v2/src/components/BudgetManager.tsx`  
**Design Source:** `.superdesign/design_iterations/budget_manager_design_3_client_v2.html`

---

## Executive Summary

This document provides a comprehensive implementation roadmap for redesigning the Budget Manager component to match the specified design while establishing a reusable, DRY-compliant architecture within the `client-v2` directory structure.

**Key Objectives:**
- Modular component architecture with atomic, composable React components
- Centralized styling system leveraging existing design tokens
- Reusable patterns applicable to subsequent pages
- Type-safe implementations with proper TypeScript interfaces
- Accessibility compliance and performance optimization
- **SEK (Swedish Krona) currency formatting throughout all monetary displays**

---

## 1. Project Structure and Organization

### 1.1 Enhanced Directory Structure

```
client-v2/src/
├── components/
│   ├── ui/                          # 48 existing shadcn/ui components
│   ├── budget/                      # NEW: Budget-specific components
│   │   ├── BudgetMetricCard.tsx
│   │   ├── BudgetProgressBar.tsx
│   │   ├── BudgetTableRow.tsx
│   │   ├── BudgetTableHeader.tsx
│   │   ├── BudgetStatusBadge.tsx
│   │   ├── BudgetHeader.tsx
│   │   ├── BudgetStatsFooter.tsx
│   │   └── index.ts
│   ├── shared/                      # NEW: Cross-page reusable components
│   │   ├── PageHeader.tsx
│   │   ├── MetricCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ActionButtons.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   └── BudgetManager.tsx
├── lib/
│   ├── utils.ts
│   ├── budgetUtils.ts              # NEW
│   ├── formatters.ts               # NEW
│   └── constants.ts                # NEW
├── hooks/
│   ├── useBudgetData.ts            # NEW
│   └── useBudgetCalculations.ts   # NEW
├── styles/
│   ├── globals.css
│   ├── budget.module.css           # NEW
│   └── shared.module.css           # NEW
└── types/
    └── budget.ts                    # NEW
```

### 1.2 Naming Conventions

- **Components**: PascalCase (`BudgetMetricCard.tsx`)
- **Utilities/Hooks**: camelCase (`budgetUtils.ts`, `useBudgetData.ts`)
- **CSS Modules**: kebab-case with `.module.css` (`budget-table.module.css`)
- **Constants**: UPPER_SNAKE_CASE
- **Barrel Exports**: Use `index.ts` for cleaner imports

---

## 2. Design System Extraction

### 2.1 Color System (from globals.css)

```typescript
// lib/constants.ts
export const COLORS = {
  primary: 'var(--primary)',
  muted: 'var(--muted)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
} as const;

export const CHART_COLORS = {
  green: 'var(--theme-amber)',      // Success
  teal: 'var(--theme-teal)',        // Info
  blue: 'var(--theme-indigo)',      // Secondary
  amber: 'var(--theme-lime)',       // Warning
  orange: 'var(--theme-yellow)',    // Accent
} as const;

export const STATUS_COLORS = {
  success: CHART_COLORS.green,
  warning: CHART_COLORS.amber,
  danger: COLORS.destructive,
} as const;
```

### 2.2 Currency Formatting (SEK)

**IMPORTANT**: All monetary values must be displayed in Swedish Krona (SEK) format.

The existing `formatCurrency` utility in `lib/utils.ts` already implements SEK formatting:

```typescript
// lib/utils.ts (existing)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK'
  }).format(amount);
}

// Example output: 4 250 kr (Swedish format with space separator)
```

**Usage Requirements:**
- **Always use** `formatCurrency()` for all monetary values
- **Never hardcode** currency symbols or formats
- Applies to: metric cards, table cells, tooltips, charts, summaries

**Examples:**
```typescript
// ✅ Correct
<span>{formatCurrency(budget.amount)}</span>        // "4 250 kr"
<span>{formatCurrency(totalSpent)}</span>           // "3 106 kr"

// ❌ Incorrect
<span>${budget.amount}</span>                       // Wrong currency
<span>{budget.amount} SEK</span>                    // Wrong format
<span>kr {budget.amount.toFixed(2)}</span>         // Wrong locale
```

### 2.3 Typography Scale

- Page Title: `text-2xl font-medium` (24px, 500 weight)
- Section Headers: `text-lg font-medium` (18px)
- Labels: `text-xs uppercase tracking-wide font-medium` (12px, uppercase)
- Body: `text-sm` (14px)

### 2.4 Spacing & Layout

- Card Padding: `p-4` (16px)
- Table Cell Padding: `px-4 py-3` (16px×12px)
- Card Gap: `gap-4` (16px)
- Metrics Grid: `grid-cols-1 md:grid-cols-4`

### 2.5 Animation Patterns

```css
/* Standard transition */
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

/* Progress bar animation */
transition: width 0.6s ease-out;

/* Hover transforms */
transform: translateY(-1px);  /* Cards */
transform: translateX(2px);   /* Table rows */
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
BudgetManager (Orchestrator)
├── BudgetHeader
│   ├── Back Button
│   ├── Title & Subtitle
│   └── Action Buttons (Export, Add)
├── BudgetMetricsBar
│   └── BudgetMetricCard × 4
├── BudgetTable (Card)
│   ├── BudgetTableHeader (Title + Period Select + Refresh)
│   ├── Table
│   │   └── BudgetTableRow × N
│   │       ├── Category Cell (Icon + Name)
│   │       ├── Amount Cells
│   │       ├── BudgetProgressBar
│   │       ├── BudgetStatusBadge
│   │       └── ActionButtons
│   └── BudgetTableFooter (Pagination)
└── BudgetStatsFooter (Legend)
```

### 3.2 Key Component Props

#### BudgetMetricCard
```typescript
interface BudgetMetricCardProps {
  label: string;
  value: string | number;  // Use formatCurrency() for monetary values
  icon: React.ReactNode;
  iconColor: 'green' | 'blue' | 'amber' | 'purple' | 'pink';
  variant?: 'default' | 'success' | 'warning';
}

// Usage example:
<BudgetMetricCard
  label="Total Budget"
  value={formatCurrency(totalBudget)}  // Always format as SEK
  icon={<WalletIcon />}
  iconColor="green"
/>
```

#### BudgetProgressBar
```typescript
interface BudgetProgressBarProps {
  percentage: number;
  variant: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
```

#### BudgetStatusBadge
```typescript
interface BudgetStatusBadgeProps {
  status: 'success' | 'warning' | 'danger';
  label?: string;
  showPulse?: boolean;
}
```

#### BudgetTableRow
```typescript
interface BudgetTableRowProps {
  budget: BudgetWithSpending;
  onEdit: (budget: BudgetWithSpending) => void;
  onDelete: (budgetId: number) => void;
  isEditing?: boolean;
}
```

#### BudgetTableHeader
```typescript
interface BudgetTableHeaderProps {
  title: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onRefresh?: () => void;
}

// Usage - Use shadcn Select component (NOT native HTML select)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<div className="flex items-center justify-between px-6 py-4 border-b">
  <h2 className="text-lg font-medium">Category Budgets</h2>
  <div className="flex items-center gap-2">
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current">This Month</SelectItem>
        <SelectItem value="last">Last Month</SelectItem>
        <SelectItem value="3months">Last 3 Months</SelectItem>
      </SelectContent>
    </Select>
    <Button variant="ghost" size="sm" onClick={onRefresh}>
      <RefreshCw className="w-4 h-4" />
    </Button>
  </div>
</div>
```

**Important**: The design spec shows a native HTML `<select>` element, but we should use the shadcn `Select` component instead for consistency with the rest of the app (see `Dashboard.tsx` for reference pattern). This provides:
- Consistent styling with other selects
- Better accessibility
- Keyboard navigation
- Custom styling capabilities

---

## 4. Styling Strategy

### 4.1 CSS Module Organization

```
styles/
├── globals.css              # Design tokens (existing)
├── budget/
│   ├── budget-manager.module.css
│   ├── budget-table.module.css
│   └── budget-metrics.module.css
└── shared/
    ├── cards.module.css
    ├── tables.module.css
    └── buttons.module.css
```

### 4.2 Key CSS Patterns

#### Table Row Hover (budget-table.module.css)
```css
.tableRow {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.tableRow:hover {
  background-color: var(--accent);
  transform: translateX(2px);
}

.iconGreen {
  background-color: color-mix(in oklab, var(--theme-amber) 20%, transparent);
  color: var(--theme-amber);
}
```

#### Metric Card Hover (cards.module.css)
```css
.metricCard {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.metricCard:hover {
  border-left-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

#### Progress Bar (budget-metrics.module.css)
```css
.progressFill {
  transition: width 0.6s ease-out;
  border-radius: 9999px;
}

.progressFillSuccess { background-color: var(--theme-amber); }
.progressFillWarning { background-color: var(--theme-teal); }
.progressFillDanger { background-color: var(--destructive); }
```

---

## 5. State Management and Data Flow

### 5.1 Type Definitions

```typescript
// types/budget.ts
export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  progress: number;
  status: 'success' | 'warning' | 'danger';
  expenseCount: number;
}

export interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  overallStatus: 'success' | 'warning' | 'danger';
}

export interface BudgetStats {
  onTrack: number;
  warning: number;
  overBudget: number;
}
```

### 5.2 Custom Hooks

#### useBudgetData
```typescript
// hooks/useBudgetData.ts
export function useBudgetData() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loadBudgets();
  }, [currentScope]);
  
  return { budgets, loading, error, refetch: loadBudgets };
}
```

#### useBudgetCalculations
```typescript
// hooks/useBudgetCalculations.ts
export function useBudgetCalculations(
  budgets: Budget[], 
  expenses: Expense[]
): BudgetWithSpending[] {
  return useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      spent: calculateCategorySpending(expenses, budget.category_name),
      remaining: budget.amount - spent,
      progress: (spent / budget.amount) * 100,
      status: getStatusFromProgress(progress),
      expenseCount: expenses.filter(e => e.category_name === budget.category_name).length
    }));
  }, [budgets, expenses]);
}
```

### 5.3 Utility Functions

```typescript
// lib/budgetUtils.ts

// Import currency formatter
import { formatCurrency } from './utils';

export function getBudgetStatus(progress: number): 'success' | 'warning' | 'danger' {
  if (progress >= 100) return 'danger';
  if (progress >= 80) return 'warning';
  return 'success';
}

export function getStatusLabel(status: string): string {
  const labels = {
    success: 'Good',
    warning: 'Warning',
    danger: 'Over Budget'
  };
  return labels[status] || 'Unknown';
}

// Format budget message with SEK amounts
export function getBudgetMessage(spent: number, budgetAmount: number): string {
  const percentage = (spent / budgetAmount) * 100;
  const remaining = formatCurrency(budgetAmount - spent);
  
  if (percentage <= 50) return `Great start! ${remaining} left`;
  if (percentage <= 80) return `On track with ${remaining} remaining`;
  if (percentage <= 100) return `Getting close - ${remaining} left`;
  return `Over budget by ${formatCurrency(spent - budgetAmount)}`;
}

export function calculateBudgetMetrics(budgets: BudgetWithSpending[]): BudgetMetrics {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = (totalSpent / totalBudget) * 100;
  
  return {
    totalBudget,
    totalSpent,
    totalRemaining: totalBudget - totalSpent,
    overallProgress,
    overallStatus: getBudgetStatus(overallProgress)
  };
}

export function calculateBudgetStats(budgets: BudgetWithSpending[]): BudgetStats {
  return budgets.reduce((stats, budget) => {
    if (budget.status === 'success') stats.onTrack++;
    else if (budget.status === 'warning') stats.warning++;
    else stats.overBudget++;
    return stats;
  }, { onTrack: 0, warning: 0, overBudget: 0 });
}
```

---

## 6. Implementation Phases

### Phase 1: Foundation & Setup (Days 1-2)

**Tasks:**
1. Create directory structure for new components
2. Define TypeScript interfaces in `types/budget.ts`
3. Create utility functions in `lib/budgetUtils.ts`
4. Set up CSS modules with base styles
5. Create constants file with color/status mappings

**Validation:**
- [ ] All directories created
- [ ] TypeScript compiles without errors
- [ ] Utility functions have unit tests

### Phase 2: Atomic Components (Days 3-5)

**Tasks:**
1. Implement `BudgetMetricCard` component
2. Implement `BudgetProgressBar` component
3. Implement `BudgetStatusBadge` component
4. Implement `ActionButtons` component
5. Create Storybook stories for each component
6. Apply CSS module styles

**Validation:**
- [ ] All components render correctly in isolation
- [ ] Hover states work as designed
- [ ] Responsive behavior tested
- [ ] Accessibility audit passed

### Phase 3: Composite Components (Days 6-8)

**Tasks:**
1. Implement `BudgetHeader` component
2. Implement `BudgetTableHeader` component with shadcn Select (not native HTML select)
3. Implement `BudgetTableRow` component
4. Implement `BudgetStatsFooter` component
5. Create table container with header/footer
6. Integrate progress bars and badges

**Important**: Use shadcn `Select` component for period/month selector following the pattern in `Dashboard.tsx` (see component props section for example)

**Validation:**
- [ ] Table rows display correctly with real data
- [ ] Period selector uses shadcn Select component (not native HTML)
- [ ] Period changes trigger data refresh
- [ ] Edit/delete actions trigger correctly
- [ ] Inline editing mode works
- [ ] Footer legend displays accurate counts

### Phase 4: Page Integration (Days 9-11)

**Tasks:**
1. Refactor `BudgetManager.tsx` to use new components
2. Implement `useBudgetData` and `useBudgetCalculations` hooks
3. Wire up all event handlers
4. Integrate with existing API services
5. Add loading and error states
6. Implement empty state

**Validation:**
- [ ] Full page renders with real API data
- [ ] CRUD operations work end-to-end
- [ ] Loading states display correctly
- [ ] Error handling works properly
- [ ] Empty state displays when no budgets

### Phase 5: Refinement & Testing (Days 12-14)

**Tasks:**
1. Responsive design testing (mobile, tablet, desktop)
2. Accessibility audit (ARIA labels, keyboard navigation)
3. Performance optimization (memoization, lazy loading)
4. Cross-browser testing
5. User testing and feedback incorporation
6. Documentation updates

**Validation:**
- [ ] Passes WCAG 2.1 AA standards
- [ ] Works on iOS Safari, Chrome, Firefox, Edge
- [ ] No layout shifts on load
- [ ] Smooth animations (60fps)
- [ ] Documentation complete

### Phase 6: Deployment & Monitoring (Days 15-16)

**Tasks:**
1. Code review and PR submission
2. Merge to staging environment
3. Staging validation
4. Production deployment
5. Monitor for errors
6. Performance monitoring

**Validation:**
- [ ] PR approved by team
- [ ] Staging tests pass
- [ ] Production deployment successful
- [ ] No errors in monitoring
- [ ] Performance metrics within targets

---

## 7. Reusability Framework

### 7.1 Component Extraction Guidelines

**Budget-Specific → Generic Transformation:**

```typescript
// Budget-specific (budget/BudgetProgressBar.tsx)
<BudgetProgressBar 
  percentage={budget.progress}
  variant={budget.status}
/>

// Generic (shared/ProgressBar.tsx)
<ProgressBar
  value={budget.progress}
  max={100}
  variant={budget.status}
/>

// Reuse in Savings Goals
<ProgressBar
  value={goal.currentAmount}
  max={goal.targetAmount}
  variant="info"
/>
```

### 7.2 Shared Component Library

**Created for Future Use:**

1. **MetricCard** → Dashboard, Analytics, Reports
2. **StatusBadge** → Expenses, Goals, Bills
3. **ProgressBar** → Goals, Savings, Budgets
4. **ActionButtons** → All list/table views
5. **EmptyState** → All empty data scenarios
6. **PageHeader** → All page-level views

### 7.3 Documentation Standards

**Component Documentation Template:**

```typescript
/**
 * BudgetMetricCard
 * 
 * Displays a single metric with icon, label, and value.
 * Includes hover animation and status indicator.
 * 
 * @example
 * <BudgetMetricCard
 *   label="Total Budget"
 *   value="$4,250"
 *   icon={<WalletIcon />}
 *   iconColor="green"
 * />
 * 
 * @param {string} label - Display label for the metric
 * @param {string | number} value - Metric value to display
 * @param {ReactNode} icon - Icon component
 * @param {string} iconColor - Color variant for icon background
 * @param {string} variant - Visual variant (default, success, warning)
 * 
 * @see MetricCard for generic version
 * @category Budget Components
 */
```

### 7.4 Migration Path for Future Pages

**Step-by-Step Guide:**

1. **Analyze Page Design**: Identify reusable patterns
2. **Check Component Library**: Use existing shared components
3. **Create Page-Specific**: Only if no suitable generic exists
4. **Extract Reusable Logic**: Move generic parts to `/shared`
5. **Update Documentation**: Add usage examples
6. **Create Migration PR**: Document changes

---

## 8. Integration and Testing

### 8.1 Unit Testing Strategy

```typescript
// __tests__/BudgetMetricCard.test.tsx
describe('BudgetMetricCard', () => {
  it('renders with correct label and value', () => {
    render(<BudgetMetricCard label="Test" value="$100" icon={<Icon />} iconColor="green" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('applies hover animation', async () => {
    const { container } = render(<BudgetMetricCard {...props} />);
    const card = container.firstChild;
    
    await userEvent.hover(card);
    expect(card).toHaveStyle({ transform: 'translateY(-1px)' });
  });
});
```

### 8.2 Integration Testing

```typescript
// __tests__/BudgetManager.integration.test.tsx
describe('BudgetManager Integration', () => {
  it('displays budgets with calculated spending', async () => {
    mockBudgetService.getBudgets.mockResolvedValue(mockBudgets);
    mockExpenseService.getExpenses.mockResolvedValue(mockExpenses);
    
    render(<BudgetManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('$680')).toBeInTheDocument(); // spent
      expect(screen.getByText('85%')).toBeInTheDocument(); // progress
    });
  });

  it('handles edit flow', async () => {
    render(<BudgetManager />);
    const editButton = screen.getAllByLabelText('Edit budget')[0];
    
    await userEvent.click(editButton);
    // Verify edit mode activated
  });
});
```

### 8.3 Accessibility Testing

```typescript
// __tests__/BudgetManager.a11y.test.tsx
describe('BudgetManager Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<BudgetManager />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    render(<BudgetManager />);
    const firstButton = screen.getByRole('button', { name: /add budget/i });
    
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    await userEvent.keyboard('{Tab}');
    // Verify next interactive element has focus
  });
});
```

### 8.4 Performance Testing

```typescript
// Monitor component render performance
it('renders efficiently with large dataset', () => {
  const largeBudgetList = generateMockBudgets(100);
  
  const { rerender } = render(<BudgetTable budgets={largeBudgetList} />);
  
  // Update one budget
  largeBudgetList[0].amount = 1000;
  rerender(<BudgetTable budgets={largeBudgetList} />);
  
  // Verify only affected row re-renders (using React DevTools Profiler)
});
```

---

## 9. Migration and Deployment

### 9.1 Migration Strategy

**Parallel Implementation Approach:**

1. **Create New Component**: Build `BudgetManager.tsx` redesign alongside existing
2. **Feature Flag**: Control which version is displayed
3. **Gradual Rollout**: 10% → 50% → 100% of users
4. **Monitor Metrics**: Track errors, performance, user engagement
5. **Rollback Plan**: Instant switch back to old version if needed

### 9.2 Feature Flag Implementation

```typescript
// App.tsx or BudgetManager.tsx
const useNewBudgetDesign = useFeatureFlag('new-budget-design');

return useNewBudgetDesign ? (
  <BudgetManagerRedesigned {...props} />
) : (
  <BudgetManagerLegacy {...props} />
);
```

### 9.3 Deployment Checklist

**Pre-Deployment:**
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] **All monetary values display in SEK format**
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Migration guide created

**Deployment:**
- [ ] Deploy to staging environment
- [ ] Run smoke tests on staging
- [ ] Enable for 10% of users
- [ ] Monitor for 24 hours
- [ ] Increase to 50% of users
- [ ] Monitor for 48 hours
- [ ] Enable for 100% of users

**Post-Deployment:**
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Address any issues
- [ ] Remove feature flag code
- [ ] Delete legacy component

### 9.4 Rollback Procedures

**Immediate Rollback (< 5 minutes):**
```bash
# Disable feature flag via admin panel
POST /api/admin/feature-flags
{
  "flag": "new-budget-design",
  "enabled": false
}
```

**Full Rollback (< 30 minutes):**
1. Revert Git commit
2. Rebuild and deploy previous version
3. Clear CDN cache
4. Verify old version working

### 9.5 Monitoring & Metrics

**Key Metrics to Track:**

- **Performance**: Page load time, time to interactive, largest contentful paint
- **Errors**: JavaScript errors, API failures, console warnings
- **User Engagement**: Time on page, interactions per session, completion rates
- **Accessibility**: Keyboard navigation usage, screen reader detection

**Monitoring Tools:**
- Application Performance Monitoring (APM)
- Error tracking (Sentry, etc.)
- User analytics (Google Analytics, Mixpanel)
- Real User Monitoring (RUM)

---

## 10. Success Criteria

### 10.1 Technical Requirements

- [ ] All components TypeScript-compliant with no `any` types
- [ ] 100% design specification match
- [ ] **All monetary values formatted in SEK (Swedish Krona)**
- [ ] No accessibility violations (WCAG 2.1 AA)
- [ ] < 3s page load time (3G network)
- [ ] < 50ms interaction response time
- [ ] 80%+ code coverage with tests

### 10.2 User Experience Requirements

- [ ] Smooth animations (60fps)
- [ ] Responsive across mobile/tablet/desktop
- [ ] Keyboard navigation fully functional
- [ ] Screen reader compatible
- [ ] Clear error messages
- [ ] Loading states for all async operations

### 10.3 Development Experience Requirements

- [ ] Reusable components documented
- [ ] Storybook stories for all components
- [ ] TypeScript interfaces exported
- [ ] Utility functions tested
- [ ] Migration guide complete
- [ ] AI agent instructions clear

---

## Appendix A: Quick Reference

### Component Import Cheatsheet

```typescript
// UI Primitives
import { Button, Card, Table } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Budget Components
import { BudgetMetricCard, BudgetProgressBar } from '@/components/budget';

// Shared Components
import { MetricCard, StatusBadge } from '@/components/shared';

// Utilities (ALWAYS import formatCurrency for monetary values)
import { formatCurrency } from '@/lib/utils';  // ⚠️ REQUIRED for SEK formatting
import { getBudgetStatus, getBudgetMessage } from '@/lib/budgetUtils';
import { CHART_COLORS, STATUS_COLORS } from '@/lib/constants';

// Hooks
import { useBudgetData, useBudgetCalculations } from '@/hooks';

// Types
import type { BudgetWithSpending, BudgetMetrics } from '@/types/budget';
```

### CSS Class Patterns

```typescript
// Metric Cards
className="card p-4 metric-card card-hover"

// Table Rows
className="table-row-hover compact-cell"

// Status Badges
className="badge badge-success" | "badge-warning" | "badge-danger"

// Progress Bars
className="progress-bar"
fillClassName="progress-fill progress-fill-success"

// Icon Containers
className="w-8 h-8 bg-icon-green rounded-lg flex items-center justify-center"
iconClassName="w-4 h-4 icon-green"
```

### Color Utility Functions

```typescript
// Get status color
const statusColor = STATUS_COLORS[budget.status];

// Get chart color by index
const chartColor = Object.values(CHART_COLORS)[index % 5];

// Apply opacity
const bgColor = `color-mix(in oklab, ${CHART_COLORS.green} 20%, transparent)`;
```

---

## Appendix B: AI Agent Instructions

When implementing subsequent pages using this architecture:

1. **Review Shared Components**: Check `/components/shared` for reusable patterns
2. **Follow Naming Conventions**: Use established file/component naming patterns
3. **Leverage Design Tokens**: Use CSS variables from `globals.css`
4. **Create Page-Specific Folder**: Only if needed (e.g., `/components/expenses`)
5. **Extract Reusable Logic**: Move generic components to `/shared` immediately
6. **Document New Patterns**: Update this guide with new reusable patterns
7. **Maintain Type Safety**: Define all interfaces in `/types`
8. **Test Thoroughly**: Unit + integration + accessibility tests required

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-08 | AI Agent | Initial creation |

---

**End of Document**
