# Repository Guidelines

## Project Structure & Module Organization
- Root: Node.js workspace with `client` (React + Tailwind) and `server` (Express + SQLite/Knex).
- Client: app code in `client/src` (components, pages, hooks, utils). Static assets in `client/public`.
- Server: HTTP API in `server/index.js`; routes in `server/routes/*`, middleware in `server/middleware`, data layer in `server/db/*` and helpers in `server/utils/*`.
- Tests: client unit tests under `client/src/**/__tests__/*.test.js`. Server includes ad‑hoc scripts in `server/test_*.js`.
- Config: copy `.env.example` to `.env` (e.g., `PORT`, `JWT_SECRET`).

## Build, Test, and Development Commands
- `npm run setup`: install root deps and client deps.
- `npm run dev`: run server and client concurrently (API on `:5001`, client on `:3000`).
- `npm run dev:server` / `npm run dev:client`: run each side in isolation.
- `npm run build`: build production client to `client/build`.
- `npm start`: start Express API; in production it serves `client/build`.
- Tests: `cd client && npm test` for React tests. Root `npm test` runs Jest for Node when present.

## Coding Style & Naming Conventions
- JavaScript/React with 2‑space indentation, semicolons, single quotes.
- Components: PascalCase files (e.g., `SpendingPatternsChart.js`). Hooks/utilities: camelCase.
- Server: route modules camelCase plural (e.g., `recurringExpenses.js`), avoid side effects in `utils`.
- Linting: client uses CRA’s ESLint defaults; prefer Tailwind utility classes defined in `tailwind.config.js`.

## Testing Guidelines
- Frameworks: Jest + React Testing Library (client). Place tests near code in `__tests__` using `*.test.js`.
- Aim for behavior tests around charts/utils; mock API calls with `axios` mocks.
- Run: `cd client && npm test` (watch mode) or CI-friendly `CI=true npm test`.

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
  - POST `/budgets`: `{ category_id, amount, month, year }` (upsert).

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

## Shared Goal Palette & Pinning
- Shared accent ramp lives in `client/src/utils/goalColorPalette.js`. Use `getGoalColorScheme(index)` or `assignGoalColors(collection)` for any ordered card list (goals, dashboard tiles, future analytics).
- Pinning is persisted via `savings_goals.is_pinned`; server routes enforce a single pinned goal per user and send `color_index` for consistent ordering.
- Client helpers consume the accent object (`surface`, `border`, `ring`, `quickButton`, etc.) to keep cards, progress bars, and buttons aligned with the design spec.
- Run `npx knex migrate:latest --knexfile server/db/knexfile.js` after pulling to ensure the new column exists before starting the API.

## UI Style Guide & Design System

The project follows a comprehensive design specification documented in `docs/design_spec_financial_checkup_ui.md`. Key guidelines:

### Design Principles
- **Conversational & Supportive** – copy should feel like a helpful coach
- **Data-rich, never overwhelming** – every insight has a visual for immediate understanding
- **Action-oriented** – each card provides clear next steps
- **Calming confidence** – rounded shapes, soft gradients, gentle shadows

### Color System
- **Primary**: Emerald (`#10b981`) for wins/savings, Rose (`#fb7185`) for alerts, Indigo (`#6366f1`) for reallocation
- **Background**: White with `#f8fafc` section dividers
- **Text**: Primary `#0f172a`, secondary `#475569`, quiet `#94a3b8`
- **Accent Palette**: 8-color shared system (emerald, teal, sky, indigo, violet, amber, rose, slate)

### Typography
- **Headlines**: 600 weight, 24-32px, `#0f172a`
- **Card titles**: 600 weight, 18px, `#0f172a`
- **Body**: 14px, line-height 1.6, `#475569`
- **Meta labels**: Uppercase, 0.08em tracking, 12px, `#64748b`

### Component Standards
- **Cards**: `rounded-3xl border border-slate-100 bg-white p-6 shadow-md`
- **Section banners**: 60px tall, gradient backgrounds, icon + stacked text
- **Action pills**: Ghost style with hover states, emerald for primary actions
- **Mini-charts**: 128-160px tall, soft gridlines, 11px axis fonts
- **Progress bars**: 2px radius, accent colors with smooth transitions

### Implementation
- Use Flowbite library as base unless specified otherwise
- Responsive design required (mobile-first approach)
- Google Fonts: Plus Jakarta Sans, Inter, Roboto, Open Sans, Poppins, etc.
- Motion: 250ms ease for cards, 150ms for buttons

### Accessibility
- Contrast ratio ≥ 4.5:1 for text
- All icon-only controls need `aria-label`
- Focus states visible with accent colors
- Charts should have alt text summaries

Refer to the full design spec for detailed component patterns, chart styling, and interaction guidelines.
