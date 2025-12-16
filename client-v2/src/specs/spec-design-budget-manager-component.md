---
title: Budget Manager Component Specification
version: 1.0
date_created: 2025-12-16
last_updated: 2025-12-16
owner: Frontend Team
tags: [design, component, budget, react, typescript, ui]
---

# Introduction

The BudgetManager component is a comprehensive React/TypeScript component that provides users with a complete interface for creating, viewing, editing, and managing monthly budgets. It serves as the primary budget management interface in the application, integrating data visualization, smart suggestions, automated budget creation, and real-time spending tracking.

## 1. Purpose & Scope

**Purpose**: Provide users with an intuitive, data-driven interface to set monthly spending limits per category, track progress against those limits, and receive actionable insights to maintain financial health.

**Scope**: This specification covers the BudgetManager component (`client-v2/src/components/BudgetManager.tsx`), including:
- Budget creation, viewing, editing, and deletion workflows
- Month/year navigation for viewing historical and future budgets
- Smart budget suggestions based on historical spending patterns
- Alert preference configuration
- Integration with Smart Budget Wizard for automated budget creation
- Real-time metrics and progress visualization
- Category-based budget management with icon and color theming

**Out of Scope**: Backend API implementation, data persistence logic, authentication, and authorization are covered in separate specifications.

**Intended Audience**: Frontend developers, UI/UX designers, QA engineers, and product managers.

**Assumptions**:
- User is authenticated and has valid scope context
- Categories exist in the system with icons and colors
- Expense data is available via API services
- Browser supports ES6+ and modern React features

## 2. Definitions

- **Budget**: A spending limit set for a specific category in a given month/year
- **BudgetWithSpending**: Budget enriched with calculated spending, remaining amount, progress percentage, and status
- **Category**: A classification for expenses (e.g., Groceries, Utilities, Entertainment)
- **Spending**: Total amount of expenses in a category for a given period
- **Progress**: Percentage of budget consumed (spent / budget * 100)
- **Status**: Budget health indicator (success < 80%, warning 80-100%, danger > 100%)
- **Smart Budget Wizard**: Automated budget creation tool using AI/ML suggestions
- **Scope Context**: User or couple-level data filtering context
- **Modal**: Dialog overlay for creating/editing budgets
- **Toast**: Non-blocking notification message

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: Component MUST display all budgets for the selected month/year with spending data
- **REQ-002**: Component MUST allow users to create new budgets for available categories
- **REQ-003**: Component MUST allow users to delete existing budgets with confirmation
- **REQ-004**: Component MUST display budget metrics (total budget, total spent, remaining, progress)
- **REQ-005**: Component MUST provide month/year navigation (previous/next month, dropdown selection)
- **REQ-006**: Component MUST show smart budget suggestions based on historical spending
- **REQ-007**: Component MUST persist alert preferences (80% threshold, exceed threshold) to localStorage
- **REQ-008**: Component MUST filter categories to show only those without existing budgets in modal
- **REQ-009**: Component MUST validate budget amount is positive and category is selected
- **REQ-010**: Component MUST display loading state while fetching data
- **REQ-011**: Component MUST display error state with retry option on data fetch failure
- **REQ-012**: Component MUST display empty state with guidance when no budgets exist
- **REQ-013**: Component MUST integrate Smart Budget Wizard for automated budget creation
- **REQ-014**: Component MUST support "Save & Add Another" workflow for creating multiple budgets
- **REQ-015**: Component MUST display category icons with color theming throughout UI

### UI/UX Requirements

- **UXR-001**: Budget creation MUST be accessible via prominent "Add Budget" button in header
- **UXR-002**: Budget deletion MUST require two clicks with visual warning confirmation
- **UXR-003**: Month/year selector MUST support both arrow navigation and dropdown selection
- **UXR-004**: Empty states MUST provide clear guidance and call-to-action for first-time users
- **UXR-005**: Smart suggestions MUST be displayed as quick-select chips below amount input
- **UXR-006**: Category selection MUST support search/filter functionality
- **UXR-007**: Selected category MUST show visual checkmark indicator
- **UXR-008**: Budget progress MUST be visualized with color-coded bars (green/yellow/red)
- **UXR-009**: All user actions MUST provide immediate feedback via toast notifications
- **UXR-010**: Component MUST be fully responsive on mobile, tablet, and desktop

### Data Requirements

- **DAT-001**: Component MUST fetch budgets via `budgetService.getBudgets(month, year)`
- **DAT-002**: Component MUST fetch categories via `categoryService.getCategories()`
- **DAT-003**: Component MUST fetch expenses via `useBudgetData` hook for spending calculations
- **DAT-004**: Component MUST use `useBudgetCalculations` hook for metrics computation
- **DAT-005**: Component MUST support scope-based data filtering via `ScopeContext`
- **DAT-006**: Budget amount MUST be stored with 2 decimal precision
- **DAT-007**: Alert preferences MUST be stored in localStorage with key `budgetAlertPrefs_{userId}`

### Performance Requirements

- **PER-001**: Initial render MUST complete within 300ms on standard hardware
- **PER-002**: Budget creation MUST complete within 500ms excluding network latency
- **PER-003**: Month navigation MUST update view within 200ms
- **PER-004**: Component MUST prevent unnecessary re-renders using React.memo where appropriate
- **PER-005**: Spending calculations MUST execute synchronously without blocking UI

### Accessibility Requirements

- **ACC-001**: All interactive elements MUST be keyboard navigable
- **ACC-002**: All icon-only buttons MUST have aria-label attributes
- **ACC-003**: Modal dialogs MUST trap focus and support ESC key to close
- **ACC-004**: Color-coded status MUST also provide text labels (not color-only)
- **ACC-005**: Form inputs MUST have associated labels with proper for/id attributes
- **ACC-006**: ARIA live regions MUST announce toast notifications to screen readers

### Security Requirements

- **SEC-001**: Component MUST not execute if user is not authenticated
- **SEC-002**: Component MUST respect scope context permissions
- **SEC-003**: Component MUST sanitize all user input before API submission
- **SEC-004**: Component MUST not expose sensitive data in console logs

### Constraints

- **CON-001**: Component MUST use TypeScript with strict type checking enabled
- **CON-002**: Component MUST use shadcn/ui components for all UI elements
- **CON-003**: Component MUST use Tailwind CSS for styling (no inline styles except dynamic colors)
- **CON-004**: Component MUST use Sonner for toast notifications
- **CON-005**: Component MUST use React Router for navigation
- **CON-006**: Component MUST use Lucide React for all icons
- **CON-007**: Budget amounts MUST be in SEK (Swedish Krona) currency
- **CON-008**: Month values MUST be 1-indexed (1 = January, 12 = December)

### Design Guidelines

- **GUD-001**: Follow design system defined in `client-v2/src/styles/globals.css`
- **GUD-002**: Use CSS custom properties for colors, never hardcode hex/rgb values
- **GUD-003**: Use consistent spacing scale (space-y-6, gap-3, p-6 patterns)
- **GUD-004**: Use button variants: default (primary), ghost (secondary), destructive (delete)
- **GUD-005**: Use Card components for content grouping with CardHeader, CardContent structure
- **GUD-006**: Use Dialog components for modals with DialogHeader, DialogFooter structure
- **GUD-007**: Display currency with "kr" prefix for all Swedish Krona amounts
- **GUD-008**: Round budget amounts to whole numbers for display
- **GUD-009**: Use title case for button labels, sentence case for descriptions

### Code Patterns

- **PAT-001**: Use custom hooks (`useBudgetData`, `useBudgetCalculations`) for data fetching and computation
- **PAT-002**: Use service layer (`budgetService`, `categoryService`) for API calls
- **PAT-003**: Use context (`ScopeContext`) for cross-cutting concerns
- **PAT-004**: Use local state (`useState`) for UI-only state (modals, forms, selections)
- **PAT-005**: Use `useEffect` for side effects (data fetching, preference loading)
- **PAT-006**: Separate concerns: component logic, business logic (hooks), API calls (services)
- **PAT-007**: Use async/await with try/catch for all asynchronous operations
- **PAT-008**: Use toast notifications for all user action feedback (success, error, warning)
- **PAT-009**: Use conditional rendering for loading, error, empty, and success states
- **PAT-010**: Extract reusable sub-components (BudgetHeader, BudgetTable, BudgetMetricsGrid)

## 4. Interfaces & Data Contracts

### Component Props

\`\`\`typescript
interface BudgetManagerProps {
  onNavigate?: (view: string) => void;
}
\`\`\`

**Properties**:
- `onNavigate` (optional): Callback function for programmatic navigation to other views

### Component State

\`\`\`typescript
// Categories
const [categories, setCategories] = useState<Category[]>([]);

// Month/Year selection
const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // 1-12
const [selectedYear, setSelectedYear] = useState<number>(currentYear);

// Modal state
const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
const [modalSearchTerm, setModalSearchTerm] = useState<string>('');
const [modalSelectedCategory, setModalSelectedCategory] = useState<Category | null>(null);
const [modalAmount, setModalAmount] = useState<string>('');
const [suggestions, setSuggestions] = useState<BudgetSuggestions | null>(null);
const [alertAt80Percent, setAlertAt80Percent] = useState<boolean>(true);
const [alertOnExceed, setAlertOnExceed] = useState<boolean>(true);

// Delete confirmation
const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
\`\`\`

### Custom Hook Interfaces

\`\`\`typescript
// useBudgetData hook
interface UseBudgetDataReturn {
  budgets: Budget[];
  expenses: Expense[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// useBudgetCalculations hook
interface UseBudgetCalculationsReturn {
  budgetsWithSpending: BudgetWithSpending[];
  metrics: BudgetMetrics;
}
\`\`\`

### Data Models

\`\`\`typescript
interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  amount: number;
  month: number; // 1-12
  year: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  progress: number; // 0-100+
  status: BudgetStatus; // 'success' | 'warning' | 'danger'
  expenseCount: number;
}

interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  overallStatus: BudgetStatus;
}

interface BudgetSuggestions {
  matchAvg: number;
  matchSpending?: number;
  plusTen: number;
  minusTen: number;
  rounded: number;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  is_fixed?: boolean;
  spending_role?: 'need' | 'want' | 'save';
}
\`\`\`

### API Service Contracts

\`\`\`typescript
// budgetService
budgetService.getBudgets(month: number, year: number): Promise<Budget[]>
budgetService.createOrUpdateBudget(data: CreateBudgetRequest): Promise<Budget>
budgetService.deleteBudget(budgetId: number): Promise<void>

interface CreateBudgetRequest {
  category_id: number;
  month: number;
  year: number;
  amount: number;
}

// categoryService
categoryService.getCategories(): Promise<Category[]>
\`\`\`

### Event Handlers

\`\`\`typescript
handleAddBudget(): void
handleModalSubmit(saveAndAddAnother: boolean): Promise<void>
handleDelete(budgetId: number): Promise<void>
handleExport(): void
handlePreviousMonth(): void
handleNextMonth(): void
handleMonthChange(value: string): void
handleYearChange(value: string): void
handleBack(): void
\`\`\`

### localStorage Contracts

\`\`\`typescript
// Alert Preferences
key: `budgetAlertPrefs_{userId}`
value: {
  alertAt80Percent: boolean;
  alertOnExceed: boolean;
}
\`\`\`

## 5. Acceptance Criteria

### Budget Viewing

- **AC-001**: Given budgets exist for the selected month, When component loads, Then all budgets MUST be displayed with spending data, progress bars, and status badges
- **AC-002**: Given no budgets exist for the selected month, When component loads, Then an empty state MUST be displayed with "Create my first budget" call-to-action
- **AC-003**: Given budgets exist, When user changes month/year, Then budgets MUST update to show data for the new period within 500ms

### Budget Creation

- **AC-004**: Given user clicks "Add Budget" button, When modal opens, Then only categories without existing budgets MUST be shown in the selection list
- **AC-005**: Given user has budgets for all categories, When modal opens, Then a message MUST indicate all categories have budgets with option to view existing budgets
- **AC-006**: Given user selects a category, When category has historical spending data, Then smart suggestions MUST be calculated and displayed as quick-select chips
- **AC-007**: Given user enters valid amount and selects category, When user clicks "Add Budget", Then budget MUST be created, modal MUST close, and success toast MUST appear
- **AC-008**: Given user clicks "Save & Add Another", When budget is created, Then modal MUST remain open, form MUST reset, and success toast MUST appear
- **AC-009**: Given user submits form without selecting category or amount, When validation runs, Then error toast MUST appear with message "Please select a category and enter an amount"

### Budget Deletion

- **AC-010**: Given user clicks delete icon once, When delete action initiates, Then warning toast MUST appear with "Click again to confirm deletion" message
- **AC-011**: Given user clicked delete once, When user clicks delete icon again within 3 seconds, Then budget MUST be deleted and success toast MUST appear
- **AC-012**: Given user clicked delete once, When user waits 3+ seconds or clicks Cancel, Then delete confirmation MUST reset and budget MUST remain

### Navigation

- **AC-013**: Given user clicks previous month arrow, When month is January, Then month MUST change to December and year MUST decrement by 1
- **AC-014**: Given user clicks next month arrow, When month is December, Then month MUST change to January and year MUST increment by 1
- **AC-015**: Given user selects month/year from dropdowns, When selection changes, Then budgets MUST reload for the new period

### Metrics & Visualization

- **AC-016**: Given budgets exist, When budgets load, Then metrics grid MUST display total budget, total spent, total remaining, and overall progress
- **AC-017**: Given a budget has progress < 80%, When budget displays, Then status badge MUST be green with "On Track" label
- **AC-018**: Given a budget has progress 80-100%, When budget displays, Then status badge MUST be yellow with "Warning" label
- **AC-019**: Given a budget has progress > 100%, When budget displays, Then status badge MUST be red with "Over Budget" label

### Smart Suggestions

- **AC-020**: Given category has 3+ historical expenses, When category is selected, Then suggestions MUST include: match average, +10%, -10%, and rounded to nearest 50
- **AC-021**: Given user clicks a suggestion chip, When chip is clicked, Then amount input MUST populate with the suggested value
- **AC-022**: Given category has < 3 historical expenses, When category is selected, Then no suggestions MUST be displayed

### Alert Preferences

- **AC-023**: Given user opens add budget modal, When modal loads, Then alert preferences MUST load from localStorage with default values (both true)
- **AC-024**: Given user creates a budget, When budget is saved, Then alert preferences MUST be saved to localStorage

### Loading & Error States

- **AC-025**: Given component is fetching data, When loading state is active, Then a spinner MUST be displayed with message "Getting your budget goals ready..."
- **AC-026**: Given API call fails, When error occurs, Then error state MUST be displayed with message "Failed to load budgets" and a Retry button
- **AC-027**: Given user clicks Retry, When button is clicked, Then data fetch MUST be re-attempted

### Smart Budget Wizard Integration

- **AC-028**: Given user clicks "Auto Budget" button, When wizard opens, Then SmartBudgetWizard component MUST render with current month/year and categories
- **AC-029**: Given user completes wizard, When wizard closes, Then budgets MUST refetch to show newly created budgets

## 6. Test Automation Strategy

### Test Levels

**Unit Tests**: Test individual functions, hooks, and calculations
- Budget calculation logic (`useBudgetCalculations`)
- Suggestion calculation (`calculateCategorySuggestions`)
- Alert preference storage/retrieval
- Month/year navigation logic
- Category filtering logic

**Integration Tests**: Test component integration with hooks and services
- Budget creation workflow
- Budget deletion workflow
- Month navigation with data refetch
- Category selection with suggestion calculation
- Modal form submission

**End-to-End Tests**: Test complete user workflows
- Create first budget flow (empty state → modal → success)
- Create multiple budgets using "Save & Add Another"
- Delete budget with confirmation
- Navigate months and view historical budgets
- Use Smart Budget Wizard to create budgets

### Test Frameworks

- **Unit Tests**: Jest + React Testing Library
- **Mocking**: MSW (Mock Service Worker) for API mocks
- **Assertions**: Jest matchers + Testing Library queries
- **Coverage**: Minimum 80% line coverage for business logic

### Test Data Management

- Use factory functions to generate test budgets, categories, and expenses
- Mock API responses with consistent test data
- Use fixtures for complex data structures
- Clean up test data after each test run

### CI/CD Integration

- Run tests on every PR commit
- Block merge if tests fail or coverage drops below threshold
- Run E2E tests nightly against staging environment
- Generate coverage reports in pipeline

### Coverage Requirements

- Business logic (hooks, utilities): 90%+ coverage
- Component render logic: 80%+ coverage
- Integration flows: 70%+ coverage
- Overall project: 80%+ coverage

### Performance Testing

- Measure component render time with large datasets (100+ budgets)
- Test suggestion calculation performance with 90+ historical expenses
- Monitor memory usage during month navigation
- Test concurrent user interactions (rapid clicking, form submission)

### Example Test Cases

\`\`\`typescript
// Unit test example
describe('calculateCategorySuggestions', () => {
  it('should return null when < 3 expenses and no current spending', () => {
    const expenses = [/* 2 expenses */];
    const result = calculateCategorySuggestions('Groceries', expenses);
    expect(result).toBeNull();
  });

  it('should calculate suggestions based on average spending', () => {
    const expenses = [
      { category_name: 'Groceries', amount: 1000 },
      { category_name: 'Groceries', amount: 1200 },
      { category_name: 'Groceries', amount: 1100 },
    ];
    const result = calculateCategorySuggestions('Groceries', expenses);
    expect(result).toEqual({
      matchAvg: 1100,
      plusTen: 1210,
      minusTen: 990,
      rounded: 1150
    });
  });
});

// Integration test example
describe('BudgetManager - Create Budget', () => {
  it('should create budget and show success toast', async () => {
    render(<BudgetManager />);
    
    const addButton = screen.getByText('Add Budget');
    fireEvent.click(addButton);
    
    const categoryItem = screen.getByText('Groceries');
    fireEvent.click(categoryItem);
    
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '1500' } });
    
    const submitButton = screen.getByText('Add Budget');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Budget goal set/i)).toBeInTheDocument();
    });
  });
});
\`\`\`

## 7. Rationale & Context

### Design Decisions

**Decision**: Use two-click deletion with confirmation toast
**Rationale**: Prevents accidental deletion while maintaining fast workflow. Users can cancel within 3 seconds without disrupting their flow.

**Decision**: Display smart suggestions as chips below amount input
**Rationale**: Provides data-driven guidance without forcing users to accept suggestions. Quick-select chips reduce cognitive load and typing.

**Decision**: Filter categories to show only available ones in modal
**Rationale**: Prevents confusion and duplicate budget creation. Users see only actionable options.

**Decision**: Persist alert preferences to localStorage
**Rationale**: User preferences should persist across sessions without requiring server-side storage. This is UI-level preference data.

**Decision**: Use custom hooks for data fetching and calculations
**Rationale**: Separates concerns, improves testability, and enables reuse across components. Business logic is isolated from UI logic.

**Decision**: Show empty state with guidance for first-time users
**Rationale**: Reduces friction for new users by explaining purpose and providing clear next steps.

**Decision**: Support "Save & Add Another" workflow
**Rationale**: Power users creating multiple budgets can do so faster without repeatedly opening the modal.

### Historical Context

The BudgetManager component evolved from a simpler budget list view to a comprehensive management interface as user needs grew. Key milestones:

1. **v1.0**: Basic budget list with create/delete
2. **v1.5**: Added smart suggestions based on spending patterns
3. **v2.0**: Integrated Smart Budget Wizard for automated budget creation
4. **v2.1**: Added metrics visualization and empty state guidance
5. **v2.2**: Improved deletion workflow with confirmation

### Technology Choices

**React + TypeScript**: Provides type safety, excellent developer experience, and industry-standard tooling.

**shadcn/ui**: Component library built on Radix UI provides accessible, customizable components that match design system.

**Sonner**: Modern toast library with excellent UX and minimal configuration.

**Tailwind CSS**: Utility-first CSS framework enables rapid UI development with consistent design tokens.

**React Router**: Industry-standard routing library for single-page applications.

**Lucide React**: Comprehensive icon library with consistent design and tree-shaking support.

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: Budget API Service - RESTful API for budget CRUD operations
  - **Integration Type**: HTTP/JSON via Axios
  - **SLA Requirements**: < 500ms response time, 99.9% uptime
  - **Error Handling**: Retry logic with exponential backoff

- **EXT-002**: Category API Service - RESTful API for category management
  - **Integration Type**: HTTP/JSON via Axios
  - **SLA Requirements**: < 300ms response time, 99.9% uptime
  - **Error Handling**: Cached categories with stale-while-revalidate pattern

- **EXT-003**: Expense API Service - RESTful API for expense data
  - **Integration Type**: HTTP/JSON via Axios (via useBudgetData hook)
  - **SLA Requirements**: < 1000ms response time for monthly data
  - **Error Handling**: Graceful degradation if spending data unavailable

### Third-Party Services

- **SVC-001**: shadcn/ui Component Library
  - **Required Capabilities**: Accessible UI primitives (Dialog, Select, Button, Card, Input)
  - **Version Constraints**: Compatible with React 18+
  - **Fallback Strategy**: Graceful degradation to HTML native elements if components fail

- **SVC-002**: Sonner Toast Library
  - **Required Capabilities**: Non-blocking notifications with customizable duration and actions
  - **Version Constraints**: Latest stable version
  - **Fallback Strategy**: Console logging if toast library fails

- **SVC-003**: Lucide React Icons
  - **Required Capabilities**: SVG icon components for budget-related actions
  - **Version Constraints**: Latest stable version
  - **Fallback Strategy**: Emoji fallbacks for critical icons

### Infrastructure Dependencies

- **INF-001**: Browser localStorage
  - **Requirements**: Persistent key-value storage for alert preferences
  - **Constraints**: Minimum 5MB available storage
  - **Error Handling**: Fallback to session-only preferences if localStorage unavailable

- **INF-002**: Modern Browser (ES6+ support)
  - **Requirements**: Supports async/await, arrow functions, destructuring, modules
  - **Constraints**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
  - **Error Handling**: Polyfills for older browsers via build configuration

### Data Dependencies

- **DAT-001**: Historical Expense Data
  - **Format**: JSON array of Expense objects
  - **Frequency**: Real-time via API, cached for 5 minutes
  - **Access Requirements**: Authenticated user, scoped to user/couple context
  - **Error Handling**: Disable suggestions if historical data unavailable

- **DAT-002**: Category Master Data
  - **Format**: JSON array of Category objects with icons and colors
  - **Frequency**: Cached indefinitely, revalidated on mount
  - **Access Requirements**: Public data, no authentication required
  - **Error Handling**: Show generic category list if custom categories fail to load

### Technology Platform Dependencies

- **PLT-001**: React Runtime
  - **Version Constraints**: React 18.0.0 or higher
  - **Rationale**: Concurrent features, automatic batching, improved hydration

- **PLT-002**: TypeScript Compiler
  - **Version Constraints**: TypeScript 5.9.0 or higher
  - **Rationale**: Strict type checking, improved type inference, satisfies operator

- **PLT-003**: Node.js Runtime (Development)
  - **Version Constraints**: Node.js 18.0.0 or higher
  - **Rationale**: Native ES modules, fetch API, performance improvements

### Compliance Dependencies

- **COM-001**: WCAG 2.1 Level AA Accessibility
  - **Impact**: All interactive elements must be keyboard accessible with proper ARIA labels
  - **Verification**: Automated accessibility testing with axe-core, manual testing with screen readers

- **COM-002**: GDPR Data Privacy
  - **Impact**: User preferences must be stored locally, not transmitted to server without consent
  - **Verification**: Privacy policy compliance audit, data flow analysis

## 9. Examples & Edge Cases

### Example 1: Creating First Budget

\`\`\`typescript
// User flow
1. Component renders with empty state
2. User clicks "Create my first budget" button
3. Modal opens showing all categories (no budgets exist yet)
4. User searches for "Groceries"
5. User selects Groceries category
6. Smart suggestions appear (if historical data exists):
   - Match avg: kr1200
   - +10%: kr1320
   - -10%: kr1080
   - Round: kr1250
7. User clicks "+10%: kr1320"
8. Amount field populates with 1320
9. User enables both alert preferences (default)
10. User clicks "Add Budget"
11. API creates budget
12. Modal closes
13. Success toast appears: "✨ Budget goal set! We'll track your progress"
14. Budget list refreshes showing Groceries budget with progress bar
\`\`\`

### Example 2: Delete Budget with Confirmation

\`\`\`typescript
// User flow
1. Budget list displays with delete icon (Trash2)
2. User clicks delete icon on Groceries budget
3. Delete icon changes to AlertTriangle (warning)
4. Toast appears: "Click again to confirm deletion"
5. User waits 4 seconds (confirmation expires)
6. Delete icon reverts to Trash2
7. User clicks delete again
8. Delete icon changes to AlertTriangle
9. User clicks again within 3 seconds
10. API deletes budget
11. Budget removed from list
12. Success toast: "Budget removed"
\`\`\`

### Example 3: Month Navigation

\`\`\`typescript
// Current month: December 2025
1. User clicks previous month arrow
2. Month changes to November 2025
3. Budgets refetch for November 2025
4. User clicks previous month arrow 2 more times
5. Month changes to October 2025, then September 2025
6. User clicks next month arrow
7. Month changes to October 2025
8. User opens month dropdown
9. User selects "January"
10. Month changes to January 2025
11. Year automatically adjusts to 2025
12. Budgets refetch for January 2025
\`\`\`

### Edge Case 1: All Categories Have Budgets

\`\`\`typescript
// Scenario: User has created budgets for all available categories
Given: 
  - User has 10 categories
  - User has created 10 budgets (one per category)
When:
  - User clicks "Add Budget"
Then:
  - Modal opens
  - Category selection shows message:
    "All categories have budgets!"
    "Want to adjust an existing one instead?"
  - "View Existing Budgets" button displayed
  - "Save & Add Another" button hidden
  - "Add Budget" button disabled
  - Footer note: "💡 You can delete a budget to create a different one"
\`\`\`

### Edge Case 2: No Historical Spending Data

\`\`\`typescript
// Scenario: User selects category with no historical expenses
Given:
  - User selects "Entertainment" category
  - No expenses exist for Entertainment
When:
  - Category is selected
Then:
  - No smart suggestions displayed
  - Amount input is empty
  - User must enter amount manually
  - No error or warning shown (this is normal)
\`\`\`

### Edge Case 3: Rapid Month Navigation

\`\`\`typescript
// Scenario: User rapidly clicks next month multiple times
Given:
  - Current month: January 2025
  - User clicks next month 15 times in 2 seconds
When:
  - Each click triggers month increment
Then:
  - Month should advance to April 2026 (15 months forward)
  - Only the final month (April 2026) should trigger API call
  - Loading state should prevent duplicate fetches
  - No race condition errors should occur
\`\`\`

### Edge Case 4: Concurrent Budget Creation

\`\`\`typescript
// Scenario: User clicks "Save & Add Another" and "Add Budget" rapidly
Given:
  - User has filled out budget form for Groceries
When:
  - User clicks "Save & Add Another"
  - Before API responds, user clicks "Add Budget"
Then:
  - First submission should complete
  - Second submission should be blocked (modal still open, loading state)
  - Success toast appears once
  - Form resets only after first submission succeeds
  - No duplicate budgets created
\`\`\`

### Edge Case 5: Decimal Amount Handling

\`\`\`typescript
// Scenario: User enters decimal amounts
Given:
  - User enters "1500.50" in amount field
When:
  - User submits form
Then:
  - API receives amount as 1500.50 (float)
  - Amount is stored with 2 decimal precision
  - Display shows "kr1501" (rounded for UI)
  - Calculations use exact 1500.50 value

Given:
  - User enters "1500.999" in amount field
When:
  - User submits form
Then:
  - Amount is accepted as-is by input (type="number")
  - API receives 1500.999
  - Server-side validation may round to 1501.00
\`\`\`

### Edge Case 6: Scope Context Loading

\`\`\`typescript
// Scenario: Scope context is still loading when component mounts
Given:
  - User navigates to /budgets
  - ScopeContext is still determining user/couple scope
When:
  - BudgetManager renders
  - scopeLoading = true
Then:
  - useEffect for loading categories should NOT execute
  - Component shows loading state
  - No API calls made until scopeLoading = false
When:
  - scopeLoading changes to false
Then:
  - Categories API call executes
  - Budgets API call executes (via useBudgetData hook)
  - Component renders with data
\`\`\`

### Edge Case 7: API Error During Budget Creation

\`\`\`typescript
// Scenario: Network error occurs during budget creation
Given:
  - User fills out budget form correctly
  - User clicks "Add Budget"
When:
  - API call fails with network error
Then:
  - Error toast appears: "Could not create budget. Please check your amount and try again"
  - Modal remains open with form data intact
  - User can retry submission
  - Delete confirmation state resets
\`\`\`

### Edge Case 8: Smart Suggestions with Minimal Data

\`\`\`typescript
// Scenario: Category has exactly 3 expenses (minimum threshold)
Given:
  - "Utilities" category has 3 expenses: [500, 550, 600]
When:
  - User selects "Utilities" category
Then:
  - Suggestions calculated from average (550):
    * matchAvg: 550
    * plusTen: 610 (550 * 1.1, rounded to nearest 10)
    * minusTen: 500 (550 * 0.9, rounded to nearest 10)
    * rounded: 550 (ceil to nearest 50)
  - All 4 suggestions displayed as chips
\`\`\`

## 10. Validation Criteria

### Functional Validation

- **VAL-001**: All budgets for selected month/year MUST display within 1 second of data fetch completion
- **VAL-002**: Budget creation MUST validate category selection and positive amount before API submission
- **VAL-003**: Budget deletion MUST require two clicks within 3-second window
- **VAL-004**: Month navigation MUST correctly handle year boundaries (Dec→Jan, Jan→Dec)
- **VAL-005**: Smart suggestions MUST calculate correctly based on historical spending average

### UI Validation

- **VAL-006**: All buttons MUST have hover states with visual feedback
- **VAL-007**: All form inputs MUST show focus states with ring outline
- **VAL-008**: All toast notifications MUST auto-dismiss after 3-5 seconds
- **VAL-009**: All icons MUST render at consistent size (h-4 w-4 or h-5 w-5)
- **VAL-010**: All currency amounts MUST display with "kr" prefix

### Data Validation

- **VAL-011**: Budget amounts MUST be positive numbers (> 0)
- **VAL-012**: Month values MUST be integers 1-12
- **VAL-013**: Year values MUST be integers 2020-2030
- **VAL-014**: Category IDs MUST exist in categories table
- **VAL-015**: Spending calculations MUST sum expenses filtered by exact month/year

### Accessibility Validation

- **VAL-016**: All interactive elements MUST be reachable via keyboard (Tab navigation)
- **VAL-017**: All icon-only buttons MUST have aria-label attributes
- **VAL-018**: Modal dialogs MUST trap focus and support ESC key to close
- **VAL-019**: Form inputs MUST have associated labels with matching for/id attributes
- **VAL-020**: Color-coded status badges MUST include text labels (not color-only)

### Performance Validation

- **VAL-021**: Initial render MUST complete within 300ms (excluding API calls)
- **VAL-022**: Month navigation MUST update UI within 200ms of state change
- **VAL-023**: Suggestion calculation MUST complete within 50ms for 90 expenses
- **VAL-024**: Component MUST handle 100+ budgets without performance degradation

### Security Validation

- **VAL-025**: Component MUST not render if user is not authenticated
- **VAL-026**: Component MUST respect scope context (user vs couple)
- **VAL-027**: API calls MUST include authentication token in headers
- **VAL-028**: User input MUST be sanitized before API submission (no XSS vulnerabilities)

## 11. Related Specifications / Further Reading

### Internal Specifications

- [Smart Budget Wizard Specification](./smart-budget-wizard-spec.md) - Automated budget creation tool
- [Budget Optimization Specification](./spec-tool-budget-optimization.md) - AI-powered budget recommendations
- [API Budget Endpoints Specification](./api-budget-spec.md) - Backend budget API contract
- [Design System Specification](./design-system-spec.md) - UI component and styling guidelines

### External Documentation

- [React Documentation](https://react.dev/) - React 18 features and best practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript type system and patterns
- [shadcn/ui Components](https://ui.shadcn.com/) - Component library documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [React Router](https://reactrouter.com/) - Client-side routing library
- [Sonner](https://sonner.emilkowal.ski/) - Toast notification library
- [Lucide Icons](https://lucide.dev/) - Icon library documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web accessibility standards

### Design Resources

- [Budget Manager Figma Mockups](https://figma.com/...) - UI/UX design files
- [User Flow Diagrams](./diagrams/budget-user-flows.png) - User journey visualizations
- [Component Architecture Diagram](./diagrams/budget-component-architecture.png) - Technical architecture

### Testing Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started) - JavaScript testing framework
- [React Testing Library](https://testing-library.com/react) - React component testing
- [MSW Documentation](https://mswjs.io/docs/) - API mocking for tests

---

**Document Approval**:
- Frontend Lead: [Pending]
- Product Manager: [Pending]
- QA Lead: [Pending]
- UX Designer: [Pending]

**Change Log**:
- 2025-12-16: Initial specification created (v1.0)