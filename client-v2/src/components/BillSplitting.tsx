import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Expense, User } from '../types';
import { formatCurrency, calculateBalance, calculateExpenseShare, filterExpensesByMonth } from '../lib/utils';
import { ArrowLeft, ArrowRight, Users, Receipt, DollarSign } from 'lucide-react';
import { expenseService } from '../api/services/expenseService';
import { analyticsService } from '../api/services/analyticsService';
import { authService } from '../api/services/authService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface BillSplittingProps {
  onNavigate: (view: string) => void;
}

export function BillSplitting({ onNavigate }: BillSplittingProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, usersData, settlementData] = await Promise.all([
          expenseService.getExpenses('all'),
          authService.getUsers(),
          analyticsService.getCurrentSettlement()
        ]);
        setExpenses(expensesData);
        setUsers(usersData);
        setSettlement(settlementData.settlement);
      } catch (error) {
        toast.error('Failed to load bill splitting data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bill splitting...</p>
        </div>
      </div>
    );
  }

  const monthlyExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
  const currentUser = users.find(u => u.id === user?.id);
  const partnerUser = users.find(u => u.id !== user?.id);
  
  // Calculate balance
  const balance = calculateBalance(monthlyExpenses, currentUser.id, partnerUser.id);
  
  // Split expenses by type
  const sharedExpenses = monthlyExpenses.filter(exp => exp.split_type !== 'personal');
  const personalExpenses = monthlyExpenses.filter(exp => exp.split_type === 'personal');

  // Calculate individual totals
  const user1Paid = monthlyExpenses
    .filter(exp => exp.paid_by_user_id === currentUser.id)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const user2Paid = monthlyExpenses
    .filter(exp => exp.paid_by_user_id === partnerUser.id)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const user1Share = monthlyExpenses
    .reduce((sum, exp) => sum + calculateExpenseShare(exp, currentUser.id), 0);

  const user2Share = monthlyExpenses
    .reduce((sum, exp) => sum + calculateExpenseShare(exp, partnerUser.id), 0);

  const totalShared = sharedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const getUserName = (userId: string) => {
    return userId === currentUser.id ? currentUser.name : partnerUser.name;
  };

  const getSplitDetails = (expense: Expense) => {
    if (expense.split_type === 'equal') {
      return '50/50 split';
    }
    if (expense.split_type === 'custom') {
      const payer = expense.paid_by_user_id === currentUser.id ? currentUser.name : partnerUser.name;
      return `${payer}: ${expense.custom_split_ratio}%`;
    }
    return 'Personal';
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
            <CardTitle>Settlement Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-2">Current Balance</p>
                <div className="flex items-center justify-center gap-4">
                  {balance > 0 ? (
                    <>
                      <span>{partnerUser.name}</span>
                      <ArrowRight className="h-5 w-5" />
                      <span>{currentUser.name}</span>
                    </>
                  ) : (
                    <>
                      <span>{currentUser.name}</span>
                      <ArrowRight className="h-5 w-5" />
                      <span>{partnerUser.name}</span>
                    </>
                  )}
                </div>
                <p className="mt-4">
                  {formatCurrency(Math.abs(balance))}
                </p>
                <p className="text-muted-foreground mt-2">
                  {Math.abs(balance) < 10 
                    ? "You're all settled up! 🎉" 
                    : balance > 0 
                      ? `${partnerUser.name} owes ${currentUser.name}`
                      : `${currentUser.name} owes ${partnerUser.name}`
                  }
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 p-4 border rounded-lg">
                  <h3>{currentUser.name}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid</span>
                      <span>{formatCurrency(user1Paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Share</span>
                      <span>{formatCurrency(user1Share)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Balance</span>
                      <span className={user1Paid - user1Share >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {formatCurrency(user1Paid - user1Share)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-4 border rounded-lg">
                  <h3>{partnerUser.name}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid</span>
                      <span>{formatCurrency(user2Paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Share</span>
                      <span>{formatCurrency(user2Share)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Balance</span>
                      <span className={user2Paid - user2Share >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {formatCurrency(user2Paid - user2Share)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Shared Expenses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div>{formatCurrency(totalShared)}</div>
              <p className="text-muted-foreground mt-1">
                {sharedExpenses.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div>{formatCurrency(user1Paid + user2Paid)}</div>
              <p className="text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Split Ratio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div>
                {((user1Share / (user1Share + user2Share)) * 100).toFixed(0)}% / {((user2Share / (user1Share + user2Share)) * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground mt-1">
                {currentUser.name} / {partnerUser.name}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shared Expenses Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sharedExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(expense => {
                  const user1ExpenseShare = calculateExpenseShare(expense, currentUser.id);
                  const user2ExpenseShare = calculateExpenseShare(expense, partnerUser.id);
                  
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p>{expense.description}</p>
                          {expense.recurring && (
                            <Badge variant="outline">Recurring</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">
                          {expense.category_name} • Paid by {getUserName(expense.paid_by_user_id)}
                        </p>
                        <p className="text-muted-foreground">
                          {getSplitDetails(expense)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(expense.amount)}</p>
                        <p className="text-muted-foreground">
                          {currentUser.name}: {formatCurrency(user1ExpenseShare)}
                        </p>
                        <p className="text-muted-foreground">
                          {partnerUser.name}: {formatCurrency(user2ExpenseShare)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {sharedExpenses.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No shared expenses this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {personalExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {personalExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p>{expense.description}</p>
                        <p className="text-muted-foreground">
                          {expense.category_name} • {getUserName(expense.paid_by_user_id)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(expense.amount)}</p>
                        <Badge variant="secondary">Personal</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
