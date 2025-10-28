import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  YAxis,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { cn } from '../../../lib/utils';

const scopeTitles = {
  ours: 'Our spending trend',
  mine: 'My spending trend',
  partner: "Partner's spending trend"
};

const SpendingTrendsCard = ({ scope, monthlyTotals = [], formatCurrency, onExplore }) => {
  const trendData = useMemo(() => {
    if (!monthlyTotals || monthlyTotals.length === 0) {
      return [];
    }
    return monthlyTotals.map((month) => {
      const [year, monthPart] = month.month.split('-');
      const label = new Date(Number(year), Number(monthPart) - 1).toLocaleDateString('en-US', {
        month: 'short'
      });
      return {
        ...month,
        label,
        spending: month.total_spending ?? month.spending ?? 0
      };
    });
  }, [monthlyTotals]);

  const lastPoint = trendData[trendData.length - 1];
  const previousPoint = trendData[trendData.length - 2];
  const delta = previousPoint ? (lastPoint?.spending ?? 0) - (previousPoint?.spending ?? 0) : 0;
  const trendingUp = delta <= 0;

  const trendCopy = trendData.length
    ? trendingUp
      ? 'We slowed spending compared to last month. Nice teamwork!'
      : 'Spending nudged up this month. Let’s take a closer look together.'
    : 'We’ll surface a trend as soon as we have data to share.';

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Momentum</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            {scopeTitles[scope] || scopeTitles.ours}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{trendCopy}</p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border',
            trendingUp ? 'border-emerald-200 bg-emerald-50 text-emerald-500' : 'border-rose-200 bg-rose-50 text-rose-500'
          )}
        >
          {trendingUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-6 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
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
              width={80}
              tick={{
                fontSize: 12,
                fill: '#475569'
              }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#cbd5f5' }}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                backgroundColor: '#ffffff'
              }}
              labelStyle={{ fontSize: 12, color: '#475569' }}
              formatter={(value) => [formatCurrency(value), 'Spending']}
            />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#spendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {trendData.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>Last month: {formatCurrency(lastPoint?.spending || 0)}</span>
          </div>
          <span className={cn('font-medium', trendingUp ? 'text-emerald-600' : 'text-rose-600')}>
            {trendingUp ? 'Down' : 'Up'} {formatCurrency(Math.abs(delta))}
          </span>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onExplore}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
        >
          Explore spending
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

SpendingTrendsCard.propTypes = {
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  monthlyTotals: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total_spending: PropTypes.number
    })
  ),
  formatCurrency: PropTypes.func.isRequired,
  onExplore: PropTypes.func
};

export default SpendingTrendsCard;
