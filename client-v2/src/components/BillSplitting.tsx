import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Expense, User } from '../types';
import { formatCurrency, calculateBalance, calculateExpenseShare, filterExpensesByMonth } from '../lib/utils';
import { ArrowLeft, ArrowRight, Users, Receipt, DollarSign, CalendarClock, CheckCircle2, Loader2, Calendar, PiggyBank } from 'lucide-react';
import { expenseService } from '../api/services/expenseService';
import { analyticsService } from '../api/services/analyticsService';
import { authService } from '../api/services/authService';
import { recurringExpenseService } from '../api/services/recurringExpenseService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { SettlementAllocationPrompt } from './savings/SettlementAllocationPrompt';

interface BillSplittingProps {
  onNavigate: (view: string) => void;
}

export function BillSplitting({ onNavigate }: BillSplittingProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingTemplatesCount, setPendingTemplatesCount] = useState(0);
  const [allocationPromptOpen, setAllocationPromptOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState(0);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, usersData, settlementData, templates] = await Promise.all([
        expenseService.getExpenses('all'),
        authService.getUsers(),
        analyticsService.getCurrentSettlement(),
        recurringExpenseService.getTemplates()
      ]);

      setExpenses(expensesData || []);
      setUsers(usersData || []);
      setSettlement(settlementData?.settlement || null);

      // Check for pending templates for this month
      const monthlyExpenses = filterExpensesByMonth(expensesData || [], selectedYear, selectedMonth);
      const generatedTemplateIds = new Set(
        monthlyExpenses
          .filter(e => e.recurring_expense_id)
          .map(e => e.recurring_expense_id)
      );
      
      const pending = templates.filter(t => t.is_active && !generatedTemplateIds.has(t.id));
      setPendingTemplatesCount(pending.length);

    } catch (error) {
      console.error('Failed to load bill splitting data:', error);
      toast.error('Failed to load bill splitting data');
      setExpenses([]);
      setUsers([]);
      setSettlement(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const handleGenerateRecurring = async () => {
    try {
      setIsGenerating(true);
      const result = await recurringExpenseService.generate({
        year: selectedYear,
        month: selectedMonth + 1 // API uses 1-indexed months
      });
      
      if (result.generatedCount > 0) {
        toast.success(`Successfully confirmed ${result.generatedCount} recurring expenses!`);
        await loadData(); // Refresh everything
      } else {
        toast.info('No new recurring expenses to confirm.');
      }
    } catch (error) {
      toast.error('Failed to confirm recurring expenses');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkSettlementComplete = () => {
    setSettlementAmount(Math.abs(balance));
    setAllocationPromptOpen(true);
  };

  const handleAllocationComplete = () => {
    toast.success('Settlement marked complete!');
  };

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

  const monthlyExpenses = filterExpensesByMonth(expenses, selectedYear, selectedMonth);
  const currentUser = users.find(u => u.id === user?.id);
  const partnerUser = users.find(u => u.id !== user?.id);

  // Get available years for dropdown
  const availableYears = Array.from(new Set(
    expenses.map(exp => new Date(exp.date).getFullYear())
  )).sort((a, b) => b - a);

  // Get month name for display
  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Early return if we don't have the required data
  if (!currentUser || !partnerUser || users.length === 0) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              {users.length === 0 ? 'Loading user data...' : 'Setting up bill splitting...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
    if (expense.split_type === '50/50') {
      return '50/50 split';
    }
    if (expense.split_type === 'custom') {
      const payer = expense.paid_by_user_id === currentUser.id ? currentUser.name : partnerUser.name;
      return `${payer}: ${expense.split_ratio_user1}%`;
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
        {pendingTemplatesCount > 0 && (
          <Card className="border-indigo-200 bg-indigo-50/30 overflow-hidden shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-1.5 w-full bg-indigo-500" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CalendarClock className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-indigo-900">Ready to finalize the month?</h2>
                    <p className="text-sm text-indigo-700/80 max-w-md">
                      You have <span className="font-bold">{pendingTemplatesCount}</span> recurring bills & subscriptions pending for this period. 
                      Confirm them now to include them in your settlement.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateRecurring} 
                  disabled={isGenerating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-base shadow-lg shadow-indigo-200 gap-2 min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirm & Add All
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Settlement Summary</CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(val: string) => setSelectedMonth(parseInt(val))}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2024, i).toLocaleDateString('en-US', { month: 'short' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedYear.toString()}
                  onValueChange={(val: string) => setSelectedYear(parseInt(val))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                {Math.abs(balance) >= 10 && (
                  <Button
                    onClick={handleMarkSettlementComplete}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    <PiggyBank className="mr-2 h-4 w-4" />
                    Mark Settlement Complete & Allocate to Savings
                  </Button>
                )}
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
                {monthName}
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
                {user1Share + user2Share > 0 
                  ? `${((user1Share / (user1Share + user2Share)) * 100).toFixed(0)}% / ${((user2Share / (user1Share + user2Share)) * 100).toFixed(0)}%`
                  : '0% / 0%'
                }
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
                  No shared expenses for {monthName}
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

      <SettlementAllocationPrompt
        isOpen={allocationPromptOpen}
        amount={settlementAmount}
        onClose={() => setAllocationPromptOpen(false)}
        onAllocated={handleAllocationComplete}
      />
    </div>
  );
}
