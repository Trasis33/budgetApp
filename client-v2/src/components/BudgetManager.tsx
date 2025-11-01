import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Budget, Expense, CATEGORIES } from '../types';
import { formatCurrency, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { ArrowLeft, Plus, Pencil, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  expenses: Expense[];
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onNavigate: (view: string) => void;
}

export function BudgetManager({ budgets, expenses, onUpdateBudget, onDeleteBudget, onNavigate }: BudgetManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    monthlyAmount: ''
  });

  const now = new Date();
  const monthlyExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());

  const budgetsWithSpending = budgets.map(budget => ({
    ...budget,
    spent: calculateCategorySpending(monthlyExpenses, budget.category),
    progress: getBudgetProgress(budget, calculateCategorySpending(monthlyExpenses, budget.category))
  })).sort((a, b) => b.spent - a.spent);

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyAmount, 0);
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const overallProgress = (totalSpent / totalBudget) * 100;

  const usedCategories = budgets.map(b => b.category);
  const availableCategories = CATEGORIES.filter(cat => !usedCategories.includes(cat));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBudget: Budget = {
      id: Date.now().toString(),
      category: formData.category,
      monthlyAmount: parseFloat(formData.monthlyAmount)
    };

    onUpdateBudget(newBudget);
    setFormData({ category: 'Food', monthlyAmount: '' });
    setIsAdding(false);
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      category: budget.category,
      monthlyAmount: budget.monthlyAmount.toString()
    });
  };

  const handleUpdate = (id: string) => {
    onUpdateBudget({
      id,
      category: formData.category,
      monthlyAmount: parseFloat(formData.monthlyAmount)
    });
    setEditingId(null);
    setFormData({ category: 'Food', monthlyAmount: '' });
  };

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
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
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
                      value={formData.monthlyAmount}
                      onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
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
                        <Input value={budget.category} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Budget</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.monthlyAmount}
                          onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
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
                        <h3>{budget.category}</h3>
                        <p className="text-muted-foreground">
                          {formatCurrency(budget.spent)} of {formatCurrency(budget.monthlyAmount)}
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
                      value={budget.progress} 
                      className={budget.progress >= 100 ? '[&>div]:bg-red-500' : ''}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {budget.progress.toFixed(1)}% used
                      </span>
                      <span className={budget.progress >= 100 ? 'text-red-500' : 'text-green-600'}>
                        {formatCurrency(budget.monthlyAmount - budget.spent)} remaining
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
