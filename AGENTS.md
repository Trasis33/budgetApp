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

## Coding Style & Naming Conventions
- Client: TypeScript/React with 2‑space indentation. Files use `.tsx` for components, `.ts` for utilities.
- Components: PascalCase files (e.g., `BudgetManager.tsx`). Hooks/utilities: camelCase (e.g., `useBudgetData.ts`).
- Server: JavaScript with 2‑space indentation, semicolons, single quotes. Route modules camelCase plural (e.g., `recurringExpenses.js`), avoid side effects in `utils`.
- Linting: client uses TypeScript strict mode; prefer Tailwind utility classes defined in `tailwind.config.js`.
- Type definitions: Located in `client-v2/src/types/` directory.

## Testing Guidelines
- Frameworks: Jest + React Testing Library + TypeScript (client). Place tests near code in `__tests__` using `*.test.tsx` or `*.test.ts`.
- Aim for behavior tests around components/utils; mock API calls with `axios` mocks.
- Run: `cd client-v2 && npm test` (watch mode), `npm run test:watch` (explicit watch), or `npm run test:coverage` (coverage report).

## Commit & Pull Request Guidelines
- Use Conventional Commits seen in history: `feat: ...`, `refactor: ...`, `fix: ...`.
- PRs: small, focused, with description, linked issue, screenshots for UI changes, and test plan.
- Include API or schema notes if touching `server/routes/*` or `server/db/*`.

## Security & Configuration Tips
- Do not commit secrets; set `JWT_SECRET` and `PORT` in `.env`.
- SQLite lives in `server/db/expense_tracker.sqlite`; back up locally and avoid editing by hand.

## API Endpoint Overview
- Base URL: `http://localhost:5001/api`. Auth: send `x-auth-token: <JWT>` (except `POST /auth/register` and `POST /auth/login`). Dates use `YYYY-MM-DD`.

- Auth
  - POST `/auth/register`: name, email, password → returns `{token, user}`.
  - POST `/auth/login`: email, password → returns `{token, user}`.
  - GET `/auth/user`: current user.
  - PUT `/auth/profile`: update `name`, `email`, optional `currentPassword` + `newPassword`.

- Expenses
  - GET `/expenses`: list expenses with category and payer names.
  - GET `/expenses/recent`: last 5 expenses.
  - GET `/expenses/:id`: expense by id.
  - POST `/expenses`: body `{ amount, category_id, paid_by_user_id, date?, split_type?, split_ratio_user1?, split_ratio_user2?, description }`.
  - PUT `/expenses/:id`: update any of the fields above.
  - DELETE `/expenses/:id`: remove expense.

- Categories
  - GET `/categories`: list categories.
  - POST `/categories`: `{ name, icon? }`.
  - PUT `/categories/:id`: `{ name?, icon? }`.
  - DELETE `/categories/:id`: fails if in use by expenses.

- Incomes
  - GET `/incomes?month=MM&year=YYYY`: current user’s incomes.
  - POST `/incomes`: `{ source, amount, date }`.
  - DELETE `/incomes/:id`.

- Budgets
  - GET `/budgets?month=MM&year=YYYY`: list budgets for a specific month/year with category names.
  - POST `/budgets`: `{ category_id, amount, month, year }` (upsert).
  - DELETE `/budgets/:id`: delete a budget by id.
  - GET `/budgets/available-categories?month=MM&year=YYYY`: categories without budgets for specified period.
  - GET `/budgets/summary/:month/:year`: detailed budget summary with spending, progress, and status for all categories.
  - GET `/budgets/test`: test database connection (dev endpoint).

- Recurring Expenses
  - GET `/recurring-expenses`: active templates.
  - GET `/recurring-expenses/:id`.
  - POST `/recurring-expenses`: `{ description, default_amount, category_id, paid_by_user_id, split_type, split_ratio_user1?, split_ratio_user2? }`.
  - PUT `/recurring-expenses/:id`: update fields above.
  - DELETE `/recurring-expenses/:id`: soft-deactivate.

- Summary
  - GET `/summary/monthly/:year/:month`: expenses, category totals, balances, monthly statement.
  - PUT `/summary/monthly/:year/:month`: `{ remaining_budget_user1?, remaining_budget_user2? }`.
  - GET `/summary/settle?month=MM&year=YYYY`: settlement message and totals.
  - GET `/summary/charts/:year/:month`: chart data for monthly summary.

- Analytics
  - GET `/analytics/trends/:startDate/:endDate`: monthly totals + budget comparisions.
  - GET `/analytics/trends/detailed/:startDate/:endDate`: detailed trend analytics with enhanced data.
  - GET `/analytics/category-trends/:startDate/:endDate`: top categories with monthly/budget data.
  - GET `/analytics/income-expenses/:startDate/:endDate`: monthly income vs expenses, surplus, trends.
  - GET `/analytics/savings-analysis/:startDate/:endDate`: comprehensive savings analysis.
  - GET `/analytics/current-settlement`: current month settlement snapshot.

- Savings
  - GET `/savings/goals`: goals for current user.
  - POST `/savings/goals`: `{ goal_name, target_amount, target_date, category }`.
  - PUT `/savings/goals/:id`: partial update.
  - DELETE `/savings/goals/:id`.
  - GET `/savings/goals/:id/contributions`: contributions for a specific goal.
  - POST `/savings/goals/:id/contributions`: add contribution to goal.
  - DELETE `/savings/contributions/:contributionId`: remove specific contribution.
  - GET `/savings/rate/:startDate/:endDate`: savings rate per month.

- Optimization
  - GET `/optimization/analyze`: returns analysis and stores optimization tips.
  - GET `/optimization/tips`: active (non-dismissed, non-expired) tips.
  - POST `/optimization/tips/:id/dismiss`: dismiss tip.
  - PUT `/optimization/tips/:id`: `{ is_dismissed }`.

- Users
  - GET `/users`: list all users (admin/couple access).

- Couple
  - POST `/couple/invite`: invite partner to share budget.
  - GET `/couple/summary`: couple-level financial summary.

- Auth (Additional)
  - GET `/auth/users`: list all users (for couple setup).
  - POST `/auth/invite-partner`: `{ partnerEmail }` - invite partner to link accounts.

## API Response Examples
Example values are illustrative and truncated.

Analytics
- GET `/analytics/trends/2025-07-01/2025-08-31`
```json
{
  "monthlyTotals": [
    { "month": "2025-07", "total_spending": 32000, "expense_count": 85, "avg_expense": 376.47, "total_budget": 31000 },
    { "month": "2025-08", "total_spending": 33000, "expense_count": 88, "avg_expense": 375.0, "total_budget": 32000 }
  ],
  "previousYearTotals": [ { "month": "2024-07", "total_spending": 28000 } ],
  "summary": { "totalSpending": 65000, "avgMonthlySpending": 32500, "trendPercentage": 23.2, "trendDirection": "up", "monthCount": 2 }
}
```

- GET `/analytics/category-trends/2025-05-01/2025-08-31`
```json
{
  "topCategories": ["Groceries", "Utilities", "Dining Out"],
  "trendsByCategory": {
    "Groceries": {
      "monthlyData": [
        { "category": "Groceries", "category_id": 1, "month": "2025-07", "total_spending": 1200, "expense_count": 12, "avg_expense": 100 },
        { "category": "Groceries", "category_id": 1, "month": "2025-08", "total_spending": 1400, "expense_count": 14, "avg_expense": 100 }
      ],
      "budgetData": [
        { "category": "Groceries", "category_id": 1, "month": "2025-07", "budget_amount": 1000 },
        { "category": "Groceries", "category_id": 1, "month": "2025-08", "budget_amount": 1100 }
      ],
      "totalSpending": 5600
    }
  },
  "categoryTotals": [ { "category": "Groceries", "category_id": 1, "total_spending": 5600, "expense_count": 54 } ],
  "summary": { "totalCategories": 5, "topCategory": "Groceries", "topCategorySpending": 5600 }
}
```

- GET `/analytics/income-expenses/2025-07-01/2025-08-31`
```json
{
  "monthlyData": [
    { "month": "2025-07", "income": 40000, "expenses": 32000 },
    { "month": "2025-08", "income": 42000, "expenses": 33000 }
  ],
  "summary": {
    "totalIncome": 82000,
    "totalExpenses": 65000,
    "totalSurplus": 17000,
    "avgSavingsRate": 20.73,
    "savingsTrend": 5.1,
    "savingsTrendDirection": "improving",
    "monthCount": 2
  }
}
```

- GET `/analytics/savings-analysis/2025-07-01/2025-08-31`
```json
{
  "monthlyData": [
    { "month": "2025-07", "income": 40000, "expenses": 32000, "savings": 8000, "savingsRate": 20 },
    { "month": "2025-08", "income": 42000, "expenses": 33000, "savings": 9000, "savingsRate": 21.43 }
  ],
  "savingsGoals": [ { "id": 3, "goal_name": "Emergency Fund", "target_amount": 60000 } ],
  "summary": {
    "totalIncome": 82000,
    "totalExpenses": 65000,
    "totalSavings": 17000,
    "averageSavingsRate": 20.72,
    "savingsRateTrend": 7.1,
    "trendDirection": "improving",
    "monthCount": 2
  }
}
```

- GET `/analytics/current-settlement`
```json
{
  "settlement": { "amount": "450.00", "creditor": "Alice", "debtor": "Bob", "message": "Bob owes Alice" },
  "totalSharedExpenses": "12000.00",
  "monthYear": "2025-09"
}
```

Optimization
- GET `/optimization/analyze`
```json
{
  "patterns": {
    "Groceries": {
      "data": [ { "month": "2025-07", "amount": 1200 }, { "month": "2025-08", "amount": 1400 } ],
      "trend": "increasing",
      "trendStrength": 150.2,
      "enhancedTrend": {
        "category": "strong",
        "normalizedStrength": 18.2,
        "percentageChange": 25.6,
        "monthlyChange": 180,
        "volatility": 90,
        "confidence": 73,
        "description": "Significant change, strong trend detected",
        "dataPoints": 12,
        "average": 990
      }
    }
  },
  "seasonalTrends": { "01": 0.92, "12": 1.14 },
  "budgetVariances": [
    { "name": "Groceries", "month": "2025-08", "budgetAmount": 1000, "actualAmount": 1200, "variance": 0.2, "overagePercentage": 20, "suggestedReduction": 200, "unusedAmount": 0 }
  ],
  "recommendations": [
    { "type": "reduction", "category": "Groceries", "title": "Reduce Groceries spending", "description": "You're spending 20% over budget...", "impact_amount": 200, "confidence_score": 0.8 }
  ]
}
```

- GET `/optimization/tips`
```json
[
  {
    "id": 12,
    "tip_type": "reduction",
    "category": "Groceries",
    "title": "Reduce Groceries spending",
    "description": "You're spending 20% over budget...",
    "impact_amount": 200,
    "confidence_score": 0.8,
    "is_dismissed": 0,
    "expires_at": "2025-10-01T00:00:00.000Z",
    "created_at": "2025-09-03T21:15:00.000Z"
  }
]
```

## Client-v2 Architecture & Libraries

### Technology Stack
- **Framework**: React 18 with TypeScript 5.9+
- **Build Tool**: Vite 6.3+ (replaces Create React App)
- **Routing**: React Router DOM 7.9+
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind)
- **Charts**: Recharts 2.15+
- **Icons**: Lucide React
- **Forms**: React Hook Form 7.55+
- **HTTP Client**: Axios (services in `client-v2/src/api/services/`)
- **State**: React Context API (`client-v2/src/context/`)

### Directory Structure
```
client-v2/src/
├── components/        # React components (.tsx)
│   ├── ui/           # shadcn/ui components
│   ├── budget/       # Budget-specific components
│   ├── shared/       # Shared utilities
│   └── ...           # Page-level components
├── lib/              # Utility functions (.ts)
├── hooks/            # Custom React hooks (.ts)
├── api/              # API layer
│   ├── axios.ts      # Axios instance
│   └── services/     # API service modules
├── context/          # React Context providers
├── types/            # TypeScript type definitions
└── styles/           # CSS modules
```

### Key Features
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Library**: shadcn/ui for consistent, accessible UI components
- **Service Layer**: Organized API services per domain (auth, budget, expense, etc.)
- **Custom Hooks**: Reusable hooks like `useBudgetData`, `useBudgetCalculations`
- **Scope System**: Multi-user scope selection via `ScopeContext`

### Shared Goal Palette & Colors
- Color utilities live in `client-v2/src/lib/` directory (TypeScript modules).
- Pinning is persisted via `savings_goals.is_pinned`; server routes enforce a single pinned goal per user and send `color_index` for consistent ordering.
- Client helpers provide accent colors (`surface`, `border`, `ring`, `quickButton`, etc.) to keep cards, progress bars, and buttons aligned with the design spec.
- Run `npx knex migrate:latest --knexfile server/db/knexfile.js` after pulling to ensure the new column exists before starting the API.

## UI Style Guide & Design System

The project uses a modern design system built on shadcn/ui components with Tailwind CSS v4 and oklch color space. All styles are defined in `client-v2/src/styles/globals.css` and follow consistent patterns throughout the application.

### Design Principles
- **Type-safe**: Full TypeScript coverage with strict typing
- **Accessible**: WCAG AA compliant with focus states and aria labels
- **Consistent**: CSS custom properties for themeable design tokens
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Modern**: oklch color space for perceptual uniformity

### Color System
Colors use oklch format for better perceptual uniformity and are defined as CSS custom properties in `:root`:

**Core Colors:**
- `--background`: `#ffffff` (light) / `oklch(0.145 0 0)` (dark)
- `--foreground`: `oklch(0.145 0 0)` (light) / `oklch(0.985 0 0)` (dark)
- `--primary`: `#030213` (near-black primary)
- `--muted`: `#ececf0` (subtle backgrounds)
- `--muted-foreground`: `#717182` (secondary text)
- `--border`: `rgba(0, 0, 0, 0.1)` (subtle borders)
- `--destructive`: `#d4183d` (red for errors/delete)

**Theme Accent Colors:**
- `--theme-amber`: `oklch(.646 .222 41.116)` - warm amber
- `--theme-teal`: `oklch(.6 .118 184.704)` - teal
- `--theme-indigo`: `oklch(.398 .07 227.392)` - deep indigo
- `--theme-yellow`: `oklch(.828 .189 84.429)` - yellow
- `--theme-golden`: `oklch(.769 .188 70.08)` - golden yellow
- `--theme-coral`: `oklch(.71 .18 16)` - soft coral-red
- `--theme-violet`: `oklch(.74 .16 320)` - lilac/violet
- `--theme-cyan`: `oklch(.7 .16 200)` - aqua-cyan
- `--theme-periwinkle`: `oklch(.78 .16 260)` - periwinkle
- `--theme-mint`: `oklch(.82 .12 140)` - mint green

### Typography
Typography uses CSS custom properties with responsive scaling:

**Font Sizes:**
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)

**Font Weights:**
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

**Base Typography Styles:**
- `h1`: 2xl size, medium weight, 1.5 line-height
- `h2`: xl size, medium weight, 1.5 line-height
- `h3`: lg size, medium weight, 1.5 line-height
- `h4`: base size, medium weight, 1.5 line-height
- `p`: base size, normal weight, 1.5 line-height
- `label`: base size, medium weight, 1.5 line-height
- `button`: base size, medium weight, 1.5 line-height

### Component Patterns

**Buttons:**
shadcn/ui Button component with variants defined in `globals.css`:
- `.btn-ghost`: Transparent with hover accent background
- `.btn-primary`: Primary background with text contrast
- `.btn-secondary`: Secondary background with subtle hover
- `.btn-destructive`: Red background for delete/remove actions

Example usage:
```tsx
<Button variant="ghost">Cancel</Button>
<Button>Save</Button>
<Button variant="destructive">Delete</Button>
```

**Cards:**
shadcn/ui Card component with standard pattern:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```
- Uses `var(--radius)` (0.625rem) for rounded corners
- Border color: `var(--border)`
- Background: `var(--card)`

**Inputs:**
shadcn/ui Input component with consistent styling:
- Background: `var(--input-background)` (#f3f3f5)
- Border: `var(--border)`
- Focus ring: `var(--ring)`
- Height: standard (h-10)

**Dialogs/Modals:**
shadcn/ui Dialog component for modals:
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      {/* actions */}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Spacing & Layout
Spacing uses CSS custom properties with consistent scale:
- `--spacing-1` through `--spacing-64` (0.25rem to 16rem)
- Standard padding/margin: `p-6`, `space-y-6`, `gap-3`
- Card padding: `p-6` (1.5rem)
- Section spacing: `space-y-6` (1.5rem vertical gap)

### Radius & Borders
- `--radius`: 0.625rem (10px) - base radius
- `--radius-sm`: calc(var(--radius) - 4px)
- `--radius-md`: calc(var(--radius) - 2px)
- `--radius-lg`: var(--radius)
- `--radius-xl`: calc(var(--radius) + 4px)

### Icons
**Lucide React** for all icons:
- Standard size: `h-4 w-4` or `h-5 w-5`
- Icon color inherits text color or uses `text-primary`, `text-muted-foreground`
- Icons in buttons: gap-2 spacing

Example:
```tsx
import { Plus, Target, PlusCircle } from 'lucide-react';
<Button><Plus className="h-4 w-4 mr-2" />Add</Button>
```

### Notifications
**Sonner** toast library for notifications:
```tsx
import { toast } from 'sonner';
toast.success('Budget goal set!');
toast.error('Could not save changes');
toast.warning('Click again to confirm');
```

### Dark Mode Support
Full dark mode support with automatic theme switching:
- Uses `.dark` class on root element
- All color variables have dark mode equivalents
- Automatic contrast adjustment

### Accessibility
- Focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- ARIA labels on icon-only buttons
- Keyboard navigation supported in all interactive elements
- Contrast ratio ≥ 4.5:1 maintained
- Screen reader friendly with semantic HTML

### Implementation Guidelines
1. **Always use shadcn/ui components** from `client-v2/src/components/ui/`
2. **Use CSS custom properties** instead of hard-coded colors
3. **Apply Tailwind utility classes** for spacing and layout
4. **Follow consistent patterns** seen in BudgetManager.tsx
5. **Use toast notifications** for user feedback
6. **Implement loading states** with spinners and skeleton loaders

Refer to `client-v2/src/styles/globals.css` for complete design token definitions and `client-v2/src/components/BudgetManager.tsx` for comprehensive component usage examples.
