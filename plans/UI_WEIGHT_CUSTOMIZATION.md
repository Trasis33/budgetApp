# Category Weight Customization UI Guide

## Overview

Users can now customize budget weights for categories directly in the Settings → Categories interface. This allows advanced users to fine-tune how budgets are allocated based on their specific needs.

## UI Components Added

### 1. Budget Priority Weight Slider
**Location:** Settings → Categories → [Edit Category Dialog]

```
Budget Priority Weight: [====●=======] 55%
                        Low ← Medium → High
```

**Features:**
- Range: 0% (lowest priority) to 100% (highest priority)
- Slider increments: 5% steps for easy adjustment
- Real-time display of percentage value
- Clear visual feedback with scale labels

**Use Cases:**
- Set "Groceries" to 80% priority (essential)
- Set "Subscriptions" to 20% priority (discretionary)
- Custom adjustments for life situations (more dining out, less entertainment)

### 2. Minimum Percentage Constraint
**Label:** "Minimum % of Bucket (Optional)"

**Example:**
- Category: Groceries  
- spending_role: need
- Min %: 15
- **Effect:** Groceries will always receive at least 15% of the needs budget

**When to Use:**
- ✅ Essential categories that shouldn't be starved
- ✅ Basic necessities (groceries, utilities)
- ❌ Not needed for most discretionary categories

### 3. Maximum Percentage Constraint  
**Label:** "Maximum % of Bucket (Optional)"

**Example:**
- Category: Subscriptions
- spending_role: want
- Max %: 5
- **Effect:** Subscriptions never exceed 5% of wants budget

**When to Use:**
- ✅ Discretionary categories that could spiral
- ✅ Entertainment, streaming, apps
- ✅ Premium/luxury items
- ❌ Not needed for essential categories

## Complete Category Edit Dialog

### Create/Edit Flow

```
┌─────────────────────────────────────────────────────┐
│ Edit Category                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Category Name                                       │
│ [_____________ Groceries _____________]             │
│                                                     │
│ [x] Fixed Expense                                   │
│     Mark as mandatory monthly bill                  │
│                                                     │
│ Spending Role                                       │
│ [v] Need                                            │
│     ○ Want  ○ Save                                  │
│                                                     │
│ Budget Priority Weight        ← NEW FIELD           │
│ [====●=======] 80%            ← NEW FIELD           │
│ Low ← Medium → High           ← NEW FIELD           │
│ Higher weight = larger share  ← HELP TEXT          │
│                               ← NEW FIELD           │
│ Minimum % of Bucket (Optional) ← NEW FIELD          │
│ [________15________]           ← NEW FIELD          │
│ Ensure at least 15% of bucket ← HELP TEXT          │
│                               ← NEW FIELD           │
│ Maximum % of Bucket (Optional) ← NEW FIELD          │
│ [__________________________]   ← NEW FIELD          │
│ (leave empty for no max)     ← HELP TEXT          │
│                               ← NEW FIELD           │
│ Icon                                        (existing)
│ [color grid - 8 columns]                    (existing)
│                                             (existing)
│ Color                                       (existing)
│ [color picker - 6 columns]                  (existing)
│                                             (existing)
├─────────────────────────────────────────────────────┤
│ [Cancel]  [Update]                                  │
└─────────────────────────────────────────────────────┘
```

## Real-World Examples

### Example 1: Balanced Household
```
Groceries (need, weight 80%, min 15%)   
  → Always gets 15-30% of needs budget
  → Essential, can't be low

Dining Out (want, weight 50%, max 20%)  
  → Gets ~17% of wants budget
  → Flexibility but capped so it doesn't dominate

Entertainment (want, weight 40%, max 12%)
  → Gets ~14% of wants budget
  → Controlled discretionary spending

Subscriptions (want, weight 15%, max 5%)
  → Gets ~5% of wants budget
  → Easy luxury to cut if needed
```

### Example 2: High Cost of Living (Spender Strategy)
```
Mortgage (need, weight 90%, no limits)
  → Top priority, full allocation
  
Transportation (need, weight 70%)
  → Important for work/life
  
Utilities (need, weight 75%)
  → Non-negotiable infrastructure

These get the 70% "needs" budget from spender strategy
```

### Example 3: Aggressive Saver Profile
```
Savings (save, weight 95%, min 10%)
  → Locked in for 10% minimum
  → Gets extra weight to maximize savings

Subscriptions (want, weight 15%, max 3%)
  → Tightened to 3% max
  → Cut discretionary to boost savings rate
```

## Implementation Details

### Form State Management
```typescript
formData = {
  // ...existing fields
  budget_weight: 0.5,           // 0.0-1.0
  budget_min_pct: undefined,    // 0.0-1.0 or empty
  budget_max_pct: undefined,    // 0.0-1.0 or empty
}
```

### API Integration
Weight fields are automatically included in:
- `categoryService.updateCategory(id, formData)` 
- `categoryService.createCategory(formData)`

No additional API calls needed.

### Data Persistence
When user clicks "Update" or "Create":
1. Form data (including weights) sent to API
2. Backend validates and stores in database
3. UI updates category list
4. Toast confirms: "Category updated successfully"

### Backward Compatibility
- Old categories without weight fields work fine
- Weights default to 0.5 if not specified
- Existing categories can be edited to add weights anytime

## User Guidance

### Helpful Tips to Display

**Weight Selection:**
- 🟢 **0.80-1.00** = Essential (housing, food, utilities)
- 🟢 **0.60-0.75** = Important (healthcare, transportation)  
- 🟡 **0.40-0.55** = Moderate (dining, hobbies)
- 🔴 **0.15-0.30** = Discretionary (subscriptions, apps)

**Constraint Usage:**
- **Min %:** Use for categories you never want below a threshold
- **Max %:** Use for categories that could spiral if unchecked
- **Leave blank:** Default behavior applies (no constraint)

## Testing the UI

### Manual Test Checklist

```
[ ] Edit an existing category
    [ ] See weight slider at 50% default
    [ ] Drag slider to 80%
    [ ] Confirm percentage updates
    
[ ] Add min constraint
    [ ] Enter "15" for minimum
    [ ] Save and verify
    
[ ] Add max constraint
    [ ] Enter "5" for maximum  
    [ ] Save and verify
    
[ ] Create new category
    [ ] All weight fields appear
    [ ] Defaults to 50% weight
    [ ] Can set constraints
    
[ ] Verify wizard integration
    [ ] Go to Smart Budget Wizard
    [ ] Step 2 uses new weights
    [ ] Allocations respect constraints
```

### Browser Console Checks

After saving a category with weights:
```javascript
// Verify the API call payload
// Open DevTools → Network → find PUT /api/categories/XX
// Click → Request → Verify includes:
// {
//   "budget_weight": 0.75,
//   "budget_min_pct": 0.15,
//   "budget_max_pct": null
// }
```

## Accessibility Features

- ✅ Range slider has proper `id` and `step` attributes
- ✅ Input fields have `htmlFor` labels
- ✅ Number inputs support keyboard navigation
- ✅ Help text explains each field
- ✅ Visual slider shows value in real-time
- ✅ Color scale (Low/Medium/High) for clarity

## Future Enhancements

1. **Weight Templates**
   - "Essential Living" - pre-configured weights
   - "Budget Conscious" - aggressive caps
   - "Lifestyle" - higher entertainment weights

2. **Weight Recommendations**
   - Auto-suggest weights based on spending_role
   - Warn if weight seems unusual for role

3. **Visual Feedback**
   - Show how weight affects allocation in real-time
   - "If you set weights X%, category gets Y kr in a Z income scenario"

4. **Bulk Edit**
   - Adjust multiple category weights at once
   - Reset all to defaults

## Summary

The weight customization UI empowers users to:
- ✅ Design budgets matching their priorities
- ✅ Set floor/ceilings for control
- ✅ Fine-tune allocations on category basis  
- ✅ Override defaults when life circumstances change

All while maintaining clear, logical defaults that work for 95% of users out-of-the-box.
