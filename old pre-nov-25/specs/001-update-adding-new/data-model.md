# Data Model: Expense Modal Feature

## Entities

### Expense (existing)
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | integer | PK | Assigned by DB |
| date | date (YYYY-MM-DD) | NOT NULL, <= today | Defaults server-side to first of month if omitted |
| amount | decimal(10,2) | > 0 | Client enforces >0; server not negative guard implicitly |
| category_id | integer FK categories.id | required | Dropdown selection |
| paid_by_user_id | integer FK users.id | required | Selected payer |
| split_type | string | default '50/50' | Values: '50/50','custom','personal-user1','personal-user2' (confirm future) |
| split_ratio_user1 | decimal(5,2) | nullable | Required if split_type='custom'; sum ratio1+ratio2=100±0.5 |
| split_ratio_user2 | decimal(5,2) | nullable | Same rule as above |
| description | string | NOT NULL, UI ≤ 140 chars | DB allows longer (string length unspecified) |
| notes | string | nullable | Not exposed in modal (out of scope) |
| recurring_expense_id | integer | nullable | Not set by modal (deferred) |
| created_at / updated_at | timestamp | auto | For secondary sort |

### Category (existing reference)
Fields: id, name, icon.

### User (existing reference)
Fields: id, name, email.

### Split Allocation (derived form state)
Transient client object: { type, ratio_user1, ratio_user2 } validated before submit.

## Validation Rules (Client)
- amount: required, numeric, > 0, format to 2 decimals.
- category_id: required.
- paid_by_user_id: required.
- date: required (UI default today), not future, earliest allowed = first day of currently viewed month (to match expected grouping).
- description: required, length ≤ 140 chars, trim leading/trailing whitespace before length check.
- split_type:
  - '50/50': ratios null.
  - 'custom': ratio_user1 & ratio_user2 required; ratio1+ratio2 within [99.5,100.5].
  - 'personal-user1' / 'personal-user2': treat as 100% assigned to that user, ratios null (server still stores split_type only).

## Derived / Computed
- budgetRemaining(category): fetched async after category selection; not persisted.
- optimisticTempId: generated client UUID before POST; replaced with server id on success.

## State Transitions
Draft → Dirty (first field change) → Submitting → Success (list updated) OR Error (retain dirty state) → (optionally) Reset (on Save & Add Another clearing fields subset).

## Rejected / Deferred Fields
- recurring toggle (deferred)
- notes editing
- multi-user (>2) splits

## Invariants
- Ratios only meaningful when split_type='custom'.
- Description never empty after trim.
- Only one modal instance open at a time.
