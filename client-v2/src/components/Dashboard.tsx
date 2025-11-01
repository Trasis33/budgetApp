import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Expense, Budget, User } from '../types';
import { formatCurrency, formatDate, filterExpensesByMonth, calculateCategorySpending, getBudgetProgress } from '../lib/utils';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
  currentUser: User;
  onNavigate: (view: string) => void;
}

export function Dashboard({ expenses, budgets, currentUser, onNavigate }: DashboardProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyExpenses = filterExpensesByMonth(expenses, currentYear, currentMonth);
  const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthExpenses = filterExpensesByMonth(expenses, previousYear, previousMonth);
  const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const spendingChange = previousMonthTotal > 0 
    ? ((totalSpent - previousMonthTotal) / previousMonthTotal) * 100 
    : 0;
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyAmount, 0);
  const budgetProgress = (totalSpent / totalBudget) * 100;
  
  const recentExpenses = [...monthlyExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const budgetsWithSpending = budgets.map(budget => ({
    ...budget,
    spent: calculateCategorySpending(monthlyExpenses, budget.category)
  })).filter(b => b.spent > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => onNavigate('add-expense')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

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
            <p className={`mt-1 ${spendingChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {spendingChange > 0 ? '+' : ''}{spendingChange.toFixed(1)}% from last month
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
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p>{expense.description}</p>
                    <p className="text-muted-foreground">
                      {expense.category} • {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(expense.amount)}</p>
                    <p className="text-muted-foreground">
                      {expense.splitType === 'personal' ? 'Personal' : 'Split'}
                    </p>
                  </div>
                </div>
              ))}
              {recentExpenses.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No expenses this month</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('expenses')}
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
                      <span>{budget.category}</span>
                      <span className={isOverBudget ? 'text-red-500' : ''}>
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.monthlyAmount)}
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
              variant="outline" 
              className="w-full mt-4"
              onClick={() => onNavigate('budgets')}
            >
              Manage Budgets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
