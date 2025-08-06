# Mockup A — Dual Ledger

Summary:
A calm, ledger-inspired system with clear “Mine • Ours • Partner” scopes at the top. Uses solid surfaces, soft shadows, and strong contrast. Feels trustworthy like a banking app. Navigation is a 5-item bottom bar + top scope tabs. Tablet scales to a 2-column layout with a persistent activity rail.

Information Architecture & Navigation:
- Global scopes (top segmented control): Mine | Ours | Partner
- Bottom nav (mobile):
  - Dashboard
  - Plan (Monthly Budget)
  - Add (+) floating action, context-aware to current scope
  - Transactions
  - Insights
  - Settings (in profile sheet accessible from avatar)
- Secondary:
  - Bills & Recurring
  - Categories
  - Savings & Debt
  - Approvals & Requests
  - Data Import/Export
- Activity Feed/Changelog: per-scope filterable stream
- Tablet: left rail for scopes + activity feed; main panel switches screen content

Key Screens & Annotations:
1) Onboarding / Partner Linking
- Steps: welcome → choose country/currency → invite partner (link or QR) → privacy preferences → category presets → done.
- Notes: visible data scopes preview; example: “Show: my expenses to partner? Yes/No”.
- State examples: loading invite status, pending invite, invite accepted.

2) Shared Dashboard (Ours)
- Top: segmented scope tabs.
- KPIs: Total spending this month, Split difference (who owes), Budget remaining, Savings progress.
- Cards: 
  - Activity Feed (live updates, comments on changes)
  - Upcoming Recurring (toggle to skip/defer)
  - Goals (progress rings)
- States: 
  - Empty (no data yet) exposes quick actions: Add expense, Link bank, Import CSV.
  - Overspent shows red accent and “nudge” card with suggestions.

3) Monthly Budget Planning
- Header: Month selector (swipe), rollover toggle, currency.
- Category list with per-category allocations, goal and trend chips.
- Under/Over indicators; long-press to edit allocation, swipe to split between personal/shared.
- Joint decisions: changing a shared allocation prompts “Request approval from Partner” with comment.

4) Expense Entry
- Steps in one screen with progressive disclosure:
  - Amount (numeric pad), Category, Date, Paid by, Split type (50/50, custom ratio slider, personal), Notes, Attach receipt.
- Microinteractions: keypad haptics, auto-advance on amount entry, category auto-suggest.
- Error states: invalid amount, missing split; show concise inline help.

5) Transaction List
- Sticky filters: scope, category, split type, status.
- Group by day; each row: amount, role (Mine/Partner/Ours badge), split badge, status (Pending approval).
- Bulk actions for settling suggestions.

6) Categories with Allocations
- Grid with icons; tap to open details: allocation, rules, rollover settings, visibility (shared/private).
- Create custom category with icon picker.

7) Bill Splitting
- Selector: monthly bills paid by each person; running total and settlement suggestions.
- Switch to “Include variable expenses” to combine with shared categories.
- Approval flow for settlement.

8) Savings Goals & Debt Tracking
- Goals list with progress rings; tap for details (target, timeline, transfers).
- Debt card with payoff projections and “snowball/avalanche” selector.

9) Recurring Expenses
- Calendar row + list; supports pause/skip, amount change request (approval if shared).

10) Insights & Analytics
- Simple, high-contrast charts: spending by category, burn rate, savings rate.
- Compare Mine/Partner/Ours with toggle; export CSV/PDF.

11) Notifications & Settings
- In-app inbox shows approvals, comments, changes; push toggles by type.
- Privacy controls and data export.

Visual System:
- Color: primary #2A5CFF, success #2EAF5E, warning #FFB020, danger #E5484D, neutral grays 900–50. Backgrounds solid; no glassmorphism.
- Typography: Inter or SF on iOS, Roboto on Android. Sizes: 15–17 body, 28–32 numeric display.
- Iconography: outline set; filled for active states. Consistent stroke weights.
- Components: solid cards with 8px radius; shadows blur 16/opacity 10–12%; bottom sheet with handles; segmented control (mine/ours/partner).

Interactions & Motion:
- Scope segmented control animates content fade/slide 150–200ms.
- Add FAB morphs to full form sheet; numeric keypad snaps in.
- Pull to refresh on lists; optimistic UI for entries with subtle shimmer when syncing.

Accessibility:
- Contrast: 4.5:1 minimum body text, 3:1 for large numbers; state colors paired with icons/labels.
- Touch targets ≥ 44x44; bottom padding for home indicator.
- VoiceOver: semantic headers, “Mine/Ours/Partner” toggles as tabs with selected state; transaction row announces split and status.
- Haptics: light impact on approvals and success.

States & Offline:
- Loading: skeleton rows; charts shimmer.
- Empty: guided starters.
- Error: inline banners with retry; maintain unsynced entries locally.
- Overspent/Under budget: color-coded chips; show suggestions.
- Pending approval: badge and “awaiting partner” hint.
- Offline: banner; queue changes and show clock icon for pending sync.

Collaboration Flows:
- Request budget changes for shared categories; partner gets a card with Approve/Decline/Comment.
- Large purchases: propose split with threshold; discussion thread.
- Settlements: propose method (Swish/Bank); auto-mark when confirmed by both.
- Activity feed shows diffs (“You increased Groceries +500 SEK”); filterable by scope.

Notification Strategy:
- Real-time in-app updates via feed; push only for approvals, settlements, large changes.
- Digest for weekly summaries.

Rationale:
- Clear scopes reduce “who paid/owns what” friction.
- Approvals ensure joint transparency.
- Ledger style fosters trust, aligns with PRD’s calculation and monthly statement needs.