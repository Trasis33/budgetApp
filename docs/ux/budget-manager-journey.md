# User Journey — Budget Manager (CouplesFlow)

Status: Draft v0.1 (based on CouplesFlow spec + current client-v2 patterns)

## Persona
- Who: Couple partners (2-user system)
- Primary goal: agree on budgets, track progress, and prevent month-end surprise
- Context: mostly desktop (planning + review), occasional mobile check-ins
- Success metric: both partners can answer “are we okay?” quickly and settle without conflict

## Journey Stages

### Stage 1 — Trigger / Awareness
What user is doing:
- Opens app after payday or after a few days of spending

What user is thinking:
- “Did we set budgets for this month?” / “Are we overspending anywhere?”

What user is feeling:
- Slight uncertainty; wants reassurance

Pain points:
- Budgets feel like admin; unclear whether budgets are “shared agreement” or “one person decided”
- Not sure if looking at shared vs personal numbers

Opportunities:
- Single top-level “Month health” snapshot that clearly labels scope (Our / My / Partner)
- A visible “Agreement status” for shared budgets (e.g., Approved by both / Needs partner review)

---

### Stage 2 — Orientation / Context Setting
What user is doing:
- Confirms month/year
- Confirms scope (Our / My / Partner)

What user is thinking:
- “Show me the month we’re actually living in.”
- “These numbers should match our shared reality.”

What user is feeling:
- Calm if UI is explicit; frustrated if scope is hidden

Pain points:
- Scope feels global; reviewer can forget which view they’re in
- Desktop users want fast switching without modal friction

Opportunities:
- Desktop-first toolbar: month/year + scope pills always visible
- Partner context: names/avatars near the scope control

---

### Stage 3 — Glance / Health Check
What user is doing:
- Checks overall budget progress
- Scans “at-risk” categories

What user is thinking:
- “Are we on track?”
- “What’s the one thing to watch this week?”

What user is feeling:
- Reassured if “on track”; anxious if over budget without explanation

Pain points:
- Over-budget status without a clear path to “why”
- Hard to attribute overspend (shared vs personal, whose expenses)

Opportunities:
- “At Risk” section: 1–3 categories closest to limit
- Per-category mini insight: biggest drivers + quick link to transactions
- Side-by-side partner impact for shared scope (paid vs share, or “your spend vs partner spend”)

---

### Stage 4 — Decide / Adjust Budgets (Finance Keeper)
What user is doing:
- Adds a new budget
- Edits an existing budget
- Potentially proposes a shared change

What user is thinking:
- “If we raise this budget, are we just hiding the problem?”
- “Will my partner agree?”

What user is feeling:
- Wants control without conflict

Pain points:
- Budget editing feels risky/opaque
- Reviewer may not understand why a limit changed

Opportunities:
- Edit flow shows recent trend + suggested range (based on recent spending)
- Change attribution (“Changed by Emma”) and a lightweight change note (optional)

---

### Stage 5 — Drilldown / Explain Variance
What user is doing:
- Opens a category detail
- Reviews transactions and split types

What user is thinking:
- “What caused this?”
- “Was this personal, shared 50/50, or custom?”

What user is feeling:
- Curious; possibly defensive if partner attribution is unclear

Pain points:
- Hard to filter by split type or payer
- No clear connection from category overage → top transactions

Opportunities:
- Category detail filters: payer, split type, recurring, date range
- “Explain this overage” summary: top 3 expenses + recurring flags

---

### Stage 6 — Outcome / Next Actions
What user is doing:
- Sets alerts
- Shares “settlement snapshot” / navigates to settlement screen
- Leaves feeling informed

What user is thinking:
- “Okay, we’re fine” or “We need to slow down on X.”

What user is feeling:
- Relief / confidence

Success indicators:
- Clear remaining amounts
- Agreement status understood
- Next action obvious (add expense, adjust budget, view settlement)
