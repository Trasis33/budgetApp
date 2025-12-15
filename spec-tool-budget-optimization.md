---
title: AI-powered Budget Optimization Feature
version: 1.0
date_created: 2025-08-17
last_updated: 2025-08-17
owner: Product / Analytics Team
tags: [tool, analytics, ai, optimization, server, client]
---

# Introduction

This specification defines the AI-powered Budget Optimization feature for the BudgetApp. It describes the purpose, scope, requirements, data contracts, APIs, acceptance criteria, testing strategy, rationale, dependencies, examples, and validation criteria. The spec is written to be machine-readable and actionable by developers and generative AIs.

## 1. Purpose & Scope

Purpose
- Provide an AI-driven analysis engine that inspects a user's historical budgets and expenses and produces actionable optimization recommendations (tips), spending pattern analyses, seasonal insights, and budget variance reports.

Scope
- Server-side analysis engine (class: `BudgetOptimizer`) that consumes expense, budget, and savings goal data.
- REST API endpoints to trigger analysis, list active tips, update/dismiss tips, and persist recommendations (routes in `server/routes/optimization.js`).
- Client UI components to present tips and analysis (`BudgetOptimizationTips`, `OptimizationTipCard`, `SpendingPatternsChart`).
- Persistence of generated tips to `budget_optimization_tips` table for retrieval and dismissal.

Intended audience
- Backend and frontend engineers implementing or testing optimization logic.
- Data scientists tuning trend detection algorithms.
- QA engineers writing integration and E2E tests.

Assumptions
- The application uses Node.js/Express with `knex` for DB access and a React client.
- Authentication middleware populates `req.user.id` (as used in the code attachments).
- Expense and budget data are available with monthly granularity for at least the last 12 months.

## 2. Definitions

- Tip: A single optimization recommendation generated for a user (stored in `budget_optimization_tips`).
- Recommendation: Generic term for computed suggestions returned by analysis and used to create Tips.
- Pattern: Spending trend for a category (e.g., increasing, decreasing, stable).
- EnhancedTrend: Richer metric including normalized strength, volatility, confidence and categorical strength labels (e.g., `strong`, `very_strong`).
- Variance: Difference between actual spending and budgeted amount, expressed as absolute and relative values.
- Goal Shortfall: Monthly amount required to meet a savings goal.

## 3. Requirements, Constraints & Guidelines

- **REQ-001**: The system shall provide an endpoint GET `/api/optimization/analyze` that runs the analysis and returns an analysis object containing: `patterns`, `seasonalTrends`, `budgetVariances`, and `recommendations`.
- **REQ-002**: Analysis shall include at minimum 12 months of expense and budget history when available.
- **REQ-003**: The system shall persist generated recommendations into `budget_optimization_tips` and make them retrievable by GET `/api/optimization/tips`.
- **REQ-004**: The system shall allow dismissing a tip via POST `/api/optimization/tips/:id/dismiss` and updating tip attributes via PUT `/api/optimization/tips/:id`.
- **REQ-005**: Only tips where `is_dismissed = 0` and `expires_at` is null or in the future shall be returned from `/api/optimization/tips`.
- **REQ-006**: All optimization APIs must require authentication — user identity must be taken from the authenticated request (e.g., `req.user.id`).
- **REQ-007**: The analysis must be resilient to missing or sparse data and return clear messages or empty structures rather than exceptions.
- **REQ-008**: The analysis engine must calculate confidence scores for recommendations and trends; confidence must be a float between 0 and 1 and stored as `confidence_score` in tips.
- **SEC-001**: The API shall not expose other users' data. All DB queries must filter by the authenticated user or shared group membership rules (for couples features).
- **CON-001**: The server environment uses SQLite (via `knex`) in the repo; queries must be written to support SQLite-compatible SQL functions (e.g., `strftime`, `datetime`).
- **GUD-001**: Recommendations should be human-readable, concise, and include: title, description, optional `impact_amount`, and `confidence_score`.
- **PAT-001**: Follow the existing code pattern: `BudgetOptimizer` class produces analysis; `optimization.js` stores recommendations and returns analysis.

## 4. Interfaces & Data Contracts

Summary: three primary API surfaces — Analyze, Tips list, Tip actions.

API: GET /api/optimization/analyze
- Auth: required (session or Bearer token). Uses `req.user.id`.
- Query params: none.
- Response (200): JSON Object
  - patterns: { [category: string]: PatternObject }
  - seasonalTrends: { [month: "01".."12"]: { factor: number, description?: string } }
  - budgetVariances: Array of BudgetVariance
  - recommendations: Array of Recommendation

PatternObject schema
- trend: "increasing" | "decreasing" | "stable"
- rawTrend: number (slope per-month) - can be positive/negative/zero
- amounts: number[] (ordered oldest->newest)
- enhancedTrend: {
    category: "weak" | "moderate" | "strong" | "very_strong",
    normalizedStrength: number, // percent
    percentageChange: number, // percent from first to last
    monthlyChange: number, // absolute amount per month
    volatility: number, // stddev
    confidence: number, // 0-100 (BudgetOptimizer returns rounded confidence)
    description: string,
    dataPoints: number,
    average: number
  }

BudgetVariance schema
- category: string
- month: "YYYY-MM"
- budget_amount: number
- actual_spent: number
- variance: number (actual_spent - budget_amount)
- variance_pct: number (variance / budget_amount, nullable if budget_amount == 0)

Recommendation schema (server internal and saved to DB as tip)
- type: "reduction" | "reallocation" | "seasonal" | "goal_based" | "other"
- category: string | null
- title: string
- description: string
- impact_amount: number | null
- confidence_score: number (0..1)

API: GET /api/optimization/tips
- Auth: required
- Response (200): Array of TipRow

TipRow (DB row) schema (recommended columns for `budget_optimization_tips`):
- id: integer
- user_id: integer
- tip_type: string
- category: string | null
- title: string
- description: string
- impact_amount: number | null
- confidence_score: number (0..1)
- is_dismissed: 0 | 1
- created_at: ISO timestamp
- expires_at: ISO timestamp | null

Example Tip JSON
{
  "id": 123,
  "user_id": 7,
  "tip_type": "reduction",
  "category": "Dining Out",
  "title": "Reduce dining out by 20%",
  "description": "You've been trending up in 'Dining Out' — limiting meals out to X per month could save ~450 SEK.",
  "impact_amount": 450,
  "confidence_score": 0.78,
  "is_dismissed": 0,
  "created_at": "2025-08-12T10:00:00Z",
  "expires_at": "2025-09-11T10:00:00Z"
}

API: POST /api/optimization/tips/:id/dismiss
- Auth: required
- Path param: id (tip id)
- Body: none
- Response 200: { message: 'Tip dismissed successfully' } or 404 when not found

API: PUT /api/optimization/tips/:id
- Auth: required
- Body: partial TipRow fields permitted (e.g., { is_dismissed: 1 })
- Response 200: { message: 'Tip updated successfully' }

Error modes
- 401: Not authenticated — all endpoints must return 401 if auth middleware fails.
- 404: Tip not found on dismiss/update.
- 500: Internal errors (DB or algorithm exceptions). Errors should include a short, non-sensitive message.

## 5. Acceptance Criteria

- **AC-001**: Given a user with 12 months of expense and budget data, When the client calls GET `/api/optimization/analyze`, Then the API returns an object containing `patterns`, `seasonalTrends`, `budgetVariances`, and `recommendations`, and stores recommendations in `budget_optimization_tips`.

- **AC-002**: Given the user has generated recommendations, When the client calls GET `/api/optimization/tips`, Then only non-dismissed, non-expired tips are returned ordered by `confidence_score` desc and `created_at` desc.

- **AC-003**: Given a valid tip id for the authenticated user, When the client POSTs to `/api/optimization/tips/:id/dismiss`, Then the tip's `is_dismissed` field is set to 1 and subsequent GET `/api/optimization/tips` does not include it.

- **AC-004**: Given sparse or missing historical data, When `/api/optimization/analyze` runs, Then the API returns empty arrays/objects for missing sections and a `summary` field describing data completeness (e.g., months available) instead of throwing.

- **AC-005**: Performance: For typical user data (<= 12 months, <= 5k expense rows), full analysis completes within 5s on a development machine. If analysis is expected to exceed a threshold, it must be possible to run it async and return a 202 that analysis is queued (optional enhancement).

- **AC-006**: Security: All optimization endpoints return 401 for unauthenticated requests and never return data belonging to other users.

## 6. Test Automation Strategy

Test Levels
- Unit: Jest for backend units; test `BudgetOptimizer` methods (calculateTrend, calculateEnhancedTrendStrength, analyzeSpendingPatterns partials) by mocking `knex` queries.
- Integration: Supertest for Express routes to verify `/api/optimization/analyze`, `/api/optimization/tips`, dismiss and update flows using a test SQLite DB seeded with fixture data.
- End-to-End: Playwright (or Cypress) to exercise the React components (`BudgetOptimizationTips`, `OptimizationTipCard`) with network stubbing for API responses and an integration test that triggers analyze -> reads tips -> dismisses a tip.

Test Data Management
- Provide deterministic fixtures for expenses, budgets, and savings goals to test each recommendation type (reduction, reallocation, seasonal, goal_based).
- Use transaction rollback or an ephemeral SQLite file per test to keep DB clean.

CI/CD Integration
- Add tests to GitHub Actions matrix for Node 18+; run unit tests, then integration tests with a test database, then E2E on a headless runner for UI smoke test.

Coverage Requirements
- Minimum 80% coverage for `BudgetOptimizer` logic and 70% for optimization router behaviors.

Performance Testing
- Add a micro-benchmark test that runs `analyzeSpendingPatterns` on a large synthetic dataset (e.g., 50k expense rows) and records runtime; alert if runtime > 30s.

## 7. Rationale & Context

Why this design
- Persisting tips allows the client to show a consistent, dismissible UI and track changes over time.
- Returning both raw `patterns` and human-readable `recommendations` gives flexibility for future UIs and downstream features (e.g., auto-budget suggestions).
- Confidence scoring and enhanced trend metrics help prioritize which tips to show.

Alternatives considered
- Storing only aggregated recommendations in a user preferences object (rejected because per-tip metadata like confidence and expiry are valuable).
- Running analysis entirely client-side (rejected due to data volume, privacy, and business logic centralization).

## 8. Dependencies & External Integrations

External Systems
- **EXT-001**: Database (SQLite in repo, but design should be RDBMS-agnostic) - used to load expenses, budgets, savings goals and to store tips.

Third-Party Services
- **SVC-001**: None required for core functionality. Optional: background job runner (e.g., BullMQ) if analysis should be queued.

Infrastructure Dependencies
- **INF-001**: Node.js environment with sufficient memory to compute trend analysis.

Data Dependencies
- **DAT-001**: Expense rows with { id, user_id, amount, category_id, date, paid_by_user_id }
- **DAT-002**: Budgets with { id, user_id, category_id, year, month, amount }
- **DAT-003**: Savings goals with { id, user_id, target_amount, current_amount, target_date }

Technology Platform Dependencies
- **PLT-001**: Node.js (>= 16) and knex + sqlite3 (or a compatible DB) for server-side code; React (client) for UI.

Compliance Dependencies
- **COM-001**: Follow GDPR-like data minimization when analyzing and persisting suggestions (store minimal personal identifiers and avoid logging full PII).

## 9. Examples & Edge Cases

Example analysis response (trimmed)

{
  "patterns": {
    "Dining Out": {
      "trend": "increasing",
      "rawTrend": 42.3,
      "amounts": [300, 310, 325, 360, 400],
      "enhancedTrend": {
        "category": "strong",
        "normalizedStrength": 8.5,
        "percentageChange": 33.3,
        "monthlyChange": 42,
        "volatility": 35,
        "confidence": 85,
        "description": "Consistent increase in Dining Out",
        "dataPoints": 5,
        "average": 339
      }
    }
  },
  "budgetVariances": [
    { "category": "Groceries", "month": "2025-07", "budget_amount": 3000, "actual_spent": 4200, "variance": 1200, "variance_pct": 0.4 }
  ],
  "recommendations": [
    { "type": "reduction", "category": "Dining Out", "title": "Limit Dining Out", "description": "Reduce visits to restaurants to save approximately 500 SEK/month.", "impact_amount": 500, "confidence_score": 0.85 }
  ]
}

Edge cases
- No expense data at all -> return empty structures + summary: { monthsAvailable: 0 }
- Budget entries with zero `budget_amount` -> variance_pct should be null and documented to avoid division-by-zero errors.
- Couples/shared budgets: ensure `getExpenseHistory` and queries include split/shared expenses per the server code comments (paid_by_user_id logic); tips should only be created for categories that involve the requesting user.
- Concurrent dismiss/update of a tip -> API must return 404 if update had no rows affected; client should refresh tips after dismissing.
- Large datasets -> provide fallback to async/background processing and a queued analysis response (202 Accepted) if runtime likely exceeds threshold (optional enhancement).

## 10. Validation Criteria

- Unit tests passing for `BudgetOptimizer` methods across normal and edge cases.
- Integration tests confirm routes return expected HTTP statuses and payload shapes.
- E2E test confirms the client shows tips, can refresh analysis, and dismiss tips (UI click flows).
- DB table `budget_optimization_tips` contains persisted recommendations after `/analyze`.
- Linting and type checks (if TypeScript is introduced) pass in CI.

## 11. Related Specifications / Further Reading

- `server/routes/optimization.js` (implementation and storage of tips)
- `server/utils/budgetOptimizer.js` (analysis engine)
- `client/src/components/BudgetOptimizationTips.js` and `OptimizationTipCard.js` (UI consumption of tips)
- docs/prd.md - product requirements for analytics and optimization features
- External: Trend analysis best practices (time series smoothing, outlier rejection)


---

Notes and next steps
- Implement DB migration for `budget_optimization_tips` (fields described in Section 4). Include indexes on `user_id`, `created_at`, and `is_dismissed` for query performance.
- Write unit tests for the `calculateEnhancedTrendStrength` edge conditions (average=0, short data series).
- Consider adding async job queue and cache for heavy analyses in high-traffic scenarios.
