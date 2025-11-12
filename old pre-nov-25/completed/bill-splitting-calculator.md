# Bill Splitting Calculator: Plan and Scenarios

This document outlines the plan for implementing the bill-splitting calculator feature. The goal is to automatically calculate who owes whom based on the expenses logged for a specific period.

## Objective

To provide a clear, automated summary of the financial balance between the two users for a given month. This feature will eliminate manual calculations and provide a simple, actionable result (e.g., "User A owes User B $50").

## Core Logic

The calculation will be performed on the backend and exposed via a new API endpoint (e.g., `/api/summary/settle`).

1.  **Fetch Expenses**: The backend will retrieve all expenses for a specified month and year.
2.  **Calculate Total Contributions**: It will sum the total amount paid by each user.
3.  **Calculate Each User's Share**: For each expense, it will calculate each user's share based on the `split_type` and `split_ratio`.
    *   **50/50**: The expense amount is divided equally.
    *   **Custom Ratio**: The expense is multiplied by each user's ratio (`split_ratio_user1`, `split_ratio_user2`).
    *   **Personal**: The entire expense is assigned to the person who paid. This expense will not be included in the shared total.
4.  **Determine the Balance**: The system will compare each user's total contribution to their total share of the expenses.
    *   `Balance = Total Amount Paid - Total Share`
    *   A positive balance means the user paid more than their share and is owed money.
    *   A negative balance means the user paid less than their share and owes money.
5.  **Return Result**: The API will return a clear summary, including the final settlement amount and direction (who owes whom).

## UI/UX Plan

1.  **New Page/Component**: We will create a new page, accessible from the sidebar, called "Monthly Settlement" or similar.
2.  **Date Selection**: The page will feature dropdowns to select the month and year for the calculation.
3.  **Calculate Button**: A button will trigger the calculation for the selected period.
4.  **Results Display**: The results will be displayed in a clean, easy-to-read format:
    *   Total monthly expenses (shared).
    *   Total paid by User A.
    *   Total paid by User B.
    *   A clear, final statement, e.g., **"Fredrik owes Anna 250 SEK"**.

---

## Usage Scenarios

Here are a few simple scenarios to illustrate the logic. Assume User 1 is **Anna** and User 2 is **Fredrik**.

### Scenario 1: Simple 50/50 Split

*   **Anna** pays for Groceries: **1000 SEK** (Split 50/50)
*   **Fredrik** pays for Utilities: **500 SEK** (Split 50/50)

**Calculation:**
*   **Total Shared Expenses**: 1000 + 500 = 1500 SEK
*   **Each Person's Share**: 1500 / 2 = 750 SEK
*   **Anna Paid**: 1000 SEK. Her balance is 1000 - 750 = **+250 SEK**.
*   **Fredrik Paid**: 500 SEK. His balance is 500 - 750 = **-250 SEK**.

**Result**: Fredrik owes Anna 250 SEK.

### Scenario 2: Custom Split Ratio

*   **Anna** pays for a Flight: **3000 SEK** (Split 70% Anna, 30% Fredrik)
*   **Fredrik** pays for a Hotel: **2000 SEK** (Split 50/50)

**Calculation:**
*   **Total Expenses**: 5000 SEK
*   **Anna's Share**: (3000 * 0.70) + (2000 * 0.50) = 2100 + 1000 = **3100 SEK**
*   **Fredrik's Share**: (3000 * 0.30) + (2000 * 0.50) = 900 + 1000 = **1900 SEK**
*   **Anna Paid**: 3000 SEK. Her balance is 3000 - 3100 = **-100 SEK**.
*   **Fredrik Paid**: 2000 SEK. His balance is 2000 - 1900 = **+100 SEK**.

**Result**: Anna owes Fredrik 100 SEK.

### Scenario 3: Including a Personal Expense

*   **Anna** pays for Groceries: **1000 SEK** (Split 50/50)
*   **Fredrik** pays for a personal gadget: **800 SEK** (Split "Personal" - 100% Fredrik)

**Calculation:**
*   The personal expense is excluded from the shared calculation.
*   **Total Shared Expenses**: 1000 SEK
*   **Each Person's Share**: 1000 / 2 = 500 SEK
*   **Anna Paid (towards shared)**: 1000 SEK. Her balance is 1000 - 500 = **+500 SEK**.
*   **Fredrik Paid (towards shared)**: 0 SEK. His balance is 0 - 500 = **-500 SEK**.

**Result**: Fredrik owes Anna 500 SEK.

