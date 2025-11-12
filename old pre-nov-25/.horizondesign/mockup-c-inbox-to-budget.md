# Mockup C — Inbox‑to‑Budget

Summary:
A decisive, productivity-oriented system modeled after “inbox zero.” Every financial event lands in an Inbox (transactions, imports, approvals, nudges). Users triage items into Budgets, Goals, or Settlements. Visual tone is crisp and utilitarian: high contrast, neutral surfaces, accent color for state. No glass. Mobile-first with strong keyboard support on tablet.

Information Architecture & Navigation:
- Primary navigation (bottom):
  - Inbox
  - Budget
  - Add (+)
  - Analytics
  - Profile
- Global scope switcher (top left): Mine | Ours | Partner
- Secondary:
  - Recurring
  - Categories
  - Goals & Debt
  - Settlements
  - Data Import
  - Notifications
- Tablet: dual-pane layout—Inbox list on left, detail/compose on right. Budget and Analytics gain persistent filters in a left rail.

Key Screens & Annotations:
1) Onboarding & Partner Linking
- Minimal steps: choose scope defaults → currency → invite partner → review sharing presets.
- “What’s shared vs private” preview shows example transactions with visibility badges.
- Edge states: pending partner acceptance, resend invite, revoke link.

2) Inbox (Home)
- Sections: Needs Review (new transactions/imports), Approvals, Nudges, Errors.
- Each item shows type, amount, category guess, split guess, and confidence. Actions: Accept, Edit, Comment, Assign to Category, Propose Split.
- Batch select with bulk action bar: “Apply category,” “Mark private,” “Request approval,” “Add to settlement.”
- Realtime banner when partner acts; resolved items move to “Done” with undo.

3) Budget (Monthly Planning)
- Month header with rollover toggle and forecast badge.
- Category list with allocation bars, overspend flags, and suggested adjustments based on Inbox trends.
- Edit allocation opens compact editor; if category is shared, change triggers approval request with comment.
- “What changed” diff appears inline (before/after amounts).

4) Add Expense (Compose)
- Command-style composer: start typing amount → category chips appear → split presets → date → notes → receipt attach.
- Support for multi-currency; show converted SEK with source currency.
- Success drops a “Saved” toast and inserts item into Inbox → Done.

5) Transaction List
- Powerful filters: search, scope, category, split type, source (manual/bank/CSV).
- Row shows split, payer, visibility, and sync status; long-press for quick edit.
- Batch move to settlement or export.

6) Categories & Allocations
- Table-style list for speed on tablet; grid on phone with quick-edit.
- Custom categories with color/icon; toggle visibility and rollover rules.

7) Bill Splitting & Settlements
- Settlement workspace: pick items to settle; app suggests equalization amount/method.
- “Request to settle” posts approval card to partner with method buttons (Swish/Bank).
- Settlement receipts stored and visible in activity timeline.

8) Savings Goals & Debt
- Goals board with kanban-like columns: Planning → Funding → On Track → At Risk.
- Move cards to change phase; goal details show transfers history and projected completion.
- Debt module provides payoff strategy with next-step item injected into Inbox monthly.

9) Recurring
- Definition list with next due date; changes to shared items require approval.
- Pause/skip with reason; reasons inform analytics nudges.

10) Analytics
- High legibility, low ornamentation charts: spend by category, income vs expense, savings rate, burn-down.
- Scopes toggle and compare overlay; export CSV/PDF.

11) Notifications & Profile
- Notification rules per event type; quiet hours.
- Privacy center with explicit matrix: data type × audience (Me/Partner/Ours).

Visual System:
- Color: neutral canvas #FFFFFF / #F5F7FA, text #0B1320, accent blue #1463FF, success #169B62, warning #F0A500, danger #D7263D, info #4A4E69.
- Typography: Inter/Roboto with numerical tabular lining; sizes: 16 body, 14 secondary, 24–28 for KPIs.
- Iconography: simple stroked icons; colored state dots for visibility and sync.
- Components: list rows with left status dot, compact chips for category/scope, pill toggles, banners for sync/approval.

Interaction Patterns & Motion:
- Inbox triage: swipe right Accept, swipe left Edit; long-press enters multi-select.
- Composer supports slash commands: “/private”, “/ours”, “/split 70”.
- Motion is minimal and purposeful: 150ms fades, 100ms list reorders; batch actions slide up bar.
- Optimistic updates with reversible Undo for 5 seconds.

Accessibility:
- Contrast: body 7:1, secondary 4.5:1; state color always paired with icon+label.
- Targets ≥ 44px; bulk action bar pinned within reach.
- VoiceOver: Inbox items expose actions (Accept, Edit, Comment) via actions rotor; scope switcher is a segmented control with aria-selected.
- Haptics: light impact on Accept/Edit; success notification on approvals.

States & Offline Handling:
- Empty: Inbox shows “Connect bank or import CSV” with sample previews and single-tap connect.
- Loading: skeleton rows; deterministic progress for imports.
- Error: banner atop Inbox with “Open in Errors” link—errors are actionable cards.
- Overspent/Under: Budget flags categories; “Fix with rule” creates recurring rule from Inbox suggestion.
- Pending approval: Approval items pinned to Inbox with countdown if time-bound.
- Offline: yellow banner; triaged actions queue locally and show clock icons; conflict resolution dialog when back online (choose mine/partner/merge).

Collaboration Flows:
- Any shared budget change becomes an Approval item with diff and comments thread.
- Large purchase proposals created via composer “/propose”; partner sees context (category impact, budget delta, upcoming bills).
- Activity feed accessible from Profile and Inbox item detail; shows chronological changes with scope tags.
- Comment threads allow emoji reactions and attachments; mentions notify partner.

Notification Strategy:
- Real-time updates for approvals and mentions; batched import results; daily digest for nudges.
- Respect quiet hours; emergency override only for settlement deadlines if enabled.

Rationale:
- Inbox-first lowers friction by turning financial management into quick triage.
- Clear separation of triage (Inbox) vs planning (Budget) aligns mental models and reduces context switching.
- Explicit privacy and scope affordances build trust; approvals make joint decisions transparent.
- Batch operations and command-style composer make entry faster than a spreadsheet, meeting PRD objectives.

Production Considerations:
- Aligns with PRD stack (React/Tailwind/Chart.js). Inbox list uses virtualized list; optimistic updates with server reconciliation. All scopes and approvals map to existing MVP features and planned enhancements.