import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { PiggyBank, ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

const SavingsRateCard = ({ scope, savingsData, formatCurrency, onAdjustGoal }) => {
  const summary = savingsData?.summary || {};
  const monthlyData = savingsData?.monthlyData || [];

  const chartData = useMemo(() => {
    return monthlyData.map((month) => {
      const labelDate = new Date(month.month);
      const label = Number.isNaN(labelDate.getTime())
        ? month.month
        : labelDate.toLocaleDateString('en-US', { month: 'short' });
      return {
        ...month,
        label,
        savingsRate: month.savingsRate ?? month.savings_rate ?? 0
      };
    });
  }, [monthlyData]);

  const latest = chartData[chartData.length - 1];
  const improving = (summary.savingsRateTrend ?? summary.trend ?? 0) >= 0;

  const encouragement = improving
    ? 'Our savings rhythm is strengthening. Keep the momentum going!'
    : 'We can bounce back—let’s revisit contributions together.';

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Savings journey</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            {scope === 'mine'
              ? 'My savings progress'
              : scope === 'partner'
                ? "Partner's savings pace"
                : 'Our savings progress'}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{encouragement}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <PiggyBank className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Average rate:{' '}
          <span className="font-semibold">
            {(summary.averageSavingsRate ?? summary.avgSavingsRate ?? 0).toFixed(1)}%
          </span>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-inner ring-1 ring-slate-100">
          Total saved:{' '}
          <span className="font-semibold">
            {formatCurrency(summary.totalSavings ?? summary.total_savings ?? 0)}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
            improving ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {improving ? 'Trending up' : 'Needs attention'}
        </span>
      </div>

      <div className="mt-6 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.08)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{ fontSize: 12, fill: '#475569' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                backgroundColor: '#ffffff'
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Savings rate']}
            />
            <Area
              type="monotone"
              dataKey="savingsRate"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#savingsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {latest && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Latest rate:{' '}
          <span className="font-semibold">
            {(latest.savingsRate ?? 0).toFixed(1)}%
          </span>
          . We’re {latest.savingsRate >= (summary.targetRate ?? 20) ? 'on' : 'tracking toward'} our goal.
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onAdjustGoal}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
        >
          Adjust goal
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

SavingsRateCard.propTypes = {
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  savingsData: PropTypes.shape({
    summary: PropTypes.object,
    monthlyData: PropTypes.arrayOf(
      PropTypes.shape({
        month: PropTypes.string,
        savingsRate: PropTypes.number
      })
    )
  }),
  formatCurrency: PropTypes.func.isRequired,
  onAdjustGoal: PropTypes.func
};

export default SavingsRateCard;
