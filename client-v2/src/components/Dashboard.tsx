import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Expense, Budget, Category } from '../types';
import { formatCurrency, formatDate, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Receipt, ArrowRight, Users, User, Heart, Settings, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerInviteModal } from './PartnerInviteModal';
import { RecurringTemplatesDialog } from './RecurringTemplatesDialog';
import { RecurringCard } from './RecurringCard';
import { BudgetVsActualWidget } from './dashboard/BudgetVsActualWidget';
import { expenseService } from '../api/services/expenseService';
import { budgetService } from '../api/services/budgetService';
import { categoryService } from '../api/services/categoryService';
import { useRecurringSummary, useRecurringGeneration } from '../hooks';
import { toast } from 'sonner';
import { useScope } from '../context/ScopeContext';
import { useDate } from '../context/DateContext';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryColor } from '../lib/categoryColors';
import { getCategoryIconStyle } from '../lib/iconUtils';


interface DashboardProps {
  onNavigate: (view: string) => void;
}

export interface DashboardPropsExport {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate: _onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { isPartnerConnected, currentScope, setScope, isLoading: scopeLoading, summary } = useScope();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);

  const { selectedMonth, selectedYear, formattedDate } = useDate();
  // Convert 1-indexed month from context to 0-indexed for filtering
  const currentMonth = selectedMonth - 1;
  const currentYear = selectedYear;
  const now = new Date(); // For day-of-month calculations

  // Recurring expenses
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;
  const { templates: recurringTemplates, summary: recurringSummary, refresh: refreshRecurring } = useRecurringSummary({
    start: monthStart,
    end: monthEnd,
    expenses: allExpenses
  });
  const { generate: generateRecurring, isGenerating } = useRecurringGeneration();

  const refreshExpensesData = useCallback(async () => {
    const [scopedExpenses, combinedExpenses] = await Promise.all([
      expenseService.getExpenses(currentScope),
      expenseService.getExpenses('all')
    ]);
    setExpenses(scopedExpenses);
    setAllExpenses(combinedExpenses);
  }, [currentScope]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          (async () => {
            await refreshExpensesData();
          })(),
          (async () => {
            const budgetsData = await budgetService.getBudgets(selectedMonth, selectedYear);
            setBudgets(budgetsData);
          })(),
          (async () => {
            const categoriesData = await categoryService.getCategories();
            setCategories(categoriesData);
          })()
        ]);
      } catch (error) {
        toast.error('Having trouble loading your dashboard. Try refreshing the page');
      } finally {
        setLoading(false);
      }
    };

    if (!scopeLoading) {
      loadData();
    }
  }, [currentScope, scopeLoading, refreshExpensesData, selectedMonth, selectedYear]);

  if (loading || scopeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting your money picture ready...</p>
        </div>
      </div>
    );
  }

  const monthlyExpenses = filterExpensesByMonth(expenses, currentYear, currentMonth);

  // Separate variable (budgeted) vs fixed (recurring) expenses
  const budgetedCategoryIds = new Set(budgets.map(b => b.category_id));
  const variableExpenses = monthlyExpenses.filter(exp => budgetedCategoryIds.has(exp.category_id));
  const fixedExpenses = monthlyExpenses.filter(exp => exp.recurring_expense_id != null);

  const variableSpent = variableExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const fixedSpent = fixedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthExpenses = filterExpensesByMonth(expenses, previousYear, previousMonth);
  const previousMonthVariableExpenses = previousMonthExpenses.filter(exp => budgetedCategoryIds.has(exp.category_id));
  const previousMonthVariableTotal = previousMonthVariableExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const spendingChange = previousMonthVariableTotal > 0
    ? ((variableSpent - previousMonthVariableTotal) / previousMonthVariableTotal) * 100
    : 0;

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const budgetProgress = totalBudget > 0 ? (variableSpent / totalBudget) * 100 : 0;

  // Separate recent variable vs fixed expenses for display
  const recentVariableExpenses = [...monthlyExpenses]
    .filter(exp => exp.recurring_expense_id == null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentFixedExpenses = [...fixedExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const budgetsWithSpending = budgets.map(budget => ({
    ...budget,
    spent: calculateCategorySpending(monthlyExpenses, budget.category_name)
  })).filter(b => b.spent > 0);

  // Helper function for budget progress text color
  const getProgressTextColor = (progress: number) => {
    if (progress > 100) return 'text-red-500'; // Above budget - red/coral
    if (progress === 100) return 'text-amber-500'; // At budget - amber/yellow
    return 'text-emerald-600'; // Under budget - mint/emerald color
  };

  const getPartnerInitial = (name?: string) => {
    return name?.charAt(0).toUpperCase() || 'U';
  };

  const getPartnerAvatarStyle = (isCurrentUser: boolean) => {
    if (isCurrentUser && user?.color) {
      return { backgroundColor: user.color, color: 'white' };
    }
    if (!isCurrentUser && summary?.couple?.partner?.color) {
      return { backgroundColor: summary.couple.partner.color, color: 'white' };
    }
    // Fallback to CSS classes when no color is set
    return {};
  };

  const getPartnerAvatarClass = (isCurrentUser: boolean) => {
    return isCurrentUser ? 'partner-avatar-primary' : 'partner-avatar-secondary';
  };

  const getExpenseCategoryColor = (expense: Expense, budgets: Budget[]) => {
    // First try to use the expense's own category color
    if (expense.category_color) {
      return getCategoryColor({ color: expense.category_color });
    }

    // Fallback: find the matching budget to get the category color
    const matchingBudget = budgets.find(b => b.category_id === expense.category_id);
    if (matchingBudget?.category_color) {
      return getCategoryColor({ color: matchingBudget.category_color });
    }

    // Final fallback: use default color
    return getCategoryColor({});
  };

  // Remove local hexToRgba function since we're using the centralized one

  return (
    <div className="p-6">
      {/* Scope Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="scope-selector w-fit">
          <div
            className={`scope-option ${currentScope === 'ours' ? 'active' : ''}`}
            onClick={() => setScope('ours')}
          >
            <Users className="w-4 h-4" />
            Shared
          </div>
          <div
            className={`scope-option ${currentScope === 'mine' ? 'active' : ''}`}
            onClick={() => setScope('mine')}
          >
            <User className="w-4 h-4" />
            Personal
          </div>
          <div
            className={`scope-option ${currentScope === 'partner' ? 'active' : ''}`}
            onClick={() => setScope('partner')}
          >
            <Heart className="w-4 h-4" />
            Partner
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPartnerConnected && (
            <div className="flex items-center gap-2">
              <div
                className={`partner-avatar ${user?.color ? '' : 'partner-avatar-primary'}`}
                style={getPartnerAvatarStyle(true)}
              >
                {getPartnerInitial(user?.name)}
              </div>
              <div
                className={`partner-avatar ${summary?.couple?.partner?.color ? '' : 'partner-avatar-secondary'}`}
                style={getPartnerAvatarStyle(false)}
              >
                {getPartnerInitial(summary?.couple?.partner?.name)}
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Partner Invitation Banner for Unpaired Users */}
      {monthlyExpenses.length === 0 && expenses.length === 0 && (
        <div style={{
          background: 'linear-gradient(to right, #fdf2f8, #fef2f2)',
          borderColor: '#fce7f3'
        }} className="rounded-lg p-6 border mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                💕 Ready to team up?
              </h2>
              <p className="text-gray-600 mb-4">
                CouplesFlow works best when you and your partner track money together.
                Invite them to start managing expenses as a team!
              </p>
              <div className="space-y-3">
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Send partner invitation
                </Button>
                <p className="text-xs text-gray-500">
                  💡 Don't worry - you can still track expenses while you wait
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      {monthlyExpenses.length > 0 && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                👋 Hey{isPartnerConnected ? ` ${user?.name} & ${summary?.couple?.partner?.name}` : ` ${user?.name}`}! Here's your {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} money at a glance
              </h2>
              <p className="text-gray-600 mb-3">
                This {formattedDate.split(' ')[0]} you've tracked <strong>{monthlyExpenses.length} {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} expenses</strong> totalling <strong>{formatCurrency(totalSpent)}</strong>
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`status-dot ${budgetProgress < 80 ? 'status-dot-teal' : budgetProgress < 100 ? 'status-dot-amber' : 'status-dot-coral'}`}></div>
                  <span className="text-gray-600">
                    {budgetProgress < 80 ? 'On track with budget' : budgetProgress < 100 ? 'Approaching budget limit' : 'Over budget'}
                  </span>
                </div>
                {budgetsWithSpending.filter(b => getBudgetProgress(b, b.spent || 0) >= 80).length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="status-dot status-dot-amber"></div>
                    <span className="text-gray-600">
                      {budgetsWithSpending.filter(b => getBudgetProgress(b, b.spent || 0) >= 80).length} categories need attention
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => navigate('/add-expense')}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add expense
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => navigate('/expenses')}
                className="gap-2"
              >
                <Receipt className="h-4 w-4" />
                View all
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for New Users */}
      {monthlyExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to track your first expense?
            </h3>
            <p className="text-gray-600 mb-6">
              Let's start with something simple – maybe coffee, groceries, or a gas fill-up.
              Every expense you track helps you see the full picture.
            </p>
            <div className="space-y-3">
              <Button type="button" onClick={() => navigate('/add-expense')} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add your first expense
              </Button>
              <p className="text-xs text-gray-500">
                💡 Pro tip: Start with today's expenses, we'll handle the rest
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Grid using shadcn Card styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Budget Status - Variable spending vs budget */}
            <Card className="">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(variableSpent)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      of {formatCurrency(totalBudget)} budgeted
                    </p>
                    <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${budgetProgress > 100 ? 'bg-red-500' : budgetProgress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fixed Costs */}
            <Card className="">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Fixed Costs</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(fixedSpent)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fixedExpenses.length} recurring expense{fixedExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spending Trend */}
            <Card className="">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Trend</p>
                    <p className={`text-2xl font-bold mt-1 ${spendingChange <= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {spendingChange <= 0 ? '' : '+'}{spendingChange.toFixed(1)}%
                    </p>
                    <p className={`text-sm mt-1 ${spendingChange <= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {spendingChange <= 0 ? 'Under last month' : 'Over last month'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    {spendingChange > 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg per Day */}
            <Card className="">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Avg per Day</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(variableSpent / Math.max(1, now.getDate()))}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {now.getDate()} days
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid - 2x2 layout */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Row 1: Recent Variable Expenses + Budget Performance */}

            {/* Recent Variable Expenses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent expenses</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/expenses')}
                    className="text-primary hover:text-primary/80 p-1 h-auto"
                  >
                    View all
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentVariableExpenses.map(expense => {
                    const IconComponent = getIconByName(expense.category_icon);
                    const categoryColor = getExpenseCategoryColor(expense, budgets);
                    const isCurrentUser = expense.paid_by_user_id === user?.id;

                    return (
                      <div key={expense.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {isPartnerConnected && (
                              <div
                                className={`partner-avatar text-xs ${(isCurrentUser ? user?.color : summary?.couple?.partner?.color) ? '' : getPartnerAvatarClass(isCurrentUser)}`}
                                style={getPartnerAvatarStyle(isCurrentUser)}
                              >
                                {getPartnerInitial(isCurrentUser ? user?.name : summary?.couple?.partner?.name)}
                              </div>
                            )}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={getCategoryIconStyle(categoryColor, false, 0.25)}
                            >
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{expense.description}</p>
                              <p className="text-xs text-gray-500">
                                {expense.category_name} • {formatDate(expense.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(expense.amount)}</p>
                          <p className="text-xs text-gray-500">
                            {expense.split_type === 'personal' ? 'Personal' : 'Split'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {recentVariableExpenses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No variable expenses this month</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/expenses')}
                >
                  View All Expenses
                </Button>
              </CardContent>
            </Card>

            {/* Budget Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Budget Performance</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/budgets')}
                    className="text-primary hover:text-primary/80 p-1 h-auto"
                  >
                    Manage
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetsWithSpending.slice(0, 5).map((budget) => {
                    const progress = getBudgetProgress(budget, budget.spent || 0);
                    const IconComponent = getIconByName(budget.category_icon);
                    const categoryColor = getCategoryColor({ color: budget.category_color });
                    const progressTextColor = getProgressTextColor(progress);

                    return (
                      <div key={budget.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={getCategoryIconStyle(categoryColor, false, 0.35)}
                            >
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium">{budget.category_name}</span>
                          </div>
                          <span className={`text-sm font-medium ${progressTextColor}`}>
                            {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount || 0)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress > 100 ? 'bg-red-500' : progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              ...(budget.category_color ? { backgroundColor: budget.category_color } : {})
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {budgetsWithSpending.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No spending tracked yet</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/budgets')}
                >
                  Manage Budgets
                </Button>
              </CardContent>
            </Card>

            {/* Row 2: Fixed Expenses + Recurring Bills Card */}

            {/* Fixed Expenses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Fixed expenses</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(fixedSpent)} total
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFixedExpenses.map(expense => {
                    const IconComponent = getIconByName(expense.category_icon);
                    const categoryColor = getExpenseCategoryColor(expense, budgets);
                    const isCurrentUser = expense.paid_by_user_id === user?.id;

                    return (
                      <div key={expense.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {isPartnerConnected && (
                              <div
                                className={`partner-avatar text-xs ${(isCurrentUser ? user?.color : summary?.couple?.partner?.color) ? '' : getPartnerAvatarClass(isCurrentUser)}`}
                                style={getPartnerAvatarStyle(isCurrentUser)}
                              >
                                {getPartnerInitial(isCurrentUser ? user?.name : summary?.couple?.partner?.name)}
                              </div>
                            )}
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={getCategoryIconStyle(categoryColor, false, 0.25)}
                            >
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{expense.description}</p>
                              <p className="text-xs text-gray-500">
                                {expense.category_name} • {formatDate(expense.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(expense.amount)}</p>
                          <p className="text-xs text-gray-500">
                            {expense.split_type === 'personal' ? 'Personal' : 'Split'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {recentFixedExpenses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No fixed expenses this month</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget vs Actual Widget */}
            <BudgetVsActualWidget
              expenses={monthlyExpenses}
              categories={categories}
              totalIncome={summary?.couple?.combined_monthly_income || user?.monthly_net_income || 0}
              fixedExpensesTotal={fixedSpent}
            />
          </div>

          {/* Recurring Bills Card */}
          <div className="mt-6">
            <RecurringCard
              summary={recurringSummary}
              templateCount={recurringTemplates.length}
              isGenerating={isGenerating}
              onGenerate={async () => {
                await generateRecurring(currentYear, currentMonth + 1, async () => {
                  // Refresh expenses and recurring data
                  await refreshExpensesData();
                  refreshRecurring();
                });
              }}
              onManageTemplates={() => setRecurringDialogOpen(true)}
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/insights')}>
                  <TrendingUp className="w-4 h-4" />
                  Insights
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/analytics')}>
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/settlement')}>
                  <DollarSign className="w-4 h-4" />
                  Settlement
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/tips')}>
                  <Heart className="w-4 h-4" />
                  Tips
                </Button>
                <Button variant="ghost" className="h-auto flex-col gap-2 py-4" onClick={() => navigate('/share')}>
                  <Users className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Partner Invitation Modal */}
      <PartnerInviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          // Refresh data to show updated partnership status
          window.location.reload();
        }}
      />

      {/* Recurring Templates Dialog */}
      <RecurringTemplatesDialog
        open={recurringDialogOpen}
        onOpenChange={setRecurringDialogOpen}
        onRefresh={() => {
          refreshExpensesData();
          refreshRecurring();
        }}
      />
    </div>
  );
}
