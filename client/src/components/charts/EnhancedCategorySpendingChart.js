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
  buildDistributionData,
  computeYDomain,
  distributionPalette,
  commonMargins
} from './chartUtils';

const formatCompactCurrency = (value) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

const EmptyState = () => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
    <span className="text-2xl">📊</span>
    <p className="mt-3 font-medium text-slate-600">No category spending yet for this month.</p>
    <p className="mt-1 text-xs text-slate-400">Add expenses to unlock your spending breakdown.</p>
  </div>
);

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const record = payload[0]?.payload;
  if (!record) return null;

  return (
    <div className="min-w-[220px] rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{record.category}</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Amount</span>
          <span className="font-semibold text-indigo-600">{record.formattedValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Share</span>
          <span className="font-semibold text-emerald-600">{record.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const CHART_HEIGHT = 280;

const EnhancedCategorySpendingChart = ({
  chartData,
  formatCurrency,
  className
}) => {
  const distributionData = useMemo(() => {
    const base = buildDistributionData(chartData);
    return base.map((item) => ({
      ...item,
      formattedValue: formatCurrency(item.value)
    }));
  }, [chartData, formatCurrency]);

  const yDomain = useMemo(() => computeYDomain(distributionData, ['value'], 0.2), [distributionData]);

  if (!distributionData.length) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn('w-full', className)}
      style={{ minHeight: CHART_HEIGHT }}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={distributionData}
          margin={{ ...commonMargins, bottom: 48 }}
          barCategoryGap="32%"
          barGap={12}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            angle={-30}
            height={50}
            tickMargin={10}
            interval={0}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            width={80}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip cursor={false} content={<TooltipContent />} />
          <Bar
            dataKey="value"
            radius={[8, 8, 8, 8]}
            maxBarSize={56}
          >
            {distributionData.map((entry, index) => (
              <Cell
                key={`${entry.category}-${index}`}
                fill={distributionPalette[index % distributionPalette.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedCategorySpendingChart;
