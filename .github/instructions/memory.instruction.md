---
applyTo: '**'
---

# User Memory

## User Preferences
- Programming languages: JavaScript/React (CRA/Vite-like structure)
- Code style preferences: Componentized UI, semantic HTML, accessible forms, utility CSS from `design-system.css`
- Development environment: VS Code (Insiders), macOS, zsh; Tailwind present but prefers custom design system tokens
- Communication style: Concise, outcome-focused, minimal extraneous commentary

## Project Context
- Current project type: Couples finance web app (budget/expenses)
- Tech stack: React (client), Node/Express (server), custom design system CSS, partial Tailwind classes
- Architecture patterns: Pages under `client/src/pages`, reusable UI under `client/src/components/ui`
- Key requirements: Usability, clarity, responsiveness, visual hierarchy; avoid shadcn for this task and expand `design-system.css`

## Coding Patterns
- Preferred patterns and practices: Card-based section separation, toolbar header actions, grids for forms, semantic tables
- Code organization preferences: UI primitives in `components/ui`, page-level containers in `pages`
- Testing approaches: Manual verification; limited automated tests in client; server has some tests
- Documentation style: Brief rationale sections; inline comments by section

## Context7 Research History
- Libraries researched: MDN Web Docs (forms/ARIA), WAI-ARIA Authoring Practices
- Best practices discovered: Use native `<form>`, `<fieldset>`, `<legend>`, `<label for>`; provide accessible names/landmarks; avoid redundant ARIA; semantic tables with caption/scope
- Implementation patterns used: `role="search"` for filter form; `sr-only` for captions/legends; radio group for split type; aria-live for filter state; section separation with cards
- Version-specific findings: N/A (standards-based guidance)

## Conversation History
- Important decisions made: Do not use shadcn/ui for this page; rely on and extend `design-system.css`; restructure Expenses page for clarity and accessibility
- Recurring questions or topics: Visual hierarchy and separation; responsive form layout
- Solutions that worked well: Card-wrapped sections with larger inter-card spacing; grid-based form layout; toolbar actions; readable tables
- Things to avoid or that didn't work: Jumbled form alignment; unlabeled inputs; insufficient section separation

## Notes
- New utilities added to `design-system.css`: `.sr-only`, `.form-grid`, `.filters-grid`, `.form-row`, `.form-field`, `.label-inline`, `.form-actions`
- Files touched: `client/src/pages/Expenses.js`, `client/src/styles/design-system.css`

## Recent edits (2025-08-16)
- Rewrote `client/src/pages/Expenses.js` for clarity, accessibility, and maintainability.
- Key changes: simplified state, robust fetch with concurrent category fetch, accessible filters (MonthYearNavigator + category), totals and per-category summary, CSV export, straightforward delete handling, and consistent use of `design-system.css` classes.
- Verified no lint/compile errors for the edited file.

## Recent edits (2025-08-17)
- Implemented image-driven changes on Expenses page:
	- Tightened paddings/margins in Filters card header/content.
	- Removed the Total/By category stats section.
	- Added inline "Recurring Bills" management section that lists templates from `/api/recurring-expenses` and a "Generate for month" button that invokes `/api/summary/monthly/:year/:month` to materialize recurring items.
	- Kept recurring badges on rows for clarity.
- Verified via Playwright: logged in with demo creds, navigated to `/expenses`, ensured "By category" is absent, "Recurring Bills" table present with rows, and filters visible.
