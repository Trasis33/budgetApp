import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { Expense, Budget, User, Income } from '../types';
import { formatCurrency, formatDate, filterExpensesByMonth, calculateCategorySpending, calculateBalance } from '../lib/utils';
import { ArrowLeft, Download, FileText } from 'lucide-react';

interface MonthlyStatementProps {
  expenses: Expense[];
  budgets: Budget[];
  income: Income[];
  currentUser: User;
  partnerUser: User;
  onNavigate: (view: string) => void;
}

export function MonthlyStatement({ 
  expenses, 
  budgets, 
  income, 
  currentUser, 
  partnerUser, 
  onNavigate 
}: MonthlyStatementProps) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const availableYears = Array.from(new Set(
    expenses.map(exp => new Date(exp.date).getFullYear())
  )).sort((a, b) => b - a);

  const monthlyExpenses = filterExpensesByMonth(expenses, selectedYear, selectedMonth);
  const monthlyIncome = income.filter(inc => {
    const incDate = new Date(inc.date);
    return incDate.getFullYear() === selectedYear && incDate.getMonth() === selectedMonth;
  });

  const totalIncome = monthlyIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = budgets.map(budget => {
    const spent = calculateCategorySpending(monthlyExpenses, budget.category);
    return {
      category: budget.category,
      budget: budget.monthlyAmount,
      spent,
      variance: budget.monthlyAmount - spent
    };
  }).filter(item => item.spent > 0);

  const balance = calculateBalance(monthlyExpenses, currentUser.id, partnerUser.id);

  const handleExport = () => {
    const statementDate = new Date(selectedYear, selectedMonth);
    const monthName = statementDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    let csvContent = `CouplesFlow Monthly Statement - ${monthName}\n\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += `INCOME SUMMARY\n`;
    csvContent += `Source,Amount\n`;
    monthlyIncome.forEach(inc => {
      csvContent += `"${inc.source}",${inc.amount}\n`;
    });
    csvContent += `Total Income,${totalIncome}\n\n`;
    
    csvContent += `EXPENSE SUMMARY\n`;
    csvContent += `Category,Budget,Spent,Variance\n`;
    categoryBreakdown.forEach(cat => {
      csvContent += `"${cat.category}",${cat.budget},${cat.spent},${cat.variance}\n`;
    });
    csvContent += `Total Expenses,,${totalExpenses}\n\n`;
    
    csvContent += `NET SUMMARY\n`;
    csvContent += `Total Income,${totalIncome}\n`;
    csvContent += `Total Expenses,${totalExpenses}\n`;
    csvContent += `Net Income,${netIncome}\n`;
    csvContent += `Savings Rate,${savingsRate.toFixed(2)}%\n\n`;
    
    csvContent += `DETAILED TRANSACTIONS\n`;
    csvContent += `Date,Description,Category,Amount,Paid By,Split Type\n`;
    monthlyExpenses.forEach(exp => {
      const paidBy = exp.paidBy === currentUser.id ? currentUser.name : partnerUser.name;
      csvContent += `${exp.date},"${exp.description}","${exp.category}",${exp.amount},"${paidBy}",${exp.splitType}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement-${selectedYear}-${selectedMonth + 1}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Statement</CardTitle>
            <div className="flex gap-3">
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(val) => setSelectedMonth(parseInt(val))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(val) => setSelectedYear(parseInt(val))}
              >
                <SelectTrigger className="w-[120px]">
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

              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">Statement for</p>
            <h2>{monthName}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Total Income</p>
              <p className="text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Total Expenses</p>
              <p className="text-red-500">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Net Income</p>
              <p className={netIncome >= 0 ? 'text-green-600' : 'text-red-500'}>
                {formatCurrency(netIncome)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">Savings Rate</p>
              <p className={savingsRate >= 0 ? 'text-green-600' : 'text-red-500'}>
                {savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Income Sources</h3>
            <div className="space-y-2">
              {monthlyIncome.map(inc => (
                <div key={inc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{inc.source}</span>
                  <span className="text-green-600">{formatCurrency(inc.amount)}</span>
                </div>
              ))}
              {monthlyIncome.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No income recorded</p>
              )}
              {monthlyIncome.length > 0 && (
                <div className="flex items-center justify-between p-3 border-t-2">
                  <span>Total Income</span>
                  <span className="text-green-600">{formatCurrency(totalIncome)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Expense Summary by Category</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">% of Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryBreakdown.map(cat => {
                  const percentage = (cat.spent / cat.budget) * 100;
                  return (
                    <TableRow key={cat.category}>
                      <TableCell>{cat.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cat.spent)}</TableCell>
                      <TableCell className={`text-right ${cat.variance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {formatCurrency(cat.variance)}
                      </TableCell>
                      <TableCell className={`text-right ${percentage > 100 ? 'text-red-500' : ''}`}>
                        {percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.monthlyAmount, 0))}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(totalExpenses)}</TableCell>
                  <TableCell 
                    className={`text-right ${
                      budgets.reduce((sum, b) => sum + b.monthlyAmount, 0) - totalExpenses >= 0 
                        ? 'text-green-600' 
                        : 'text-red-500'
                    }`}
                  >
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.monthlyAmount, 0) - totalExpenses)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">Split Settlement</h3>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-muted-foreground">{currentUser.name}</p>
                  <p>{formatCurrency(monthlyExpenses.filter(e => e.paidBy === currentUser.id).reduce((s, e) => s + e.amount, 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">{partnerUser.name}</p>
                  <p>{formatCurrency(monthlyExpenses.filter(e => e.paidBy === partnerUser.id).reduce((s, e) => s + e.amount, 0))}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Settlement Amount</p>
                <p>
                  {Math.abs(balance) < 10 
                    ? "Settled up! 🎉" 
                    : balance > 0 
                      ? `${partnerUser.name} owes ${currentUser.name}: ${formatCurrency(Math.abs(balance))}`
                      : `${currentUser.name} owes ${partnerUser.name}: ${formatCurrency(Math.abs(balance))}`
                  }
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4">All Transactions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyExpenses
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>
                        {expense.paidBy === currentUser.id ? currentUser.name : partnerUser.name}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
