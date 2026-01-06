# Repository Guidelines

## Project Structure & Module Organization
- Root: Node.js workspace with `client-v2` (React + TypeScript + Vite + Tailwind) and `server` (Express + SQLite/Knex).
- Client: app code in `client-v2/src` (components, lib, hooks, api, types). Uses TypeScript (`.tsx`, `.ts`) for all source files.
- Server: HTTP API in `server/index.js`; routes in `server/routes/*`, middleware in `server/middleware`, data layer in `server/db/*` and helpers in `server/utils/*`.
- Tests: client unit tests under `client-v2/src/**/__tests__/*.test.tsx`. Server includes ad‑hoc scripts in `server/test_*.js`.
- Config: copy `.env.example` to `.env` (e.g., `PORT`, `JWT_SECRET`).

## Build, Test, and Development Commands
- `npm run setup`: install root deps and client deps.
- `npm run dev`: run server and client concurrently (API on `:5001`, client on `:3001`).
- `npm run dev:server` / `npm run dev:client`: run each side in isolation.
- `npm run build`: build production client to `client-v2/build` using Vite.
- `npm start`: start Express API; in production it serves `client-v2/build`.
- Client dev commands: `cd client-v2 && npm run dev` (dev server), `npm run build` (production build), `npm run preview` (preview build).
- Tests: `cd client-v2 && npm test` for React tests. Root `npm test` runs Jest for Node when present.
- **Run single test**: `cd client-v2 && npm test -- src/path/to/Component.test.tsx` (or `*.test.ts` for utilities)

## Code Style & Naming Conventions

### Client (TypeScript/React)
- **Indentation**: 2 spaces
- **File naming**: PascalCase for components (`BudgetManager.tsx`), camelCase for hooks/utilities (`useBudgetData.ts`)
- **Component naming**: PascalCase for components (`export function BudgetManager`)
- **Variable/State naming**: camelCase (`const [selectedMonth, setSelectedMonth]`)
- **Import style**: Named imports preferred: `import { useState, useEffect } from 'react'`
- **UI Components**: Always use shadcn/ui components from `client-v2/src/components/ui/`
- **Icons**: Import from lucide-react: `import { Plus, Trash2 } from 'lucide-react'`
- **Styling**: Prefer Tailwind utility classes over custom CSS. Use CSS custom properties from `globals.css` for colors.
- **Types**: Define types in `client-v2/src/types/` directory, import with `import type { Expense } from '../types'`
- **Error handling**: Use toast notifications from sonner for user feedback: `toast.error('Failed to save')`
- **Path aliases**: Use `@/*` for imports: `import { formatCurrency } from '@/lib/utils'`

### Server (JavaScript/Node)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Route naming**: camelCase plural (`recurringExpenses.js`, `budgets.js`)
- **File structure**: Routes in `server/routes/*`, utils in `server/utils/*` (avoid side effects)
- **Error handling**: Return consistent error responses: `res.status(400).json({ error: '...' })`

## Testing Guidelines
- **Frameworks**: Jest + React Testing Library + TypeScript (client). Place tests near code in `__tests__` using `*.test.tsx` or `*.test.ts`.
- **Run single test**: `cd client-v2 && npm test -- path/to/testFile.test.tsx`
- **Mock API calls**: Use axios mocks in `client-v2/src/__mocks__/axios.js` or jest.mock
- **Coverage**: Run `cd client-v2 && npm run test:coverage` for coverage report
- **Test behavior**: Focus on component behavior and user interactions, not implementation details

## Commit & Pull Request Guidelines
- Use Conventional Commits seen in history: `feat: ...`, `refactor: ...`, `fix: ...`.
- PRs: small, focused, with description, linked issue, screenshots for UI changes, and test plan.
- Include API or schema notes if touching `server/routes/*` or `server/db/*`.

## Security & Configuration Tips
- Do not commit secrets; set `JWT_SECRET` and `PORT` in `.env`.
- SQLite lives in `server/db/expense_tracker.sqlite`; back up locally and avoid editing by hand.

## API Endpoint Overview
- Base URL: `http://localhost:5001/api`. Auth: send `x-auth-token: <JWT>` (except `POST /auth/register` and `POST /auth/login`).
- Dates use `YYYY-MM-DD` format.
- Key routes: Auth, Expenses, Categories, Incomes, Budgets, Recurring Expenses, Summary, Analytics, Savings, Optimization, Users, Couple

## UI Design Guidelines

**IMPORTANT: Read the Design System documentation before creating or modifying UI:**
📄 **`client-v2/DESIGN_SYSTEM.md`** — Complete visual language, component patterns, and code examples

### Design Philosophy: "Refined Nordic Finance"
- Warm ivory backgrounds (not cold white/gray)
- Instrument Serif (display) + DM Sans (body) typography
- Teal (success), Coral (warning), Gold (highlight) accent colors
- Desktop-first, supports both spacious and data-dense layouts

### Quick Reference
- **Components**: Always use shadcn/ui from `client-v2/src/components/ui/`
- **Colors**: Use CSS variables from `globals.css` — NEVER raw hex values
- **Icons**: Lucide React (`h-4 w-4` standard, `h-5 w-5` for emphasis)
- **Toasts**: sonner for user feedback
- **Status Colors**:
  - Success/On track: `--theme-teal` with `bg-theme-teal/10`
  - Warning/Near limit: `--theme-amber` with `bg-theme-amber/10`
  - Danger/Over budget: `--theme-coral` with `bg-theme-coral/10`
- **Display Font**: Use `font-display` class for headings and stat values
- **Section Labels**: `text-xs font-medium text-muted-foreground uppercase tracking-wide`

### Density Modes
- **Standard** (dashboards): `p-4` to `p-6`, `gap-4` to `gap-6`
- **Compact** (tables): `py-2 px-3`, `gap-1` to `gap-2`, hover-reveal actions

### Dark Mode
Supported via `.dark` class on root element. All color tokens have dark variants.

## Task List Management (Cursor Rules)
When working on multi-step features, maintain task lists in markdown files:
- Create `TASKS.md` or descriptive filename in project root
- Structure with: Completed Tasks, In Progress Tasks, Future Tasks, Implementation Plan, Relevant Files
- Mark tasks with `[x]` when completed, move between sections as appropriate
- Keep "Relevant Files" section updated with file paths and descriptions

## Key Technology Stack
- **Client**: React 18, TypeScript 5.9+, Vite 6.3+, React Router DOM 7.9+, shadcn/ui (Radix UI), Recharts 2.15+, Lucide React, React Hook Form 7.55+, Axios
- **Server**: Express 4.18+, Knex 2.4+, SQLite3, JWT, bcryptjs
- **State**: React Context API for global state (AuthContext, ScopeContext)
- **Services**: API services organized in `client-v2/src/api/services/` by domain (auth, budget, expense, etc.)

## Important Utilities for DRY Principle Enforcement

This section references the shared utilities in `client-v2/src/lib` that should be used throughout the application to avoid code duplication and maintain consistency.

### Core Utilities

#### `utils.ts` - General Utility Functions
- **formatCurrency(amount)** - Format numbers as SEK currency (sv-SE locale)
- **formatDate(dateString)** - Format dates to 'MMM DD, YYYY' format
- **getMonthName(date)** - Get full month name with year
- **calculateExpenseShare(expense, userId)** - Calculate user's share based on split type
- **calculateBalance(expenses, user1Id, user2Id)** - Calculate balance between two users
- **filterExpensesByMonth(expenses, year, month)** - Filter expenses for specific month
- **calculateCategorySpending(expenses, category)** - Calculate total spending for a category
- **getBudgetProgress(budget, spent)** - Calculate budget progress percentage
- **cn(...classes)** - Utility for conditional CSS class names

#### `budgetUtils.ts` - Budget-Specific Utilities
- **getBudgetStatus(progress)** - Determine budget status (success/warning/danger)
- **getStatusLabel(status)** - Get human-readable status label
- **getStatusColor(status)** - Get color for budget status
- **calculateBudgetMetrics(budgets)** - Calculate comprehensive budget metrics
- **calculateBudgetStats(budgets)** - Calculate budget statistics
- **transformBudgetWithSpending(budget, expenses)** - Transform budget with spending data
- **getBudgetStatusMessage(progress)** - Get user-friendly budget status message
- **getOverallBudgetMessage(overallProgress)** - Get overall budget message
- **getCategoryIcon(categoryName)** - Get icon for category
- **sortBudgetsBySpending(budgets)** - Sort budgets by spending amount
- **sortBudgetsByProgress(budgets)** - Sort budgets by progress percentage
- **sortBudgetsByName(budgets)** - Sort budgets alphabetically
- **getBudgetsNeedingAttention(budgets)** - Filter budgets needing attention
- **getBudgetsOnTrack(budgets)** - Filter on-track budgets
- **calculateBudgetUtilization(budgets)** - Calculate overall budget utilization
- **getTopSpendingCategories(budgets, limit)** - Get top spending categories
- **isValidBudgetAmount(amount)** - Validate budget amount
- **formatBudgetAmount(amount)** - Format amount as SEK currency
- **formatPercentage(value)** - Format value as percentage
- **calculateSavingsAmount(budgets)** - Calculate total savings amount
- **calculateOverspendAmount(budgets)** - Calculate total overspend amount

#### `budgetAllocation.ts` - Budget Allocation Logic
- **calculateWeightedAllocations(categories, bucketBudget)** - Calculate weighted budget allocations with constraints
- **getCategoryWeight(category)** - Get weight for category with fallbacks
- **getCategoryConstraints(category)** - Get min/max constraints for category
- **DEFAULT_CATEGORY_WEIGHTS** - Fallback weights for common categories
- **roundBudgetAmount(amount, category)** - Apply rounding based on category type

#### `recurringAnalytics.ts` - Recurring Expense Analytics
- **computeRecurringSummary(templates, expenses, start, end)** - Calculate recurring expense summary
- **RecurringSummary** interface - Type definition for recurring analytics

### Configuration & Constants

#### `constants.ts` - Application Constants
- **COLORS** - CSS color variables mapping
- **CHART_COLORS** - Chart-specific color palette
- **STATUS_COLORS** - Status color mapping
- **ICON_COLORS** - Icon color mapping
- **ICON_BG_COLORS** - Icon background colors (20% opacity)
- **BUDGET_STATUS_THRESHOLDS** - Status threshold values
- **STATUS_LABELS** - Status label constants
- **CATEGORY_ICONS** - Icon mapping for categories
- **CATEGORY_DESCRIPTIONS** - Category descriptions as single source of truth
- **ANIMATION_DURATIONS** - Animation timing constants
- **SPACING** - Spacing scale using CSS variables
- **BREAKPOINTS** - Responsive breakpoint definitions
- **PROGRESS_SIZES** - Progress bar size configurations
- **BADGE_SIZES** - Badge size configurations
- **ICON_SIZES** - Icon size constants
- **ICON_CONTAINER_SIZES** - Icon container size constants

#### `categoryColors.ts` - Category Color Configuration
- Centralized color assignments for categories
- Consistent color scheme across the application

#### `categoryIcons.ts` - Category Icon Configuration
- Icon mappings for all categories
- Consistent iconography across components

### Specialized Utilities

#### `budgetAggregation.ts` - Budget Aggregation Logic
- Functions for aggregating budget data across different dimensions
- Time-based aggregation utilities

#### `budgetSuggestions.ts` - Budget Recommendation Engine
- Logic for generating budget suggestions
- Smart recommendation algorithms

#### `recommendationEngine.ts` - Advanced Recommendation Logic
- Complex recommendation algorithms
- ML-enhanced budget suggestions

#### `iconUtils.ts` - Icon Helper Functions
- Icon resolution utilities
- Dynamic icon loading helpers

### Usage Guidelines

1. **Always import from these utilities** instead of reimplementing functionality
2. **Check existing utilities** before creating new functions
3. **Contribute back** to shared utilities when creating reusable logic
4. **Maintain type safety** - All utilities are properly typed with TypeScript
5. **Follow naming conventions** - Use clear, descriptive function names
6. **Document new utilities** - Add JSDoc comments for all public functions

### Examples

#### ✅ Correct Usage
```typescript
import { formatCurrency, calculateCategorySpending } from '@/lib/utils';
import { getBudgetStatus, formatBudgetAmount } from '@/lib/budgetUtils';
import { COLORS, STATUS_COLORS } from '@/lib/constants';

// Use shared utilities
const amount = formatCurrency(1234.56);
const status = getBudgetStatus(progress);
```

#### ❌ Incorrect Usage
```typescript
// Don't reimplement existing utilities
const formatCurrency = (amount: number) => {
  return `SEK ${amount.toFixed(2)}`; // This already exists!
};
```

### Testing

All utilities have corresponding test files in `__tests__/` directories:
- `budgetAggregation.test.ts`
- `budgetAllocation.test.ts`
- Add tests for new utilities to ensure reliability

### Remember

Using these shared utilities ensures:
- **Consistency** across the application
- **Maintainability** - single source of truth
- **Type safety** - TypeScript interfaces included
- **Performance** - optimized implementations
- **DRY principle** - Don't Repeat Yourself
