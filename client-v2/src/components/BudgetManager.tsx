import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Budget, Expense, Category } from '../types';
import { formatCurrency, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { ArrowLeft, Plus, Pencil, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';

interface BudgetManagerProps {
  onNavigate: (view: string) => void;
}

export function BudgetManager({ onNavigate }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    category_id: 1,
    amount: ''
  });

  const now = new Date();
  const monthlyExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [budgetsData, expensesData, categoriesData] = await Promise.all([
          budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
          expenseService.getExpenses('all'),
          categoryService.getCategories()
        ]);
        setBudgets(budgetsData);
        setExpenses(expensesData);
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        toast.error('Failed to load budgets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const budgetsWithSpending = budgets.map(budget => ({
    ...budget,
    spent: calculateCategorySpending(monthlyExpenses, budget.category_name),
    progress: getBudgetProgress(budget, calculateCategorySpending(monthlyExpenses, budget.category_name))
  })).sort((a, b) => b.spent - a.spent);

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const usedCategories = budgets.map(b => b.category_name);
  const availableCategories = categories.filter(cat => !usedCategories.includes(cat.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await budgetService.createOrUpdateBudget({
        category_id: formData.category_id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        amount: parseFloat(formData.amount)
      });

      const budgetsData = await budgetService.getBudgets(now.getMonth() + 1, now.getFullYear());
      setBudgets(budgetsData);

      setFormData({ category_id: categories[0]?.id || 1, amount: '' });
      setIsAdding(false);
      toast.success('Budget created');
    } catch (error) {
      toast.error('Failed to create budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString()
    });
  };

  const handleUpdate = async (id: number) => {
    try {
      await budgetService.createOrUpdateBudget({
        category_id: formData.category_id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        amount: parseFloat(formData.amount)
      });

      const budgetsData = await budgetService.getBudgets(now.getMonth() + 1, now.getFullYear());
      setBudgets(budgetsData);

      setEditingId(null);
      setFormData({ category_id: categories[0]?.id || 1, amount: '' });
      toast.success('Budget updated');
    } catch (error) {
      toast.error('Failed to update budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Budget Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Total Spent this Month</p>
                  <p>{formatCurrency(totalSpent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Total Budget</p>
                  <p>{formatCurrency(totalBudget)}</p>
                </div>
              </div>
              <Progress 
                value={overallProgress} 
                className={overallProgress >= 100 ? '[&>div]:bg-red-500' : ''}
              />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {overallProgress.toFixed(1)}% of budget used
                </span>
                {overallProgress >= 90 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {overallProgress >= 100 ? 'Over budget!' : 'Almost at limit'}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Category Budgets</CardTitle>
            {!isAdding && availableCategories.length > 0 && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isAdding && (
              <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    >
                      {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monthly Budget</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Add</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {budgetsWithSpending.map(budget => (
              <div key={budget.id} className="space-y-3 p-4 border rounded-lg">
                {editingId === budget.id ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={budget.category_name} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Budget</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(budget.id)}>Save</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3>{budget.category_name}</h3>
                        <p className="text-muted-foreground">
                          {formatCurrency(budget.spent || 0)} of {formatCurrency(budget.amount || 0)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={budget.progress || 0}
                      className={(budget.progress || 0) >= 100 ? '[&>div]:bg-red-500' : ''}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {(budget.progress || 0).toFixed(1)}% used
                      </span>
                      <span className={(budget.progress || 0) >= 100 ? 'text-red-500' : 'text-green-600'}>
                        {formatCurrency((budget.amount || 0) - (budget.spent || 0))} remaining
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {budgetsWithSpending.length === 0 && !isAdding && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No budgets set yet</p>
                <Button onClick={() => setIsAdding(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Budget
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
