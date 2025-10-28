---
title: Expenses Page Design Specification
version: 1.0
date_created: 2025-08-17
last_updated: 2025-08-17
owner: Product/UI Team
tags: [design, app, expenses, frontend, accessibility]
---

# Introduction

This specification defines the functional, data, and interface requirements for the Expenses page implemented in the client React app (file: `client/src/pages/Expenses.js`). It is written to be precise and machine-parseable for consumption by developer tools and generative AIs.

## 1. Purpose & Scope

Purpose: describe expected behavior, inputs/outputs, data shapes, error modes, and testable acceptance criteria for the Expenses page UI and its interactions with backend endpoints.

Scope:
- The single-page Expenses view (listing, filtering, exporting, recurring templates management).
- Interactions with backend endpoints used by the page: `/expenses`, `/categories`, `/recurring-expenses`, `/summary/monthly/:year/:month`, and `/expenses/:id` (delete).
- Client-side features: filtering by month/year/category, CSV export of visible rows, delete/confirm flow, recurring templates display and generation.

Intended audience: front-end engineers, QA automation engineers, and AI agents producing code/tests for this page.

Assumptions:
- Application uses React and axios for HTTP requests.
- Dates are ISO 8601 strings on the API (e.g., "2025-08-17T00:00:00Z").
- Currency formatting is handled by `formatCurrency` utility.

## 2. Definitions

- Expense: record with at least { id, date, description, amount, category_id, category_name?, recurring_expense_id? }.
- Category: record with at least { id, name }.
- RecurringTemplate: record with at least { id, description, default_amount, category_id, is_active }.
- Filter: client state object { month: string ("01".."12" or ""), year: string (YYYY), category: string|number|"" }.

## 3. Requirements, Constraints & Guidelines

- REQ-001: Load Data — On mount, the page MUST fetch expenses, categories, and recurring templates in parallel.
- REQ-002: Loading/Error states — Show a loading indicator while fetching; display a clear non-technical error message on failure and allow retry by remount or navigation.
- REQ-003: Filtering — Support filtering by month ("01".."12" or empty for all), year (YYYY), and category id; filters MUST be client-side and not require server round-trips.
- REQ-004: Export CSV — Export only currently visible (filtered) rows to CSV. CSV columns: date (YYYY-MM-DD), description, category (string), amount (string/number). Properly escape quotes and newlines.
- REQ-005: Delete — Deleting an expense requires a user confirmation (modal or confirm). On success remove row from UI without refetching all expenses; on failure show clear error.
- REQ-006: Recurring Templates — Display list of recurring templates with count badge. The user MAY toggle visibility. If none, show a friendly hint.
- REQ-007: Generate Recurring — Provide a control to trigger generation for selected month/year by calling `/summary/monthly/:year/:month`; after success refresh expenses list.
- REQ-008: Accessibility — All interactive controls MUST be keyboard reachable, have ARIA labels where appropriate, and live regions for dynamic timeframe text.
- REQ-009: Date handling — Interpret expense.date using the browser's Date constructor. UI must display localized dates; CSV must use UTC-ish YYYY-MM-DD format using toISOString().slice(0,10).
- SEC-001: Confirm destructive action — Delete flow MUST require explicit confirmation.
- CON-001: Month format — When stored in `filters.month`, use a two-digit string '01'..'12' or empty string for all.
- GUD-001: Optimistic UI — The implementation SHOULD optimistically remove items on delete only after server responds successfully.

## 4. Interfaces & Data Contracts

API interactions (request/response shapes):

- GET /expenses
  - Response: 200 OK
  - Body: Array<Expense>

- GET /categories
  - Response: 200 OK
  - Body: Array<Category>

- GET /recurring-expenses
  - Response: 200 OK
  - Body: Array<RecurringTemplate>

- GET /summary/monthly/:year/:month
  - Purpose: trigger recurring generation and return summary
  - Response: 200 OK
  - Body: { generated: boolean, summary?: object }

- DELETE /expenses/:id
  - Response: 200 OK (or 204)
  - Body: optional { success: true }

Data schemas (JSON example shapes):

Expense:
```
{
  "id": 123,
  "date": "2025-08-17T00:00:00Z",
  "description": "Coffee",
  "amount": 3.5,
  "category_id": 12,
  "category_name": "Food",
  "recurring_expense_id": null
}
```

Category:
```
{ "id": 12, "name": "Food" }
```

RecurringTemplate:
```
{
  "id": 9,
  "description": "Monthly subscription",
  "default_amount": 9.99,
  "category_id": 5,
  "is_active": true
}
```

Client contracts (JS types):

- FilterState: { month: string, year: string, category: string }
- FilteredExpenses computed from Expenses[] and FilterState.

## 5. Acceptance Criteria

- AC-001: Given expenses and filters set to 2025-08, When the page loads, Then only expenses with date in August 2025 are shown.
- AC-002: Given no categories, When user opens the category select, Then it contains a single option "All categories" and no crash occurs.
- AC-003: Given multiple expenses visible, When the user clicks Export CSV, Then a CSV file downloads with only visible rows and correctly escaped fields.
- AC-004: Given an expense visible, When the user clicks Delete and confirms, Then the expense is removed from the table and the backend DELETE is called with the right id.
- AC-005: Given recurring templates exist, When user toggles show/hide, Then the list hides or shows without a full page reload.
- AC-006: Given filters set (month/year), When user clicks Generate for month, Then the app calls `/summary/monthly/:year/:month` and refreshes the expenses list afterward.
- AC-007: Accessibility — Page must pass basic axe/core a11y checks for: keyboard focus, visible labels, table semantics (thead/tbody/th scope), and ARIA for toolbar and search region.

## 6. Test Automation Strategy

- Test Levels: Unit, Integration, End-to-End.

- Frameworks (recommended):
  - Unit/Integration: Jest + React Testing Library + MSW (mock server).
  - End-to-End: Playwright or Cypress.

- Unit/Integration tests (examples):
  - Render with mocked GET responses: assert rows count and content.
  - Filtering logic: call setFilters and assert computed filteredExpenses output (pure function or hook-level tests).
  - exportCsv: spy on URL.createObjectURL and assert generated CSV string contains expected header and rows.
  - delete flow: mock DELETE endpoint, simulate confirm by mocking window.confirm to true, assert axios.delete called and row removed.
  - recurring generation: mock GET /summary/monthly/... to return success, assert subsequent GET /expenses is called and UI updates.

- E2E tests:
  - Smoke: load page, wait for rows, click Export and verify a file is created/downloaded (or intercept network and validate response payload).
  - Delete: create test expense, visit page, delete it and assert it no longer appears.

- Test Data Management: use MSW in unit/integration tests; use test fixtures or a sandbox database for e2e.

- CI Integration: run unit tests and a11y checks (axe) on PRs. Run E2E nightly or on release branches.

- Coverage Requirements: aim for >80% coverage on the pages/components touched by this feature; critical logic (filtering, CSV module, delete flow) must be covered.

## 7. Rationale & Context

The page centralizes expense management with emphasis on accessibility, predictable client-side filtering, and safe destructive actions. Server side is authoritative for data; client caches lists and refreshes when generation or explicit actions happen. CSV export uses client-side data to avoid extra server calls and to allow offline export.

## 8. Dependencies & External Integrations

### External Systems
- EXT-001: Backend API - provides expenses, categories, recurring-templates, and summary generation.

### Third-Party Services
- SVC-001: None required for core functionality. Optional: Sentry for error logging, or analytics for actions like export/generate.

### Infrastructure Dependencies
- INF-001: The client needs network access to the API; for e2e tests a test API or MSW sandbox is required.

### Data Dependencies
- DAT-001: Expense dates must be parseable by JS Date. If API sends non-ISO strings, a transform layer is required.

### Technology Platform Dependencies
- PLT-001: React 17+ or 18+, axios or compatible HTTP client.

### Compliance Dependencies
- COM-001: If exporting personal data, ensure export complies with data export/privacy policies in the product.

## 9. Examples & Edge Cases

1) Filtering edge cases:

```
// Expense with missing date => excluded from filtered list
{ id: 1, date: null, description: 'x', amount: 1 }

// Expense with timezone differences
{ id: 2, date: '2025-08-01T23:00:00+01:00' }
```

2) CSV escaping example:

Row: description: 'She said "Hello, world"\nNext line' -> CSV cell should be: "She said ""Hello, world"" Next line"

3) Large datasets: client should be able to filter arrays of several thousand rows; if performance degrades consider pagination or server-side filtering.

4) Concurrent deletions: if DELETE returns 404 for an already-removed item, handle as success (remove from UI) and show a non-blocking message.

## 10. Validation Criteria

- Unit tests: All unit and integration tests pass.
- Lint/Typecheck: No lint or type errors for changed files.
- Accessibility: Page passes automated a11y checks (axe-core) with no critical failures.
- Manual smoke: Load page, exercise filters, export CSV, delete an item, and generate recurring — all operations complete within reasonable time and show correct UI updates.

## 11. Related Specifications / Further Reading

- Link: Expenses list acceptance tests (repo: docs/prs or tests/ directory) — create or update as needed.
- Link: Frontend API contract document (if exists) describing /summary endpoints.

---

Requirements Coverage Summary
- REQ-001 Load Data: Done (covered by fetchAll behavior).
- REQ-002 Loading/Error states: Done (loading and error variables and UI present).
- REQ-003 Filtering: Done (client-side filters implemented; month format specified).
- REQ-004 Export CSV: Done (exportCsv behavior implemented; CSV escaping noted in tests).
- REQ-005 Delete: Done (handleDelete with confirmation implemented).
- REQ-006 Recurring Templates: Done (recurringTemplates list + toggle implemented).
- REQ-007 Generate Recurring: Done (handleGenerateRecurring implemented).
- REQ-008 Accessibility: Partially done (a11y patterns present); requires axe checks in CI to validate.
