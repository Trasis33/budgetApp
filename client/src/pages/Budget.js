import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';

// Import shadcn/ui enhanced tabs
import { Tabs, TabsList, TabsTrigger } from '../components/ui/enhanced-tabs';

// Import month/year navigator
import { MonthYearNavigator } from '../components/ui/month-year-navigator';

// Import analytics components
import BudgetOptimizationTips from '../components/BudgetOptimizationTips';
import EnhancedCategorySpendingChart from '../components/charts/EnhancedCategorySpendingChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import BudgetActualChart from '../components/charts/BudgetActualChart';
import BudgetAccordion from '../components/ui/BudgetAccordion';
import useLazyLoad from '../hooks/useLazyLoad';
import { SkeletonChart } from '../components/ui/Skeletons';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Wallet,
  Sparkles,
  ListChecks,
  Circle,
  Trash2,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

const Budget = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('budget');
  const [incomes, setIncomes] = useState([]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [timePeriod, setTimePeriod] = useState('6months');
  const [incomePanelTab, setIncomePanelTab] = useState('view');
  const [savingBudgetId, setSavingBudgetId] = useState(null);

  const sections = [
    { id: 'budget', label: 'Budget Overview', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'income', label: 'Income Management', icon: '💼' }
  ];

  const manageBudgetsSectionRef = useRef(null);
  const incomeCenterRef = useRef(null);
  const budgetInputRefs = useRef({});
  const highlightTimeoutRef = useRef(null);
  const [highlightCategoryId, setHighlightCategoryId] = useState(null);

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const basePromises = [
        axios.get(`/incomes?month=${month}&year=${year}`),
        axios.get(`/summary/charts/${year}/${month}`),
        axios.get('/categories')
      ];
      
      const [incomesRes, chartsRes, categoriesRes] = await Promise.all(basePromises);
      setIncomes(incomesRes.data);
      setChartData(chartsRes.data);
      setCategories(categoriesRes.data);
      
      const initialBudgets = {};
      chartsRes.data.categorySpending.forEach(item => {
        const category = categoriesRes.data.find(c => c.name === item.category);
        if (category) {
          initialBudgets[category.id] = item.budget || '';
        }
      });
      setBudgets(initialBudgets);

    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgetData();
  }, [month, year, fetchBudgetData]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Lazy-load refs (single declaration)
  const { ref: catRef, isVisible: catVisible } = useLazyLoad();
  const { ref: ieRef, isVisible: ieVisible } = useLazyLoad();
  const { ref: bvaRef, isVisible: bvaVisible } = useLazyLoad();

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/incomes', { source, amount, date });
      setSource('');
      setAmount('');
      setIncomePanelTab('view');
      fetchBudgetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await axios.delete(`/incomes/${id}`);
      fetchBudgetData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBudgetChange = (categoryId, value) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSaveBudget = async (categoryId) => {
    const rawValue = budgets[categoryId];
    const parsedValue = parseFloat(rawValue);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      setError('Please enter a valid budget amount before saving.');
      return;
    }

    try {
      setSavingBudgetId(categoryId);
      await axios.post('/budgets', {
        category_id: categoryId,
        amount: parsedValue,
        month,
        year
      });
      await fetchBudgetData();
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('We could not save that budget. Please try again.');
    } finally {
      setSavingBudgetId(null);
    }
  };

  const scrollToManageBudgets = () => {
    if (manageBudgetsSectionRef.current) {
      manageBudgetsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToIncomeCenter = (tab = 'view') => {
    setIncomePanelTab(tab);
    if (incomeCenterRef.current) {
      incomeCenterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFocusBudgetInput = (categoryName) => {
    if (!categoryName) {
      return;
    }

    const category = categories.find((item) => item.name === categoryName);
    if (!category) {
      return;
    }

    scrollToManageBudgets();

    const input = budgetInputRefs.current[category.id];
    if (input) {
      window.requestAnimationFrame(() => {
        try {
          input.focus({ preventScroll: true });
        } catch (err) {
          input.focus();
        }
        if (typeof input.select === 'function') {
          input.select();
        }
      });
    }

    setHighlightCategoryId(category.id);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightCategoryId(null);
    }, 4000);
  };

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#22c55e',
    accent: '#f97316',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gray: '#6b7280',
    red: '#ef4444',
    yellow: '#eab308'
  };

  const getCategoryChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    const colors = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.accent,
      chartColors.purple,
      chartColors.pink,
      chartColors.gray,
      chartColors.red,
      chartColors.yellow,
    ];

    const donutColors = colors.map(color => `${color}B3`);

    const sortedCategories = [...chartData.categorySpending].sort((a, b) => b.total - a.total);

    return {
      labels: sortedCategories.map((c) => c.category),
      datasets: [
        {
          label: 'Spending by Category',
          data: sortedCategories.map((c) => c.total),
          backgroundColor: donutColors.slice(0, sortedCategories.length),
          borderWidth: 1,
          borderColor: '#ffffff',
          hoverOffset: 8,
        },
      ],
    };
  };

  const getIncomeExpenseChartData = () => {
    if (!chartData?.monthlyTotals) {
      return null;
    }

    return {
      labels: ['Income vs. Expenses'],
      datasets: [
        {
          label: 'Income',
          data: [chartData.monthlyTotals.income || 0],
          backgroundColor: chartColors.secondary + '80',
          borderColor: chartColors.secondary,
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: [chartData.monthlyTotals.expenses || 0],
          backgroundColor: chartColors.accent + '80',
          borderColor: chartColors.accent,
          borderWidth: 1,
        },
      ],
    };
  };

  const getBudgetVsActualChartData = () => {
    if (!chartData?.categorySpending || chartData.categorySpending.length === 0) {
      return null;
    }

    const performanceData = chartData.categorySpending.map(item => {
      if (!item.budget) return 'none';
      const utilization = (item.total / item.budget) * 100;
      return utilization > 100 ? 'over' : utilization > 90 ? 'warning' : 'good';
    });

    const budgetColors = performanceData.map(status => {
      switch (status) {
        case 'over': return chartColors.red;
        case 'warning': return chartColors.yellow;
        case 'good': return chartColors.secondary;
        default: return chartColors.gray;
      }
    });

    return {
      labels: chartData.categorySpending.map(c => c.category),
      datasets: [
        {
          label: 'Budgeted',
          data: chartData.categorySpending.map(c => c.budget || 0),
          backgroundColor: chartColors.primary + '40',
          borderColor: chartColors.primary,
          borderWidth: 1,
        },
        {
          label: 'Actual Spending',
          data: chartData.categorySpending.map(c => c.total || 0),
          backgroundColor: budgetColors.map(color => color + '80'),
          borderColor: budgetColors,
          borderWidth: 1,
        }
      ]
    };
  };

  if (!user) {
    return null;
  }

  const shouldShowGlobalError = error && activeSection !== 'budget';

  const renderContent = () => {
    switch (activeSection) {
      case 'budget':
        return renderBudgetSection();
      case 'analytics':
        return renderAnalyticsSection();
      case 'income':
        return renderIncomeSection();
      default:
        return renderBudgetSection();
    }
  };

  const renderBudgetSection = () => {
    const loadingSteps = [
      {
        title: 'Syncing your latest transactions',
        caption: 'Pulling budget, income, and expense data for this month.',
      },
      {
        title: 'Analyzing category trends',
        caption: 'Spotting the categories that need attention first.',
      },
      {
        title: 'Preparing personalized guidance',
        caption: 'Drafting action steps to keep your plan on track.',
      },
    ];

    const categorySpending = chartData?.categorySpending ?? [];
    const monthlyTotals = chartData?.monthlyTotals ?? { income: 0, expenses: 0 };
    const incomeTotal = monthlyTotals.income || 0;
    const expenseTotal = monthlyTotals.expenses || 0;
    const netCashFlow = incomeTotal - expenseTotal;
    const hasCashFlowData = incomeTotal > 0 || expenseTotal > 0;
    const isBreakEven = Math.abs(netCashFlow) < 1;
    const isSurplus = netCashFlow > 0 && !isBreakEven;
    const cashFlowImpactLabel = isBreakEven
      ? 'Balanced Month'
      : `${isSurplus ? '+' : '-'}${formatCurrency(Math.abs(netCashFlow))} ${isSurplus ? 'Surplus' : 'Deficit'}`;
    const cashFlowImpactClasses = isBreakEven
      ? 'border border-indigo-100 bg-indigo-50 text-indigo-600'
      : isSurplus
        ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
        : 'border border-rose-100 bg-rose-50 text-rose-600';
    const cashFlowCopy = (() => {
      if (!hasCashFlowData) {
        return 'Add your income and expenses to see how your monthly cash flow is trending.';
      }
      if (isBreakEven) {
        return 'Your spending matched your income this month. It’s a great moment to plan the next move for your savings.';
      }
      if (isSurplus) {
        return `You're bringing in ${formatCurrency(incomeTotal)} and spending ${formatCurrency(expenseTotal)}. Great job building a surplus!`;
      }
      return `Your expenses were higher than your income this month. Let's see where you can rebalance.`;
    })();

    const sortedCategories = [...categorySpending].sort((a, b) => b.total - a.total);
    const topCategory = sortedCategories[0];
    const totalSpending = categorySpending.reduce((sum, item) => sum + (item.total || 0), 0);
    const topCategoryShare = topCategory && totalSpending
      ? Math.round((topCategory.total / totalSpending) * 100)
      : 0;
    const categoryCopy = topCategory
      ? `${topCategory.category} was your biggest expense category this month, making up ${topCategoryShare}% of your spending.`
      : 'We haven’t recorded any spending yet this month. Once you add transactions, we’ll spotlight where your money is going.';

    const trackedBudgets = categorySpending.filter((item) => item.budget && Number(item.budget) > 0);
    const performanceBreakdown = trackedBudgets.reduce(
      (acc, item) => {
        const ratio = item.budget ? item.total / item.budget : 0;
        if (ratio >= 1.05) {
          acc.over += 1;
        } else if (ratio >= 0.9) {
          acc.warning += 1;
        } else {
          acc.good += 1;
        }
        return acc;
      },
      { good: 0, warning: 0, over: 0 }
    );
    const totalTrackedBudgets = trackedBudgets.length;
    const confidenceScore = totalTrackedBudgets
      ? Math.max(0, Math.min(100, Math.round((performanceBreakdown.good / totalTrackedBudgets) * 100)))
      : 60;
    const confidenceTone = confidenceScore >= 80 ? 'emerald' : confidenceScore >= 60 ? 'amber' : 'slate';
    const confidenceClassMap = {
      emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-600',
      amber: 'border border-amber-200 bg-amber-50 text-amber-600',
      slate: 'border border-slate-200 bg-slate-100 text-slate-600',
    };
    const budgetHealthCopy = (() => {
      if (!totalTrackedBudgets) {
        return 'Set a target for each category so we can keep an eye on how your spending lines up with your goals.';
      }
      if (performanceBreakdown.over > 0) {
        return `${performanceBreakdown.over} ${performanceBreakdown.over === 1 ? 'category is' : 'categories are'} over budget. Let’s adjust allocations before the month ends.`;
      }
      if (performanceBreakdown.warning > 0) {
        return `You're nearing the limit in ${performanceBreakdown.warning} ${performanceBreakdown.warning === 1 ? 'category' : 'categories'}. A small tweak keeps everything on track.`;
      }
      return "You're on track with every budget this month. Keep the momentum going!";
    })();

    const spendingByCategoryName = categorySpending.reduce((acc, item) => {
      acc[item.category] = item;
      return acc;
    }, {});

    const budgetSections = categories.map((category) => {
      const record = spendingByCategoryName[category.name] || {};
      const spent = record.total || 0;
      const value = budgets[category.id] ?? '';
      const numericValue = parseFloat(value) || 0;
      const remaining = numericValue ? numericValue - spent : 0;
      const quickSets = spent > 0
        ? [
            { label: 'Match spending', value: spent.toFixed(2) },
            { label: 'Add 10%', value: (spent * 1.1).toFixed(2) },
          ]
        : [];

      return {
        id: String(category.id),
        title: category.name,
        spent,
        value,
        numericValue,
        remaining,
        quickSets,
        highlighted: highlightCategoryId === category.id,
        autoExpand: highlightCategoryId === category.id,
        onValueChange: (next) => handleBudgetChange(category.id, next),
        onQuickSet: (next) => handleBudgetChange(category.id, next),
        onSave: () => handleSaveBudget(category.id),
        isSaving: savingBudgetId === category.id,
        registerInput: (node) => {
          if (node) {
            budgetInputRefs.current[category.id] = node;
          }
        },
      };
    });

    const categoriesWithBudgets = budgetSections.filter((section) => section.numericValue > 0);
    const manageBudgetsCopy = categoriesWithBudgets.length
      ? `You have budgets for ${categoriesWithBudgets.length} of ${categories.length} categories. A quick tune-up keeps your plan intentional.`
      : 'Creating a budget for each category is the best way to take control of your finances.';

    const actionPillClass =
      'inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50';

    const categoryChartData = getCategoryChartData();
    const incomeExpenseChartData = getIncomeExpenseChartData();
    const budgetVsActualChartData = getBudgetVsActualChartData();

    if (loading) {
      return (
        <div className="mt-6">
          <div className="relative rounded-[32px] border border-white/40 bg-white/70 p-10 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-slate-700">
              <ListChecks className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-indigo-400">Preparing</p>
                <h3 className="text-2xl font-semibold text-slate-900">Running your financial check-up</h3>
              </div>
            </div>
            <div className="mt-8 space-y-5">
              {loadingSteps.map((step, index) => {
                const isCurrent = index === 0;
                return (
                  <div key={step.title} className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isCurrent
                          ? 'border-2 border-indigo-200 bg-indigo-50 text-indigo-500 animate-pulse'
                          : 'border border-slate-200 bg-white text-slate-300'
                      }`}
                    >
                      {isCurrent ? <Sparkles className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isCurrent ? 'text-slate-800' : 'text-slate-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-400">{step.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mt-6">
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 h-5 w-5 text-rose-500" />
              <div>
                <h3 className="text-lg font-semibold text-rose-700">We couldn’t load your budgets</h3>
                <p className="mt-2 text-sm text-rose-600">{error}</p>
                <button
                  onClick={fetchBudgetData}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const CashIcon = isSurplus || isBreakEven ? TrendingUp : TrendingDown;

    const totalIncomeLogged = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-r from-indigo-100 via-white to-white px-8 py-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 h-6 w-6 text-indigo-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-indigo-500">Financial Check-up</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Your budgets at a glance</h2>
              <p className="mt-2 text-sm text-slate-600">
                We combined your latest spending, income, and goals to highlight what needs attention right now.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <CashIcon className={`h-4 w-4 ${isSurplus || isBreakEven ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <span>Cash Flow</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Your Monthly Cash Flow</h3>
                <p className="mt-2 text-sm text-slate-600">{cashFlowCopy}</p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${cashFlowImpactClasses}`}>
                {cashFlowImpactLabel}
              </span>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-3">
              <div ref={ieRef} className="min-h-[220px]">
                {ieVisible ? (
                  hasCashFlowData && incomeExpenseChartData ? (
                    <IncomeExpenseChart chartData={incomeExpenseChartData} formatCurrency={formatCurrency} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 text-sm text-slate-400">
                      Add income and expenses to visualize your cash flow.
                    </div>
                  )
                ) : (
                  <SkeletonChart />
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className={actionPillClass}
              >
                Review Expenses
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToIncomeCenter('add')}
                className={actionPillClass}
              >
                Manage Income
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <PieChart className="h-4 w-4 text-indigo-500" />
                  <span>Spending Breakdown</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Where Your Money Went</h3>
                <p className="mt-2 text-sm text-slate-600">{categoryCopy}</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-3">
              <div ref={catRef} className="min-h-[220px]">
                {catVisible ? (
                  categoryChartData ? (
                    <EnhancedCategorySpendingChart
                      chartData={categoryChartData}
                      formatCurrency={formatCurrency}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 text-sm text-slate-400">
                      No spending yet for this month. Add expenses to unlock insights.
                    </div>
                  )
                ) : (
                  <SkeletonChart />
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={scrollToManageBudgets} className={actionPillClass}>
                Adjust Budgets
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/expenses')}
                className={actionPillClass}
              >
                View All Transactions
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg md:col-span-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Target className="h-4 w-4 text-indigo-500" />
                  <span>Budget Performance</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Budget Health Check</h3>
                <p className="mt-2 text-sm text-slate-600">{budgetHealthCopy}</p>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-xs font-medium text-slate-500">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-600">
                    <dt>On track</dt>
                    <dd className="text-lg font-semibold">{performanceBreakdown.good}</dd>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-amber-600">
                    <dt>Near limit</dt>
                    <dd className="text-lg font-semibold">{performanceBreakdown.warning}</dd>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-rose-600">
                    <dt>Over</dt>
                    <dd className="text-lg font-semibold">{performanceBreakdown.over}</dd>
                  </div>
                </dl>
              </div>
              <span className={`inline-flex h-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${confidenceClassMap[confidenceTone]}`}>
                Confidence: {confidenceScore}%
              </span>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/60 px-2 py-3">
              <div ref={bvaRef} className="min-h-[240px]">
                {bvaVisible ? (
                  budgetVsActualChartData ? (
                    <BudgetActualChart
                      chartData={budgetVsActualChartData}
                      formatCurrency={formatCurrency}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 text-sm text-slate-400">
                      Set budgets for your categories to compare planned versus actual spending.
                    </div>
                  )
                ) : (
                  <SkeletonChart />
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={scrollToManageBudgets} className={actionPillClass}>
                Fine-tune Budgets
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={manageBudgetsSectionRef}
            className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg md:col-span-2"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <ListChecks className="h-4 w-4 text-indigo-500" />
                  <span>Budgets</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Set Your Spending Goals</h3>
                <p className="mt-2 text-sm text-slate-600">{manageBudgetsCopy}</p>
              </div>
              <button
                type="button"
                onClick={() => scrollToIncomeCenter('view')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                View Incomes
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">
              <BudgetAccordion
                sections={budgetSections}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          <div
            ref={incomeCenterRef}
            className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg md:col-span-2"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  <span>Income Center</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Your Income</h3>
                <p className="mt-2 text-sm text-slate-600">
                  You’ve logged {incomes.length} {incomes.length === 1 ? 'income stream' : 'income streams'} this month
                  totaling {formatCurrency(totalIncomeLogged)}.
                </p>
              </div>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
              <button
                type="button"
                onClick={() => setIncomePanelTab('view')}
                className={`rounded-full px-4 py-1 transition ${incomePanelTab === 'view' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
              >
                View Incomes
              </button>
              <button
                type="button"
                onClick={() => setIncomePanelTab('add')}
                className={`rounded-full px-4 py-1 transition ${incomePanelTab === 'add' ? 'bg-white text-slate-900 shadow-sm' : ''}`}
              >
                Add New Income
              </button>
            </div>

            <div className="mt-6">
              {incomePanelTab === 'view' ? (
                incomes.length ? (
                  <ul className="space-y-3">
                    {incomes.map((income) => (
                      <li
                        key={income.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{income.source}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(income.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-semibold text-emerald-600">
                            {formatCurrency(income.amount)}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDeleteIncome(income.id)}
                            className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:text-rose-500"
                            aria-label={`Delete income ${income.source}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    <Wallet className="mb-3 h-8 w-8 text-slate-400" />
                    No income recorded for this month yet. Add your first entry to track progress.
                  </div>
                )
              ) : (
                <form onSubmit={handleAddIncome} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-slate-500">Income Source</label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="e.g., Salary, Freelance project"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-slate-500">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="1000.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-slate-500">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Income
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="glass-card hover-lift">
        <h3 className="section-title gradient-text">Time Period</h3>
        <select
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="form-select"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="2years">Last 2 Years</option>
        </select>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsRateTracker />
        <SavingsGoalsManager />
      </div> */}

      <BudgetOptimizationTips
        categories={categories}
        onAdjustBudget={handleFocusBudgetInput}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );

  const renderIncomeSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add Income</h3>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Income Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Salary, Freelance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="1000.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              Add Income
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Income This Month</h3>
          <div className="space-y-4">
            {incomes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No income recorded for this month</p>
            ) : (
              incomes.map((income) => (
                <div key={income.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{income.source}</p>
                    <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">{formatCurrency(income.amount)}</p>
                    <button 
                      onClick={() => handleDeleteIncome(income.id)} 
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-content">
      {/* Error card */}
      {shouldShowGlobalError && (
        <div className="glass-card error-card">
          <div className="section-header">
            <h3 className="section-title gradient-text">Error</h3>
          </div>
          <p className="error-message-text">{error}</p>
          <button onClick={fetchBudgetData} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Tabs card */}
      <div className="dashboard-header">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="tabs-list-enhanced">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="tab-trigger-enhanced">
                <span className="tab-icon">{section.icon}</span>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="dashboard-header-left">
          <div className="dashboard-actions">
            <MonthYearNavigator
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
              className="w-auto"
            />
          </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Budget;
