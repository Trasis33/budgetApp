import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Plus, 
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Send,
  Loader2,
  Search,
  Sparkles,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useBudgetData, useBudgetCalculations } from '../hooks';
import { useSettlement } from '../hooks/useSettlement';
import { useScope } from '../context/ScopeContext';
import { useDate } from '../context/DateContext';
import DateSelector from './DateSelector';
import { budgetCommentService, BudgetComment } from '../api/services/budgetCommentService';
import { budgetService } from '../api/services/budgetService';
import { getIconByName } from '../lib/categoryIcons';
import type { Expense, Category } from '../types';
import { SmartBudgetWizard } from './smart-budget/SmartBudgetWizard';
import { categoryService } from '../api/services/categoryService';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
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
import { calculateCategorySuggestions, getAlertPreferences, saveAlertPreferences, BudgetSuggestions } from '../lib/budgetSuggestions';
import { getCategoryColor } from '../lib/categoryColors';
import { getCategoryIconStyle } from '../lib/iconUtils';

interface BudgetManagerProps {
  onNavigate?: (view: string) => void;
}


export function BudgetManager({ onNavigate: _onNavigate }: BudgetManagerProps) {
  const navigate = useNavigate();
  const now = new Date();
  const { selectedMonth, selectedYear } = useDate();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [showSettlementDetails, setShowSettlementDetails] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, BudgetComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFixedBudgets, setShowFixedBudgets] = useState(true);

  // Add Budget Modal State
  const [isAddBudgetOpen, setAddBudgetOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalSelectedCategory, setModalSelectedCategory] = useState<Category | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [suggestions, setSuggestions] = useState<BudgetSuggestions | null>(null);
  const [alertAt80Percent, setAlertAt80Percent] = useState(true);
  const [alertOnExceed, setAlertOnExceed] = useState(true);

  // Use real hooks
  const { currentScope, setScope, summary: scopeSummary, isPartnerConnected } = useScope();
  const { budgets, expenses, loading: dataLoading, refetch } = useBudgetData(selectedMonth, selectedYear);
  const { budgetsWithSpending, metrics } = useBudgetCalculations(budgets, expenses);
  const { data: settlementData, loading: settlementLoading } = useSettlement(selectedMonth, selectedYear);

  // Wizard State
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Couple info from scope context
  const user = scopeSummary?.couple?.user;
  const partner = scopeSummary?.couple?.partner;

  // Load categories for wizard or modal
  useEffect(() => {
    if ((isWizardOpen || isAddBudgetOpen) && categories.length === 0) {
      categoryService.getCategories().then(setCategories).catch(console.error);
    }
  }, [isWizardOpen, isAddBudgetOpen, categories.length]);

  // Calculate suggestions
  useEffect(() => {
    if (modalSelectedCategory) {
      const sug = calculateCategorySuggestions(modalSelectedCategory.name, expenses);
      setSuggestions(sug);
    } else {
      setSuggestions(null);
    }
  }, [modalSelectedCategory, expenses]);

  // Load alert prefs
  useEffect(() => {
    if (isAddBudgetOpen) {
      const prefs = getAlertPreferences(user?.id || 1);
      setAlertAt80Percent(prefs.alertAt80Percent);
      setAlertOnExceed(prefs.alertOnExceed);
    }
  }, [isAddBudgetOpen, user?.id]);

  const usedCategories = budgets.map(b => b.category_name);
  const availableCategories = categories.filter(cat => !usedCategories.includes(cat.name));

  const handleAddBudgetSubmit = async (saveAndAddAnother: boolean = false) => {
    if (!modalSelectedCategory || !modalAmount) {
      toast.error('Please select a category and enter an amount');
      return;
    }

    try {
      await budgetService.createOrUpdateBudget({
        category_id: modalSelectedCategory.id,
        month: selectedMonth,
        year: selectedYear,
        amount: parseFloat(modalAmount)
      });

      saveAlertPreferences(user?.id || 1, {
        alertAt80Percent,
        alertOnExceed
      });

      await refetch();

      if (saveAndAddAnother) {
        setModalSelectedCategory(null);
        setModalAmount('');
        setModalSearchTerm('');
        setSuggestions(null);
        toast.success('Budget goal set! Add another one');
      } else {
        setModalSelectedCategory(null);
        setModalAmount('');
        setModalSearchTerm('');
        setAddBudgetOpen(false);
        toast.success('Budget goal set!');
      }
    } catch (error) {
      toast.error('Could not create budget');
      console.error(error);
    }
  };

  // Calculations from real data
  const totalBudget = metrics.totalBudget;
  const totalSpent = metrics.totalSpent;
  const remaining = metrics.totalRemaining;
  const overallProgress = metrics.overallProgress;
  
  const nearLimitCount = budgetsWithSpending.filter(b => b.progress >= 80 && b.progress < 100).length;
  const overBudgetCount = budgetsWithSpending.filter(b => b.progress >= 100).length;
  
  // Calculate days left in month
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = now.getMonth() + 1 === selectedMonth && now.getFullYear() === selectedYear 
    ? now.getDate() 
    : lastDay;
  const daysLeftInMonth = Math.max(0, lastDay - currentDay);
  
  // Daily burn rate
  const dailyBurnRate = daysLeftInMonth > 0 ? Math.round(remaining / daysLeftInMonth) : 0;
  const isOnTrack = dailyBurnRate >= 0;

  // Check if month-end (last 5 days)
  const isMonthEnd = daysLeftInMonth <= 5 && daysLeftInMonth > 0;

  // Sort budgets: at-risk first, then by progress descending
  const sortedBudgets = [...budgetsWithSpending].sort((a, b) => {
    const isAtRiskA = a.progress >= 80;
    const isAtRiskB = b.progress >= 80;
    if (isAtRiskA && !isAtRiskB) return -1;
    if (!isAtRiskA && isAtRiskB) return 1;
    return b.progress - a.progress;
  }).filter(budget => showFixedBudgets || !budget.category_is_fixed);

  // Calculate per-user spending for expanded category
  const getUserSpending = useCallback((categoryName: string) => {
    const categoryExpenses = expenses.filter(e => e.category_name === categoryName);
    const userSpent = categoryExpenses
      .filter(e => e.paid_by_user_id === user?.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const partnerSpent = categoryExpenses
      .filter(e => e.paid_by_user_id === partner?.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { userSpent, partnerSpent };
  }, [expenses, user?.id, partner?.id]);

  // Get transactions for a category
  const getCategoryTransactions = useCallback((categoryName: string): Expense[] => {
    return expenses
      .filter(e => e.category_name === categoryName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [expenses]);

  // Load comments for a budget
  const loadComments = useCallback(async (budgetId: number) => {
    if (comments[budgetId] || loadingComments[budgetId]) return;
    
    setLoadingComments(prev => ({ ...prev, [budgetId]: true }));
    try {
      const result = await budgetCommentService.getComments(budgetId);
      setComments(prev => ({ ...prev, [budgetId]: result }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [budgetId]: false }));
    }
  }, [comments, loadingComments]);

  // Load comments when category is expanded
  useEffect(() => {
    if (expandedCategory) {
      loadComments(expandedCategory);
    }
  }, [expandedCategory, loadComments]);

  const getStatusInfo = (progress: number, isFixed?: boolean) => {
    if (progress >= 100) {
      if (isFixed && progress === 100) {
        return {
          variant: 'secondary' as const,
          label: 'Complete',
          fill: 'bg-muted-foreground',
          icon: CheckCircle2
        };
      } else {
        return {
          variant: 'destructive' as const,
          label: 'Over budget',
          fill: 'bg-[var(--theme-coral)]',
          icon: AlertTriangle
        };
      }
    }
    if (progress >= 90) return {
      variant: 'destructive' as const,
      label: 'Critical',
      fill: 'bg-[var(--theme-coral)]',
      icon: AlertTriangle
    };
    if (progress >= 80) return {
      variant: 'outline' as const,
      label: 'Near limit',
      fill: 'bg-[var(--theme-amber)]',
      icon: AlertTriangle
    };
    return {
      variant: 'outline' as const,
      label: 'On track',
      fill: 'bg-[var(--theme-teal)]',
      icon: null
    };
  };

  const getSplitTypeBadge = (splitType: string) => {
    const styles: Record<string, string> = {
      '50/50': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'personal': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'custom': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'bill': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return styles[splitType] || styles['50/50'];
  };

  const overallStatus = overallProgress >= 90 
    ? { label: 'Over budget', color: 'text-[var(--theme-coral)]', dot: 'bg-[var(--theme-coral)]' }
    : overallProgress >= 80 
    ? { label: 'Near limit', color: 'text-[var(--theme-amber)]', dot: 'bg-[var(--theme-amber)]' }
    : { label: 'On track', color: 'text-[var(--theme-teal)]', dot: 'bg-[var(--theme-teal)]' };

  const handleAddComment = async (budgetId: number) => {
    const text = commentInputs[budgetId]?.trim();
    if (!text) return;
    
    try {
      const newComment = await budgetCommentService.addComment(budgetId, text);
      setComments(prev => ({
        ...prev,
        [budgetId]: [...(prev[budgetId] || []), newComment]
      }));
      setCommentInputs(prev => ({ ...prev, [budgetId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleQuickAddExpense = (categoryId: number, categoryName: string) => {
    navigate(`/add-expense?category=${categoryId}&name=${encodeURIComponent(categoryName)}`);
  };

  const handleDeleteBudget = async (budgetId: number) => {
    try {
      await budgetService.deleteBudget(budgetId);
      toast.success('Budget deleted successfully');
      setDeleteConfirm(null);
      refetch(); // Refresh the budget list
    } catch (error) {
      toast.error('Failed to delete budget');
      console.error('Delete budget error:', error);
    }
  };

  // Settlement amounts from real data
  const user1Paid = parseFloat(settlementData?.user1?.paid || '0');
  const user2Paid = parseFloat(settlementData?.user2?.paid || '0');
  const settlementAmount = Math.abs(user1Paid - user2Paid) / 2;
  const userOwes = user1Paid < user2Paid;

  // Loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Mobile Summary Component
  const MobileSummaryHeader = () => (
    <div className="lg:hidden sticky top-0 z-10 bg-background border-b border-border">
      <button 
        onClick={() => setShowMobileSummary(!showMobileSummary)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-lg font-semibold text-foreground">{formatCurrency(remaining)}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: overallStatus.dot.includes('var') ? overallStatus.dot.replace('bg-[', '').replace(']', '') : undefined }} />
        </div>
        <div className="flex items-center gap-2">
          {showMobileSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      
      {showMobileSummary && (
        <div className="p-4 pt-0 space-y-4 border-t border-border/50">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Budget</div>
              <div className="text-sm font-medium">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Spent</div>
              <div className="text-sm font-medium">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Daily</div>
              <div className={`text-sm font-medium ${isOnTrack ? 'text-(--theme-teal)' : 'text-(--theme-coral)'}`}>
                {formatCurrency(dailyBurnRate)}
              </div>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground">Days</div>
              <div className="text-sm font-medium">{daysLeftInMonth}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-medium text-foreground">Budget Manager</h1>
              
              <div className="flex items-center gap-1 text-sm">
              <DateSelector variant='compact' />
                {/* <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="px-2 py-1 font-medium text-foreground">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button> */}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Scope Tabs */}
              <div className="flex items-center gap-1 text-sm bg-muted rounded-lg p-1">
                {(['ours', 'mine', 'partner'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    disabled={s === 'partner' && !isPartnerConnected}
                    className={`px-3 py-1.5 rounded-md transition-colors capitalize ${
                      currentScope === s
                        ? 'text-foreground bg-card shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    } ${s === 'partner' && !isPartnerConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {s === 'ours' ? 'Shared' : s === 'mine' ? 'Mine' : "Partner's"}
                  </button>
                ))}
              </div>

              {/* Connected Status */}
              {isPartnerConnected && user && partner && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    <Avatar className="h-6 w-6 ring-2 ring-background">
                      <AvatarFallback 
                        className="text-white text-[10px]"
                        style={{ backgroundColor: user.color || 'var(--theme-indigo)' }}
                      >
                        {user.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-6 w-6 ring-2 ring-background">
                      <AvatarFallback 
                        className="text-white text-[10px]"
                        style={{ backgroundColor: partner.color || 'var(--theme-teal)' }}
                      >
                        {partner.name?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 text-(--theme-teal)" />
                </div>
              )}

              <Button 
                size="sm" 
                variant="default"
                className="gap-1.5 text-sm bg-linear-gradient-to-r from-(--theme-indigo) to-(--theme-teal) hover:opacity-90 border-0 text-white"
                onClick={() => setWizardOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Smart Setup
              </Button>

              <Button size="sm" variant="outline" className="gap-1.5 text-sm" onClick={() => setAddBudgetOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileSummaryHeader />

      {/* Month-End Review CTA */}
      {isMonthEnd && (
        <div className="bg-linear-gradient-to-r from-(--theme-indigo) to-(--theme-teal) text-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <div>
                <span className="font-medium">Month ending soon!</span>
                <span className="ml-2 opacity-90">{daysLeftInMonth} days left to review and settle</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate('/settlements')}>
              <CheckCircle2 className="h-4 w-4" />
              Review & Settle
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Summary */}
          <aside className="hidden lg:block lg:col-span-5 space-y-6">
            
            {/* Month At A Glance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Month at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-4xl font-semibold text-foreground tracking-tight">
                    {formatCurrency(remaining)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    remaining of {formatCurrency(totalBudget)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        overallProgress >= 90 ? 'bg-(--theme-coral)' : 
                        overallProgress >= 80 ? 'bg-(--theme-amber)' : 'bg-(--theme-teal)'
                      }`}
                      style={{ width: `${Math.min(100, overallProgress)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: overallStatus.dot.includes('var') ? overallStatus.dot.replace('bg-[', '').replace(']', '') : undefined }} />
                    <span className="text-sm font-medium" style={{ color: overallStatus.color.includes('var') ? overallStatus.color.replace('text-[', '').replace(']', '') : undefined }}>
                      {overallStatus.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Budget</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(totalBudget)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                    <div className="text-lg font-semibold text-foreground">{formatCurrency(totalSpent)}</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      Daily Target
                      {isOnTrack ? (
                        <TrendingUp className="h-3 w-3 text-(--theme-teal)" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-(--theme-coral)" />
                      )}
                    </div>
                    <div className={`text-lg font-semibold ${isOnTrack ? 'text-(--theme-teal)' : 'text-(--theme-coral)'}`}>
                      {formatCurrency(dailyBurnRate)}/day
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Days Left</div>
                    <div className="text-lg font-semibold text-foreground">{daysLeftInMonth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Card */}
            {isPartnerConnected && settlementData && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Settlement
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6 px-2"
                    onClick={() => setShowSettlementDetails(!showSettlementDetails)}
                  >
                    {showSettlementDetails ? 'Hide' : 'Details'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback 
                            className="text-[10px] text-white"
                            style={{ backgroundColor: userOwes ? (user?.color || 'var(--theme-indigo)') : (partner?.color || 'var(--theme-teal)') }}
                          >
                            {userOwes ? user?.name?.[0] : partner?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Avatar className="h-6 w-6">
                          <AvatarFallback 
                            className="text-[10px] text-white"
                            style={{ backgroundColor: userOwes ? (partner?.color || 'var(--theme-teal)') : (user?.color || 'var(--theme-indigo)') }}
                          >
                            {userOwes ? partner?.name?.[0] : user?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-sm font-medium text-foreground">{formatCurrency(settlementAmount)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-(--theme-teal)" onClick={() => navigate('/settlements')}>
                      Reconcile
                    </Button>
                  </div>

                  {showSettlementDetails && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] text-white" style={{ backgroundColor: user?.color || 'var(--theme-indigo)' }}>
                              {user?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">{user?.name} paid</span>
                        </div>
                        <span className="font-medium">{formatCurrency(user1Paid)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] text-white" style={{ backgroundColor: partner?.color || 'var(--theme-teal)' }}>
                              {partner?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">{partner?.name} paid</span>
                        </div>
                        <span className="font-medium">{formatCurrency(user2Paid)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">50/50 Settlement</span>
                        <span className="font-semibold text-(--theme-teal)">{formatCurrency(settlementAmount)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={nearLimitCount > 0 ? 'outline' : 'secondary'}
                    className={nearLimitCount > 0 ? 'border-(--theme-amber) text-(--theme-amber) bg-(--theme-amber)/10' : ''}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {nearLimitCount} near limit
                  </Badge>
                  <Badge variant={overBudgetCount > 0 ? 'destructive' : 'secondary'}>
                    {overBudgetCount > 0 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {overBudgetCount} over budget
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right Column - Categories */}
          <section className="lg:col-span-7">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    All Categories ({sortedBudgets.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-fixed" className="text-xs text-muted-foreground cursor-pointer">
                      Show fixed
                    </Label>
                    <Switch
                      id="show-fixed"
                      checked={showFixedBudgets}
                      onCheckedChange={setShowFixedBudgets}
                      className="h-4 w-7 data-[state=checked]:bg-(--theme-indigo)"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                
                {sortedBudgets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No budgets set for this month</p>
                    <Button onClick={() => setAddBudgetOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Budget
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sortedBudgets.map((budget) => {
                      const status = getStatusInfo(budget.progress, budget.category_is_fixed);
                      const StatusIcon = status.icon;
                      const isExpanded = expandedCategory === budget.id;
                      const CategoryIcon = getIconByName(budget.category_icon);
                      const categoryColor = budget.category_color || '--theme-teal';
                      const { userSpent, partnerSpent } = getUserSpending(budget.category_name);
                      const transactions = getCategoryTransactions(budget.category_name);
                      const budgetComments = comments[budget.id] || [];

                      return (
                        <Collapsible key={budget.id} open={isExpanded} onOpenChange={() => setExpandedCategory(isExpanded ? null : budget.id)}>
                            <div 
                              className={`group flex items-center gap-4 p-3 rounded-lg transition-colors ${isExpanded ? 'bg-accent/30' : 'hover:bg-accent/50'}`}
                              onMouseEnter={() => setHoveredRow(budget.id)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex-1 flex items-center gap-4 cursor-pointer">
                                  {/* Category Icon */}
                                  <div 
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ 
                                      backgroundColor: `color-mix(in oklch, ${budget.category_color || categoryColor} 20%, transparent)`,
                                      color: budget.category_color || categoryColor
                                    }}
                                  >
                                    <CategoryIcon className="h-4 w-4" />
                                  </div>

                                  {/* Category Name */}
                                  <div className="w-28 shrink-0 text-left">
                                    <span className="text-sm font-medium text-foreground">{budget.category_name}</span>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{ 
                                            width: `${Math.min(100, budget.progress)}%`,
                                            backgroundColor: budget.category_color || categoryColor
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground w-9 text-right shrink-0 font-medium">
                                        {Math.round(budget.progress)}%
                                      </span>
                                    </div>
                                  </div>

                                  {/* Amount */}
                                  <div className="text-right shrink-0 w-20">
                                    <div className="text-sm font-medium text-foreground">{formatCurrency(budget.spent)}</div>
                                    <div className="text-[10px] text-muted-foreground">of {formatCurrency(budget.amount)}</div>
                                  </div>

                                  {/* Status Badge */}
                                  <div className="shrink-0 w-24">
                                    <Badge 
                                      variant={status.variant}
                                      className={`text-[10px] ${
                                        status.label === 'Near limit' ? 'border-(--theme-amber) text-(--theme-amber) bg-(--theme-amber)/10' :
                                        status.label === 'On track' ? 'border-(--theme-teal) text-(--theme-teal) bg-(--theme-teal)/10' : ''
                                      }`}
                                    >
                                      {StatusIcon && <StatusIcon className="h-2.5 w-2.5" />}
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              {/* Action Icons - Outside Trigger */}
                              <div className="flex items-center gap-1 shrink-0">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-7 w-7 transition-all ${hoveredRow === budget.id ? 'opacity-100' : 'opacity-0'} hover:text-[--theme-teal]`}
                                      onClick={(e) => { e.stopPropagation(); handleQuickAddExpense(budget.category_id, budget.category_name); }}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Add expense</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost" 
                                      size="icon"
                                      className={`h-7 w-7 transition-all ${hoveredRow === budget.id ? 'opacity-100' : 'opacity-0'}`}
                                      onClick={(e) => { e.stopPropagation(); navigate(`/edit-budget/${budget.id}`); }}
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit budget</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost" 
                                      size="icon"
                                      className={`h-7 w-7 transition-all ${hoveredRow === budget.id ? 'opacity-100' : 'opacity-0'} hover:text-red-500`}
                                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(budget.id); }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete budget</TooltipContent>
                                </Tooltip>
                              </div>

                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            {/* Expanded Content */}
                            <CollapsibleContent>
                              <div className="px-3 pb-4 space-y-4">
                                <Separator />
                                
                                {/* Partner Breakdown */}
                                {isPartnerConnected && (
                                  <div className="flex gap-4">
                                    <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-[8px] text-white" style={{ backgroundColor: user?.color || 'var(--theme-indigo)' }}>
                                            {user?.name?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">{user?.name}</span>
                                      </div>
                                      <div className="text-sm font-semibold">{formatCurrency(userSpent)}</div>
                                    </div>
                                    <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="text-[8px] text-white" style={{ backgroundColor: partner?.color || 'var(--theme-teal)' }}>
                                            {partner?.name?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground">{partner?.name}</span>
                                      </div>
                                      <div className="text-sm font-semibold">{formatCurrency(partnerSpent)}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Recent Transactions */}
                                {transactions.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-2">Recent Transactions</div>
                                    <div className="space-y-2">
                                      {transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-5 w-5">
                                              <AvatarFallback 
                                                className="text-[8px] text-white"
                                                style={{ backgroundColor: tx.paid_by_user_id === user?.id ? (user?.color || 'var(--theme-indigo)') : (partner?.color || 'var(--theme-teal)') }}
                                              >
                                                {tx.paid_by_name?.[0] || '?'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div>
                                              <div className="text-sm">{tx.description}</div>
                                              <div className="text-[10px] text-muted-foreground">{tx.date}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${getSplitTypeBadge(tx.split_type)}`}>
                                              {tx.split_type}
                                            </span>
                                            <span className="text-sm font-medium">{formatCurrency(tx.amount)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Comments */}
                                {isPartnerConnected && (
                                  <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-2">
                                      Discussion ({budgetComments.length})
                                    </div>
                                    
                                    {loadingComments[budget.id] ? (
                                      <div className="flex justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : budgetComments.length > 0 ? (
                                      <div className="space-y-2 mb-3">
                                        {budgetComments.map((comment) => (
                                          <div key={comment.id} className={`flex gap-2 ${comment.user_id === user?.id ? '' : 'flex-row-reverse'}`}>
                                            <Avatar className="h-6 w-6 shrink-0">
                                              <AvatarFallback 
                                                className="text-[9px] text-white"
                                                style={{ backgroundColor: comment.user_color || (comment.user_id === user?.id ? '--theme-indigo' : '--theme-teal') }}
                                              >
                                                {comment.user_name?.[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className={`flex-1 p-2 rounded-lg text-sm ${comment.user_id === user?.id ? 'bg-muted/50' : 'bg-[--theme-teal]/10'}`}>
                                              <p>{comment.text}</p>
                                              <span className="text-[10px] text-muted-foreground">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground mb-3">No comments yet.</p>
                                    )}
                                    
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Add a comment..."
                                        value={commentInputs[budget.id] || ''}
                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [budget.id]: e.target.value }))}
                                        className="flex-1"
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(budget.id); }}
                                      />
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleAddComment(budget.id)}
                                        disabled={!commentInputs[budget.id]?.trim()}
                                      >
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      {/* Smart Budget Wizard */}
      <SmartBudgetWizard
        isOpen={isWizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={() => {
          setWizardOpen(false);
          refetch();
        }}
        categories={categories}
        existingBudgets={budgetsWithSpending}
        month={selectedMonth}
        year={selectedYear}
      />

      {/* Add Budget Modal - Redesigned */}
      <Dialog open={isAddBudgetOpen} onOpenChange={setAddBudgetOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-card">
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {modalSelectedCategory ? 'Set Budget Goal' : 'New Budget'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {modalSelectedCategory 
                  ? `Plan your spending for ${modalSelectedCategory.name}`
                  : 'Select a category to start tracking'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {!modalSelectedCategory ? (
              /* Phase 1: Category Selection */
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    className="pl-9 bg-muted/30 border-transparent focus:bg-background transition-all"
                  />
                </div>

                {availableCategories.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm mb-1">All set!</p>
                    <p className="text-xs text-muted-foreground">
                      Every category already has a budget.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {availableCategories
                      .filter(cat => cat.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                      .map((category) => {
                        const IconComponent = getIconByName(category.icon);
                        const categoryColor = getCategoryColor(category);
                        
                        return (
                          <button
                            key={category.id}
                            onClick={() => setModalSelectedCategory(category)}
                            className="flex flex-col items-center justify-center p-4 gap-3 rounded-xl border border-border/50 bg-card hover:border-[--theme-indigo] hover:bg-[--theme-indigo]/5 hover:shadow-sm transition-all group text-center"
                          >
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                              style={getCategoryIconStyle(categoryColor, false, 0.15)}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground line-clamp-1">
                              {category.name}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              /* Phase 2: Amount & Configuration */
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                
                {/* Selected Category Header */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={getCategoryIconStyle(getCategoryColor(modalSelectedCategory), false, 0.2)}
                    >
                      {(() => {
                        const Icon = getIconByName(modalSelectedCategory.icon);
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{modalSelectedCategory.name}</p>
                      <p className="text-xs text-muted-foreground">Monthly Budget</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setModalSelectedCategory(null)}
                    className="text-xs h-8 hover:bg-background"
                  >
                    Change
                  </Button>
                </div>

                {/* Amount Input */}
                <div className="space-y-4 text-center">
                  <div className="relative inline-block w-full max-w-[200px]">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-medium text-muted-foreground/50">kr</span>
                    <Input
                      autoFocus
                      placeholder="0"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="text-4xl font-bold text-center h-16 border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/20 px-8"
                      type="number"
                      step="100"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How much do you want to spend?
                  </p>
                </div>

                {/* Smart Suggestions */}
                {suggestions && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-[--theme-amber]" />
                      <span>Smart Suggestions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalAmount(suggestions.matchAvg.toString())}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-[--theme-teal]/10 hover:border-[--theme-teal]/30 transition-all text-left"
                      >
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Average</span>
                        <span className="text-sm font-medium">{formatCurrency(suggestions.matchAvg)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalAmount(suggestions.plusTen.toString())}
                        className="flex flex-col items-start p-2.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-[--theme-teal]/10 hover:border-[--theme-teal]/30 transition-all text-left"
                      >
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Growth (+10%)</span>
                        <span className="text-sm font-medium">{formatCurrency(suggestions.plusTen)}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Alerts Configuration */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Near Limit Alert</Label>
                      <p className="text-[10px] text-muted-foreground">Notify when 80% is reached</p>
                    </div>
                    <Switch
                      checked={alertAt80Percent}
                      onCheckedChange={setAlertAt80Percent}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Over Budget Alert</Label>
                      <p className="text-[10px] text-muted-foreground">Notify when budget is exceeded</p>
                    </div>
                    <Switch
                      checked={alertOnExceed}
                      onCheckedChange={setAlertOnExceed}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border/50 bg-muted/10">
            <Button variant="ghost" onClick={() => setAddBudgetOpen(false)}>
              Cancel
            </Button>
            {modalSelectedCategory && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAddBudgetSubmit(true)}
                  className="hidden sm:flex"
                >
                  Save & Add Another
                </Button>
                <Button 
                  onClick={() => handleAddBudgetSubmit(false)}
                  className="bg-[--theme-indigo] hover:bg-[--theme-indigo]/90 text-white min-w-[100px]"
                  disabled={!modalAmount}
                >
                  Set Budget
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the budget but won't affect any existing expenses. You can always create a new budget later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteBudget(deleteConfirm)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
