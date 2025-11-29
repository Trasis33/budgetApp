import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Category } from '../types';
import { filterExpensesByMonth } from '../lib/utils';
import { calculateCategorySuggestions, getAlertPreferences, saveAlertPreferences, BudgetSuggestions } from '../lib/budgetSuggestions';
import { useNavigate } from 'react-router-dom';
import { Plus, Target, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { budgetService } from '../api/services/budgetService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { useScope } from '@/context/ScopeContext';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryColor } from '../lib/categoryColors';
import { getCategoryIconStyle } from '../lib/iconUtils';

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

/**
 * BudgetManager is a component that manages budgets and expenses for a user.
 * It displays a list of budgets and expenses, and allows the user to add, edit, and delete
 * budgets and expenses. It also displays a summary of the user's total budget and expenses.
 * The component is connected to the budget service and uses the useBudgetData and
 * useBudgetCalculations custom hooks to fetch and calculate budget data.
 *
 * @param {BudgetManagerProps} props - The props for the BudgetManager component.
 * @returns {JSX.Element} - The BudgetManager component.
 */
export function BudgetManager({ onNavigate }: BudgetManagerProps = {}) {
  const navigate = useNavigate();
  const { isLoading: scopeLoading } = useScope();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Month/Year selection state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalSelectedCategory, setModalSelectedCategory] = useState<Category | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [suggestions, setSuggestions] = useState<BudgetSuggestions | null>(null);
  const [alertAt80Percent, setAlertAt80Percent] = useState(true);
  const [alertOnExceed, setAlertOnExceed] = useState(true);
  
  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Use custom hooks for data and calculations
  const { budgets, expenses, loading, error, refetch } = useBudgetData(selectedMonth, selectedYear);
  const monthlyExpenses = filterExpensesByMonth(expenses, selectedYear, selectedMonth - 1);
  
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

  useEffect(() => {
    if (modalSelectedCategory) {
      const sug = calculateCategorySuggestions(modalSelectedCategory.name, monthlyExpenses);
      setSuggestions(sug);
    } else {
      setSuggestions(null);
    }
  }, [modalSelectedCategory, monthlyExpenses]);

  useEffect(() => {
    if (isModalOpen) {
      // Load alert preferences when modal opens (we'll use a dummy user ID for now)
      const prefs = getAlertPreferences(1);
      setAlertAt80Percent(prefs.alertAt80Percent);
      setAlertOnExceed(prefs.alertOnExceed);
    }
  }, [isModalOpen]);

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

  const handleModalSubmit = async (saveAndAddAnother: boolean = false) => {
    if (!modalSelectedCategory || !modalAmount) {
      toast.error('Please select a category and enter an amount');
      return;
    }

    try {
      await budgetService.createOrUpdateBudget({
        category_id: modalSelectedCategory.id,
        month: selectedMonth,
        year: selectedYear,
        amount: parseFloat(modalAmount)
      });

      // Save alert preferences
      saveAlertPreferences(1, {
        alertAt80Percent,
        alertOnExceed
      });

      await refetch();

      if (saveAndAddAnother) {
        setModalSelectedCategory(null);
        setModalAmount('');
        setModalSearchTerm('');
        setSuggestions(null);
        toast.success('✨ Budget goal set! Add another one');
      } else {
        setModalSelectedCategory(null);
        setModalAmount('');
        setModalSearchTerm('');
        setIsModalOpen(false);
        toast.success('✨ Budget goal set! We\'ll track your progress');
      }
    } catch (error) {
      toast.error('Could not create budget. Please check your amount and try again');
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getMonthOptions = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames.map((name, index) => ({
      value: (index + 1).toString(),
      label: name
    }));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border bg-input-background">
                <button
                  onClick={handlePreviousMonth}
                  className="p-0.5 hover:bg-accent rounded transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-1">
                  <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                    <SelectTrigger className="h-8 w-[110px] border-0 bg-transparent px-2 focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthOptions().map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-8 w-[75px] border-0 bg-transparent px-2 focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getYearOptions().map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-0.5 hover:bg-accent rounded transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {availableCategories.length > 0 && (
                <Button onClick={handleAddBudget} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add budget
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetsWithSpending.length > 0 ? (
              <BudgetTable
                budgets={budgetsWithSpending}
                onDelete={handleDelete}
                deleteConfirmId={deleteConfirmId}
                onUpdate={refetch}
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
                {availableCategories.length === 0 ? (
                  <div className="text-center py-8 p-3 border rounded-lg bg-muted/30">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-sm mb-2">All categories have budgets!</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Want to adjust an existing one instead?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsModalOpen(false);
                      }}
                    >
                      View Existing Budgets
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 You can delete a budget to create a different one
                    </p>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search categories..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg bg-muted/50">
                      {availableCategories
                        .filter(cat => cat.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                        .map((category) => {
                          const IconComponent = getIconByName(category.icon);
                          const categoryColor = getCategoryColor(category);
                          
                          return (
                            <div
                              key={category.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                modalSelectedCategory?.id === category.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-accent'
                              }`}
                              onClick={() => setModalSelectedCategory(category)}
                            >
                              <div 
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                style={getCategoryIconStyle(categoryColor, false, 0.2)}
                              >
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{category.name}</p>
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
                          );
                        })}
                    </div>
                  </>
                )}
              </div>

              {availableCategories.length > 0 && (
                <>
                  {/* Budget Amount */}
                  <div className="space-y-3">
                    <Label>Monthly Budget Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">kr</span>
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

                    {/* Quick Suggestions */}
                    {suggestions && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Quick suggestions based on recent spending:</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setModalAmount(suggestions.matchAvg.toString())}
                            className="px-3 py-1 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-all"
                          >
                            Match avg: kr{suggestions.matchAvg}
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalAmount(suggestions.plusTen.toString())}
                            className="px-3 py-1 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-all"
                          >
                            +10%: kr{suggestions.plusTen}
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalAmount(suggestions.minusTen.toString())}
                            className="px-3 py-1 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-all"
                          >
                            -10%: kr{suggestions.minusTen}
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalAmount(suggestions.rounded.toString())}
                            className="px-3 py-1 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-all"
                          >
                            Round: kr{suggestions.rounded}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alert Preferences */}
                  <div className="space-y-3">
                    <Label>Alert me when</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertAt80Percent}
                          onChange={(e) => setAlertAt80Percent(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">I reach 80% of budget</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertOnExceed}
                          onChange={(e) => setAlertOnExceed(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">I exceed the budget</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              {availableCategories.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => handleModalSubmit(true)}
                >
                  Save & Add Another
                </Button>
              )}
              <Button onClick={() => handleModalSubmit(false)}>
                Add Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
