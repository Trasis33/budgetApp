# Mockup B — Cards & Stacks

Summary:
Playful yet professional card-first system using stacked cards and bottom sheets. Navigation relies on a bottom bar and a central “Stack” screen that aggregates actions (approvals, nudges, imports). Visual language: solid surfaces, soft color accents, rounded 12px corners, subtle shadows, no glass. Emphasis on quick capture and review.

Information Architecture & Navigation:
- Bottom nav:
  - Home
  - Stack (approvals/inbox/nudges/imports)
  - Add (center FAB)
  - Budgets
  - Transactions
- Top scope chips: Mine | Ours | Partner (persist across tabs)
- Secondary:
  - Recurring
  - Goals & Debt
  - Categories
  - Insights
  - Settings
- Tablet: left nav rail; “Stack” remains docked on right as an overlay panel.

Key Screens & Annotations:
1) Onboarding & Partner Link
- Card carousel: value prop → scopes explanation → link partner (code/QR) → default categories → privacy controls.
- Inline preview of data sharing toggles with sample rows.
- States: pending partner join card pinned to Stack.

2) Home (Shared)
- Hero card with month summary: Budget remaining, Split status, Savings progress.
- Quick Actions row: Add expense, Scan receipt, Link bank, Import CSV.
- “This Week” cards stack: upcoming bills, recent transactions, nudges (e.g., “You’re 80% of Dining”).
- Activity mini-feed card with avatars and diffs.

3) Budgets
- Category cards with progress bars, rollover badges, and tap to drill.
- Edit mode: multi-select with “bulk increase/decrease” control.
- Changing shared category prompts a Request card placed in the Stack for partner approval.

4) Add Expense (Bottom Sheet)
- Full-height sheet with numeric keypad at bottom; fields: Amount → Category → Paid by → Split → Date → Notes → Attach.
- Split presets: 50/50, Custom slider, Personal (mine/partner).
- Success state returns to Home and drops a “success chip” that fades after 2 seconds.

5) Transactions
- List with floating filters (scope, category, amount range).
- Swipe actions per row: Edit, Change split, Mark for settlement, Comment.
- Bulk select for settlement suggestion generation.

6) Categories & Allocations
- Grid of pill cards with icon and color; tap to open details: allocation, rollover, visibility, past 3-month trend sparkline.

7) Bill Splitting
- Two-column compare card: what each person paid in bills; “rebalance” recommendation below with methods.
- “Apply and notify” sends approval to partner via Stack.

8) Savings Goals & Debt
- Horizontal goal card carousel; each card shows target/remaining/date.
- Debt card provides “snowball/avalanche” toggle with immediate projections.

9) Recurring
- List grouped by due date; switches to pause/skip next, or request amount change if shared.

10) Insights
- Three card charts: spend by category, burn down, savings rate. Tap to expand to modal with details.
- Export actions in overflow menu.

11) Stack (Approvals, Nudges, Imports)
- Unified inbox: Approval cards (budget changes, large purchase proposals), Nudges, Import jobs (CSV/bank), Errors.
- Approval card contains context diff, comments, and Approve/Decline/Request edit.
- Activity is mirrored to Home feed after resolution.

Visual System:
- Color: primary #4C6FFF, secondary teal #0FA3B1, success #2DBE7E, warning #FFB95A, danger #E3525C; neutrals balanced on #0E1116 text and #F6F8FB background.
- Type: system font stacks with strong numeric tabular lining for amounts; display 24–32 for KPI, body 16.
- Icons: rounded-rect filled glyphs for categories; outline system for actions.
- Components: stacked cards (offset 4–6px), bottom sheets with grab handle, pill chips for scope/state.

Interactions & Motion:
- Cards enter with slight upward translate and fade (150ms).
- Add FAB morphs to bottom sheet; fields auto-advance; keypad “Done” triggers save.
- Stack uses spring expand/collapse; approvals animate to “resolved” state and move to Activity.

Accessibility:
- Contrast ≥ 4.5:1 for text; do not rely on color alone—state icons + labels.
- 48px targets for primary actions; 44px minimum everywhere else.
- VoiceOver order: scope chips → primary heading → KPIs → quick actions → stack; each card has role=group with labeledby.
- Haptics: notification feedback for approval outcomes; success impact for saved expense.

States & Offline:
- Empty: friendly illustration placeholders but text-first guidance with quick actions.
- Loading: card skeletons with shimmer.
- Error: inline card banners with “Retry” and log link in Stack.
- Overspent/Under: category cards display red/green bars, budget nudge chips on Home.
- Pending approval: badge on cards; Stack shows count.
- Offline: banner and queued actions in Stack; each queued item shows clock icon and “Tap to retry”.

Collaboration Flows:
- All joint actions materialize as Approval cards in Stack; support comment threads and @mention partner.
- Large purchase proposal: add item via “Propose” in Add sheet; includes photos, split, and budget impact.
- Settlements: generate suggestion → place in Stack for dual confirm → post-resolution note.

Notification Strategy:
- Push for approvals and large proposals; quiet for nudges (digest once daily).
- Sticky in-app badge on Stack when outstanding items exist.

Rationale:
- Central Stack reduces context switching—one place to approve, fix imports, act on nudges.
- Card-first layout makes financial elements concrete and easy to act upon.
- Strong quick capture and bottom sheets make data entry faster than Numbers, satisfying PRD goals.