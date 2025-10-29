import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import {
  buildBudgetActualData,
  computeYDomain,
  commonMargins
} from './chartUtils';

const palette = {
  budgeted: '#6366f1',
  actual: {
    good: '#10b981',
    warning: '#f59e0b',
    over: '#fb7185',
    none: '#94a3b8'
  }
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
    <span className="text-2xl">🎯</span>
    <p className="mt-3 font-medium text-slate-600">Set budgets to compare planned versus actual spending.</p>
    <p className="mt-1 text-xs text-slate-400">We’ll highlight categories that need attention once data is available.</p>
  </div>
);

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const record = payload[0]?.payload;
  if (!record) return null;

  return (
    <div className="min-w-[240px] rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{record.category}</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Budgeted
          </span>
          <span className="font-semibold text-slate-700">{record.formattedBudget}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-500">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                record.status === 'over-budget'
                  ? 'bg-rose-400'
                  : record.status === 'under-budget'
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
              )}
            />
            Actual
          </span>
          <span
            className={cn(
              'font-semibold',
              record.status === 'over-budget'
                ? 'text-rose-500'
                : record.status === 'under-budget'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
            )}
          >
            {record.formattedActual}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
          <span>Variance</span>
          <span
            className={cn(
              'text-slate-600',
              record.status === 'over-budget'
                ? 'text-rose-500'
                : record.status === 'under-budget'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
            )}
          >
            {record.variance >= 0 ? '+' : ''}
            {record.variance.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const CHART_HEIGHT = 380;

const BudgetActualChart = ({ chartData, formatCurrency, className }) => {
  const barData = useMemo(() => {
    const base = buildBudgetActualData(chartData);
    return base.map((item) => ({
      ...item,
      formattedBudget: formatCurrency(item.budgeted),
      formattedActual: formatCurrency(item.actual)
    }));
  }, [chartData, formatCurrency]);

  const hasData = barData.length > 0;
  const yDomain = useMemo(() => computeYDomain(barData, ['budgeted', 'actual'], 0.2), [barData]);
  const categoryCount = barData.length || 1;
  const dynamicBarSize = useMemo(() => {
    const base = Math.floor(660 / categoryCount);
    return Math.max(20, Math.min(36, base));
  }, [categoryCount]);

  const innerGap = useMemo(() => Math.max(8, Math.round(dynamicBarSize * 0.3)), [dynamicBarSize]);

  const barShape = useMemo(() => {
    const effectiveGap = Math.min(dynamicBarSize - 4, innerGap);
    return ({ x, y, width, height, fill }) => {
      if (width <= 0 || height <= 0) {
        return null;
      }
      const trimmedWidth = Math.max(0, width - effectiveGap);
      const offset = (width - trimmedWidth) / 2;

      return (
        <rect
          x={x + offset}
          y={y}
          width={trimmedWidth}
          height={height}
          rx={10}
          ry={10}
          fill={fill}
        />
      );
    };
  }, [innerGap, dynamicBarSize]);

  const categoryGap = useMemo(() => {
    if (categoryCount > 16) return '26%';
    if (categoryCount > 12) return '34%';
    if (categoryCount > 8) return '40%';
    return '46%';
  }, [categoryCount]);

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
          margin={{ ...commonMargins, bottom: 20 }}
          barGap={0}
          barCategoryGap={categoryGap}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            angle={-30}
            height={60}
            tickMargin={12}
            interval={0}
            minTickGap={4}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip cursor={false} content={<TooltipContent />} />
          <Bar
            dataKey="budgeted"
            fill={palette.budgeted}
            barSize={dynamicBarSize}
            shape={barShape}
          />
          <Bar
            dataKey="actual"
            barSize={dynamicBarSize}
            shape={barShape}
          >
            {barData.map((entry, index) => {
              let fill = entry.actualColor;
              if (!fill) {
                fill = palette.actual.warning;
                if (entry.status === 'over-budget') fill = palette.actual.over;
                else if (entry.status === 'under-budget') fill = palette.actual.good;
                else if (entry.status === 'no-budget') fill = palette.actual.none;
              }
              return <Cell key={`${entry.category}-${index}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BudgetActualChart;
