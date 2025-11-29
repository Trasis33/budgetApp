import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Expense, Budget } from '../types';
import { formatCurrency, formatDate, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Receipt, ArrowRight, Users, User, Heart, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerInviteModal } from './PartnerInviteModal';
import { RecurringTemplatesDialog } from './RecurringTemplatesDialog';
import { RecurringCard } from './RecurringCard';
import { expenseService } from '../api/services/expenseService';
import { budgetService } from '../api/services/budgetService';
import { useRecurringSummary, useRecurringGeneration } from '../hooks';
import { toast } from 'sonner';
import { useScope } from '../context/ScopeContext';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryColor } from '../lib/categoryColors';
import { getCategoryIconStyle } from '../lib/iconUtils';
import styles from '../styles/budget/budget-metrics.module.css';

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
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

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
            const budgetsData = await budgetService.getBudgets(new Date().getMonth() + 1, new Date().getFullYear());
            setBudgets(budgetsData);
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
  }, [currentScope, scopeLoading, refreshExpensesData]);

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
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthExpenses = filterExpensesByMonth(expenses, previousYear, previousMonth);
  const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const spendingChange = previousMonthTotal > 0
    ? ((totalSpent - previousMonthTotal) / previousMonthTotal) * 100
    : 0;

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const recentExpenses = [...monthlyExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const budgetsWithSpending = budgets.map(budget => ({
    ...budget,
    spent: calculateCategorySpending(monthlyExpenses, budget.category_name)
  })).filter(b => b.spent > 0);

  // Helper functions for consistent styling
  const getProgressColorClass = () => {
    // Return base progress fill class - hex colors will be applied as inline styles
    return styles.progressFill;
  };

  const getProgressTextColor = (progress: number) => {
    if (progress > 100) return 'text-red-500'; // Above budget - red/coral
    if (progress === 100) return 'text-amber-500'; // At budget - amber/yellow
    return 'text-emerald-600'; // Under budget - mint/emerald color
  };

  const getIconColorClass = (index: number) => {
    const colorClasses = [
      styles.iconTeal,
      styles.iconCoral,
      styles.iconAmber,
      styles.iconIndigo,
    ];
    return colorClasses[index % colorClasses.length];
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
          <button className="btn-ghost">
            <Settings className="w-4 h-4" />
          </button>
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
                This {now.toLocaleDateString('en-US', { month: 'long' })} you've tracked <strong>{monthlyExpenses.length} {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} expenses</strong> totalling <strong>{formatCurrency(totalSpent)}</strong>
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
          {/* Metrics Grid using BudgetManager styling */}
          <div className={`${styles.metricsGrid} mb-6`}>
            <div className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Total Spent</div>
                  <div className={styles.metricValue}>{formatCurrency(totalSpent)}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    of {formatCurrency(totalBudget)} budget
                  </div>
                </div>
                <div className={`${styles.metricIcon} ${getIconColorClass(0)}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>This Month</div>
                  <div className={styles.metricValue}>{monthlyExpenses.length} expenses</div>
                  <div className={`text-sm ${spendingChange <= 0 ? 'text-green-600' : 'text-orange-600'} mt-1`}>
                    {spendingChange <= 0 ? 'Great! You are on track' : 'Let us see where we can optimize'}
                  </div>
                  <div className={`text-sm ${spendingChange <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {spendingChange <= 0 ? '+' : ''}{spendingChange.toFixed(1)}% vs last month
                  </div>
                </div>
                <div className={`${styles.metricIcon} ${getIconColorClass(1)}`}>
                  {spendingChange > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Budget Used</div>
                  <div className={styles.metricValue}>{budgetProgress.toFixed(1)}%</div>
                  <div className="progress-bar mt-2">
                    <div className={`progress-fill ${getProgressColorClass()}`} style={{ width: `${budgetProgress}%` }}></div>
                  </div>
                </div>
                <div className={`${styles.metricIcon} ${getIconColorClass(2)}`}>
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricContent}>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Avg per Day</div>
                  <div className={styles.metricValue}>{formatCurrency(totalSpent / now.getDate())}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Based on {now.getDate()} days
                  </div>
                </div>
                <div className={`${styles.metricIcon} ${getIconColorClass(3)}`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} expenses</CardTitle>
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
                  {recentExpenses.map(expense => {
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
                  {recentExpenses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No expenses this month</p>
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
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${getProgressColorClass()}`} 
                            style={{ 
                              width: `${Math.min(progress, 100)}%`,
                              ...(budget.category_color ? { backgroundColor: budget.category_color } : {})
                            }}
                          ></div>
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

            {/* Recurring Expenses Card */}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="btn-ghost justify-center" onClick={() => navigate('/analytics')}>
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </button>
                <button className="btn-ghost justify-center" onClick={() => navigate('/settlement')}>
                  <DollarSign className="w-4 h-4" />
                  Settlement
                </button>
                <button className="btn-ghost justify-center" onClick={() => navigate('/tips')}>
                  <Heart className="w-4 h-4" />
                  Tips
                </button>
                <button className="btn-ghost justify-center" onClick={() => navigate('/share')}>
                  <Users className="w-4 h-4" />
                  Share
                </button>
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
