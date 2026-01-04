# Specification: Savings Goals Tracker

## Overview
A frontend UI for the existing Savings Goals backend API, enabling users to create, track, and manage savings goals with visual progress indicators. The feature integrates with the couples workflow by allowing settlement amounts to be allocated toward shared or personal savings goals.

## Functional Requirements

### FR-1: Navigation & Entry Point
- Add "Savings" as a top-level navigation item in the main sidebar/header
- Route: `/savings`
- Accessible to all authenticated users

### FR-2: Savings Goals List Page
- Display all user's savings goals in a **card grid layout**
- Each goal card displays:
  - Goal name
  - Category (if set)
  - **Dual progress rings:**
    - Ring 1: Amount progress (current_amount / target_amount)
    - Ring 2: Time progress (days elapsed / days until target_date)
  - Current amount / Target amount (formatted as SEK)
  - Target date
  - Pin indicator for pinned goal
- Support for scope switching (Mine/Partner's/Ours) per existing app patterns
- Empty state when no goals exist with CTA to create first goal

### FR-3: Create/Edit Goal Form
- Modal dialog for creating and editing goals
- Fields:
  - Goal name (required)
  - Target amount (required, positive number)
  - Target date (required, future date)
  - Category (optional, dropdown)
- Validation with user-friendly error messages
- Toast notification on success/failure

### FR-4: Goal Detail Page
- Route: `/savings/:goalId`
- Displays:
  - Goal header with name, dual progress rings (larger format)
  - Current/target amounts with percentage
  - Days remaining until target date
  - Pace indicator (on track / behind / ahead)
- **Contribution History:**
  - List of all contributions (date, amount, note)
  - Sorted by date descending
  - Delete contribution option with confirmation
- **Add Contribution Form:**
  - Amount (required)
  - Date (defaults to today, cannot be future)
  - Note (optional)

### FR-5: Inline Quick Add Contribution
- Each goal card has a "+" button
- Opens popover/dropdown for quick contribution entry
- Fields: Amount only (date defaults to today)
- Submits without navigating away from list

### FR-6: Goal Management Actions
- Edit goal (opens modal with pre-filled form)
- Delete goal (confirmation dialog required)
- Pin/Unpin goal (only one goal can be pinned at a time)

### FR-7: BillSplitting Settlement Integration
- After a settlement is marked complete in BillSplitting:
  - Display prompt: "Would you like to allocate this amount to a savings goal?"
  - Show list of active goals to choose from
  - On selection, create contribution for that goal with settlement amount
  - Optional: Skip/dismiss prompt

## Non-Functional Requirements

### NFR-1: Performance
- Goals list should load within 500ms
- Optimistic UI updates for contributions

### NFR-2: Responsive Design
- Mobile-friendly card layout (single column on small screens)
- Touch-friendly contribution buttons

### NFR-3: Accessibility
- ARIA labels on progress rings
- Keyboard navigation for all actions
- Focus management in modals

## Acceptance Criteria

1. User can navigate to Savings from main navigation
2. User can view all their savings goals in a card grid
3. User can create a new goal with name, target amount, and target date
4. User can edit an existing goal
5. User can delete a goal with confirmation
6. User can pin/unpin a goal (only one pinned at a time)
7. User can add contributions via inline quick-add on cards
8. User can view goal detail page with contribution history
9. User can add contributions with date and note from detail page
10. User can delete a contribution from history
11. Dual progress rings accurately reflect amount and time progress
12. After BillSplitting settlement, user is prompted to allocate to a goal
13. Scope switching (Mine/Partner's/Ours) works correctly

## Out of Scope
- Analytics/recommendations integration (future track)
- Automated recurring contributions
- Goal sharing/collaboration features beyond scope switching
- Export/import of goals data
