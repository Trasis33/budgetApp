# Budget Manager — Figma Handoff Checklist (Desktop-first)

This checklist is meant to be copied into a Figma frame description.

## Screen: Budget Manager (Overview)

### Layout (desktop)
- Max content width: ~1100–1200px centered (or full-width with comfortable gutters)
- Two-level header:
  - Row 1: Page title + actions
  - Row 2 (toolbar): Scope pills + Month/Year picker

### Header
- Title: “Budget Manager”
- Subtitle: `{Month YYYY} • {User & Partner | User} • Partner {connected|not connected}`
- Actions:
  - Primary: Add Budget
  - Secondary: Smart Budget
  - Secondary: Export

### Toolbar
- Scope pills (remember last selection):
  - Our Budget (default)
  - My Budget
  - Partner’s Budget (disabled/hidden if no partner)
- Month/year controls:
  - Prev / Next
  - Month dropdown
  - Year dropdown

### Content blocks
1. Month Health
   - Use existing metric-card visual language
   - Cards: Total budget, Total spent, Remaining, Status

2. At Risk (quick review)
   - Show up to 3 categories with warning/danger
   - Each shows:
     - Category icon + name
     - `Spent of Budget`
     - Progress %
     - Remaining/Over text
   - Empty: “Nothing is close to the limit for this view.”

3. Category Budgets (table)
   - Table/list of all categories with budgets
   - Each row shows:
     - Category
     - Budget
     - Spent
     - Remaining
     - Progress bar + status badge
     - Actions (edit/delete)

## Component Notes (map to existing implementation)
- Scope selector: reuse the existing selector pattern
- Budget list rows: reuse `BudgetTable` patterns
- Currency: always SEK (“kr”), formatted `sv-SE`

## States

### Loading
- Centered loader, copy: “Getting your budget goals ready…”

### Error
- Retry button

### No budgets
- Clear empty state with:
  - CTA: Create my first budget
  - Secondary: Smart Budget

### No expenses yet
- Budgets visible; add small note: “Progress updates as you add expenses.”

## UX Copy Rules
- Shared scope: prefer “we/our” language
- Personal scope: “you” language
- Neutral, non-judgmental tone (“At risk” not “bad”)

## Accessibility
- Scope pills: treat as a radiogroup
- Progress bars: include text + aria values
- Focus states visible for all interactive elements
- Hit targets >= 44px for pill buttons and icon actions
