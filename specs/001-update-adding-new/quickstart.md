# Quickstart: Expense Creation Modal

## Prerequisites
- Server running on :5001 (npm run dev or npm run dev:server)
- Client running on :3000 (npm run dev or npm run dev:client)
- Authenticated demo users (login as user1@example.com / password123)

## Manual Validation Steps
1. Navigate to Expenses list.
2. Click "Add Expense" → Modal opens; focus in amount field.
3. Enter amount=123.45, select Category=Groceries, Payer=Demo User, description="Groceries test", submit.
4. Observe optimistic insertion (if implemented) then confirmation; item appears with correct category name.
5. Open modal again, change category, enable custom split (60/40), validation blocks if not summing 100.
6. Use Save & Add Another twice; third submit close modal manually; list has 3 new items contiguous.
7. Trigger validation errors: leave amount blank → see inline message.
8. Enter future date (tomorrow) → blocked with message.
9. Start to fill form; press ESC → discard confirmation; cancel; then close again and confirm discard.
10. Network failure simulation: Temporarily stop server before submit; ensure error and retry retains values.

## Expected Analytics Events (Sequence Example)
expense_create_open → expense_create_submit_start → expense_create_submit_success.

## Test Outline (To be implemented)
- Unit: ratio validation util (custom split) returns error if 60/30.
- Component: modal opens & traps focus; closes returns focus to trigger.
- Integration: add expense flow updates list length +1 and new item fields match payload.
- Integration: Save & Add Another maintains category/payer.
- Integration: Discard confirmation appears when dirty & ESC pressed.

## Rollback Plan
- Re-enable navigation to old page (if still present) or feature flag off (if introduced later) by removing modal trigger and routing to legacy form.

## Troubleshooting
- Expense not appearing: Check network tab for POST /api/expenses error.
- Ratios not saving: Ensure split_type='custom' and both ratios provided.
