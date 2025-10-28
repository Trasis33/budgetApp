---
title: Savings Page Design Specification (SavingsRateTracker and SavingsGoalsManager)
version: 1.0
date_created: 2025-10-17
last_updated: 2025-10-17
owner: app-frontend
tags: [design, app, react, analytics, savings, goals]
---

# Introduction

This specification defines the UX, data contracts, behaviors, and validation for the Savings page, including the components SavingsRateTracker and SavingsGoalsManager. It covers UI interactions, API contracts, state management, error handling, and edge cases to ensure consistent implementation and testability.

## 1. Purpose & Scope

- Purpose: Provide a precise, AI-ready reference for implementing and validating the Savings page in the client application.
- Scope:
  - SavingsRateTracker: fetches and displays savings rate analytics over time with charting and summary stats.
  - SavingsGoalsManager: manages creation, display, and deletion of savings goals and supports contributions via AddContributionModal.
  - Time range controls and shared layout defined in the Savings page.
  - Scope-aware data handling (multi-tenant/partner context) via `useScope`.
- Audience: Frontend engineers, QA/test engineers, technical writers, and AI agents implementing or validating the feature.
- Assumptions:
  - User authentication and context (`useAuth`) are already implemented.
  - API endpoints are available per the server contract defined below.
  - The design system (Card, Chart components) and axios client exist and are configured.

## 2. Definitions

- Savings Rate: Percentage of income not spent, computed and returned by analytics API as `savingsRate` per month.
- Goal: A user-defined savings target with name, target amount/date, category, and current progress.
- Contribution: An increment towards a goal's `current_amount` captured by AddContributionModal.
- Scope: Logical partition key identifying the data context (e.g., shared/couple vs. personal), provided by `useScope()` and passed as `scope` query parameter; API may return scoped payloads under `scopes[scope]`.
- Shadcn UI: Internal design system elements used for the chart container and cards in the client.

## 3. Requirements, Constraints & Guidelines

- REQ-001: The Savings page shall display a time horizon selector (3M, 6M, 1Y) that controls the SavingsRateTracker date range.
- REQ-002: The SavingsRateTracker shall fetch analytics for the selected period and render:
  - A line chart of monthly savings rate.
  - A target reference line (default 20%).
  - Three stat cards: Average Savings Rate, Total Savings, Trend.
- REQ-003: The SavingsRateTracker shall support data scoping via `scope` from `useScope`, reading data from `payload.scopes[scope]` if present, otherwise fall back to the top-level payload.
- REQ-004: The SavingsRateTracker shall render any returned savings goals underneath the chart with progress bars and an action to add contributions.
- REQ-005: The SavingsGoalsManager shall list current goals, allow creation of a new goal, and allow deletion of an existing goal.
- REQ-006: The SavingsGoalsManager shall support data scoping via `scope` from `useScope`, reading goals from `payload.scopes[scope].goals` if present, otherwise from `payload.goals` or the raw array.
- REQ-007: The SavingsGoalsManager progress computation shall cap at 100% and handle `target_amount = 0` safely.
- REQ-008: The Add Contribution flow shall open AddContributionModal with the selected goal and enforce a cap so that `current_amount + contribution <= target_amount` when `enforceCap=true`.
- REQ-009: The UI shall show distinct loading, error, and empty states for both components.
- REQ-010: The Savings page shall be responsive and align with design tokens (colors, spacing, typography) already present in the codebase.
- REQ-011: All currency values displayed shall use `formatCurrency` and dates formatted using locale.
- REQ-012: Deleting a goal shall require user confirmation.
- SEC-001: All API requests must include auth via the client axios configuration and pass `scope` as a query parameter when available.
- SEC-002: Client must not trust client-side caps; server must validate contribution limits (server behavior out of scope of this doc but assumed).
- CON-001: Do not mutate external state directly; use React state setters.
- CON-002: Avoid division by zero when computing percentages.
- GUD-001: Prefer optimistic UI updates for contributions when modal returns updated values; otherwise refetch.
- PAT-001: Use helper extraction functions to unwrap scoped payloads (extractScopedValue/extractScopedGoals).

## 4. Interfaces & Data Contracts

### 4.1 UI Components

- Savings page (`client/src/pages/Savings.js`)
  - Props: none
  - Children: `<SavingsRateTracker timePeriod={timePeriod} />`, `<SavingsGoalsManager />`
  - Behavior: Hosts the time horizon select that updates `timePeriod` state and passes it to SavingsRateTracker.

- SavingsRateTracker (`client/src/components/SavingsRateTracker.js`)
  - Props:
    - `timePeriod: '3months' | '6months' | '1year'` (default: '6months')
    - `startDate?: YYYY-MM-DD` (optional override)
    - `endDate?: YYYY-MM-DD` (optional override)
  - Derived State: `period` mirrors `timePeriod` and drives fetching.
  - External Contexts: `useAuth()` for `user`, `useScope()` for `scope`.
  - External Components: `Card`, `ChartContainer`, Recharts LineChart, `AddContributionModal`.
  - Actions: opens `AddContributionModal` with selected goal; on success, refetches data.

- SavingsGoalsManager (`client/src/components/SavingsGoalsManager.js`)
  - Props: none
  - External Contexts: `useScope()` for `scope`.
  - External Components: `AddContributionModal` for contributions.
  - Actions: add goal (POST), delete goal (DELETE with confirm), open contribution modal (cap enforced via props).

- AddContributionModal (contract reference)
  - Expected Props from callers:
    - `open: boolean`
    - `onClose: () => void`
    - `goal: { id: number, name: string } | { id: number, name: string, targetAmount?: number, currentAmount?: number } | null`
    - `onSuccess: (updatedGoalOrVoid: any) => void`
    - `capAmount?: number | null`
    - `enforceCap?: boolean` (default true in callers)
  - Behavior: On success, either provides updated goal values or signals success; callers should refresh or update local state.

### 4.2 API Endpoints

- Analytics: GET `/analytics/savings-analysis/:startDate/:endDate?scope=<scope>`
  - Path Params: `startDate`, `endDate` in `YYYY-MM-DD`.
  - Query Params: `scope` (string) optional; when present server may return a scoped response object:
    - Either full payload at root
    - Or `{ scopes: { [scope]: { monthlyData, savingsGoals, summary } } }`
  - Response (subset required by client):
    - `monthlyData: Array<{ month: 'YYYY-MM', income?: number, expenses?: number, savings?: number, savingsRate: number }>`
    - `savingsGoals: Array<{ id: number, goal_name: string, target_amount: number, current_amount?: number, category?: string, target_date?: string }>`
    - `summary: { totalIncome?: number, totalExpenses?: number, totalSavings: number, averageSavingsRate?: number, savingsRateTrend?: number }`

- Savings Goals:
  - GET `/savings/goals?scope=<scope>`
    - Response: either
      - `Array<Goal>`
      - `{ goals: Array<Goal> }`
      - `{ scopes: { [scope]: { goals: Array<Goal> } } }`
    - `Goal` = `{ id: number, goal_name: string, target_amount: number, current_amount?: number, target_date?: string, category?: string }`
  - POST `/savings/goals`
    - Body: `{ goal_name: string, target_amount: number, target_date?: string, category?: 'general'|'emergency'|'vacation'|'house'|'car'|'education'|'retirement' }`
    - Behavior: creates or upserts a goal; returns created entity (server behavior not strictly required by client code).
  - DELETE `/savings/goals/:id`
    - Behavior: deletes goal. Client confirms before calling.

### 4.3 Local Data Shapes

- SavingsRateTracker internal `savingsData`:
  - `{ summary: { averageSavingsRate: number, totalSavings: number, trend: number }, chartData: Array<{ month: string, savingsRate: number }>, goals: Array<{ id: number, name: string, targetAmount: number, currentAmount: number, icon?: string, category?: string, targetDate?: string }>, targetRate: number }`

- SavingsGoalsManager `goals` state:
  - `Array<{ id: number, goal_name: string, target_amount: number, current_amount: number, target_date?: string, category?: string }>`

## 5. Acceptance Criteria

- AC-001: Given a logged-in user and default time horizon, when the Savings page loads, then SavingsRateTracker shows a line chart with monthly savings rate and three stat cards, and no errors.
- AC-002: Given the time horizon control is changed (3M/6M/1Y), when the user clicks a new option, then the chart data refetches and updates the visible range.
- AC-003: Given API returns scoped payloads, when `scope` is set, then the components extract and render only `scopes[scope]` data.
- AC-004: Given there are no goals, when SavingsGoalsManager loads, then it displays an empty state message and an option to add a goal.
- AC-005: Given a valid goal form submission, when the user saves, then the goal list refreshes and the new goal appears.
- AC-006: Given a goal with `current_amount < target_amount`, when the user opens AddContributionModal and submits a valid contribution within the cap, then the UI updates to reflect the new `current_amount`.
- AC-007: Given the user requests deletion, when they confirm, then the goal is removed from the list after a successful API response.
- AC-008: Given network/API errors, when requests fail, then an error banner appears with a retry mechanism (for analytics) or error message (for goals).
- AC-009: Given a goal has `target_amount = 0` or missing values, when progress is computed, then the result is `0%` and no division error occurs.
- AC-010: Given a goal has a past `target_date`, when rendered, then it shows "Overdue" in red; otherwise, it shows days remaining.

## 6. Test Automation Strategy

- Test Levels: Unit, Integration (client), and smoke E2E.
- Frameworks: Jest and React Testing Library for client components; mock axios.
- Unit Tests:
  - SavingsRateTracker: period calculation, scoped extraction, chart data transform, rendering states (loading/error/empty/data), target line presence.
  - SavingsGoalsManager: scoped goals extraction, add goal submission, delete with confirm, progress and remaining calculations, overdue display logic.
- Integration Tests:
  - Savings page: time horizon select drives SavingsRateTracker fetch and render; combined presence of goals section.
  - Contribution flow: open modal, simulate success callback, verify UI refresh via refetch or state update.
- Test Data Management: Use deterministic fixtures with monthlyData, goals (with/without target dates), and summary.
- CI/CD Integration: Include client tests in CI (e.g., `cd client && npm test` with CI=true). Fail builds when tests fail.
- Coverage Requirements: 80% line coverage for components in scope.
- Performance Testing: Ensure chart renders smoothly with up to 36 months of data; verify no blocking operations on main thread.

## 7. Rationale & Context

- The savings rate chart and stat cards provide at-a-glance financial health indicators.
- Scope-aware extraction functions allow backward compatibility with unscoped payloads.
- Contribution cap prevents overfunding a goal client-side and improves UX; server must still enforce.
- Empty, loading, and error states improve resilience and clarity for the user.

## 8. Dependencies & External Integrations

### External Systems
- EXT-001: Express API - serves analytics and savings goals endpoints.

### Third-Party Services
- SVC-001: None (local APIs only).

### Infrastructure Dependencies
- INF-001: Client build system and Recharts for charting; shadcn UI components.

### Data Dependencies
- DAT-001: Analytics data for savings analysis; savings goals data per authenticated user/context.

### Technology Platform Dependencies
- PLT-001: React 18+, Recharts, axios; modern browser with ES2019+.

### Compliance Dependencies
- COM-001: None identified.

Note: This section abstracts from specific package versions; the focus is on required capabilities.

## 9. Examples & Edge Cases

```code
// Example 1: Scoped analytics payload
{
  "scopes": {
    "shared": {
      "monthlyData": [ { "month": "2025-07", "savingsRate": 20 } ],
      "savingsGoals": [ { "id": 1, "goal_name": "Emergency Fund", "target_amount": 6000, "current_amount": 1200 } ],
      "summary": { "totalSavings": 1200, "averageSavingsRate": 20, "savingsRateTrend": 2.5 }
    }
  }
}

// Example 2: Unscoped analytics payload
{
  "monthlyData": [ { "month": "2025-07", "savingsRate": 18.4 } ],
  "savingsGoals": [],
  "summary": { "totalSavings": 900, "averageSavingsRate": 18.4, "savingsRateTrend": -1.2 }
}

// Example 3: Goals list formats
[{ "id": 1, "goal_name": "Trip", "target_amount": 2000, "current_amount": 500 }]
// or
{ "goals": [ { "id": 1, "goal_name": "Trip", "target_amount": 2000, "current_amount": 500 } ] }
// or scoped as in Example 1 under scopes.shared.goals

// Edge: target_amount = 0
progress = 0

// Edge: overdue date
new Date(goal.target_date) <= new Date() => show "Overdue"
```

## 10. Validation Criteria

- The components compile without type/syntax errors and render in isolation with mocked data.
- All acceptance criteria AC-001 to AC-010 are covered by automated tests and pass.
- API calls include `scope` query when available and correctly parse scoped payloads.
- Progress bars never exceed 100% and handle zero/undefined target amounts.
- Contribution modal sets `capAmount` to `max(0, target - current)` and `enforceCap = true`.

## 11. Related Specifications / Further Reading

- AGENTS.md (Repository Guidelines and API Endpoint Overview)
- docs/savings_rate_tracker_shadcn_migration_prompt.md
- docs/spending_patterns_chart_specification.md
- docs/ModernEnhancedDashboard.v2.spec.md