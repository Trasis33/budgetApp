# Smart Budget Wizard Specification

## Overview
The Smart Budget Wizard helps couples set up monthly budgets using strategy-based allocation (e.g., 50/30/20 rule). It combines fixed bill amounts from recurring templates with automatic distribution of remaining income across variable spending categories.

## Components
- `SmartBudgetWizard.tsx` - Main dialog container, state management, data loading
- `Step1Strategy.tsx` - Income input and strategy selection
- `Step2Architect.tsx` - Budget allocation interface with fixed/variable columns
- `types.ts` - Strategy definitions and state interfaces

## Data Flow

### On Wizard Open
1. **Refresh couple data** → Get latest income values from user profiles
2. **Load recurring templates** → Fetch all active recurring expense templates
3. **Load previous month budgets** → Seed wizard with last month's budget values
4. **Overlay bill-managed amounts** → Replace fixed expense values with current recurring template amounts

### State Priority (Fixed Expenses)
```
1. Bill-managed recurring templates (highest priority)
2. Previous month budget values (fallback)
3. Empty/zero (default)
```

Bill-managed amounts always win because they represent the actual contracted bill amounts.

## Step 1: Strategy Selection

### Income Sources
- **User income**: From `users.monthly_net_income`
- **Partner income**: From partner's `monthly_net_income`
- **Combined**: Sum of both, used for budget calculations

### Available Strategies
| Strategy | Needs | Wants | Savings |
|----------|-------|-------|---------|
| Balanced | 50% | 30% | 20% |
| Aggressive Saver | 50% | 15% | 35% |
| High Cost of Living | 70% | 20% | 10% |

## Step 2: Budget Allocation

### Column Layout
- **Left (Fixed Expenses)**: Categories with `is_fixed = true`
- **Right (Variable)**: Categories with `is_fixed = false`

### Category Classification
Each category has two independent flags:
- `is_fixed` (boolean): Determines column placement
- `spending_role` ('need' | 'want' | 'save'): Determines budget bucket

### Bill-Managed Categories
Categories linked to recurring templates with `bill_managed = true`:
- Display "BILL" badge in UI
- Show recurring template's `default_amount`
- **Excluded from budget saves** (handled as expenses, not budgets)

### Auto-Allocation Logic

```
Disposable Income = Total Income - Sum(Fixed Expenses)

For each bucket:
  Variable Needs Budget = max(0, Needs Target - Fixed Needs)
  Wants Budget = Income × Strategy.wants
  Savings Budget = Income × Strategy.savings

If total planned > disposable:
  Scale all buckets proportionally

Distribute each bucket evenly among its categories:
  Per Category = Bucket Budget ÷ Category Count
```

### Manual Override
- Any slider/input change sets `hasUserEditedVariables = true`
- Once set, auto-allocation stops running
- UI shows "Variable allocations are now manual" message

## Save Behavior

### What Gets Saved as Budgets
1. **Fixed categories** with amount > 0 AND not bill-managed
2. **Variable categories** with amount > 0

### What Gets Excluded
- Bill-managed fixed categories (these create expenses, not budgets)
- Categories with zero amount

### API Calls
```typescript
budgetService.createOrUpdateBudget({
  category_id: number,
  amount: number,
  month: number,
  year: number
})
```

## UI Elements

### Header Summary
- Total Income display
- Unallocated amount (green if positive, red if negative)

### Needs Indicator
Shows actual vs target percentage:
- "Needs: 54% of income · Strategy target 50%"
- Red text if actual exceeds target by >5%

### Debug Footer
- "Fixed budgets to save: X"
- "Variable budgets to save: Y"
- Manual mode indicator

## Dependencies
- `budgetService` - Budget CRUD operations
- `recurringExpenseService` - Load recurring templates
- `ScopeContext` - Couple summary and income data
- `categoryService` - Category definitions (loaded by parent)

## Category Setup Requirements
For the wizard to work correctly, categories need:
1. `is_fixed` set appropriately (true for bills/contracts)
2. `spending_role` set to 'need', 'want', or 'save'
3. Bill-managed recurring templates for fixed monthly bills
