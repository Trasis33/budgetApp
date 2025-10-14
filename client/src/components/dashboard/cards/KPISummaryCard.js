import React from 'react';
import PropTypes from 'prop-types';
import {
  HeartHandshake,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const scopeLabels = {
  ours: { heading: 'Our shared snapshot', pill: 'Shared view' },
  mine: { heading: 'Focusing on my numbers', pill: 'My view' },
  partner: { heading: "Looking at our partner's spend", pill: "Partner's view" }
};

const KPISummaryCard = ({
  scope = 'ours',
  couple,
  income = 0,
  expenses = 0,
  totalSavings = 0,
  settlement,
  formatCurrency,
  onViewReport
}) => {
  const netFlow = income - expenses;
  const netPositive = netFlow >= 0;
  const settlementAmount = Number.parseFloat(settlement?.settlement?.amount || 0);
  const settlementSettled = !settlementAmount || settlementAmount === 0;

  const partnerName = couple?.partner?.name || 'your partner';
  const scopeMeta = scopeLabels[scope] || scopeLabels.ours;

  const supportiveMessage = netPositive
    ? `Great news – we're building a surplus of ${formatCurrency(Math.abs(netFlow))} this period.`
    : `We're running a shortfall of ${formatCurrency(Math.abs(netFlow))}. Let's explore how to close the gap together.`;

  const settlementMessage = settlement?.settlement?.message
    || (settlementSettled ? 'All settled up for now.' : `We still have ${formatCurrency(settlementAmount)} to square together.`);

  const statusIcon = netPositive ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
            <Sparkles className="h-4 w-4" />
            {scopeMeta.pill}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">{scopeMeta.heading}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Our Financial Health</h2>
            <p className="mt-2 text-sm text-slate-600">{supportiveMessage}</p>
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <PiggyBank className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Net flow
            </span>
            {React.createElement(statusIcon, {
              className: cn('h-4 w-4', netPositive ? 'text-emerald-500' : 'text-rose-500')
            })}
          </div>
          <p className={cn('mt-2 text-xl font-semibold', netPositive ? 'text-emerald-600' : 'text-rose-600')}>
            {formatCurrency(netFlow)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatCurrency(income)} income vs {formatCurrency(expenses)} expenses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Our savings progress
            </span>
            <HeartHandshake className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {formatCurrency(totalSavings)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {totalSavings > 0 ? 'Growing steadily together.' : 'A fresh opportunity to start saving.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Settlement status
            </span>
            <ArrowUpRight className="h-4 w-4 text-indigo-500" />
          </div>
          <p className={cn('mt-2 text-lg font-semibold', settlementSettled ? 'text-emerald-600' : 'text-slate-900')}>
            {settlementSettled ? 'We are all square' : settlementMessage}
          </p>
          {!settlementSettled && (
            <p className="mt-1 text-xs text-slate-500">
              {settlement?.settlement?.creditor
                ? `${settlement?.settlement?.debtor} owes ${settlement?.settlement?.creditor}`
                : `We owe ${partnerName}`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          View our full report
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <span className="text-xs uppercase tracking-[0.08em] text-slate-400">
          Updated just now
        </span>
      </div>
    </div>
  );
};

KPISummaryCard.propTypes = {
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  couple: PropTypes.shape({
    partner: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  income: PropTypes.number,
  expenses: PropTypes.number,
  totalSavings: PropTypes.number,
  settlement: PropTypes.shape({
    settlement: PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      creditor: PropTypes.string,
      debtor: PropTypes.string,
      message: PropTypes.string
    })
  }),
  formatCurrency: PropTypes.func.isRequired,
  onViewReport: PropTypes.func
};

export default KPISummaryCard;
