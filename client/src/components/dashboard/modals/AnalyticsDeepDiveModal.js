import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import {
  X,
  LineChart as LineChartIcon,
  TrendingUp,
  List,
  CircleDollarSign,
  BarChart3,
  Sparkles,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  GaugeCircle
} from 'lucide-react';
import axios from '../../../api/axios';
import formatCurrency from '../../../utils/formatCurrency';
import { getGoalColorScheme } from '../../../utils/goalColorPalette';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/enhanced-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const ranges = [
  { value: '3months', label: 'Last 3 months', months: 3 },
  { value: '6months', label: 'Last 6 months', months: 6 },
  { value: '1year', label: 'Last 12 months', months: 12 }
];

const scopeLabelMap = {
  ours: 'Shared view',
  mine: 'My view',
  partner: 'Partner view'
};

const chartPalette = [
  '#0EA5E9',
  '#6366F1',
  '#10B981',
  '#14B8A6',
  '#8B5CF6',
  '#F97316',
  '#F59E0B',
  '#475569'
];

const chartGridStroke = '#e2e8f0';
const chartTickStyle = { fill: '#475569', fontSize: 12, fontWeight: 500 };
const axisProps = { axisLine: false, tickLine: false };

const formatMonthLabel = (value) => {
  if (!value) return '—';
  if (value.includes('-') && value.length <= 7) {
    const [year, month] = value.split('-');
    const safeDate = new Date(Number(year), Number(month) - 1, 1);
    if (!Number.isNaN(safeDate.getTime())) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(safeDate);
    }
  }
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(directDate);
  }
  return value;
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const normalisePercent = (value) => {
  const numeric = toNumber(value, 0);
  if (!Number.isFinite(numeric)) return 0;
  const percent = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
  return Math.round(percent * 10) / 10;
};

const hasDetailedStructure = (data) => Array.isArray(data?.monthlyData) && data.monthlyData.length > 0;

const computeRange = (months) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months + 1);
  start.setDate(1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
};

const buildMetricCards = (summary) => {
  const metrics = [
    {
      label: 'Total spending',
      value: formatCurrency(summary.totalSpending),
      description: 'What left our accounts this window.',
      Icon: Wallet,
      accentIndex: 6
    },
    {
      label: 'Total income',
      value: formatCurrency(summary.totalIncome),
      description: 'Money that came in across all sources.',
      Icon: PiggyBank,
      accentIndex: 0
    },
    {
      label: 'Avg monthly spend',
      value: formatCurrency(summary.avgMonthlySpending),
      description: 'Typical month inside the selected range.',
      Icon: GaugeCircle,
      accentIndex: 3
    }
  ];

  return metrics.map((metric) => ({
    ...metric,
    accent: getGoalColorScheme(metric.accentIndex)
  }));
};

const SavingsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 text-sm shadow-xl">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-2 grid gap-2 text-slate-600">
        {payload.map((entry) => {
          const key = entry.dataKey;
          const color = entry.stroke || entry.fill;
          const value = key === 'savingsRate'
            ? `${normalisePercent(entry.value).toFixed(1)}%`
            : formatCurrency(entry.value);
          const labelMap = key === 'savingsRate' ? 'Savings rate' : 'Amount saved';
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {labelMap}
              </span>
              <span className="font-medium text-slate-900">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ContributionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 text-sm shadow-xl">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-2 grid gap-2 text-slate-600">
        {payload.map((series) => {
          const amount = toNumber(series.payload?.[series.dataKey]);
          const percent = series.percent != null
            ? Math.round(series.percent * 100)
            : series.payload?.__total
              ? Math.round((amount / series.payload.__total) * 100)
              : 0;
          return (
            <div key={series.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.fill }} />
                {series.name}
              </span>
              <span className="font-medium text-slate-900">
                {formatCurrency(amount)}{' '}
                <span className="text-xs text-slate-400">{`(${percent}%)`}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CashflowTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 text-sm shadow-xl">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="mt-2 grid gap-2 text-slate-600">
        {payload.map((series) => (
          <div key={series.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.fill }} />
              {series.name}
            </span>
            <span className="font-medium text-slate-900">{formatCurrency(series.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 text-sm shadow-xl">
      <div className="font-semibold text-slate-900">{entry.name}</div>
      <div className="mt-1 text-slate-600">{formatCurrency(entry.value)}</div>
      <div className="text-xs text-slate-400">{`${entry.percent.toFixed(1)}% of period spend`}</div>
    </div>
  );
};

const AnalyticsDeepDiveModal = ({
  open,
  onClose,
  scope,
  initialTrends,
  initialIncomeExpenses
}) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailedTrends, setDetailedTrends] = useState(
    hasDetailedStructure(initialTrends) ? initialTrends : null
  );
  const [incomeExpenses, setIncomeExpenses] = useState(initialIncomeExpenses || null);

  const fetchDetailedData = useCallback(async (rangeValue) => {
    const selected = ranges.find((range) => range.value === rangeValue) || ranges[1];
    const { startDate, endDate } = computeRange(selected.months);
    setLoading(true);
    setError(null);
    try {
      const [trendsRes, incomeRes] = await Promise.all([
        axios.get(`/analytics/trends/detailed/${startDate}/${endDate}`, { params: { scope } }),
        axios.get(`/analytics/income-expenses/${startDate}/${endDate}`, { params: { scope } })
      ]);
      setDetailedTrends(trendsRes.data);
      setIncomeExpenses(incomeRes.data);
    } catch (err) {
      console.error('Failed to load detailed analytics', err);
      setError('We could not refresh the data right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setActiveTab('overview');
    setTimeRange('6months');
    setError(null);

    if (hasDetailedStructure(initialTrends)) {
      setDetailedTrends(initialTrends);
    } else {
      setDetailedTrends(null);
      fetchDetailedData('6months');
    }

    if (initialIncomeExpenses) {
      setIncomeExpenses(initialIncomeExpenses);
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, initialTrends, initialIncomeExpenses, onClose, fetchDetailedData]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (timeRange === '6months' && hasDetailedStructure(initialTrends)) {
      return;
    }
    fetchDetailedData(timeRange);
  }, [timeRange, open, initialTrends, fetchDetailedData]);

  const monthlyDetail = useMemo(() => {
    if (!Array.isArray(detailedTrends?.monthlyData)) {
      return [];
    }

    return detailedTrends.monthlyData.map((entry) => {
      const monthRaw = entry.month || entry.monthYear || entry.period || '';
      const income = toNumber(entry.income ?? entry.totalIncome ?? entry.total_income);
      const spending = toNumber(
        entry.spending
        ?? entry.totalSpending
        ?? entry.total_spending
        ?? entry.expenses
        ?? entry.totalExpenses
      );
      const rawSavingsRate = entry.savingsRate ?? entry.savings_rate;
      const derivedRate = rawSavingsRate != null && rawSavingsRate !== ''
        ? rawSavingsRate
        : income > 0
          ? (income - spending) / income
          : 0;
      const categories = Array.isArray(entry.categories) ? entry.categories : [];
      const scopeTotals = entry.scopeTotals || entry.scope_totals || entry.scope || {};

      const shared = toNumber(scopeTotals.shared ?? scopeTotals.ours ?? 0);
      const mine = toNumber(scopeTotals.mine ?? scopeTotals.personal ?? 0);
      const partnerTotal = toNumber(scopeTotals.partner ?? scopeTotals.them ?? 0);
      const totalContribution = shared + mine + partnerTotal || spending;

      return {
        monthKey: monthRaw || formatMonthLabel(monthRaw),
        monthLabel: formatMonthLabel(monthRaw),
        income,
        spending,
        net: income - spending,
        savingsRate: normalisePercent(derivedRate),
        categories,
        scopeTotals: {
          shared,
          mine,
          partner: partnerTotal
        },
        totalContribution
      };
    });
  }, [detailedTrends]);

  const summary = useMemo(() => {
    const base = detailedTrends?.periodSummary || detailedTrends?.summary;
    if (base) {
      const totalIncome = toNumber(base.totalIncome ?? base.total_income);
      const totalSpending = toNumber(base.totalSpending ?? base.total_spending ?? base.totalExpenses);
      const netSurplus = toNumber(base.netSurplus ?? base.net_surplus ?? totalIncome - totalSpending);
      const avgMonthlySpending = toNumber(base.avgMonthlySpending ?? base.averageMonthlySpending ?? base.avg_monthly_spending);
      return {
        totalIncome,
        totalSpending,
        netSurplus,
        avgMonthlySpending
      };
    }
    const fallback = incomeExpenses?.summary;
    if (fallback) {
      const totalIncome = toNumber(fallback.totalIncome ?? fallback.total_income);
      const totalSpending = toNumber(fallback.totalExpenses ?? fallback.total_expenses);
      const netSurplus = toNumber(fallback.totalSurplus ?? fallback.total_surplus ?? totalIncome - totalSpending);
      return {
        totalIncome,
        totalSpending,
        netSurplus,
        avgMonthlySpending: toNumber(fallback.avgMonthlySpending ?? fallback.avg_monthly_spending)
      };
    }
    return {
      totalIncome: 0,
      totalSpending: 0,
      netSurplus: 0,
    avgMonthlySpending: 0
  };
}, [detailedTrends, incomeExpenses]);

const savingsTrendData = useMemo(() => monthlyDetail.map((row) => ({
    month: row.monthLabel,
    savingsRate: row.savingsRate,
    savingsAmount: row.net
  })), [monthlyDetail]);

  const categoryTotals = useMemo(() => {
    const totals = new Map();
    monthlyDetail.forEach((row) => {
      row.categories.forEach((category) => {
        const name = category.name || category.category || 'Uncategorized';
        const value = toNumber(category.total ?? category.amount ?? category.value);
        const current = totals.get(name) || { name, value: 0, count: 0 };
        current.value += value;
        current.count += toNumber(category.expense_count ?? category.count ?? 0);
        totals.set(name, current);
      });
    });

    return Array.from(totals.values())
      .map((entry) => ({
        ...entry,
        value: Math.round(entry.value * 100) / 100
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyDetail]);

  const totalCategorySpend = useMemo(
    () => categoryTotals.reduce((sum, cat) => sum + cat.value, 0),
    [categoryTotals]
  );

  const categoryPieData = useMemo(() => categoryTotals.slice(0, 5).map((category, index) => ({
    name: category.name,
    value: category.value,
    percent: totalCategorySpend ? (category.value / totalCategorySpend) * 100 : 0,
    color: chartPalette[index % chartPalette.length]
  })), [categoryTotals, totalCategorySpend]);

  const areaCategoryNames = useMemo(() => {
    const names = categoryTotals.slice(0, 5).map((entry) => entry.name);
    if (categoryTotals.length > 5) {
      names.push('Other');
    }
    return names;
  }, [categoryTotals]);

  const trendsAreaData = useMemo(() => {
    if (!monthlyDetail.length) {
      return [];
    }
    return monthlyDetail.map((row) => {
      const payload = { month: row.monthLabel };
      let otherTotal = 0;
      row.categories.forEach((category) => {
        const name = category.name || category.category || 'Uncategorized';
        const value = toNumber(category.total ?? category.amount ?? category.value);
        if (areaCategoryNames.includes(name)) {
          payload[name] = (payload[name] || 0) + value;
        } else {
          otherTotal += value;
        }
      });
      if (areaCategoryNames.includes('Other')) {
        payload.Other = otherTotal;
      }
      areaCategoryNames.forEach((name) => {
        if (payload[name] == null) {
          payload[name] = 0;
        }
      });
      return payload;
    });
  }, [monthlyDetail, areaCategoryNames]);

  const contributionData = useMemo(() => monthlyDetail.map((row) => ({
    month: row.monthLabel,
    Shared: toNumber(row.scopeTotals.shared),
    Mine: toNumber(row.scopeTotals.mine),
    Partner: toNumber(row.scopeTotals.partner),
    __total: row.totalContribution || 0
  })), [monthlyDetail]);

  const cashflowData = useMemo(() => monthlyDetail.map((row) => ({
    month: row.monthLabel,
    Income: row.income,
    Expenses: row.spending
  })), [monthlyDetail]);

const breakdownRows = useMemo(() => monthlyDetail.map((row) => ({
  month: row.monthLabel,
  income: row.income,
  spending: row.spending,
  net: row.net,
  savingsRate: row.savingsRate,
  shared: row.scopeTotals.shared,
  mine: row.scopeTotals.mine,
  partner: row.scopeTotals.partner
})), [monthlyDetail]);

const bestMonth = useMemo(() => {
  if (!monthlyDetail.length) return null;
  return [...monthlyDetail].sort((a, b) => b.net - a.net)[0];
}, [monthlyDetail]);

const toughestMonth = useMemo(() => {
  if (!monthlyDetail.length) return null;
  return [...monthlyDetail].sort((a, b) => a.net - b.net)[0];
}, [monthlyDetail]);

const topCategory = categoryTotals[0] || null;

const contributionSummary = useMemo(() => {
  if (!monthlyDetail.length) return null;
  const totals = monthlyDetail.reduce(
    (acc, row) => {
      acc.shared += row.scopeTotals.shared;
      acc.mine += row.scopeTotals.mine;
      acc.partner += row.scopeTotals.partner;
      return acc;
    },
    { shared: 0, mine: 0, partner: 0 }
  );
  const total = totals.shared + totals.mine + totals.partner;
  if (!total) return null;
  return {
    shared: Math.round((totals.shared / total) * 100),
    mine: Math.round((totals.mine / total) * 100),
    partner: Math.round((totals.partner / total) * 100)
  };
}, [monthlyDetail]);

  const currentRange = ranges.find((range) => range.value === timeRange);
  const scopeLabel = scopeLabelMap[scope] || 'Shared view';

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const isEmpty = !loading && !error && !monthlyDetail.length;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur">
      <div className="relative flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl">
        <header className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-emerald-25 to-white px-12 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/50 border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                <Sparkles className="h-4 w-4" />
                Financial check-up
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Spending deep dive
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">Your financial story in detail</h2>
                <p className="max-w-2xl text-sm text-slate-600">
                  Explore how income, spending, and contributions shift across the months. Each tab stays descriptive and calm so you can spot patterns and share context confidently.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 shadow-sm">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  {scopeLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 shadow-sm">
                  {currentRange?.label}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={timeRange}
                onChange={(event) => setTimeRange(event.target.value)}
              >
                {ranges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close deep dive"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50/80 px-10 py-8 pb-28">
          {loading && (
            <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-100 bg-white text-sm text-slate-500 shadow-sm">
              Refreshing your analytics…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-600 shadow-sm">
              {error}
            </div>
          )}

          {isEmpty && (
            <div className="rounded-3xl border border-slate-100 bg-white px-6 py-10 text-center text-sm text-slate-600 shadow-sm">
              We do not have detailed analytics for this period yet. Try a different range to explore more history.
            </div>
          )}

          {!loading && !error && !isEmpty && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full flex-col gap-6"
            >
              <TabsList className="flex flex-wrap gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm w-fit">
                <TabsTrigger value="overview">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    Overview
                  </div>
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trends
                  </div>
                </TabsTrigger>
                <TabsTrigger value="breakdown">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Breakdown
                  </div>
                </TabsTrigger>
                <TabsTrigger value="cashflow">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-4 w-4" />
                    Cash flow
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex-1 focus-visible:outline-none">
                <div className="space-y-8">
                  <div className="rounded-3xl bg-gradient-to-r from-emerald-100/40 to-white border border-emerald-100/50 px-6 py-5 mb-5 flex items-center gap-3 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <LineChartIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Savings rate over time</div>
                      <div className="text-xs text-slate-600">How much of your income stayed in reserve each month, paired with the net amount you kept.</div>
                    </div>
                  </div>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-2 pb-0">
                      <CardTitle className="sr-only">Savings rate over time</CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 pb-6 pt-4 md:px-4">
                      <div className="h-80 rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={savingsTrendData} margin={{ top: 30, right: 24, bottom: 8, left: 18 }}>
                          <defs>
                            <linearGradient id="savingsAmountGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.48} />
                              <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 6" />
                          <XAxis dataKey="month" tick={chartTickStyle} {...axisProps} />
                          <YAxis
                            yAxisId="left"
                            tickFormatter={(value) => `${value}%`}
                            tick={chartTickStyle}
                            {...axisProps}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={chartTickStyle}
                            {...axisProps}
                          />
                          <Tooltip content={<SavingsTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Bar
                            yAxisId="right"
                            dataKey="savingsAmount"
                            name="Amount saved"
                            fill="url(#savingsAmountGradient)"
                            stroke="#0EA5E9"
                            strokeWidth={1.5}
                            radius={[12, 12, 4, 4]}
                            maxBarSize={36}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="savingsRate"
                            name="Savings rate"
                            stroke="#6366F1"
                            strokeWidth={3}
                            dot={{ r: 4, stroke: '#a6bafc', strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 2, fill: '#6366F1', stroke: '#EEF2FF' }}
                          />
                        </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="text-lg font-semibold text-slate-900">Period summary</CardTitle>
                      <p className="text-sm text-slate-600">
                        A high-level recap of what went well and where to keep an eye.
                      </p>
                    </CardHeader>
                    <CardContent className="px-4 pb-6">
                      <div className="space-y-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/40 p-6 shadow-inner">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Net position</p>
                            <p className="mt-2 text-3xl font-semibold text-emerald-700">
                              {formatCurrency(summary.netSurplus)}
                            </p>
                          </div>
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-emerald-600 shadow-sm">
                            <ArrowUpRight className="h-5 w-5" />
                          </span>
                        </div>
                        <p className="text-sm text-emerald-700">
                          {summary.netSurplus >= 0
                            ? 'We held onto more than we spent across the selected months.'
                            : 'Expenses outpaced income in this range—worth scanning the breakdown below.'}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {buildMetricCards(summary).map((metric) => (
                            <div
                              key={metric.label}
                              className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${metric.accent.surface} ${metric.accent.border}`}
                            >
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                {metric.label}
                              </span>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="text-lg font-semibold text-slate-900">{metric.value}</span>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow">
                                  <metric.Icon className="h-4 w-4" />
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{metric.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="text-lg font-semibold text-slate-900">Key highlights</CardTitle>
                      <p className="text-sm text-slate-600">
                        Notable patterns and insights from your spending.
                      </p>
                    </CardHeader>
                    <CardContent className="px-4 pb-6">
                      <div className="space-y-3">
                        {bestMonth && (
                          <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50/80 to-sky-50/40 p-5 shadow-inner">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Bright spot</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-lg font-semibold text-slate-900">{bestMonth.monthLabel}</span>
                              <span className="text-sm font-semibold text-emerald-600">
                                {formatCurrency(bestMonth.net)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              Income of {formatCurrency(bestMonth.income)} with spending of {formatCurrency(bestMonth.spending)}.
                            </p>
                          </div>
                        )}
                        {toughestMonth && toughestMonth.net < bestMonth?.net && (
                          <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/80 to-rose-50/40 p-5 shadow-inner">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600">Tougher month</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-lg font-semibold text-slate-900">{toughestMonth.monthLabel}</span>
                              <span className="text-sm font-semibold text-rose-500">
                                {formatCurrency(toughestMonth.net)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              Spending reached {formatCurrency(toughestMonth.spending)} against income of {formatCurrency(toughestMonth.income)}.
                            </p>
                          </div>
                        )}
                        {topCategory && (
                          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50/80 to-slate-50/40 p-5 shadow-inner">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Top category</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-lg font-semibold text-slate-900">{topCategory.name}</span>
                              <span className="text-sm font-semibold text-slate-600">
                                {formatCurrency(topCategory.value)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              {topCategory.name} represented {totalCategorySpend ? `${((topCategory.value / totalCategorySpend) * 100).toFixed(1)}%` : '—'} of total spend.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 xl:grid-cols-1">

                    <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                      <CardHeader className="space-y-3 pb-0">
                        <CardTitle className="text-lg font-semibold text-slate-900">Top categories</CardTitle>
                        <p className="text-sm text-slate-600">
                          Where most of our spending landed.
                        </p>
                      </CardHeader>
                      <CardContent className="grid gap-4 px-4 pb-6">
                        {categoryPieData.length ? (
                          <div className="flex flex-col gap-4">
                            <div className="h-48 rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <defs>
                                    {categoryPieData.map((category, index) => (
                                      <linearGradient key={category.name} id={`category-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={category.color} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={category.color} stopOpacity={0.25} />
                                      </linearGradient>
                                    ))}
                                  </defs>
                                  <Pie
                                    data={categoryPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    stroke="#fff"
                                  >
                                    {categoryPieData.map((entry, index) => (
                                      <Cell key={entry.name} fill={`url(#category-${index})`} stroke={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CategoryPieTooltip />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                              {categoryPieData.map((category) => (
                                <div key={category.name} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                                    <span>{category.name}</span>
                                    <span>{category.percent.toFixed(1)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${Math.min(category.percent, 100)}%`,
                                        background: category.color
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-50/80 text-sm text-slate-500">
                            No category data in this range.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="flex-1 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-emerald-100/40 to-white border border-emerald-100/50 px-6 py-5 flex items-center gap-3 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Category composition over time</div>
                      <div className="text-xs text-slate-600">Stacked to show how key categories shaped overall spend each month.</div>
                    </div>
                  </div>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="sr-only">Category composition over time</CardTitle>
                      <p className="sr-only">
                        Stacked to show how key categories shaped overall spend each month.
                      </p>
                      {!!areaCategoryNames.length && (
                        <div className="flex flex-wrap gap-2">
                          {areaCategoryNames.slice(0, 4).map((name, index) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                              />
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                  </CardHeader>
                  <CardContent className="px-3 pb-6 pt-4 md:px-4">
                    <div className="h-[420px] rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsAreaData} margin={{ top: 48, right: 24, bottom: 8, left: 18 }}>
                          <defs>
                            {areaCategoryNames.map((name, index) => (
                              <linearGradient key={name} id={`trend-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={chartPalette[index % chartPalette.length]} stopOpacity={0.32} />
                                <stop offset="100%" stopColor={chartPalette[index % chartPalette.length]} stopOpacity={0.05} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 6" />
                        <XAxis dataKey="month" tick={chartTickStyle} {...axisProps} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} tick={chartTickStyle} {...axisProps} />
                        <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                        <Legend verticalAlign="top" height={40} iconType="circle" />
                        {areaCategoryNames.map((name, index) => (
                          <Area
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stackId="1"
                            stroke={chartPalette[index % chartPalette.length]}
                            strokeWidth={2}
                            fill={`url(#trend-${index})`}
                          />
                        ))}
                      </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="flex-1 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-emerald-100/40 to-white border border-emerald-100/50 px-6 py-5 flex items-center gap-3 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <List className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Spending breakdown</div>
                      <div className="text-xs text-slate-600">Detailed view of shared and personal spending patterns.</div>
                    </div>
                  </div>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="text-lg font-semibold text-slate-900">Shared vs personal contributions</CardTitle>
                      <p className="text-sm text-slate-600">
                        Each column represents the month's spend, segmented by who covered it.
                      </p>
                      {contributionSummary && (
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Shared', value: contributionSummary.shared, color: chartPalette[0] },
                            { label: 'Mine', value: contributionSummary.mine, color: chartPalette[1] },
                            { label: 'Partner', value: contributionSummary.partner, color: chartPalette[2] }
                          ].map((item) => (
                            <span
                              key={item.label}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                            >
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.label}: {item.value}%
                            </span>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="px-3 pb-6 pt-4 md:px-4">
                      <div className="h-96 rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={contributionData} stackOffset="expand" margin={{ top: 36, right: 24, bottom: 8, left: 18 }}>
                            <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 6" />
                            <XAxis dataKey="month" tick={chartTickStyle} {...axisProps} />
                            <YAxis tickFormatter={(value) => `${Math.round(value * 100)}%`} tick={chartTickStyle} {...axisProps} />
                            <Tooltip content={<ContributionTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                          {['Shared', 'Mine', 'Partner'].map((key, index) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              name={key}
                              stackId="scopes"
                              fill={chartPalette[index % chartPalette.length]}
                              radius={[12, 12, 0, 0]}
                              maxBarSize={48}
                            />
                          ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="text-lg font-semibold text-slate-900">Monthly breakdown</CardTitle>
                      <p className="text-sm text-slate-600">
                        Raw numbers remain available when you need to double-check the math.
                      </p>
                    </CardHeader>
                    <CardContent className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/60">
                      <div className="max-h-[360px] overflow-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead className="sticky top-0 bg-white/90 backdrop-blur">
                            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              <th className="px-5 py-3">Month</th>
                              <th className="px-5 py-3">Income</th>
                              <th className="px-5 py-3">Spending</th>
                              <th className="px-5 py-3">Net</th>
                              <th className="px-5 py-3">Savings rate</th>
                              <th className="px-5 py-3">Shared</th>
                              <th className="px-5 py-3">Mine</th>
                              <th className="px-5 py-3">Partner</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {breakdownRows.map((row) => (
                              <tr key={row.month} className="transition hover:bg-slate-50/80">
                                <td className="px-5 py-3 font-medium text-slate-700">{row.month}</td>
                                <td className="px-5 py-3">{formatCurrency(row.income)}</td>
                                <td className="px-5 py-3">{formatCurrency(row.spending)}</td>
                                <td className={`px-5 py-3 font-semibold ${row.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {formatCurrency(row.net)}
                                </td>
                                <td className="px-5 py-3">
                                  {Number.isFinite(row.savingsRate) ? `${row.savingsRate.toFixed(1)}%` : '—'}
                                </td>
                                <td className="px-5 py-3">{formatCurrency(row.shared)}</td>
                                <td className="px-5 py-3">{formatCurrency(row.mine)}</td>
                                <td className="px-5 py-3">{formatCurrency(row.partner)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="cashflow" className="flex-1 focus-visible:outline-none">
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-emerald-100/40 to-white border border-emerald-100/50 px-6 py-5 flex items-center gap-3 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Income vs expenses</div>
                      <div className="text-xs text-slate-600">A clear view of cash coming in compared to what left the budget.</div>
                    </div>
                  </div>

                  <Card className="p-4 rounded-3xl border border-slate-100 bg-white shadow-lg">
                    <CardHeader className="space-y-3 pb-0">
                      <CardTitle className="sr-only">Income vs expenses</CardTitle>
                      <p className="sr-only">A clear view of cash coming in compared to what left the budget.</p>
                    </CardHeader>
                  <CardContent className="px-3 pb-6 pt-4 md:px-4">
                    <div className="h-[360px] rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashflowData} margin={{ top: 36, right: 24, bottom: 8, left: 18 }}>
                          <CartesianGrid stroke={chartGridStroke} strokeDasharray="4 6" />
                          <XAxis dataKey="month" tick={chartTickStyle} {...axisProps} />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} tick={chartTickStyle} {...axisProps} />
                          <Tooltip content={<CashflowTooltip />} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="Income" fill="#10B981" radius={[12, 12, 0, 0]} maxBarSize={42} />
                          <Bar dataKey="Expenses" fill="#F97316" radius={[12, 12, 0, 0]} maxBarSize={42} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
};

AnalyticsDeepDiveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  initialTrends: PropTypes.object,
  initialIncomeExpenses: PropTypes.object
};

export default AnalyticsDeepDiveModal;
