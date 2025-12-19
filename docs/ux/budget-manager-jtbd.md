# Budget Manager (CouplesFlow) — Jobs-to-be-Done (JTBD)

Status: Draft v0.1 (assumptions noted)

## Confirmed Inputs
- Primary usage: mostly desktop
- Primary user pattern: one “finance keeper” + one reviewer
- Privacy default: everything visible by default
- Shared budget approvals: not required
- Scope behavior: remember last scope; scope selector visible
- Notifications: in-app only (for now)

## Personas (working set)

### Persona A — “Finance Keeper” (Primary)
- Who: Partner who sets budgets and keeps the system tidy
- Skill: comfortable with apps/spreadsheets
- Primary goal: keep the month predictable and reduce surprises
- Pain: too many steps to set/adjust budgets; unclear where overspending comes from

### Persona B — “Reviewer” (Secondary)
- Who: Partner who checks status and fairness, and occasionally logs
- Skill: moderate; wants simple answers
- Primary goal: see remaining allowance and whether spending is fair
- Pain: budgeting feels like admin; wants clear “what’s left” and “who owes whom”

## Job Statements

### Core Job — Shared financial clarity
When we’re managing our month together, I want to quickly see whether we’re on track (and who’s driving changes), so we can avoid surprises and keep spending fair.

### Job 1 — Set shared expectations
When we start a new month (or negotiate a change), I want to agree on shared category limits with my partner, so we both know what “normal” looks like.

### Job 2 — Stay in control day-to-day
When I’m about to spend, I want to know how much is left in the relevant category (for me and for us), so I can make a confident decision in seconds.

### Job 3 — Recover from drift
When we’re trending over budget, I want to see the fastest levers (which categories, which transactions, which partner share), so we can course-correct without blame.

### Job 4 — Reduce conflict via settlement transparency
When the month progresses, I want a clear “who owes whom” snapshot tied to shared spending, so settling up is predictable and emotionally neutral.

## Current Solutions & Pain Points (assumptions)
- Current: one or both partners use a spreadsheet (or ad hoc notes) + occasional month-end settlement math
- Pain: duplicate entry, unclear split rules, no quick answer for “are we okay?”
- Consequence: friction, delayed logging, and surprise overspending

## Outcomes / Success Metrics
- Budget check time: <10 seconds to answer “how much left?”
- Budget setup time: <3 minutes to set 5 common categories
- Agreement workflow: partner can approve in <30 seconds
- Reduced disputes: fewer “why is this category over?” questions due to transaction drilldown

## Product Principles (for this page)
1. Partner visibility by default: show both partners’ impact side-by-side for shared budgets.
2. Split-first: budget + spending should respect scope (ours/mine/partner) and split types.
3. Clarity over cleverness: plain-language status (“On track”, “Near limit”, “Over”).
4. Two speeds: fast glance mode + deep drilldown when needed.
5. Collaborative control: shared changes are reviewable and attributable.
