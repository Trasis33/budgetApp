import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Expense, Category } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { ArrowLeft, Search, Filter, Trash2 } from 'lucide-react';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';

interface ExpenseListProps {
  onNavigate: (view: string) => void;
}

export function ExpenseList({ onNavigate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const [expensesData, categoriesData] = await Promise.all([
          expenseService.getExpenses('all'),
          categoryService.getCategories()
        ]);
        setExpenses(expensesData);
        setCategories(categoriesData);
      } catch (error) {
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseService.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category_name === filterCategory;

    let matchesMonth = true;
    if (filterMonth !== 'all') {
      const expenseDate = new Date(expense.date);
      const [year, month] = filterMonth.split('-');
      matchesMonth = expenseDate.getFullYear() === parseInt(year) &&
                    expenseDate.getMonth() === parseInt(month);
    }

    return matchesSearch && matchesCategory && matchesMonth;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getSplitBadge = (expense: Expense) => {
    if (expense.split_type === 'personal') {
      return <Badge variant="outline">Personal</Badge>;
    }
    if (expense.split_type === 'equal') {
      return <Badge variant="secondary">50/50</Badge>;
    }
    return <Badge variant="default">{expense.custom_split_ratio}% Split</Badge>;
  };

  const availableMonths = Array.from(new Set(
    expenses.map(exp => {
      const date = new Date(exp.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  )).sort().reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    const date = new Date(parseInt(year), parseInt(monthNum));
                    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return <SelectItem key={month} value={month}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.category_name}</TableCell>
                      <TableCell>{expense.paid_by_name}</TableCell>
                      <TableCell>{getSplitBadge(expense)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {sortedExpenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No expenses found matching your filters
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <p className="text-muted-foreground">
                Showing {sortedExpenses.length} of {expenses.length} expenses
              </p>
              <p>
                Total: {formatCurrency(sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
