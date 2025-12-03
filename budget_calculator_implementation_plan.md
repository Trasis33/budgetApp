# Implementation Plan: Smart Budget Setup (Wizard)

## Objective
Implement a "Smart Budget Setup" wizard that guides couples through creating a balanced budget. The flow combines high-level strategy selection with granular control, styled to match the application's existing `ExpenseForm` aesthetic.

## UX Flow
1.  **Step 1: Income & Strategy**
    *   User inputs **Combined Monthly Net Income**.
    *   User selects a **Budget Strategy** (e.g., "Balanced 50/30/20", "Aggressive Saver", "High Fixed Costs").
    *   *Design:* Large, clean input for income (reusing `ExpenseForm` style). Cards for strategy selection.
2.  **Step 2: Budget Architect (Split View)**
    *   **Left Column (Fixed):** Pre-populated with "Fixed" type categories (Housing, Utilities, etc.). Users enter exact amounts.
    *   **Right Column (Variable):** Remaining "Lifestyle" categories. Budgets are auto-calculated based on the `(Income - Fixed) * Strategy %`.
    *   **Interactive Tuning:** Users can adjust sliders/inputs. The "Remaining" amount updates in real-time.
    *   *Design:* Two-column layout using `Card` components. Slate/Gray color palette.

## Component Architecture

### 1. `SmartBudgetWizard.tsx` (Container)
*   **State Management:**
    *   `step`: 1 | 2
    *   `income`: number
    *   `selectedStrategy`: StrategyEnum
    *   `budgets`: Record<categoryId, number>
*   **Props:** `isOpen`, `onClose`, `onSave`, `categories`

### 2. `IncomeStrategyStep.tsx`
*   **UI:**
    *   Large central input for Income (`text-4xl` or `text-6xl`).
    *   Grid of 3 Strategy Cards.
    *   "Next" button.

### 3. `BudgetArchitectStep.tsx`
*   **UI:**
    *   **Header:** Income summary & "Unallocated" amount indicator.
    *   **Split Layout:**
        *   **Fixed Section:** List of fixed categories with direct number inputs.
        *   **Variable Section:** List of variable categories with progress bars/sliders indicating % of disposable income.
    *   **Action:** "Apply Budget Plan" button.

## Logic & Algorithms

### Strategies
```typescript
const STRATEGIES = {
  BALANCED: { needs: 0.5, wants: 0.3, savings: 0.2 },
  SAVER:    { needs: 0.5, wants: 0.2, savings: 0.3 },
  SPENDER:  { needs: 0.6, wants: 0.3, savings: 0.1 } // Adjusted for high COL
}
```

### Calculation
1.  `Total Fixed` = Sum of user inputs in Fixed column.
2.  `Disposable Income` = `Total Income` - `Total Fixed`.
3.  `Variable Category Budget` = `Disposable Income` * `Category Weight` (normalized from Strategy).

## Integration
*   **EntryPoint:** Add "Auto-Generate" button to `BudgetManager.tsx` header.
*   **Service:** Use `budgetService.createOrUpdateBudget` (looping through all entries) to save.

## Design System Alignment
*   **Colors:** `slate-50` backgrounds, `slate-900` primary text/buttons.
*   **Components:** Reuse `ui/card`, `ui/input`, `ui/slider` (if available) or custom range input.
*   **Typography:** Uppercase tracking-wider labels for headers (e.g., "FIXED EXPENSES").
