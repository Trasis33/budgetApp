import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Expense, Category } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Trash2, PlusCircle, Receipt, ArrowUpDown } from 'lucide-react';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryColor } from '../lib/categoryColors';

interface ExpenseListProps {
  onNavigate: (view: string) => void;
}

type SortKey = 'date' | 'description' | 'category' | 'paid_by' | 'split' | 'amount';
type SortDirection = 'asc' | 'desc';

export function ExpenseList({ onNavigate: _ }: ExpenseListProps) {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // const now = new Date(); // Unused
  // const currentMonth = now.getMonth(); // Unused
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });

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
        toast.error('Having trouble loading expenses. Check your connection and try again');
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
      toast.success('Expense removed successfully');
    } catch (error) {
      toast.error('Could not delete expense. Try again in a moment');
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
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

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    switch (sortConfig.key) {
      case 'date':
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
      case 'description':
        return a.description.localeCompare(b.description) * direction;
      case 'category':
        return a.category_name.localeCompare(b.category_name) * direction;
      case 'paid_by':
        return a.paid_by_name.localeCompare(b.paid_by_name) * direction;
      case 'split':
        return (a.split_type || '').localeCompare(b.split_type || '') * direction;
      case 'amount':
        return (a.amount - b.amount) * direction;
      default:
        return 0;
    }
  });

  const getSplitBadge = (expense: Expense) => {
    if (expense.split_type === 'personal') {
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 font-normal border-gray-200">Personal</Badge>;
    }
    if (expense.split_type === '50/50') {
      return <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100">50/50</Badge>;
    }
    if (expense.split_type === 'custom') {
      return <Badge variant="default" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100">{expense.split_ratio_user1}% Split</Badge>;
    }
    if (expense.split_type === 'bill') {
      return <Badge variant="outline">Bill</Badge>;
    }
    return <Badge variant="default">{expense.split_type}</Badge>;
  };

  const availableMonths = Array.from(new Set(
    expenses.map(exp => {
      const date = new Date(exp.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    })
  )).sort().reverse();

  const hexToRgba = (hex: string, alpha: number) => {
    const cleanedHex = hex.replace('#', '');
    const r = parseInt(cleanedHex.slice(0, 2), 16);
    const g = parseInt(cleanedHex.slice(2, 4), 16);
    const b = parseInt(cleanedHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const SortableHead = ({ label, sortKey, className = "" }: { label: string, sortKey: SortKey, className?: string }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 hover:text-gray-900 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === sortKey ? 'text-gray-900' : 'text-gray-400'}`} />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Getting your expense history ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2 pl-0 hover:bg-transparent hover:text-gray-900 text-gray-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your {expenses.length} shared and personal expenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/add-expense')} className="shadow-sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* New User Empty State */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expenses yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start tracking your spending to see patterns and insights. Every expense you record 
            helps you and your partner get a clearer picture of where your money goes.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/add-expense')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add your first expense
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[160px] bg-white border-gray-200">
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

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px] bg-white border-gray-200">
                    <Filter className="mr-2 h-3.5 w-3.5 text-gray-500" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

            <div className="relative">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <SortableHead label="Date" sortKey="date" className="w-[120px] pl-6" />
                    <SortableHead label="Description" sortKey="description" className="w-[300px]" />
                    <SortableHead label="Category" sortKey="category" className="w-[180px]" />
                    <SortableHead label="Paid By" sortKey="paid_by" className="w-[140px]" />
                    <SortableHead label="Split" sortKey="split" className="w-[120px]" />
                    <SortableHead label="Amount" sortKey="amount" className="text-right pr-6" />
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map(expense => {
                    const IconComponent = getIconByName(expense.category_icon);
                    const categoryColor = getCategoryColor({ color: expense.category_color });
                    
                    return (
                    <TableRow key={expense.id} className="hover:bg-gray-50/60 border-gray-50 group transition-colors">
                      <TableCell className="py-2.5 pl-6 text-gray-600 font-medium text-sm">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell className="py-2.5 font-medium text-gray-900">
                        {expense.description}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-transparent transition-colors" 
                             style={{ 
                               backgroundColor: hexToRgba(categoryColor, 0.08), 
                               color: categoryColor 
                             }}>
                          <IconComponent className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold">{expense.category_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
                            {expense.paid_by_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-600">{expense.paid_by_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {getSplitBadge(expense)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right pr-6 font-bold text-gray-900 tabular-nums">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>

            {sortedExpenses.length === 0 && expenses.length > 0 && (
              <div className="text-center py-16 bg-white">
                <Search className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No expenses found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || filterCategory !== 'all' || filterMonth !== 'all' 
                    ? 'Try adjusting your filters or search terms'
                    : 'No expenses match your current filters'
                  }
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterMonth('all');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-500 font-medium">
                Showing {sortedExpenses.length} of {expenses.length} expenses
              </p>
              <p className="text-sm font-semibold text-gray-900">
                Total: {formatCurrency(sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </p>
            </div>
        </CardContent>
        </Card>
      )}
    </div>
  );
}
