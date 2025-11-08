import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useNavigate } from 'react-router-dom';
import { Plus, Target } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { toast } from 'sonner';
import { useScope } from '@/context/ScopeContext';
import { useBudgetData, useBudgetCalculations } from '../hooks';
import { BudgetHeader, BudgetMetricsGrid, BudgetTable } from './budget';
import { getOverallMessage } from '../lib/budgetUtils';

interface BudgetManagerProps {
  onNavigate: (view: string) => void;
}

export function BudgetManager({ }: BudgetManagerProps) {
  const navigate = useNavigate();
  const { currentScope, isLoading: scopeLoading } = useScope();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [formData, setFormData] = useState({
    category_id: 1,
    amount: ''
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Use custom hooks for data and calculations
  const { budgets, expenses, categories, loading, refetch } = useBudgetData(
    currentMonth,
    currentYear,
    currentScope
  );

  const { budgetsWithSpending, metrics } = useBudgetCalculations(
    budgets,
    expenses,
    currentYear,
    now.getMonth()
  );

  // Set initial form category when categories load
  if (categories.length > 0 && formData.category_id === 1 && categories[0].id !== 1) {
    setFormData(prev => ({ ...prev, category_id: categories[0].id }));
  }

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

      await refetch();
      setFormData({ category_id: categories[0]?.id || 1, amount: '' });
      setIsAdding(false);
      toast.success('✨ Budget goal set! We\'ll track your progress');
    } catch (error) {
      toast.error('Could not create budget. Please check your amount and try again');
    }
  };

  const handleEdit = (budget: typeof budgetsWithSpending[0]) => {
    setEditingId(budget.id);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString()
    });
  };

  const handleUpdate = async () => {
    try {
      await budgetService.createOrUpdateBudget({
        category_id: formData.category_id,
        month: currentMonth,
        year: currentYear,
        amount: parseFloat(formData.amount)
      });

      await refetch();
      setEditingId(null);
      setFormData({ category_id: categories[0]?.id || 1, amount: '' });
      toast.success('✨ Budget updated successfully');
    } catch (error) {
      toast.error('Could not update budget. Please try again');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await budgetService.deleteBudget(id);
      await refetch();
      toast.success('Budget removed');
    } catch (error) {
      toast.error('Could not delete budget. Please try again');
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // In a full implementation, this would trigger data refresh for different periods
    // For now, we only show current month
  };

  if (loading || scopeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting your budget goals ready...</p>
        </div>
      </div>
    );
  }

  const scopeTitle = currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's";
  const scopeSubtitle = `Plan your ${currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} spending before it happens. ${budgetsWithSpending.length > 0 ? "Track how you're doing" : "Get started by setting budgets"}.`;

  return (
    <div className="p-6">
      <BudgetHeader
        title={`${scopeTitle} Budget Goals`}
        subtitle={scopeSubtitle}
        onBack={() => navigate('/dashboard')}
        onAdd={availableCategories.length > 0 ? () => setIsAdding(true) : undefined}
      />

      {/* Metrics Grid */}
      {metrics.totalBudget > 0 && (
        <BudgetMetricsGrid metrics={metrics} />
      )}

      {/* Overall Status Card */}
      {metrics.totalBudget > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Budget Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${
              metrics.overallStatus === 'danger' ? 'text-red-700' :
              metrics.overallStatus === 'warning' ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {getOverallMessage(metrics.overallProgress, metrics.totalSpent, metrics.totalBudget)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {metrics.totalBudget === 0 && !isAdding && (
        <Card className="mb-6">
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to set your first budget?
            </h3>
            <p className="text-gray-600 mb-4">
              Budgets help you plan spending before it happens. Start with categories 
              you spend on most – groceries, gas, or fun money.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              💡 Pro tip: Start with 2-3 categories, you can always add more
            </p>
            {availableCategories.length > 0 && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create my first budget
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Budget Form */}
      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="amount">Monthly Budget (SEK)</Label>
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
                <Button type="submit">Add Budget</Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Budget Form */}
      {editingId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input 
                    value={budgetsWithSpending.find(b => b.id === editingId)?.category_name || ''} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Budget (SEK)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Table */}
      {budgetsWithSpending.length > 0 && (
        <BudgetTable
          budgets={budgetsWithSpending}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingId={editingId}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}

