import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Budget, Category } from '../types';
import { filterExpensesByMonth } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, PlusCircle } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { useScope } from '@/context/ScopeContext';

// Import new budget components
import { 
  BudgetHeader,
  BudgetMetricsGrid,
  BudgetTable,
  type BudgetWithSpending
} from './budget';
import { useBudgetData, useBudgetCalculations } from '../hooks';

interface BudgetManagerProps {
  onNavigate?: (view: string) => void;
}

export function BudgetManager({ onNavigate }: BudgetManagerProps) {
  const navigate = useNavigate();
  const { currentScope, isLoading: scopeLoading } = useScope();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    category_id: 1,
    amount: ''
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Use custom hooks for data and calculations
  const { budgets, expenses, loading, error, refetch } = useBudgetData(currentMonth, currentYear);
  const monthlyExpenses = filterExpensesByMonth(expenses, currentYear, now.getMonth());
  
  const { budgetsWithSpending, metrics } = useBudgetCalculations(budgets, monthlyExpenses);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        toast.error('Having trouble loading categories. Check your connection and try again');
      }
    };

    if (!scopeLoading) {
      loadCategories();
    }
  }, [scopeLoading]);

  const getScopeTitle = () => {
    switch (currentScope) {
      case 'ours': return 'Our';
      case 'mine': return 'My';
      case 'partner': return "Partner's";
      default: return 'My';
    }
  };

  const getOverallMessage = () => {
    if (metrics.overallProgress <= 50) return "Excellent! You're staying well within your budgets";
    if (metrics.overallProgress <= 80) return "Nice work! You're managing your budgets well";
    if (metrics.overallProgress <= 100) return "You're approaching your total budget limit";
    return "You've exceeded your total budget – let's review and adjust";
  };

  const usedCategories = budgets.map(b => b.category_name);
  const availableCategories = categories.filter(cat => !usedCategories.includes(cat.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await budgetService.createOrUpdateBudget({
        category_id: formData.category_id,
        month: currentMonth,
        year: currentYear,
        amount: parseFloat(formData.amount)
      });

      refetch();
      setFormData({ category_id: categories[0]?.id || 1, amount: '' });
      setIsAdding(false);
      toast.success('✨ Budget goal set! We\'ll track your progress');
    } catch (error) {
      toast.error('Could not create budget. Please check your amount and try again');
    }
  };

  const handleEdit = (budget: BudgetWithSpending) => {
    setEditingId(budget.id);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString()
    });
  };

  const handleDelete = async (budgetId: number) => {
    try {
      await budgetService.deleteBudget(budgetId);
      refetch();
      toast.success('Budget removed');
    } catch (error) {
      toast.error('Could not delete budget. Please try again');
    }
  };

  const handleExport = () => {
    // Export functionality - can be implemented later
    toast.info('Export functionality coming soon!');
  };

  const handleAddBudget = () => {
    setIsAdding(true);
  };

  const handleBack = () => {
    navigate('/dashboard');
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600">Failed to load budgets. Please try again.</p>
          <Button onClick={refetch} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BudgetHeader
        title={`${getScopeTitle()} Budget Goals`}
        subtitle="Plan your spending before it happens. Set realistic budgets and we'll show you how you're doing."
        onBack={handleBack}
        onExport={handleExport}
        onAddBudget={handleAddBudget}
        showAddButton={!isAdding && availableCategories.length > 0}
      />

      <div className="space-y-6">
        {/* Overall Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How you're doing overall
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.totalBudget > 0 ? (
              <div className="space-y-4">
                <BudgetMetricsGrid metrics={metrics} />
                
                <div className="pt-4 border-t">
                  <p className={`text-sm ${
                    metrics.overallStatus === 'danger' ? 'text-red-700' : 
                    metrics.overallStatus === 'warning' ? 'text-orange-700' : 'text-green-700'
                  }`}>
                    {getOverallMessage()}
                  </p>
                </div>
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

        {/* Category Budgets Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category budgets
            </CardTitle>
            {!isAdding && availableCategories.length > 0 && (
              <Button onClick={handleAddBudget} size="sm" className="gap-2">
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

            {budgetsWithSpending.length > 0 ? (
              <BudgetTable
                budgets={budgetsWithSpending}
                onEdit={handleEdit}
                onDelete={handleDelete}
                editingBudgetId={editingId || undefined}
              />
            ) : (
              !isAdding && (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to plan ahead?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Budgets help you decide what to spend before you spend it. 
                    Start with categories you spend on most – groceries, gas, fun money.
                  </p>
                  <div className="space-y-3 max-w-xs mx-auto">
                    <Button onClick={handleAddBudget} className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create my first budget
                    </Button>
                    <p className="text-xs text-gray-500">
                      💡 Pro tip: Start with 2-3 categories, you can always add more
                    </p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
