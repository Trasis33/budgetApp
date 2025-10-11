import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList
} from 'recharts';
import { cn } from '../../lib/utils';
import { commonMargins } from './chartUtils';

const palette = {
  income: '#10b981',
  expenses: '#fb7185'
};

const formatCompactCurrency = (value) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

const EmptyState = () => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
    <span className="text-2xl">💰</span>
    <p className="mt-3 font-medium text-slate-600">Add income and expenses to view your cash flow.</p>
    <p className="mt-1 text-xs text-slate-400">We’ll chart the surplus or deficit once data arrives.</p>
  </div>
);

const createValueLabel = (color, align = 'middle', horizontalOffset = 0, verticalOffset = 12) => (props) => {
  const { x, y, value, height } = props;
  if (value == null || x == null || y == null) {
    return null;
  }

  const textAnchor =
    align === 'start' || align === 'end' || align === 'middle' ? align : align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';

  return (
    <text
      x={x + horizontalOffset}
      y={y + height + verticalOffset}
      fill={color}
      textAnchor={textAnchor}
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const record = payload[0]?.payload;
  if (!record) return null;

  const net = record.income - record.expenses;
  const isPositive = net >= 0;
  const savingsRate = record.income > 0 ? ((net / record.income) * 100).toFixed(1) : 0;

  return (
    <div className="min-w-[220px] rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">Monthly Cash Flow</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Income
          </span>
          <span className="font-semibold text-emerald-600">{record.formattedIncome}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Expenses
          </span>
          <span className="font-semibold text-rose-500">{record.formattedExpenses}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Net result</span>
          <span className={cn('font-semibold', isPositive ? 'text-emerald-600' : 'text-rose-500')}>
            {isPositive ? '+' : ''}
            {record.formattedNet}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>Savings rate</span>
          <span className="text-slate-600">{Number.isFinite(Number(savingsRate)) ? `${savingsRate}%` : '—'}</span>
        </div>
      </div>
    </div>
  );
};

const CHART_HEIGHT = 260;
const BAR_GAP = '65%';
const BAR_SIZE = 112;

const IncomeExpenseChart = ({ chartData, formatCurrency, className }) => {
  const barData = useMemo(() => {
    if (!chartData?.datasets) return [];
    const income = chartData.datasets.find((dataset) => dataset.label === 'Income')?.data?.[0] || 0;
    const expenses = chartData.datasets.find((dataset) => dataset.label === 'Expenses')?.data?.[0] || 0;

    return [
      {
        name: 'Cash Flow',
        income,
        expenses,
        formattedIncome: formatCurrency(income),
        formattedExpenses: formatCurrency(expenses),
        formattedNet: formatCurrency(income - expenses),
        shortIncome: formatCompactCurrency(income),
        shortExpenses: formatCompactCurrency(expenses)
      }
    ];
  }, [chartData, formatCurrency]);

  const renderIncomeLabel = useMemo(() => createValueLabel('#059669', 'middle', 56, 24), []);
  const renderExpenseLabel = useMemo(() => createValueLabel('#f43f5e', 'middle', 56, 24), []);

  const hasData = barData.length > 0 && (barData[0].income > 0 || barData[0].expenses > 0);

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn('w-full', className)}
      style={{ minHeight: CHART_HEIGHT }}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={barData}
          margin={{ ...commonMargins, bottom: 16 }}
          barCategoryGap={BAR_GAP}
          barGap={24}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip cursor={false} content={<TooltipContent />} />
          <Bar
            dataKey="income"
            radius={[12, 12, 12, 12]}
            barSize={BAR_SIZE}
            fill={palette.income}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="shortIncome"
              position="top"
              offset={12}
              content={renderIncomeLabel}
            />
          </Bar>
          <Bar
            dataKey="expenses"
            radius={[12, 12, 12, 12]}
            barSize={BAR_SIZE}
            fill={palette.expenses}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="shortExpenses"
              position="top"
              offset={12}
              content={renderExpenseLabel}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
