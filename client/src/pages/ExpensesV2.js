"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import axios from '../api/axios';
import { useExpenseModal } from '../context/ExpenseModalContext';
import useScopedExpenses from '../hooks/useScopedExpenses';
import { useScope } from '../context/ScopeContext';
import formatCurrency from '../utils/formatCurrency';
import {
  createRangeFromFilters,
  filterExpensesByRange,
  buildCategorySummaries,
  computeRecurringSummary,
  buildHeroCopy,
  buildInsights,
  buildDailySeries,
  sumAmounts,
} from '../utils/expensesAnalytics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import Pill from '../components/ui/pill';
import { ChartContainer, ChartTooltipContent } from '../components/ui/chart';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
} from 'recharts';

const {
  Filter,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  CheckCircle2,
  Tag,
} = LucideIcons;

const today = new Date();
const defaultFilters = {
  month: '',
  year: String(today.getFullYear()),
  category: '',
};

const currencyFormatter = (value) => formatCurrency(value || 0);

const toPascalCase = (value) => {
  return String(value || '')
    .split(/[^\w]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');
};

const resolveCategoryIcon = (iconName) => {
  if (!iconName) {
    return Tag;
  }

  const normalized = toPascalCase(iconName);
  const IconComponent =
    LucideIcons[normalized] ||
    LucideIcons[`${normalized}Icon`] ||
    Tag;

  return IconComponent;
};

const ExpensesV2 = () => {
  const location = useLocation();
  const { scope, totals, isPartnerConnected } = useScope();
  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    refresh: refreshExpenses,
  } = useScopedExpenses();
  const { openAddModal, openEditModal } = useExpenseModal();

  const [categories, setCategories] = useState([]);
  const [recurringTemplates, setRecurringTemplates] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const monthParam = params.get('month') || '';
    const yearParam = params.get('year') || String(today.getFullYear());
    const categoryParam = params.get('category') || '';

    setFilters((current) => {
      if (
        current.month === monthParam &&
        current.year === yearParam &&
        current.category === categoryParam
      ) {
        return current;
      }
      return {
        month: monthParam,
        year: yearParam,
        category: categoryParam,
      };
    });
  }, [location.search]);

  useEffect(() => {
    let mounted = true;

    const loadMetadata = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const [categoryRes, recurringRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/recurring-expenses'),
        ]);

        if (!mounted) return;
        setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
        setRecurringTemplates(Array.isArray(recurringRes.data) ? recurringRes.data : []);
      } catch (err) {
        console.error('Failed to load expense metadata', err);
        if (mounted) {
          setMetaError('Unable to load expense metadata right now.');
        }
      } finally {
        if (mounted) {
          setMetaLoading(false);
        }
      }
    };

    loadMetadata();

    return () => {
      mounted = false;
    };
  }, []);

  const range = useMemo(() => createRangeFromFilters(filters), [filters]);

  const filteredExpenses = useMemo(
    () => filterExpensesByRange(expenses, range.start, range.end, filters.category),
    [expenses, range, filters.category]
  );

  const previousPeriodExpenses = useMemo(
    () => filterExpensesByRange(expenses, range.previousStart, range.previousEnd, filters.category),
    [expenses, range, filters.category]
  );

  const dailySeries = useMemo(
    () => buildDailySeries(filteredExpenses, range.start, range.end),
    [filteredExpenses, range]
  );

  const totalsCurrent = useMemo(() => sumAmounts(filteredExpenses), [filteredExpenses]);
  const totalsPrevious = useMemo(() => sumAmounts(previousPeriodExpenses), [previousPeriodExpenses]);

  const categorySummaries = useMemo(
    () =>
      buildCategorySummaries({
        currentExpenses: filteredExpenses,
        previousExpenses: previousPeriodExpenses,
        allExpenses: expenses,
        categories,
      }),
    [filteredExpenses, previousPeriodExpenses, expenses, categories]
  );

  const recurringSummary = useMemo(
    () =>
      computeRecurringSummary({
        recurringTemplates,
        expenses,
        start: range.start,
        end: range.end,
      }),
    [recurringTemplates, expenses, range]
  );

  const insights = useMemo(
    () =>
      buildInsights({
        categorySummaries,
        totals: totalsCurrent,
        previousTotals: totalsPrevious,
        recurringSummary,
        dailySeries,
      }),
    [categorySummaries, totalsCurrent, totalsPrevious, recurringSummary, dailySeries]
  );

  const heroCopy = useMemo(
    () =>
      buildHeroCopy({
        filters,
        categories,
        range,
      }),
    [filters, categories, range]
  );

  const scopeLabel = useMemo(() => {
    if (scope === 'mine') return 'My spending';
    if (scope === 'partner') {
      return isPartnerConnected ? "Partner's spending" : 'Partner scope unavailable';
    }
    return 'Shared spending';
  }, [isPartnerConnected, scope]);

  const scopedTotal = useMemo(() => {
    switch (scope) {
      case 'mine':
        return totals?.mine || 0;
      case 'partner':
        return totals?.partner || 0;
      default:
        return totals?.ours || 0;
    }
  }, [scope, totals]);

  const selectedCategory = useMemo(() => {
    if (!filters.category) return null;
    return categories.find((cat) => String(cat.id) === String(filters.category)) || null;
  }, [filters.category, categories]);

  const daysInRange = useMemo(() => {
    const diff = range.end.getTime() - range.start.getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [range]);

  const averagePerDay = totalsCurrent / daysInRange || 0;

  const handleExpenseSuccess = useCallback(
    (savedExpense) => {
      if (savedExpense) {
        refreshExpenses();
      }
    },
    [refreshExpenses]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this expense?')) return;
      try {
        await axios.delete(`/expenses/${id}`);
        refreshExpenses();
      } catch (err) {
        console.error('Failed to delete expense', err);
        setMetaError('Unable to delete that expense at the moment.');
      }
    },
    [refreshExpenses]
  );

  const handleGenerateRecurring = useCallback(async () => {
    const year = filters.year || String(today.getFullYear());
    const month = filters.month
      ? String(parseInt(filters.month, 10))
      : String(today.getMonth() + 1);
    try {
      await axios.get(`/summary/monthly/${year}/${month}`);
      refreshExpenses();
    } catch (err) {
      console.error('Failed to generate recurring bills', err);
      setMetaError('Could not generate recurring bills right now.');
    }
  }, [filters.month, filters.year, refreshExpenses]);

  const handleFilterApply = (nextFilters) => {
    setFilters(nextFilters);
  };

  const resetFilters = () => setFilters(defaultFilters);

  const loading = metaLoading || expensesLoading;
  const error = expensesError || metaError;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          Gathering your spending insights…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-rose-100 bg-rose-50 px-6 py-5 text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="space-y-8">
        <SectionBanner
          title={heroCopy.title}
          subtitle={heroCopy.subtitle}
          scopeLabel={scopeLabel}
          onOpenFilter={() => setIsFilterOpen(true)}
          onAddExpense={() => openAddModal(handleExpenseSuccess)}
          scopedTotal={currencyFormatter(scopedTotal)}
        />

        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TotalSpendingCard
              range={range}
              selectedCategory={selectedCategory}
              totalAmount={totalsCurrent}
              dailySeries={dailySeries}
              averagePerDay={averagePerDay}
              transactionCount={filteredExpenses.length}
              onViewTransactions={() => setShowTransactions(true)}
            />
            <RecurringCard
              recurringSummary={recurringSummary}
              templates={recurringTemplates}
              onGenerate={handleGenerateRecurring}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
            <CategorySummaryGrid
              categorySummaries={categorySummaries}
              expandedCategory={expandedCategory}
              expenses={filteredExpenses}
              onViewCategoryTransactions={(categoryId) => {
                setExpandedCategory((current) =>
                  current === categoryId ? null : categoryId
                );
              }}
              onEditExpense={(expense) => openEditModal(expense, handleExpenseSuccess)}
              onDeleteExpense={handleDelete}
              categories={categories}
            />
            <InsightsPanel
              insights={insights}
              onAction={({ actionKey, categoryId }) => {
                if (actionKey === 'view-category-transactions' && categoryId) {
                  setExpandedCategory(categoryId);
                }
                if (actionKey === 'view-daily-trend') {
                  setShowTransactions(true);
                }
                if (actionKey === 'review-recurring') {
                  handleGenerateRecurring();
                }
              }}
            />
          </div>
        </div>
      </div>

      <FilterDialog
        open={isFilterOpen}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        onReset={() => {
          resetFilters();
          setIsFilterOpen(false);
        }}
        categories={categories}
      />

      <TransactionsSheet
        open={showTransactions}
        onClose={() => setShowTransactions(false)}
        expenses={filteredExpenses}
        categories={categories}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onSuccess={handleExpenseSuccess}
      />
    </div>
  );
};

const SectionBanner = ({ title, subtitle, scopeLabel, scopedTotal, onOpenFilter, onAddExpense }) => (
  <div className="rounded-3xl border border-slate-100 bg-gradient-to-r from-indigo-100 via-white to-white px-6 py-8 shadow-sm">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          {scopeLabel}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm text-slate-600 lg:text-base">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="pill"
          className="border-indigo-100 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
          onClick={onOpenFilter}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button
          variant="primary"
          className="bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 before:border-indigo-500/40"
          onClick={onAddExpense}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add expense
        </Button>
      </div>
    </div>
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-indigo-100/30">
      Your active scope total: <span className="font-semibold text-slate-900">{scopedTotal}</span>
    </div>
  </div>
);

const TotalSpendingCard = ({
  range,
  selectedCategory,
  totalAmount,
  dailySeries,
  averagePerDay,
  transactionCount,
  onViewTransactions,
}) => {
  const hasData = dailySeries.length > 0;
  const title =
    range.mode === 'month'
      ? `${new Date(range.year, range.month - 1, 1).toLocaleString('en', { month: 'long' })} spending`
      : `${range.year} spending`;

  const description = selectedCategory
    ? `This is what you've spent on ${selectedCategory.name.toLowerCase()} for the selected period.`
    : 'This is what you and your partner have spent so far this period.';

  const gradientId = `daily-spending-${range.year}-${range.month || 'year'}`;

  return (
    <Card className="relative h-full rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg text-slate-900">{title}</CardTitle>
        <CardDescription className="text-sm text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <Pill tone="positive" className="px-4 py-2 text-base font-semibold">
          {currencyFormatter(totalAmount)}
        </Pill>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          {hasData ? (
            <ChartContainer className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySeries}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.slice(5)}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent formatter={currencyFormatter} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    name="Spending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-44 items-center justify-center text-sm text-slate-500">
              We’ll build your trend line once expenses land in this timeframe.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <strong className="text-slate-900">{transactionCount}</strong> transactions captured
          </span>
          <span>
            Average per day:{' '}
            <strong className="text-slate-900">{currencyFormatter(averagePerDay)}</strong>
          </span>
        </div>
      </CardContent>
      <CardFooter className="justify-between px-6 pb-6 pt-0">
        <Button variant="pill" className="px-4 py-2" onClick={onViewTransactions}>
          View all transactions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const RecurringCard = ({ recurringSummary, templates, onGenerate }) => {
  const hasTemplates = templates.length > 0;
  const shouldGenerate = recurringSummary.upcomingCount > 0;

  return (
    <Card className="relative h-full rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg text-slate-900">Upcoming bills</CardTitle>
        <CardDescription className="text-sm text-slate-600">
          {hasTemplates
            ? `You have ${templates.length} recurring ${(templates.length === 1 ? 'template' : 'templates')} keeping your bills on autopilot.`
            : 'Set up recurring templates to automate your monthly bills.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {hasTemplates ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-center text-sm text-slate-600">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-emerald-600">Generated</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-700">
                  {recurringSummary.generatedCount}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Upcoming</div>
                <div className="mt-2 text-2xl font-semibold text-slate-700">
                  {recurringSummary.upcomingCount}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <ChartContainer className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { label: 'Generated', value: recurringSummary.generatedCount },
                      { label: 'Upcoming', value: recurringSummary.upcomingCount },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <span>
                Coverage:{' '}
                <strong className="text-slate-900">{recurringSummary.coverage}%</strong> generated
                this period
              </span>
              <span>
                Generated amount:{' '}
                <strong className="text-slate-900">
                  {currencyFormatter(recurringSummary.generatedAmount)}
                </strong>
              </span>
            </div>
          </>
        ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500">
              Add a template to never miss a bill again. We’ll surface upcoming due dates here.
            </div>
        )}
      </CardContent>
      <CardFooter className="justify-between px-6 pb-6 pt-0">
        <Button
          variant={shouldGenerate ? 'primary' : 'pill'}
          className={shouldGenerate ? 'bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 before:border-indigo-500/40' : 'px-4 py-2'}
          onClick={onGenerate}
          aria-label="Generate recurring expenses for the selected period"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {shouldGenerate ? 'Generate remaining' : 'Review recurring'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CategorySummaryGrid = ({
  categorySummaries,
  expandedCategory,
  expenses,
  onViewCategoryTransactions,
  onEditExpense,
  onDeleteExpense,
  categories,
}) => {
  if (!categorySummaries.length) {
    return (
      <Card className="relative rounded-3xl border border-slate-100 bg-white shadow-sm">
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-lg text-slate-900">Category breakdown</CardTitle>
          <CardDescription className="text-sm text-slate-600">
            We’ll summarize spending by category once you have expenses for this period.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-sm text-slate-500">
            Try adding a few expenses or selecting a broader timeframe to see insights here.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {categorySummaries.map((summary) => {
        const trendTone =
          summary.trend.direction === 'up'
            ? 'warning'
            : summary.trend.direction === 'down'
            ? 'positive'
            : 'neutral';
        const trendCopy =
          summary.trend.direction === 'stable'
            ? 'Holding steady'
            : summary.trend.direction === 'up'
            ? `${Math.abs(summary.trend.percentage)}% higher`
            : `${Math.abs(summary.trend.percentage)}% lower`;

        const isExpanded = expandedCategory === summary.categoryId;
        const gradientId = `category-${summary.categoryId}`;

        const categoryTransactions = expenses.filter(
          (expense) => String(expense.category_id) === String(summary.categoryId)
        );

        const categoryMeta = categories.find(
          (cat) => String(cat.id) === String(summary.categoryId)
        );

        const CategoryIconComponent = resolveCategoryIcon(categoryMeta?.icon);

        return (
          <Card
            key={summary.categoryId}
            className="relative rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <CardHeader className="items-start justify-between gap-4 px-6 pt-6 sm:flex sm:flex-row sm:items-center">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  {summary.categoryName}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {`You've spent ${currencyFormatter(summary.total)} across ${summary.count} ${
                    summary.count === 1 ? 'transaction' : 'transactions'
                  }.`}
                </CardDescription>
              </div>
              <Pill tone={trendTone} className="px-3 py-1">
                {trendCopy}
              </Pill>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <ChartContainer className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.sparkline}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => value.slice(5)}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                        content={<ChartTooltipContent formatter={currencyFormatter} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        name="Spending"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="justify-between px-6 pb-6 pt-0">
              <Button
                variant="pill"
                className="px-4 py-2"
                onClick={() => onViewCategoryTransactions(summary.categoryId)}
              >
                {isExpanded ? 'Hide transactions' : 'View transactions'}
                {isExpanded ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
              {CategoryIconComponent ? (
                <div className="hidden rounded-2xl border border-slate-100 bg-slate-50 p-3 text-indigo-500 sm:flex">
                  <CategoryIconComponent className="h-5 w-5" />
                </div>
              ) : null}
            </CardFooter>
            {isExpanded ? (
              <div className="border-t border-slate-100 bg-slate-50/60">
                <ul className="divide-y divide-slate-200">
                  {categoryTransactions.map((expense) => (
                    <li
                      key={expense.id}
                      className="flex flex-col gap-3 px-6 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">
                          {expense.description || 'Untitled expense'}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                          {expense.recurring_expense_id ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                              Recurring
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <span className="font-semibold text-slate-900">
                          {currencyFormatter(expense.amount)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="pill"
                            size="sm"
                            onClick={() => onEditExpense(expense)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="pill"
                            size="sm"
                            onClick={() => onDeleteExpense(expense.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
};

const toneConfig = {
  alert: {
    icon: AlertTriangle,
    pillTone: 'danger',
    background: 'from-rose-50 to-white',
    text: 'text-rose-700',
  },
  celebration: {
    icon: CheckCircle2,
    pillTone: 'positive',
    background: 'from-emerald-50 to-white',
    text: 'text-emerald-700',
  },
  info: {
    icon: Sparkles,
    pillTone: 'info',
    background: 'from-sky-50 to-white',
    text: 'text-sky-700',
  },
};

const InsightsPanel = ({ insights, onAction }) => (
  <Card className="relative rounded-3xl border border-slate-100 bg-white shadow-sm">
    <CardHeader className="px-6 pt-6">
      <CardTitle className="text-lg text-slate-900">Your financial check-up</CardTitle>
      <CardDescription className="text-sm text-slate-600">
        Personalized highlights to keep your spending on-track.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 px-6 pb-6">
      {insights.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-6 text-sm text-emerald-700 shadow-inner">
          Everything looks calm right now. We’ll surface new tips as soon as trends change.
        </div>
      ) : (
        insights.map((insight) => {
          const config = toneConfig[insight.tone] || toneConfig.info;
          const Icon = config.icon;
          const useBarChart = insight.chart?.length && insight.chart.length <= 3;
          const chartData = insight.chart || [];
          const chartGradientId = `insight-${insight.id}`;

          return (
            <div
              key={insight.id}
              className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${config.background} p-5`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm font-medium ${config.text}`}>
                    <Icon className="h-4 w-4" />
                    {insight.title}
                  </div>
                  <p className="text-sm text-slate-600">{insight.body}</p>
                  {insight.meta ? (
                    <Pill tone={config.pillTone} className="text-xs uppercase tracking-wide">
                      {insight.meta}
                    </Pill>
                  ) : null}
                </div>
                <Button
                  variant="pill"
                  size="sm"
                  className="px-4 py-2"
                  onClick={() => onAction(insight)}
                >
                  {insight.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {chartData.length ? (
                <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-3">
                  <ChartContainer className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      {useBarChart ? (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                          />
                          <RechartsTooltip
                            cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                            content={<ChartTooltipContent />}
                          />
                          <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#6366f1" />
                        </BarChart>
                      ) : (
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="label"
                            tickFormatter={(value) => value.slice(5)}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
                            content={<ChartTooltipContent formatter={currencyFormatter} />}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill={`url(#${chartGradientId})`}
                            dot={false}
                          />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
);

const FilterDialog = ({ open, filters, onClose, onApply, onReset, categories }) => {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm md:items-center">
      <div className="h-full w-full max-w-md rounded-t-3xl bg-white shadow-xl md:h-auto md:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filter spending</h2>
            <p className="text-sm text-slate-500">Scope the insights to the timeframe you need.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="month" className="text-sm font-medium text-slate-700">
              Month
            </label>
            <select
              id="month"
              name="month"
              value={draft.month}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All months</option>
              {Array.from({ length: 12 }).map((_, index) => {
                const monthValue = String(index + 1).padStart(2, '0');
                const label = new Date(2024, index, 1).toLocaleString('en', { month: 'long' });
                return (
                  <option key={monthValue} value={monthValue}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="year" className="text-sm font-medium text-slate-700">
              Year
            </label>
            <select
              id="year"
              name="year"
              value={draft.year}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {Array.from({ length: 5 }).map((_, index) => {
                const yearValue = new Date().getFullYear() - index;
                return (
                  <option key={yearValue} value={yearValue}>
                    {yearValue}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={draft.category}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={onReset}>
              Reset filters
            </Button>
            <Button type="submit" variant="soft">
              Apply filters
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionsSheet = ({
  open,
  onClose,
  expenses,
  categories,
  onEdit,
  onDelete,
  onSuccess,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm lg:items-center">
      <div className="h-[85vh] w-full max-w-5xl overflow-hidden rounded-t-3xl bg-white shadow-2xl lg:h-[80vh] lg:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
            <p className="text-sm text-slate-500">
              A detailed look at every expense in this filtered view.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close transactions">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="h-full overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No expenses match these filters yet.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-900">{expense.description || 'Untitled expense'}</td>
                    <td className="px-6 py-4">
                      {expense.category_name ||
                        categories.find((category) => category.id === expense.category_id)?.name ||
                        '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900">
                      {currencyFormatter(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="pill"
                          size="sm"
                          onClick={() => onEdit(expense, onSuccess)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="pill"
                          size="sm"
                          onClick={() => onDelete(expense.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesV2;
