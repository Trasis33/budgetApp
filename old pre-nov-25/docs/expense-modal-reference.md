# Quick Reference: Using the Expense Modal

## For Developers

### Opening the Modal

```javascript
import { useExpenseModal } from '../context/ExpenseModalContext';

function MyComponent() {
  const { openAddModal, openEditModal } = useExpenseModal();
  
  // Add new expense
  const handleAdd = () => {
    openAddModal((savedExpense) => {
      console.log('Expense added:', savedExpense);
      // Refresh your list, show notification, etc.
    });
  };
  
  // Edit existing expense
  const handleEdit = (expense) => {
    openEditModal(expense, (savedExpense) => {
      console.log('Expense updated:', savedExpense);
      // Update your list, show notification, etc.
    });
  };
  
  return (
    <>
      <button onClick={handleAdd}>Add Expense</button>
      <button onClick={() => handleEdit(someExpense)}>Edit</button>
    </>
  );
}
```

### Modal Features

#### Add Mode
- Auto-focus on amount field
- Quick-add buttons (+100, +500, +1000)
- Recent expenses list at bottom
- All fields start empty (except date = today)

#### Edit Mode
- Pre-filled with existing expense data
- No quick-add buttons
- No recent expenses list
- Same validation as add mode

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Amount | number | Yes | Must be > 0 |
| Date | date | Yes | Cannot be future date |
| Description | text | Yes | Max 140 characters (tracked in UI) |
| Category | select | Yes | From `/categories` API |
| Paid By | select | Yes | From `/auth/users` API |
| Split Type | select | No | "50/50" or "custom" |
| User 1 Ratio | number | Conditional | Required if split type = "custom" |
| User 2 Ratio | number | Conditional | Required if split type = "custom" |

### Validation Rules

```javascript
// Amount validation
amount > 0

// Date validation
date <= today

// Split validation (custom only)
splitRatio1 + splitRatio2 === 100
splitRatio1 >= 0 && splitRatio2 >= 0
```

### Styling Classes Used

From `design-system.css`:
- `.modal-overlay` - Full-screen backdrop
- `.modal-content` - Modal container
- `.form-grid` - Two-column form layout
- `.form-field` - Individual field wrapper
- `.form-actions` - Button container at bottom
- `.glass-effect` - Recent expenses list items
- `.btn` - Primary action button
- `.btn-ghost` - Secondary/cancel button
- `.error-message` - Validation error display

### API Endpoints

```
GET  /categories              → Load categories
GET  /auth/users              → Load users (optional)
GET  /expenses/recent         → Load recent 5 expenses
POST /expenses                → Create new expense
PUT  /expenses/:id            → Update expense
GET  /expenses                → Refresh list
```

### Example: Full Integration

```javascript
import React, { useState, useEffect } from 'react';
import { useExpenseModal } from '../context/ExpenseModalContext';
import axios from '../api/axios';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const { openAddModal, openEditModal } = useExpenseModal();
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const loadExpenses = async () => {
    const res = await axios.get('/expenses');
    setExpenses(res.data);
  };
  
  const handleAdd = () => {
    openAddModal((savedExpense) => {
      // Optimistic update
      setExpenses(prev => [savedExpense, ...prev]);
      // Or refresh from server
      // loadExpenses();
    });
  };
  
  const handleEdit = (expense) => {
    openEditModal(expense, (savedExpense) => {
      // Update in list
      setExpenses(prev => 
        prev.map(e => e.id === savedExpense.id ? savedExpense : e)
      );
    });
  };
  
  return (
    <div>
      <button onClick={handleAdd}>Add New</button>
      {expenses.map(exp => (
        <div key={exp.id}>
          <span>{exp.description} - {exp.amount}</span>
          <button onClick={() => handleEdit(exp)}>Edit</button>
        </div>
      ))}
    </div>
  );
}
```

### Accessibility

- Modal has proper ARIA labels
- Auto-focus on first field
- Keyboard navigation supported
- Screen reader friendly error messages
- Close button clearly labeled

### Mobile Considerations

- Modal is responsive (max-width: 600px)
- Touch-friendly button sizes
- Scrollable content if needed
- Bottom action buttons always visible
- Quick-add buttons work well on mobile

## Migration Notes

### Old Pattern (Deprecated)
```javascript
// DON'T USE - Old navigation pattern
<Link to="/expenses/add">Add Expense</Link>
<Link to={`/expenses/edit/${id}`}>Edit</Link>
```

### New Pattern (Current)
```javascript
// DO USE - Modal pattern
import { useExpenseModal } from '../context/ExpenseModalContext';

const { openAddModal, openEditModal } = useExpenseModal();
<button onClick={() => openAddModal()}>Add Expense</button>
<button onClick={() => openEditModal(expense)}>Edit</button>
```

## Troubleshooting

### Modal doesn't open
- Ensure component is wrapped in `<ExpenseModalProvider>`
- Check that `GlobalExpenseModal` is rendered in App.js
- Verify `useExpenseModal()` is called inside a component (not at module level)

### Data not refreshing
- Make sure you pass an `onSuccess` callback to `openAddModal/openEditModal`
- Call your refresh function inside the callback
- Check network tab for API errors

### Styling issues
- Verify `design-system.css` is imported
- Check CSS variable definitions in `:root`
- Ensure no conflicting global styles

### Validation not working
- Check console for JavaScript errors
- Verify API is returning proper error format
- Test with browser dev tools network tab
