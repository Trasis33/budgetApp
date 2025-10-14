import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Gauge, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const getStatusTheme = (status) => {
  switch (status) {
    case 'over':
      return {
        tone: 'rose',
        label: 'Over budget',
        description: 'Let’s review recent transactions and rebalance together.'
      };
    case 'warning':
      return {
        tone: 'amber',
        label: 'Close to limit',
        description: 'We are nearing the limit—time for a quick check-in.'
      };
    default:
      return {
        tone: 'emerald',
        label: 'On track',
        description: 'Plenty of room left in this category. Great teamwork.'
      };
  }
};

const BudgetPerformanceCard = ({ scope, insight, formatCurrency, onViewTransactions }) => {
  const {
    category = 'Monthly budget',
    budgetAmount = 0,
    actualAmount = 0,
    variance = 0
  } = insight || {};

  const ratio = budgetAmount > 0 ? actualAmount / budgetAmount : 0;
  const status =
    ratio >= 1.05 ? 'over' : ratio >= 0.85 ? 'warning' : 'ok';

  const theme = useMemo(() => getStatusTheme(status), [status]);

  const toneClasses = {
    emerald: {
      track: 'bg-emerald-100',
      fill: 'bg-emerald-500',
      chip: 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    },
    amber: {
      track: 'bg-amber-100',
      fill: 'bg-amber-500',
      chip: 'bg-amber-50 text-amber-600 border border-amber-100'
    },
    rose: {
      track: 'bg-rose-100',
      fill: 'bg-rose-500',
      chip: 'bg-rose-50 text-rose-600 border border-rose-100'
    }
  };

  const tone = toneClasses[theme.tone] || toneClasses.emerald;

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            {scope === 'mine'
              ? 'My budget check-in'
              : scope === 'partner'
                ? "Partner's budget check-in"
                : 'Shared budget focus'}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            {category}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {theme.description}
          </p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border',
            theme.tone === 'emerald' && 'border-emerald-200 bg-emerald-50 text-emerald-500',
            theme.tone === 'amber' && 'border-amber-200 bg-amber-50 text-amber-500',
            theme.tone === 'rose' && 'border-rose-200 bg-rose-50 text-rose-500'
          )}
        >
          {theme.tone === 'rose' ? <AlertTriangle className="h-6 w-6" /> : <Gauge className="h-6 w-6" />}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Used</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(actualAmount)} / {formatCurrency(budgetAmount)}
          </span>
        </div>
        <div className={cn('h-3 w-full overflow-hidden rounded-full', tone.track)}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', tone.fill)}
            style={{ width: `${Math.min(ratio * 100, 110)}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
              tone.chip
            )}
          >
            {theme.label}
          </span>
          <span className="text-xs text-slate-500">
            Variance: {(variance * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onViewTransactions}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
        >
          See transactions
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

BudgetPerformanceCard.propTypes = {
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  insight: PropTypes.shape({
    category: PropTypes.string,
    budgetAmount: PropTypes.number,
    actualAmount: PropTypes.number,
    variance: PropTypes.number
  }),
  formatCurrency: PropTypes.func.isRequired,
  onViewTransactions: PropTypes.func
};

export default BudgetPerformanceCard;
