import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Budget, Category } from '../types';
import { filterExpensesByMonth } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, PlusCircle } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { useScope } from '@/context/ScopeContext';

// Import new budget components
import { 
  BudgetHeader,
  BudgetMetricsGrid,
  BudgetTable
} from './budget';
import { useBudgetData, useBudgetCalculations } from '../hooks';

interface BudgetManagerProps {
  onNavigate?: (view: string) => void;
}

export function BudgetManager({ onNavigate }: BudgetManagerProps = {}) {
  const navigate = useNavigate();
  const { isLoading: scopeLoading } = useScope();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalSelectedCategory, setModalSelectedCategory] = useState<Category | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  
  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

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

        // Categories loaded successfully
      } catch (error) {
        toast.error('Having trouble loading categories. Check your connection and try again');
      }
    };

    if (!scopeLoading) {
      loadCategories();
    }
  }, [scopeLoading]);

  const usedCategories = budgets.map(b => b.category_name);
  const availableCategories = categories.filter(cat => !usedCategories.includes(cat.name));


  const handleDelete = async (budgetId: number) => {
    // First click - show warning and change icon
    if (deleteConfirmId !== budgetId) {
      setDeleteConfirmId(budgetId);
      toast.warning('Click again to confirm deletion', {
        duration: 3000,
        action: {
          label: 'Cancel',
          onClick: () => setDeleteConfirmId(null)
        }
      });
      return;
    }
    
    // Second click - actually delete
    try {
      await budgetService.deleteBudget(budgetId);
      refetch();
      setDeleteConfirmId(null);
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
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!modalSelectedCategory || !modalAmount) {
      toast.error('Please select a category and enter an amount');
      return;
    }

    try {
      await budgetService.createOrUpdateBudget({
        category_id: modalSelectedCategory.id,
        month: currentMonth,
        year: currentYear,
        amount: parseFloat(modalAmount)
      });

      await refetch();
      setModalSelectedCategory(null);
      setModalAmount('');
      setModalSearchTerm('');
      setIsModalOpen(false);
      toast.success('✨ Budget goal set! We\'ll track your progress');
    } catch (error) {
      toast.error('Could not create budget. Please check your amount and try again');
    }
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
        title="Budget Manager"
        subtitle="September 2025 • Partner Connected"
        onBack={handleBack}
        onExport={handleExport}
        onAddBudget={handleAddBudget}
      />

      <div className="space-y-6">
          {/* <CardContent> */}
            {metrics.totalBudget > 0 ? (
              <div className="space-y-4">
                <BudgetMetricsGrid metrics={metrics} />
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

        {/* Category Budgets Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category budgets
            </CardTitle>
            {availableCategories.length > 0 && (
              <Button onClick={handleAddBudget} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add budget
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetsWithSpending.length > 0 ? (
              <BudgetTable
                budgets={budgetsWithSpending}
                onDelete={handleDelete}
                deleteConfirmId={deleteConfirmId}
              />
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Add Budget Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label>Category</Label>
                <Input
                  placeholder="Search categories..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg bg-muted/50">
                  {availableCategories
                    .filter(cat => cat.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                    .map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          modalSelectedCategory?.id === category.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-accent'
                        }`}
                        onClick={() => setModalSelectedCategory(category)}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">Category description</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          modalSelectedCategory?.id === category.id
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {modalSelectedCategory?.id === category.id && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Budget Amount */}
              <div className="space-y-3">
                <Label>Monthly Budget Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    placeholder="0.00"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    className="pl-8"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleModalSubmit}>
                Add Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
