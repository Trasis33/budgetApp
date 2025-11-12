# Component Integration Plan: Mock Data → Real API

## Overview

This document provides detailed, step-by-step instructions to convert each component in client-v2 from using mock data to fetching real data from the backend API.

---

## 1. Dashboard Component

### Current State
- **File**: `src/components/Dashboard.tsx`
- **Props**: Receives `expenses`, `budgets`, `currentUser` as props
- **Mock Usage**: Filters and displays data passed from parent

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
  currentUser: User;
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface DashboardProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
Add inside component:
```typescript
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../api/services/expenseService';
import { budgetService } from '../api/services/budgetService';
import { toast } from 'sonner';

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, budgetsData] = await Promise.all([
          expenseService.getExpenses('ours'),
          budgetService.getBudgets(new Date().getMonth() + 1, new Date().getFullYear())
        ]);
        setExpenses(expensesData);
        setBudgets(budgetsData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
```

#### Step 3: Fix Field Name Mismatches

**Find this section (line 41):**
```typescript
spent: calculateCategorySpending(monthlyExpenses, budget.category)
```

**Replace with:**
```typescript
spent: calculateCategorySpending(monthlyExpenses, budget.category_name)
```

**Find this section (lines 126-134):**
```typescript
<p>{expense.category} • {formatDate(expense.date)}</p>
...
<p className="text-muted-foreground">
  {expense.splitType === 'personal' ? 'Personal' : 'Split'}
</p>
```

**Replace with:**
```typescript
<p>{expense.category_name} • {formatDate(expense.date)}</p>
...
<p className="text-muted-foreground">
  {expense.split_type === 'personal' ? 'Personal' : 'Split'}
</p>
```

**Find this section (line 165):**
```typescript
<span>{budget.category}</span>
```

**Replace with:**
```typescript
<span>{budget.category_name}</span>
```

**Find this section (line 167):**
```typescript
{formatCurrency(budget.monthlyAmount)}
```

**Replace with:**
```typescript
{formatCurrency(budget.amount)}
```

---

## 2. ExpenseForm Component

### Current State
- **File**: `src/components/ExpenseForm.tsx`
- **Props**: Receives `currentUser`, `partnerUser`, callbacks for add/cancel
- **Mock Usage**: Converts form data to Expense object and calls callback

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface ExpenseFormProps {
  currentUser: User;
  partnerUser: User;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}
```

**After:**
```typescript
interface ExpenseFormProps {
  onCancel: () => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { authService } from '../api/services/authService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function ExpenseForm({ onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category_id: 1,  // Changed from category string to category_id number
    description: '',
    date: new Date().toISOString().split('T')[0],
    paid_by_user_id: user?.id || 0,  // Changed from paidBy
    split_type: 'equal' as 'equal' | 'custom' | 'personal' | 'bill',  // Added 'bill'
    custom_split_ratio: 50  // Changed from splitRatio
  });
```

#### Step 3: Load Categories and Users
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const [categoriesData, usersData] = await Promise.all([
        categoryService.getCategories(),
        authService.getUsers()
      ]);
      setCategories(categoriesData);
      setUsers(usersData);

      // Set default category
      if (categoriesData.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
      }
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  loadData();
}, []);
```

#### Step 4: Update Form Submission
**Before:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const expense: Omit<Expense, 'id'> = {
    amount: parseFloat(formData.amount),
    category: formData.category,
    description: formData.description,
    date: formData.date,
    paidBy: formData.paidBy,
    splitType: formData.splitType,
    ...(formData.splitType === 'custom' && { splitRatio: formData.splitRatio }),
    ...(formData.recurring && {
      recurring: true,
      recurringDay: formData.recurringDay
    })
  };

  onAddExpense(expense);
};
```

**After:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    await expenseService.createExpense({
      amount: parseFloat(formData.amount),
      category_id: formData.category_id,
      description: formData.description,
      date: formData.date,
      paid_by_user_id: formData.paid_by_user_id,
      split_type: formData.split_type,
      ...(formData.split_type === 'custom' && { custom_split_ratio: formData.custom_split_ratio })
    });

    toast.success('Expense added successfully!');
    navigate('/dashboard');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to add expense');
  } finally {
    setLoading(false);
  }
};
```

#### Step 5: Update Form Fields

**Category Field (lines 92-106):**
```typescript
<div className="space-y-2">
  <Label htmlFor="category">Category</Label>
  <Select
    value={formData.category_id.toString()}
    onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
  >
    <SelectTrigger id="category">
      <SelectValue placeholder="Select a category" />
    </SelectTrigger>
    <SelectContent>
      {categories.map(cat => (
        <SelectItem key={cat.id} value={cat.id.toString()}>
          {cat.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Paid By Field (lines 120-133):**
```typescript
<div className="space-y-2">
  <Label htmlFor="paidBy">Paid By</Label>
  <Select
    value={formData.paid_by_user_id.toString()}
    onValueChange={(value) => setFormData({ ...formData, paid_by_user_id: parseInt(value) })}
  >
    <SelectTrigger id="paidBy">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {users.map(u => (
        <SelectItem key={u.id} value={u.id.toString()}>
          {u.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

**Split Type Field (lines 136-150):**
```typescript
<SelectContent>
  <SelectItem value="equal">Equal (50/50)</SelectItem>
  <SelectItem value="custom">Custom Split</SelectItem>
  <SelectItem value="personal">Personal (No Split)</SelectItem>
  <SelectItem value="bill">Bill</SelectItem>  {/* Added 'bill' option */}
</SelectContent>
```

**Custom Split Ratio Field:**
```typescript
const currentUser = users.find(u => u.id === user?.id);
const partnerUser = users.find(u => u.id !== user?.id);

{formData.split_type === 'custom' && (
  <div className="space-y-2">
    <Label htmlFor="splitRatio">
      {formData.paid_by_user_id === currentUser?.id ? currentUser?.name : partnerUser?.name}'s Share (%)
    </Label>
    <Input
      id="splitRatio"
      type="number"
      min="0"
      max="100"
      value={formData.custom_split_ratio}
      onChange={(e) => setFormData({ ...formData, custom_split_ratio: parseInt(e.target.value) })}
    />
    <p className="text-muted-foreground">
      {formData.paid_by_user_id === currentUser?.id ? partnerUser?.name : currentUser?.name}:{' '}
      {100 - formData.custom_split_ratio}%
    </p>
  </div>
)}
```

**Submit Button:**
```typescript
<Button type="submit" className="flex-1" disabled={loading}>
  {loading ? 'Adding...' : 'Add Expense'}
</Button>
```

---

## 3. ExpenseList Component

### Current State
- **File**: `src/components/ExpenseList.tsx`
- **Props**: Receives expenses, users, delete callback
- **Mock Usage**: Displays and filters expenses

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface ExpenseListProps {
  expenses: Expense[];
  currentUser: User;
  partnerUser: User;
  onDeleteExpense: (id: string) => void;
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface ExpenseListProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { expenseService } from '../api/services/expenseService';
import { toast } from 'sonner';

export function ExpenseList({ onNavigate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await expenseService.getExpenses('all');
        setExpenses(data);
      } catch (error) {
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };
```

#### Step 3: Fix Field Name Mismatches

**Line 27:**
```typescript
const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     expense.category_name.toLowerCase().includes(searchTerm.toLowerCase());  // category → category_name
```

**Line 28:**
```typescript
const matchesCategory = filterCategory === 'all' || expense.category_name === filterCategory;  // category → category_name
```

**Line 45:**
```typescript
const getUserName = (userId: number) => {  // string → number
  const user = users.find(u => u.id === userId);
  return user?.name || 'Unknown';
};
```

**Lines 49-57:**
```typescript
const getSplitBadge = (expense: Expense) => {
  if (expense.split_type === 'personal') {  // splitType → split_type
    return <Badge variant="outline">Personal</Badge>;
  }
  if (expense.split_type === 'equal') {
    return <Badge variant="secondary">50/50</Badge>;
  }
  return <Badge variant="default">{expense.custom_split_ratio}% Split</Badge>;  // splitRatio → custom_split_ratio
};
```

**Line 138:**
```typescript
{expense.recurring && (
  <Badge variant="outline" className="ml-2">Recurring</Badge>
)}
```
This field doesn't exist in backend - either remove or handle differently

**Line 142:**
```typescript
<TableCell>{expense.category_name}</TableCell>  // category → category_name
```

**Line 143:**
```typescript
<TableCell>{getUserName(expense.paid_by_user_id)}</TableCell>  // paidBy → paid_by_user_id, update function
```

**Line 144:**
```typescript
<TableCell>{getSplitBadge(expense)}</TableCell>
```

**Line 150:**
```typescript
onClick={() => handleDelete(expense.id)}
```

---

## 4. BudgetManager Component

### Current State
- **File**: `src/components/BudgetManager.tsx`
- **Props**: Receives budgets, expenses, update/delete callbacks
- **Mock Usage**: Manages budget CRUD operations

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface BudgetManagerProps {
  budgets: Budget[];
  expenses: Expense[];
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface BudgetManagerProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { toast } from 'sonner';

export function BudgetManager({ onNavigate }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const now = new Date();
      try {
        const [budgetsData, expensesData] = await Promise.all([
          budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
          expenseService.getExpenses('all')
        ]);
        setBudgets(budgetsData);
        setExpenses(expensesData);
      } catch (error) {
        toast.error('Failed to load budgets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
```

#### Step 3: Fix Field Name Mismatches

**Line 32:**
```typescript
spent: calculateCategorySpending(monthlyExpenses, budget.category_name)  // category → category_name
```

**Line 41:**
```typescript
const usedCategories = budgets.map(b => b.category_name);  // category → category_name
```

**Lines 46-49:**
```typescript
const newBudget: Omit<Budget, 'id'> = {
  category_id: 1,  // Need to get from category service
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  amount: parseFloat(formData.monthlyAmount),
  category_name: formData.category
};
```

**Lines 57-63:**
```typescript
const handleEdit = (budget: Budget) => {
  setEditingId(budget.id);
  setFormData({
    category: budget.category_name,  // category → category_name
    monthlyAmount: budget.amount.toString()  // monthlyAmount → amount
  });
};
```

**Lines 65-72:**
```typescript
const handleUpdate = async (id: number) => {
  try {
    // Backend uses POST for upsert
    await budgetService.createOrUpdateBudget({
      category_id: 1,  // Need to map category name to ID
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: parseFloat(formData.monthlyAmount)
    });

    // Reload budgets
    const now = new Date();
    const budgetsData = await budgetService.getBudgets(now.getMonth() + 1, now.getFullYear());
    setBudgets(budgetsData);

    setEditingId(null);
    setFormData({ category: 'Food', monthlyAmount: '' });
    toast.success('Budget updated');
  } catch (error) {
    toast.error('Failed to update budget');
  }
};
```

**Line 165:**
```typescript
<span>{budget.category_name}</span>  // category → category_name
```

**Line 167:**
```typescript
{formatCurrency(budget.amount)} / {formatCurrency(budget.amount)}  // monthlyAmount → amount
```

---

## 5. Analytics Component

### Current State
- **File**: `src/components/Analytics.tsx`
- **Props**: Receives expenses, budgets
- **Mock Usage**: Calculates analytics from local data

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface AnalyticsProps {
  expenses: Expense[];
  budgets: Budget[];
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface AnalyticsProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { expenseService } from '../api/services/expenseService';
import { analyticsService } from '../api/services/analyticsService';
import { toast } from 'sonner';

export function Analytics({ onNavigate }: AnalyticsProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, budgetsData] = await Promise.all([
          expenseService.getExpenses('all'),
          // Load current month budgets
          // Note: May need to adjust budget service to get all budgets
        ]);
        setExpenses(expensesData);
        setBudgets([]);

        // Load analytics from backend
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(new Date().setMonth(new Date().getMonth() - 5))
          .toISOString().split('T')[0];

        const trendsData = await analyticsService.getTrends(startDate, endDate);
        setAnalyticsData(trendsData);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
```

#### Step 3: Fix Field Name Mismatches

**Line 20:**
```typescript
acc[exp.category_name] = (acc[exp.category_name] || 0) + exp.amount;  // category → category_name
```

**Line 44:**
```typescript
const budgetComparison = budgets.map(budget => {
  const spent = categoryTotals[budget.category_name] || 0;  // category → category_name
  return {
    category: budget.category_name,  // category → category_name
    budget: budget.amount,  // monthlyAmount → amount
    spent: parseFloat(spent.toFixed(2))
  };
```

**Line 54:**
```typescript
const splitTypeData = monthlyExpenses.reduce((acc, exp) => {
  const type = exp.split_type === 'personal' ? 'Personal' :  // splitType → split_type
               exp.split_type === 'equal' ? 'Split 50/50' : 'Custom Split';
```

---

## 6. BillSplitting Component

### Current State
- **File**: `src/components/BillSplitting.tsx`
- **Props**: Receives expenses, users
- **Mock Usage**: Calculates balances locally

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface BillSplittingProps {
  expenses: Expense[];
  currentUser: User;
  partnerUser: User;
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface BillSplittingProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { expenseService } from '../api/services/expenseService';
import { analyticsService } from '../api/services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function BillSplitting({ onNavigate }: BillSplittingProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, settlementData] = await Promise.all([
          expenseService.getExpenses('all'),
          analyticsService.getCurrentSettlement()
        ]);
        setExpenses(expensesData);
        setSettlement(settlementData.settlement);
      } catch (error) {
        toast.error('Failed to load bill splitting data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
```

#### Step 3: Fix Field Name Mismatches

**Lines 20, 27-32, 35-39:**
All references to `exp.paidBy` → `exp.paid_by_user_id`
All references to `exp.splitType` → `exp.split_type`
All references to `exp.splitRatio` → `exp.custom_split_ratio`

**Line 43:**
```typescript
const getUserName = (userId: number) => {  // string → number
  // Find user from expenses or load users separately
  const expense = expenses.find(e => e.paid_by_user_id === userId);
  return expense?.paid_by_name || 'Unknown';
};
```

---

## 7. MonthlyStatement Component

### Current State
- **File**: `src/components/MonthlyStatement.tsx`
- **Props**: Receives expenses, budgets, income, users
- **Mock Usage**: Generates statements from local data

### Required Changes

#### Step 1: Update Props Interface
**Before:**
```typescript
interface MonthlyStatementProps {
  expenses: Expense[];
  budgets: Budget[];
  income: Income[];
  currentUser: User;
  partnerUser: User;
  onNavigate: (view: string) => void;
}
```

**After:**
```typescript
interface MonthlyStatementProps {
  onNavigate: (view: string) => void;
}
```

#### Step 2: Add API Integration
```typescript
import { useState, useEffect } from 'react';
import { expenseService } from '../api/services/expenseService';
import { summaryService } from '../api/services/summaryService';
import { toast } from 'sonner';

export function MonthlyStatement({ onNavigate }: MonthlyStatementProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, budgetsData, settlementData] = await Promise.all([
          expenseService.getExpenses('all'),
          // Load budgets for selected month
          summaryService.getSettlement(selectedMonth + 1, selectedYear)
        ]);
        setExpenses(expensesData);
        setBudgets(budgetsData);
        setSettlement(settlementData.settlement);
      } catch (error) {
        toast.error('Failed to load statement data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedMonth]);
```

#### Step 3: Fix Field Name Mismatches

Similar pattern:
- `budget.category` → `budget.category_name`
- `budget.monthlyAmount` → `budget.amount`
- `expense.category` → `expense.category_name`
- `expense.paidBy` → `expense.paid_by_user_id`
- `expense.splitType` → `expense.split_type`

---

## Implementation Priority

1. **Dashboard** - Easiest, foundation for others
2. **ExpenseList** - Simple read operations
3. **ExpenseForm** - Create operations
4. **BudgetManager** - CRUD operations
5. **Analytics** - Complex calculations
6. **BillSplitting** - Settlement calculations
7. **MonthlyStatement** - Full statement generation

## Common Issues to Watch

### Field Name Mismatches
- `category` (string) → `category_id` (number) + `category_name` (string)
- `paidBy` → `paid_by_user_id`
- `splitType` → `split_type`
- `splitRatio` → `custom_split_ratio`
- `monthlyAmount` → `amount` (in Budget)
- `id` type: `string` → `number`

### Loading States
Always add loading indicators:
```typescript
const [loading, setLoading] = useState(true);
```

### Error Handling
Always wrap API calls in try-catch:
```typescript
try {
  await apiCall();
  toast.success('Success message');
} catch (error) {
  toast.error('Error message');
}
```

### Toast Notifications
Import and use:
```typescript
import { toast } from 'sonner';
toast.success('Operation successful!');
toast.error('Operation failed!');
```

### Navigation
After successful operations, navigate back:
```typescript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

### useAuth
Get current user:
```typescript
import { useAuth } from '../context/AuthContext';
const { user } = useAuth();
```

---

## Testing Checklist

After implementing each component:

- [ ] Component renders without errors
- [ ] Data loads from API
- [ ] Loading states work
- [ ] Error messages display on failure
- [ ] Success messages display on success
- [ ] Form submissions work
- [ ] Navigation works after actions
- [ ] Field names match backend
- [ ] TypeScript types are correct
- [ ] No console errors

---

This plan provides a complete roadmap for converting all components from mock data to real API integration.
