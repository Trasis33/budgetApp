import React from 'react';
import PropTypes from 'prop-types';
import { Coins, ArrowRightLeft, Smile, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import formatCurrency from '../../../utils/formatCurrency';

const SettlementCard = ({ settlement, couple }) => {
  const status = settlement?.settlement;
  const amount = Number.parseFloat(status?.amount || 0);
  const settled = !amount || amount === 0;

  const debtor = status?.debtor || couple?.user?.name || 'You';
  const creditor = status?.creditor || couple?.partner?.name || 'Partner';

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
            Shared balance
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Settlement status</h3>
          <p className="mt-2 text-sm text-slate-600">
            {settled
              ? 'We’re balanced—no one owes anything right now.'
              : `${debtor} can settle ${formatCurrency(amount)} with ${creditor} when ready.`}
          </p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border',
            settled ? 'border-emerald-200 bg-emerald-50 text-emerald-500' : 'border-slate-200 bg-slate-50 text-slate-500'
          )}
        >
          {settled ? <ShieldCheck className="h-6 w-6" /> : <ArrowRightLeft className="h-6 w-6" />}
        </div>
      </div>

      {!settled && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <span className="font-medium text-slate-900">Total shared expenses this month:</span>{' '}
          {formatCurrency(Number.parseFloat(settlement?.totalSharedExpenses || 0))}
        </div>
      )}

      {settled && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600">
          <Smile className="h-4 w-4" />
          Nicely done—everything’s squared up.
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
        >
          View breakdown
          <Coins className="h-4 w-4" />
        </button>
        {!settled && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            Settle up
          </button>
        )}
      </div>
    </div>
  );
};

SettlementCard.propTypes = {
  settlement: PropTypes.shape({
    settlement: PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      debtor: PropTypes.string,
      creditor: PropTypes.string
    }),
    totalSharedExpenses: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  couple: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string
    }),
    partner: PropTypes.shape({
      name: PropTypes.string
    })
  })
};

export default SettlementCard;
