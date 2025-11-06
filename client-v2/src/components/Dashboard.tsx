import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Expense, Budget } from '../types';
import { formatCurrency, formatDate, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Receipt, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnerInviteModal } from './PartnerInviteModal';
import { expenseService } from '../api/services/expenseService';
import { budgetService } from '../api/services/budgetService';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { useScope } from '../context/ScopeContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export interface DashboardPropsExport {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate: _onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { currentScope, isLoading: scopeLoading } = useScope();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, budgetsData] = await Promise.all([
          expenseService.getExpenses(currentScope),
          budgetService.getBudgets(new Date().getMonth() + 1, new Date().getFullYear())
        ]);
        setExpenses(expensesData);
        setBudgets(budgetsData);
      } catch (error) {
        toast.error('Having trouble loading your dashboard. Try refreshing the page');
      } finally {
        setLoading(false);
      }
    };

    if (!scopeLoading) {
      loadData();
    }
  }, [currentScope, scopeLoading]);

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

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title={`${currentScope === 'ours' ? 'Our' : currentScope === 'mine' ? 'My' : "Partner's"} money dashboard`}
        subtitle={now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        showScopeSelector={true}
        showNotifications={false}
        showUserMenu={false}
      />
      
      <div className="px-6 space-y-6">

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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                👋 Hey {user?.name}! Here's your {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} money at a glance
              </h2>
              <p className="text-gray-600">
                This month you've tracked {monthlyExpenses.length} {currentScope === 'ours' ? 'shared' : currentScope === 'mine' ? 'personal' : "partner's"} expenses totalling {formatCurrency(totalSpent)}
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  size="sm"
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
            <Button 
              type="button" 
              onClick={() => navigate('/add-expense')} 
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add expense
            </Button>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>{formatCurrency(totalSpent)}</div>
            <p className="text-muted-foreground mt-1">
              of {formatCurrency(totalBudget)} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>This Month</CardTitle>
            {spendingChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div>{monthlyExpenses.length} expenses</div>
            <p className={`mt-1 text-xs ${spendingChange >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {spendingChange >= 0 ? "Great! You're on track" : "Let's see where we can optimize"}
            </p>
            <p className={`text-sm ${spendingChange >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {spendingChange >= 0 ? '+' : ''}{spendingChange.toFixed(1)}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Budget Used</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>{budgetProgress.toFixed(1)}%</div>
            <Progress value={budgetProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg per Day</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>{formatCurrency(totalSpent / now.getDate())}</div>
            <p className="text-muted-foreground mt-1">
              Based on {now.getDate()} days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p>{expense.description}</p>
                    <p className="text-muted-foreground">
                      {expense.category_name} • {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(expense.amount)}</p>
                    <p className="text-muted-foreground">
                      {expense.split_type === 'personal' ? 'Personal' : 'Split'}
                    </p>
                  </div>
                </div>
              ))}
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

        <Card>
          <CardHeader>
            <CardTitle>Budget Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetsWithSpending.slice(0, 5).map(budget => {
                const progress = getBudgetProgress(budget, budget.spent || 0);
                const isOverBudget = progress >= 100;

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{budget.category_name}</span>
                      <span className={isOverBudget ? 'text-red-500' : ''}>
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount || 0)}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={isOverBudget ? '[&>div]:bg-red-500' : ''}
                    />
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
          </div>
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
      </div>
    </div>
  );
}
