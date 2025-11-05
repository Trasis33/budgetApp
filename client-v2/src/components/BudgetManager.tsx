import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Budget, Expense, Category } from '../types';
import { formatCurrency, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, TrendingUp, AlertCircle, PieChart, Target, PlusCircle } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';

interface BudgetManagerProps {
  onNavigate: (view: string) => void;
}

export function BudgetManager({ onNavigate }: BudgetManagerProps) {
  const navigate = useNavigate();
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
        toast.error('Having trouble loading budgets. Check your connection and try again');
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

  const getBudgetMessage = (spent: number, budgetAmount: number) => {
    const percentage = (spent / budgetAmount) * 100;
    if (percentage <= 50) return "Great start! You're well within budget";
    if (percentage <= 80) return "Looking good! You're using your budget wisely";
    if (percentage <= 100) return "Getting close to your limit";
    return "You've reached your budget goal";
  };

  const getOverallMessage = () => {
    if (overallProgress <= 50) return "Excellent! You're staying well within your budgets";
    if (overallProgress <= 80) return "Nice work! You're managing your budgets well";
    if (overallProgress <= 100) return "You're approaching your total budget limit";
    return "You've exceeded your total budget – let's review and adjust";
  };

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
      toast.success('✨ Budget goal set! We\'ll track your progress');
    } catch (error) {
      toast.error('Could not create budget. Please check your amount and try again');
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
      toast.success('✨ Budget updated successfully');
    } catch (error) {
      toast.error('Could not update budget. Please try again');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting your budget goals ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Budget goals</h1>
        <p className="text-gray-600">
          Plan your spending before it happens. Set realistic budgets and we'll 
          {budgetsWithSpending.length > 0 ? ' show you how you\'re doing' : ' help you get started'}.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              How you're doing overall
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalBudget > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total spent this month</p>
                    <p className="text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your total budget</p>
                    <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
                  </div>
                </div>
                <Progress 
                  value={Math.min(overallProgress, 100)} 
                  className={overallProgress >= 100 ? '[&>div]:bg-red-500' : overallProgress >= 80 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {overallProgress.toFixed(1)}% of budget used
                  </span>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      overallProgress >= 100 ? 'text-red-600' : 
                      overallProgress >= 80 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {overallProgress >= 100 
                        ? `Over by ${formatCurrency(totalSpent - totalBudget)}`
                        : `${formatCurrency(totalBudget - totalSpent)} remaining`
                      }
                    </p>
                  </div>
                </div>
                <p className={`text-sm ${
                  overallProgress >= 100 ? 'text-red-700' : 
                  overallProgress >= 80 ? 'text-orange-700' : 'text-green-700'
                }`}>
                  {getOverallMessage()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to set your first budget?
                </h3>
                <p className="text-gray-600 mb-4">
                  Budgets help you plan spending before it happens. Start with categories 
                  you spend on most – groceries, gas, or fun money.
                </p>
                <p className="text-xs text-gray-500">
                  💡 Pro tip: Start with 2-3 categories, you can always add more
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category budgets
            </CardTitle>
            {!isAdding && availableCategories.length > 0 && (
              <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add budget
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
                    <p className="text-xs text-gray-500 mt-1">
                      {getBudgetMessage(budget.spent || 0, budget.amount || 0)}
                    </p>
                  </>
                )}
              </div>
            ))}

            {budgetsWithSpending.length === 0 && !isAdding && (
              <div className="text-center py-12">
                <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to plan ahead?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Budgets help you decide what to spend before you spend it. 
                  Start with categories you spend on most – groceries, gas, fun money.
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <Button onClick={() => setIsAdding(true)} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create my first budget
                  </Button>
                  <p className="text-xs text-gray-500">
                    💡 Pro tip: Start with 2-3 categories, you can always add more
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
