import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Expense, Category, User } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, PlusCircle, Receipt, ArrowUpDown, Edit2, Check, X, Percent } from 'lucide-react';
import { expenseService } from '../api/services/expenseService';
import { categoryService } from '../api/services/categoryService';
import { userService } from '../api/services/userService';
import { toast } from 'sonner';
import { getIconByName } from '../lib/categoryIcons';
import { getCategoryColor, getCategoryColorShades } from '../lib/categoryColors';
import { BudgetHeader } from './budget/BudgetHeader';
import { Slider } from './ui/slider';
import { useAuth } from '../context/AuthContext';
import styles from '@/styles/expense-table.module.css';

interface ExpenseListProps {
  onNavigate: (view: string) => void;
}

type SortKey = 'date' | 'description' | 'category' | 'paid_by' | 'split' | 'amount';
type SortDirection = 'asc' | 'desc';

export function ExpenseList({ onNavigate: _ }: ExpenseListProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [splitPopoverOpen, setSplitPopoverOpen] = useState(false);
  const splitPanelRef = useRef<HTMLDivElement | null>(null);
  const adjustSplitButtonRef = useRef<HTMLButtonElement | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterMonth, setFilterMonth] = useState(currentMonth.toString());
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, categoriesData, usersData] = await Promise.all([
          expenseService.getExpenses('ours'),
          categoryService.getCategories(),
          userService.getUsers()
        ]);
        setExpenses(expensesData);
        setCategories(categoriesData);
        setUsers(usersData);
      } catch (error) {
        toast.error('Having trouble loading data. Check your connection and try again');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!splitPopoverOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        splitPanelRef.current &&
        !splitPanelRef.current.contains(target) &&
        adjustSplitButtonRef.current &&
        !adjustSplitButtonRef.current.contains(target)
      ) {
        setSplitPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [splitPopoverOpen]);

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      ...expense,
      date: expense.date.split('T')[0], // Ensure date format for input
      split_ratio_user1: expense.split_ratio_user1 ?? (expense.split_type === 'custom' ? 50 : undefined),
      split_ratio_user2: expense.split_ratio_user2 ?? (expense.split_type === 'custom' ? 50 : undefined)
    });
    setSplitPopoverOpen(expense.split_type === 'custom');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setSplitPopoverOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;

    try {
      const payload: Partial<Expense> = {
        ...editForm,
        ...(editForm.split_type === 'custom'
          ? {
              split_ratio_user1: editForm.split_ratio_user1 ?? 50,
              split_ratio_user2: editForm.split_ratio_user2 ?? 50
            }
          : {
              split_ratio_user1: undefined,
              split_ratio_user2: undefined
            })
      };

      // Optimistic update
      const updatedExpenses = expenses.map(exp => 
        exp.id === editingId ? { ...exp, ...payload } as Expense : exp
      );
      setExpenses(updatedExpenses);
      setEditingId(null);
      setSplitPopoverOpen(false);

      // API call
      const updatedExpense = await expenseService.updateExpense(editingId, payload);
      
      // Update with server response to ensure consistency
      // updatedExpense is already the data object because of apiClient interceptor
      setExpenses(expenses.map(exp => 
        exp.id === editingId ? updatedExpense : exp
      ));
      
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error('Failed to update expense');
      // Revert on error (reload data would be safer but this is quick)
      const originalExpenses = await expenseService.getExpenses('all');
      setExpenses(originalExpenses);
      setSplitPopoverOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await expenseService.deleteExpense(deleteId);
      setExpenses(expenses.filter(exp => exp.id !== deleteId));
      toast.success('Expense removed successfully');
    } catch (error) {
      toast.error('Could not delete expense. Try again in a moment');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredExpenses = expenses.filter(expense => {
    if (!expense) return false; // Safety check
    const matchesSearch = (expense.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.category_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category_name === filterCategory;

    const expenseDate = new Date(expense.date);
    const matchesYear = filterYear === 'all' || expenseDate.getFullYear().toString() === filterYear;
    const matchesMonth = filterMonth === 'all' || expenseDate.getMonth().toString() === filterMonth;

    return matchesSearch && matchesCategory && matchesYear && matchesMonth;
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

  const hasPartner = users.some(u => u.id !== authUser?.id);

  const clampRatio = (value: number) => Math.max(0, Math.min(100, value));

  const updateUserSplitRatio = (value: number) => {
    setEditForm(prev => {
      if (!prev) return prev;
      const clamped = clampRatio(value);
      return {
        ...prev,
        split_ratio_user1: clamped,
        split_ratio_user2: 100 - clamped
      };
    });
  };

  const updatePartnerSplitRatio = (value: number) => {
    setEditForm(prev => {
      if (!prev) return prev;
      const clamped = clampRatio(value);
      return {
        ...prev,
        split_ratio_user2: clamped,
        split_ratio_user1: 100 - clamped
      };
    });
  };

  const handleSplitTypeChange = (value: Expense['split_type']) => {
    if (!hasPartner && (value === 'custom' || value === 'bill')) {
      return;
    }
    const wantsCustom = value === 'custom';
    setEditForm(prev => {
      if (!prev) return prev;
      if (value !== 'custom') {
        return {
          ...prev,
          split_type: value,
          split_ratio_user1: undefined,
          split_ratio_user2: undefined
        };
      }
      return {
        ...prev,
        split_type: value,
        split_ratio_user1: prev.split_ratio_user1 ?? 50,
        split_ratio_user2: prev.split_ratio_user2 ?? 50
      };
    });
    setSplitPopoverOpen(wantsCustom);
  };

  const availableYears = Array.from(new Set(
    expenses.map(exp => new Date(exp.date).getFullYear())
  )).sort((a, b) => b - a);

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || typeof hex !== 'string') return `rgba(99, 102, 241, ${alpha})`; // Fallback to default indigo
    const cleanedHex = hex.replace('#', '');
    if (cleanedHex.length < 6) return `rgba(99, 102, 241, ${alpha})`; // Invalid hex
    
    const r = parseInt(cleanedHex.slice(0, 2), 16);
    const g = parseInt(cleanedHex.slice(2, 4), 16);
    const b = parseInt(cleanedHex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
      <BudgetHeader
        title="Expenses"
        subtitle={`Manage and track your ${expenses.length} shared and personal expenses`}
        onBack={() => navigate('/dashboard')}
        onAddBudget={() => navigate('/add-expense')}
        showExportButton={false}
        showAddButton={true}
        addButtonLabel="Add Expense"
      />

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
        <div className="space-y-6">
          {/* Filter Section */}
          <Card className="shadow-sm border-0">
            <CardContent className="p-0 [&:last-child]:pb-0">
              <div className={styles.filterContainer}>
                <div className={styles.searchContainer}>
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>

                <div className={styles.filterGroup}>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[120px] border-0 bg-transparent focus:ring-0">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="w-px h-4 bg-gray-200 mx-1"></div>

                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0">
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
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="shadow-sm overflow-hidden border-0">
            <CardContent className="p-0 [&:last-child]:pb-0">
              <div className={styles.tableContainer}>
                <table className={styles.expenseTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.colDate} onClick={() => handleSort('date')}>
                        <div className="flex items-center gap-1">
                          Date
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'date' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colDescription} onClick={() => handleSort('description')}>
                        <div className="flex items-center gap-1">
                          Description
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'description' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colCategory} onClick={() => handleSort('category')}>
                        <div className="flex items-center gap-1">
                          Category
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'category' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colPaidBy} onClick={() => handleSort('paid_by')}>
                        <div className="flex items-center gap-1">
                          Paid By
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'paid_by' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colSplit} onClick={() => handleSort('split')}>
                        <div className="flex items-center gap-1">
                          Split
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'split' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colAmount} onClick={() => handleSort('amount')}>
                        <div className="flex items-center justify-end gap-1">
                          Amount
                          <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'amount' ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                      </th>
                      <th className={styles.colActions}></th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {sortedExpenses.map(expense => {
                      const isEditing = editingId === expense.id;
                      const IconComponent = getIconByName(expense.category_icon);
                      const categoryColor = getCategoryColor({ color: expense.category_color });
                      const categoryShades = getCategoryColorShades({ color: expense.category_color });
                      
                      return (
                      <tr key={expense.id} className={`${styles.tableRow} group`}>
                        {isEditing ? (
                          // Editing Mode
                          <>
                            <td className={styles.compactCell}>
                              <Input 
                                type="date" 
                                value={editForm.date?.toString().split('T')[0]} 
                                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                className="h-8 w-full"
                              />
                            </td>
                            <td className={styles.compactCell}>
                              <Input 
                                value={editForm.description} 
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                className="h-8 w-full"
                              />
                            </td>
                            <td className={styles.compactCell}>
                              <Select 
                                value={editForm.category_id?.toString()} 
                                onValueChange={(val: string) => setEditForm({...editForm, category_id: parseInt(val)})}
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className={styles.compactCell}>
                              <Select 
                                value={editForm.paid_by_user_id?.toString()} 
                                onValueChange={(val: string) => setEditForm({...editForm, paid_by_user_id: parseInt(val)})}
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue placeholder="Paid By" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users.map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className={`${styles.compactCell} relative` }>
                              <div className="flex items-center gap-2">
                                <Select 
                                  value={editForm.split_type} 
                                  onValueChange={(val: Expense['split_type']) => handleSplitTypeChange(val)}
                                >
                                  <SelectTrigger className="h-8 w-full">
                                    <SelectValue placeholder="Split" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="50/50">50/50</SelectItem>
                                    <SelectItem value="personal">Personal</SelectItem>
                                    <SelectItem value="custom" disabled={!hasPartner}>Custom</SelectItem>
                                    <SelectItem value="bill" disabled={!hasPartner}>Bill</SelectItem>
                                  </SelectContent>
                                </Select>

                                {editForm.split_type === 'custom' && hasPartner && (
                                  <Button 
                                    type="button"
                                    ref={adjustSplitButtonRef}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 whitespace-nowrap text-xs font-semibold"
                                    onClick={() => setSplitPopoverOpen(prev => !prev)}
                                    aria-pressed={splitPopoverOpen}
                                  >
                                    <Percent className="mr-1 h-3.5 w-3.5" />
                                    Adjust split
                                  </Button>
                                )}
                              </div>

                              {editForm.split_type === 'custom' && hasPartner && splitPopoverOpen && (
                                <div
                                  ref={splitPanelRef}
                                  className="absolute left-0 top-full z-50 mt-2 w-72 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold text-gray-900">Fine-tune split</p>
                                    <p className="text-xs text-muted-foreground">Tap or drag to adjust in 5% increments</p>
                                  </div>
                                  <Slider
                                    value={[editForm.split_ratio_user1 ?? 50]}
                                    min={0}
                                    max={100}
                                    step={5}
                                    onValueChange={(value: number[]) => updateUserSplitRatio(value[0])}
                                  />
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">You (%)</p>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={editForm.split_ratio_user1 ?? 50}
                                        onChange={(e) => updateUserSplitRatio(parseInt(e.target.value || '0', 10))}
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Partner (%)</p>
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={editForm.split_ratio_user2 ?? 50}
                                        onChange={(e) => updatePartnerSplitRatio(parseInt(e.target.value || '0', 10))}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>Totals stay at 100%</span>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setSplitPopoverOpen(false)}>
                                      Close
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className={styles.compactCell}>
                              <Input 
                                type="number" 
                                value={editForm.amount} 
                                onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                                className="h-8 w-full text-right"
                              />
                            </td>
                            <td className={styles.compactCell}>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={handleSaveEdit}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode
                          <>
                            <td className={`${styles.compactCell} text-gray-600 font-medium text-sm`}>
                              {formatDate(expense.date)}
                            </td>
                            <td className={`${styles.compactCell} font-medium text-gray-900`}>
                              {expense.description}
                            </td>
                            <td className={styles.compactCell}>
                              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-transparent transition-colors" 
                                   style={{ 
                                     backgroundColor: hexToRgba(categoryColor, 0.08), 
                                     color: categoryShades.text 
                                   }}>
                                <IconComponent className="h-3.5 w-3.5" />
                                <span className="text-xs font-semibold">{expense.category_name}</span>
                              </div>
                            </td>
                            <td className={styles.compactCell}>
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const paidByUser = users.find(u => u.id === expense.paid_by_user_id);
                                  const userColor = paidByUser?.color;
                                  return (
                                    <div 
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${userColor ? 'text-white border-transparent' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                      style={userColor ? { backgroundColor: userColor } : {}}
                                    >
                                      {expense.paid_by_name.charAt(0).toUpperCase()}
                                    </div>
                                  );
                                })()}
                                <span className="text-sm text-gray-600">{expense.paid_by_name}</span>
                              </div>
                            </td>
                            <td className={styles.compactCell}>
                              {getSplitBadge(expense)}
                            </td>
                            <td className={`${styles.compactCell} text-right font-bold text-gray-900 tabular-nums`}>
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className={`${styles.compactCell} text-right`}>
                              <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 lg:border-transparent"
                                  onClick={() => handleEdit(expense)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 lg:border-transparent"
                                  onClick={() => setDeleteId(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              {sortedExpenses.length === 0 && expenses.length > 0 && (
                <div className="text-center py-16 bg-white">
                  <Search className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No expenses found
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchTerm || filterCategory !== 'all' || filterMonth !== 'all' || filterYear !== 'all'
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
                      setFilterMonth(currentMonth.toString());
                      setFilterYear(currentYear.toString());
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}

              <div className={styles.tableFooter}>
                <p className={styles.footerInfo}>
                  Showing {sortedExpenses.length} of {expenses.length} expenses
                </p>
                <p className={styles.footerTotal}>
                  Total: {formatCurrency(sortedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
