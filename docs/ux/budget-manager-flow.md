# Budget Manager — Flow Specification (Figma-ready)

Status: Draft v0.1

## Scope
Design a couples-first Budget Manager page that:
- Supports the 2-user model and partner visibility
- Makes shared vs personal context explicit
- Surfaces month health + at-risk categories + settlement context
- Supports budget add/edit with suggestions and alert preferences
- Prepares for “shared budget agreement” workflows (future feature), without blocking current functionality

## Entry Points
- Navigation: Dashboard → “Budgets” / “Budget Manager”
- Deep links:
  - From an over-budget warning → Budget Manager filtered to a category
  - From settlement card → Budget Manager (shared scope) with “Settlement” strip

## Information Architecture (IA)
1. Header (always visible above the fold)
   - Title: “Budget Manager”
   - Month/Year selector (mobile-friendly)
  - Scope selector pill (Our / My / Partner) — remembers last used scope
   - Couple indicator: partner connected + names/avatars
   - Primary actions: Add Budget, Smart Wizard, Export

2. Month Health (summary)
   - Cards: Total Budget, Total Spent, Remaining, Status
   - For shared scope: include “Settlement preview” micro-card (who owes whom + amount)

3. At-Risk Categories (prioritized)
   - Top 1–3 categories closest to limit
   - Each item shows: category, spent/budget, progress, quick drilldown

4. Category Budgets (full list)
   - Sort modes: At risk / Alphabetical / Highest spend
   - Row content:
     - Category icon + name
     - Spent of budget + progress bar + status badge
     - Quick actions: edit, delete, view transactions
     - Shared scope add-on: “Your impact / Partner impact” (compact)

5. Settings & Alerts
  - Alert toggles: at 80%, on exceed
  - Delivery: in-app only (for now)

## Key Screens

### Screen A — Budget Manager (Overview)

**Header**
- Left: Back (if entered from a sub-flow), otherwise omit
- Center/Top: Title + month/year
- Right: Actions

**Context strip (high clarity)**
- Scope pill: “Our Budget” (remember state)
- Partner connected indicator
- Microcopy: “Shared numbers include split rules”

**Month Health cards**
- Card 1: Total budget (kr)
- Card 2: Total spent (kr)
- Card 3: Remaining (kr or %)
- Card 4: Status (“On track”, “Near limit”, “Over budget”)

**Settlement strip (shared scope only)**
- Example: “Settlement this month: Fredrik owes Emma kr585”
- CTA: “View settlement”

**At-Risk list**
- 1–3 items with quick “See transactions”

**Budgets table/list**
- Optimized for mobile: card rows, large tap targets

---

### Screen B — Category Detail (Drawer or dedicated page)

Goal: explain variance fast, with neutral language.

Content:
- Category summary: budget, spent, remaining, status
- Breakdown (shared scope):
  - Paid by you vs partner
  - Share owed by you vs partner (if available)
- Drivers:
  - Top 3 transactions by amount
  - Recurring flagged
- Filters:
  - Payer: You / Partner
  - Split type: 50/50 / custom / personal / bill
  - Recurring only toggle

Actions:
- Edit budget
- Add expense in this category

---

### Screen C — Add / Edit Budget (Modal)

Current behavior (already implemented):
- Select category
- Enter monthly amount
- Quick suggestions based on recent spending
- Alerts: 80% + exceed

Enhancements for redesign:
- Add a “Scope” selector in the modal when relevant:
  - Our / My / Partner (partner scope disabled if not connected)
- Add “Why?” helper copy: “Shared budgets help you agree on expectations.”

Shared changes (confirmed):
- No partner approval required
- Still show attribution ("Changed by …") in a lightweight, non-blocking way

---

### Screen D — Change History (Optional / Future)

Lightweight audit trail for shared budgets:
- Item: category, old → new amount, changed by, timestamp
- Optional note (why)

## States & Edge Cases

### Partner not connected
- Hide Partner scope
- Replace settlement strip with connect CTA
- Shared scope still works for “ours” if app supports it, but show disclaimer: “Connect partner to enable split and settlement.”

### No budgets yet
- Empty state focused on action:
  - “Ready to set your first budget?”
  - CTA: “Create my first budget”
  - Secondary: “Use Smart Wizard”

### No expenses yet (this month)
- Show budgets but explain that progress will appear once expenses are logged
- CTA: “Add expense”

### Over budget
- Status becomes prominent
- Default sort switches to “At risk”
- Top of page shows “Most over” category with drilldown CTA

## Microcopy Guidelines (tone)
- Neutral, collaborative, non-judgmental
- Prefer “we/our” in shared scope; “you” in personal scope
- Use explicit “who owes whom” phrasing on settlement preview

## Accessibility Requirements

### Keyboard
- All interactive elements reachable via Tab
- Logical order: header → scope/month → cards → at-risk → budgets list → footer
- Escape closes modals/drawers

### Screen reader
- Scope changes announced (aria-live polite)
- Budget status conveyed with text (not color only)
- Progress bars expose value via aria-valuenow/aria-valuemax

### Visual
- Contrast ≥ 4.5:1 for text
- Tap targets ≥ 44px height on mobile
- Do not rely on color alone for “over budget” states (include badge text + icon)

## Open Questions (needs your input)
1. For shared budgets, do you want contribution limits per partner (from spec), or only a single shared cap in v1?
2. Should the “Settlement preview” appear on Budget Manager in all scopes, or only in shared scope?
