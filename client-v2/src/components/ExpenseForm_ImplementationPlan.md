# Implementation Plan: Expense Form Redesign (Design 4)

## Goal
Replace the current `@client-v2/src/components/ExpenseForm.tsx` with a modern, centered, visual design ("Design 4") while preserving all existing backend logic (splits, recurring, etc.).

## Core Requirements
1.  **Visual Design:** Centered card layout, large amount input, additive quick-add buttons, grid-based category selection.
2.  **Category Presentation:** Use dynamic icons and colors from the `Category` object.
3.  **Logic Preservation:**
    *   State: `formData` (amount, category, description, date, paid_by, split_type).
    *   Services: `expenseService`, `recurringExpenseService`, `categoryService`, `authService`.
    *   Context: `AuthContext` (current user).
4.  **New Interactions:**
    *   Additive amount buttons (e.g., clicking "+100" adds 100 to current value).
    *   Clickable "Paid by [Name]" to toggle payer.
    *   Simplified Split Toggles (50/50, Personal, Partner).

## Technical Details

### 1. Imports & Setup
*   Keep all existing imports.
*   Ensure `lucide-react` icons are imported dynamically or mapped.
*   Use `hexToRgba` utility for category background styling.

### 2. Helper Functions
*   `hexToRgba(hex, alpha)`: For creating the light background colors for unselected categories.
*   `handleQuickAdd(value)`:
    ```typescript
    const handleQuickAdd = (value: number) => {
      const current = parseFloat(formData.amount) || 0;
      setFormData({ ...formData, amount: (current + value).toString() });
    };
    ```

### 3. Component Structure
*   **Header:** Back button (top left), Title (center/left), Spacer (right).
*   **Main Card:**
    *   **Amount Section:**
        *   Input: `type="number"`, centered, huge text.
        *   Quick Buttons: Map `[100, 200, 500]` -> `onClick={() => handleQuickAdd(val)}`.
    *   **Category Section:**
        *   Grid Layout: `grid-cols-3 sm:grid-cols-4 gap-3`.
        *   Items: Button with dynamic style.
            *   Selected: `bg-[color] text-white ring-2`.
            *   Unselected: `bg-[color]/10 text-[color]`.
            *   Icon: `getIconByName(cat.icon)`.
    *   **Details Section:**
        *   Description Input: Styled as a "flush" input or minimal border.
        *   Date Input: Standard date picker with custom styling.
    *   **Split & Payer Section:**
        *   Header: "Split & Payer".
        *   Payer Toggle: "Paid by [Name]" (Clickable).
        *   Split Buttons:
            *   [50/50] -> `split_type: '50/50'`
            *   [Me] -> `split_type: 'personal'`
            *   [Partner] -> `split_type: 'bill'` (or custom logic if needed).
    *   **Recurring Toggle:**
        *   Card-like row with checkbox.

### 4. State Management Updates
*   **Paid By:** Since the design implies a simple toggle between "Me" and "Partner", we can derive the partner's ID from the `users` array (finding the one that isn't `user.id`).
*   **Category:** Default to the first available category if none selected (already implemented).

## Styles
*   Use Tailwind CSS for layout and typography.
*   Use inline `style={{ backgroundColor: ... }}` for dynamic category colors.

## Verification
*   Check if amount updates correctly with additive buttons.
*   Check if category selection updates `formData.category_id`.
*   Check if split type and payer update correctly.
*   Verify submission sends correct data to backend.
