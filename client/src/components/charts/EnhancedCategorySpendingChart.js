import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Label
} from 'recharts';
import { cn } from '../../lib/utils';
import {
  buildDistributionData,
  distributionPalette
} from './chartUtils';

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

  if (!distributionData.length) {
    return <EmptyState />;
  }

  const totalSpent = distributionData.reduce((sum, item) => sum + item.value, 0);
  const topSlices = distributionData.slice(0, 4);

  return (
    <div className={cn('space-y-5', className)}>
      <div
        className="w-full"
        style={{ minHeight: CHART_HEIGHT }}
      >
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
            <Tooltip cursor={false} content={<TooltipContent />} />
            <Pie
              data={distributionData}
              dataKey="value"
              nameKey="category"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {distributionData.map((entry, index) => (
                <Cell
                  key={`${entry.category}-${index}`}
                  fill={distributionPalette[index % distributionPalette.length]}
                />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox?.cx || !viewBox?.cy) return null;
                  return (
                    <g>
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy - 6}
                        textAnchor="middle"
                        fill="#94a3b8"
                        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}
                      >
                        Total spent
                      </text>
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy + 16}
                        textAnchor="middle"
                        fill="#1e293b"
                        style={{ fontSize: '18px', fontWeight: 600 }}
                      >
                        {formatCurrency(totalSpent)}
                      </text>
                    </g>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topSlices.map((slice, index) => (
          <div key={slice.category} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: distributionPalette[index % distributionPalette.length] }}
              />
              <span className="text-sm font-medium text-slate-700">{slice.category}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {slice.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedCategorySpendingChart;
