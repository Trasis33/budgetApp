## Plan: Recurring Expenses in Client‑v2

End goal: client‑v2 should let users turn expenses into recurring bill templates, manage those templates, and generate concrete expenses for a month (e.g. “Generate March bills”), reusing existing server routes and the v2 design system. This plan assumes templates are monthly and generation is triggered via the existing monthly summary endpoint (with an optional future dedicated endpoint).

### Steps

1. **Align Data Models in Types**
   1. In `client-v2/src/types/expenses.ts` (or equivalent), add a `RecurringTemplate` type mirroring the server (`id`, `description`, `default_amount`, `category_id`, `paid_by_user_id`, `split_type`, `split_ratio_user1`, `split_ratio_user2`, `is_active`, timestamps).
   2. Extend the `Expense` type to include `recurring_expense_id?: number | null` so lists can flag instances as recurring and analytics can group by template.
   3. Ensure `split_type` in v2’s shared types includes `'personal' | '50/50' | 'custom' | 'bill'`, with doc comments describing when `split_ratio_*` must be set (e.g. required and sum to 100 for `custom`).

2. **Add Recurring API Service Layer**
   1. Create `client-v2/src/api/services/recurringExpenseService.ts` using the shared axios instance:
      - `getTemplates(): Promise<RecurringTemplate[]>` → `GET /recurring-expenses` (returns all **couple-level** active templates for the authenticated couple).
      - `getTemplate(id): Promise<RecurringTemplate>` → `GET /recurring-expenses/:id`.
      - `createTemplate(payload): Promise<RecurringTemplate>` → `POST /recurring-expenses`.
      - `updateTemplate(id, payload): Promise<RecurringTemplate>` → `PUT /recurring-expenses/:id`.
      - `deactivateTemplate(id): Promise<void>` → `DELETE /recurring-expenses/:id`.
      - `generate(payload: { year: number; month: number }): Promise<{ generatedCount: number; generatedAmount: number; year: number; month: number }>` → `POST /recurring-expenses/generate`.
   2. Keep templates conceptually **couple-first** everywhere in the client:
      - Do not split templates by mine/partner; always present them as “our recurring bills” for the couple scope.
      - When creating a template from an expense, attach the expense’s `paid_by_user_id`, but treat ownership as shared.

3. **Dedicated Monthly Generation Endpoint (Server Contract)**
   1. Implement a backend endpoint:
      - `POST /recurring-expenses/generate` with JSON body `{ year: number; month: number }` (month is 1–12).
      - For the authenticated couple, iterate all active templates and, for that **single monthly period**, insert concrete expenses if none exist yet (one per template, per {year, month}).
      - Enforce idempotence via a uniqueness constraint like `(recurring_expense_id, date)` and `onConflict().ignore()`.
      - Response shape for v2 client: `{ generatedCount: number; generatedAmount: number; year: number; month: number }`.
   2. Make it explicit in server docs that recurring generation is **monthly-only**; there is no generic date-range or non-monthly frequency in v2.

4. **Introduce Hooks for Templates and Recurring Summary**
   1. Add `useRecurringTemplates` in `client-v2/src/hooks/useRecurringTemplates.ts`:
      - Fetches templates via `recurringExpenseService.getTemplates()` on mount or when scope/user changes.
      - Exposes `{ templates, loading, error, refresh }`.
   2. Create a recurring analytics helper in `client-v2/src/lib/recurringAnalytics.ts`:
      - Port the logic concept from old `buildCategorySummaries` / recurring bits in `client/src/pages/ExpensesV2.js`:
        - Given `{ templates, expenses, start, end }`, compute:
          - `generatedCount` and `generatedAmount` (how many instances and total amount in range).
          - `upcomingCount` (templates expected in the range but without a matching expense).
          - `coverage` as `% templates generated this period`.
      - Define and export a `RecurringSummary` type used here and in UI.
   3. Add `useRecurringSummary` in `client-v2/src/hooks/useRecurringSummary.ts`:
      - Takes `{ start, end, expenses }`.
      - Uses `useRecurringTemplates` and `computeRecurringSummary` to return `{ templates, recurringSummary, loading, error, refresh }`.

5. **Hook or Utility for Generation**
   1. Implement `useRecurringGeneration` in `client-v2/src/hooks/useRecurringGeneration.ts`:
      - Accepts `year`, `month`, and a callback to refresh expenses (and optionally templates).
      - Internally calls `recurringExpenseService.generate({ year, month })` to trigger **monthly** generation for that specific period.
      - Manages `isGenerating` state, error handling, and returns `{ generate, isGenerating }`.
      - On success, calls the provided `refreshExpenses` and optionally `refreshTemplates` from `useRecurringSummary`, and surfaces a toast summarizing `{ generatedCount, generatedAmount }`.

6. **Extend Add‑Expense Flow to Create Templates**
   1. Identify the v2 add‑expense UI (e.g. `client-v2/src/components/expenses/AddExpenseModal.tsx` or the page navigated to from `ExpenseList` via `navigate('/add-expense')`).
   2. In that form’s UI:
      - Add a checkbox or toggle “Save as recurring template”.
      - Optionally include an info line: “We’ll use this amount, category, payer and split as your monthly bill template.”
   3. In the submit handler:
      - First create the standard expense via the existing `expenseService` call.
      - If “Save as recurring template” is checked:
        - Call `recurringExpenseService.createTemplate` with fields derived from the saved expense:
          - `description` (from expense description).
          - `default_amount` (from expense amount).
          - `category_id`, `paid_by_user_id`, `split_type`, `split_ratio_user1`, `split_ratio_user2`.
      - Handle errors:
        - If expense succeeds but template fails, show a toast that the template couldn’t be created, but don’t roll back the expense.
      - On success, optionally trigger a `refreshTemplates` (from `useRecurringTemplates`) so the Recurring card updates.

7. **Respect Partner/Scope Constraints in Template Creation**
   1. Leverage the existing “has partner” logic from `ExpenseList.tsx`:
      - If there is no partner, disable or hide `split_type` options of `custom` and `bill` both in expense and template creation/editing.
   2. Ensure the add‑expense UI uses the same split component and validation as the edit‑expense UI in `ExpenseList.tsx` so that template splits are consistent and valid.

8. **Create a Recurring Templates Management UI**
   1. Decide placement:
      - Either a new route/page `client-v2/src/components/RecurringTemplatesPage.tsx` (or under `pages/`), or
      - A drawer/modal invoked from the dashboard (e.g. `RecurringTemplatesDialog`).
   2. This surface should:
      - Use `useRecurringTemplates` to list templates (description, default amount, category chip, payer, split type/ratios, active status).
      - Provide actions:
        - “Edit” → opens a form with the same fields and validations as add‑expense, but operating on a template.
        - “Deactivate” → confirms and calls `deactivateTemplate`, then refreshes.
        - Optional: “New template” → create directly without a source expense.
   3. Style using v2’s shadcn/ui components:
      - `Card`, `Table`, `Dialog`, `Button`, `Input`, `Select`, etc. with Tailwind classes aligned to patterns in `ExpenseList.tsx` and the analytics screens.

9. **Add a Recurring Card Component in Client‑v2**
   1. Create `client-v2/src/components/RecurringCard.tsx` modelled conceptually on old `RecurringCard` in `client/src/pages/ExpensesV2.js`:
      - Props: `{ recurringSummary, templates, onGenerate, onManageTemplates, isGenerating }`.
      - Shows:
        - Summary tiles: `Generated`, `Upcoming`.
        - Coverage `%` and `generatedAmount`, using v2’s chart primitives if desired (e.g. small bar/area chart).
        - Copy encouraging users to set up templates when `templates.length === 0`.
   2. The primary action button:
      - If `recurringSummary.upcomingCount > 0`, show “Generate remaining” and call `onGenerate`.
      - Else, show “Review recurring” and call `onManageTemplates`.
      - Disable and show a spinner while `isGenerating` is true.
   3. Reuse v2’s button variants and copy tone (see `ExpensesV2.js` for “Upcoming bills” card language).

10. **Wire Recurring Card into the v2 Dashboard**
   1. Identify the equivalent of the old `ExpensesV2` dashboard in client‑v2 (e.g. `client-v2/src/components/dashboard/ExpensesOverview.tsx` or similar).
   2. In that component:
      - Use existing expenses hook/context (e.g. `useScopedExpenses` or its v2 equivalent) to get `expenses`, `loading`, `error`, `refresh`.
      - Use filters/range already present (month/year or date range).
      - Instantiate `useRecurringSummary({ start, end, expenses })` and `useRecurringGeneration({ month, year, refreshExpenses })`.
      - Render the new `RecurringCard` side‑by‑side with the main spending card, similar to old `ExpensesV2.js` layout:
        - Pass: `recurringSummary`, `templates`, `onGenerate={generate}`, `isGenerating`, and `onManageTemplates` that opens the management UI.
   3. Ensure loading and error states:
      - Hide or skeleton‑render the card while templates or expenses are loading.
      - Show a gentle message if templates fail to load, but don’t break the rest of the page.

11. **Flag Recurring Instances in Expense Lists**
   1. Update `client-v2/src/components/ExpenseList.tsx`:
      - In table “view mode” rows, if `expense.recurring_expense_id` is present, show a small badge or chip (e.g. “Recurring”) alongside the description or in an extra column.
   2. Ensure this badge appears in other lists that show expenses (e.g. any transaction sheets or dashboard tables) for consistency.
   3. Keep styling light and in line with existing badges in `ExpenseList` (e.g. `Badge` with a neutral/indigo tone).

12. **Validation & Edge Case Handling**
   1. Split validation:
      - Reuse the ratio clamping and mirroring logic from `ExpenseList.tsx` for template forms so `split_ratio_user1 + split_ratio_user2 === 100` for `custom` (and for `bill` if you decide to treat it the same).
      - Prevent saving templates with invalid splits; show inline errors and/or toasts.
   2. Missing categories or users:
      - If `category_id` in a template doesn’t match an existing category, display “Uncategorized” and consider highlighting with a subtle warning icon in the management UI.
      - If `paid_by_user_id` no longer references a known user, default the label to “Unknown payer” and suggest editing.
   3. Inactive templates:
      - `useRecurringTemplates` should by default only surface active (`is_active`) templates (the backend already filters for `is_active = true`).
      - Optionally, add a toggle in the management view to include inactive templates, which would require either:
        - A different API call, or
        - Adjusting the server route later; for the first iteration, keep it “active‑only”.

13. **Connect Recurring to Insights (Optional but Recommended)**
   1. In the v2 insights builder (under `client-v2/src/lib/analytics` or similar), use `recurringSummary` to add one or two recurring‑oriented insights:
      - Example: if `upcomingCount > 0`, surface a tip “You have X bills not yet generated this month – tap to generate them.”
   2. Use an `actionKey` like `"open_recurring_manager"` or `"generate_recurring"` so the `InsightsPanel` can call into either:
      - `onGenerate` from `useRecurringGeneration`, or
      - The recurring templates manager.
   3. Keep copy in line with current tone from the analytics spec (supportive, not alarmist).

14. **UX Copy & Design Alignment**
   1. Align new copy with the style in `CLIENT_V2_UX_COPY_IMPROVEMENTS.md` and existing `ExpensesV2.js`:
      - Use phrases like “upcoming bills”, “keep your bills on autopilot”, “never miss a bill”.
   2. Ensure all components use shadcn/ui from `client-v2/src/components/ui/` and Tailwind tokens:
      - Border, radius, and color tokens (`--radius`, `--border`, `--theme-*`) as per `AGENTS.md`.
   3. Confirm focus states, ARIA labels, and keyboard navigation work for the new dialogs/sheets.

15. **Behavior Verification & Edge Scenarios**
   1. Confirm that hitting “Generate remaining” multiple times in one period doesn’t create duplicates:
      - Rely on server idempotence, but also disable the button while one request is in flight.
   2. Test flows:
      - User with partner vs single user.
      - Templates using each split type, ensuring the generated expenses show the correct splits and appear in `ExpenseList` and analytics.
      - Deactivating a template and reloading the dashboard: counts should update and upcoming items should drop.
   3. Confirm that all generated expenses flow through existing `useScopedExpenses`/summary pipelines so they influence budgets, category totals, and settlement calculations with no special casing.

### Further Considerations

1. Clarify whether templates are couple‑level or per‑user (current DB routes aren’t scoped; you may want to filter by couple/user in a future backend step).
2. Decide whether you want a dedicated `POST /recurring-expenses/generate` in the near term or are comfortable letting `GET /summary/monthly` implicitly handle generation.
3. Confirm if you only need monthly frequency for now, or whether to extend the server model (and this plan) to support other recurrence patterns later.
