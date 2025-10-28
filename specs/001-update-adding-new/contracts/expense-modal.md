# Contract: Expense Creation Modal Interaction

## Overview
The modal uses existing endpoint:
POST /api/expenses (Private)

No new routes introduced. Client performs optional secondary fetch for budget remaining (existing summary/budget endpoints not altered).

## Request (POST /api/expenses)
```
Content-Type: application/json
{
  "date": "YYYY-MM-DD" | optional,
  "amount": number (2 decimals),
  "category_id": number,
  "paid_by_user_id": number,
  "split_type": "50/50" | "custom" | "personal-user1" | "personal-user2",
  "split_ratio_user1": number | null,
  "split_ratio_user2": number | null,
  "description": string (UI ≤140 chars)
}
```

Rules:
- If date omitted → server sets first day of current month.
- If split_type != 'custom' → ratios SHOULD be null.
- Amount > 0 enforced client-side; server trusts non-zero presence.

## Response 200
```
{
  "id": number,
  "date": "YYYY-MM-DD",
  "amount": "123.45",
  "category_id": number,
  "paid_by_user_id": number,
  "split_type": string,
  "split_ratio_user1": "50.00" | null,
  "split_ratio_user2": "50.00" | null,
  "description": string,
  "category_name": string,
  "category_icon": string | null,
  "paid_by_name": string,
  "created_at": "ISO",
  "updated_at": "ISO"
}
```

## Error Responses
- 400 { message: 'Please provide amount, category and payer' }
- 401 Unauthorized (auth middleware)
- 500 Server Error

## Client Handling
1. Generate tempId.
2. Optimistically unshift expense draft with status=TEMP.
3. On success: replace temp by server record.
4. On 400/401/500: remove temp, show inline error, focus first invalid field.

## Analytics Mapping
| Event | Trigger | Payload Additions |
|-------|---------|-------------------|
| expense_create_open | Modal first render | { contextFilterMonth } |
| expense_create_validation_error | Field validation fail | { field, error_code } |
| expense_create_submit_start | Submit click | { temp_id } |
| expense_create_submit_success | Server 200 | { id, latency_ms } |
| expense_create_submit_error | Non-200 | { error_code, latency_ms } |
| expense_create_cancel_discard | User discard dirty | { dirty:true } |
| expense_create_save_add_another | Save & Add Another success | { sequence_count }

## Non-Goals
- No partial autosave.
- No offline queue.
- No recurring template creation.
