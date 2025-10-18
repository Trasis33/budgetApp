import React from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, Users2, ArrowUpRight } from 'lucide-react';
import formatCurrency from '../../../utils/formatCurrency';
import { getGoalColorScheme } from '../../../utils/goalColorPalette';
import { cn } from '../../../lib/utils';

const computeContributionSplit = (goal) => {
  const mine = Number.parseFloat(goal?.my_contribution ?? goal?.user_contribution ?? 0);
  const partner = Number.parseFloat(goal?.partner_contribution ?? 0);
  const total = Number.parseFloat(goal?.current_amount ?? 0);

  if (mine === 0 && partner === 0) {
    return {
      mine: total,
      partner: 0,
      total
    };
  }

  const normalisedMine = mine || Math.max(total - partner, 0);
  const normalisedPartner = partner || Math.max(total - normalisedMine, 0);

  return {
    mine: normalisedMine,
    partner: normalisedPartner,
    total: total || normalisedMine + normalisedPartner
  };
};

const SharedGoalsCard = ({ scope, goal }) => {
  if (!goal) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-600 shadow-md">
        <p className="font-semibold text-slate-900">No shared goal yet</p>
        <p className="mt-2">Create a shared savings goal to track progress together.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.12em] text-slate-500">
          Start a goal from the Savings page
        </div>
      </div>
    );
  }

  const contributions = computeContributionSplit(goal);
  const targetAmount = Number.parseFloat(goal?.target_amount ?? 0);
  const progress = targetAmount > 0 ? Math.min((contributions.total / targetAmount) * 100, 100) : 0;
  const remaining = Math.max(targetAmount - contributions.total, 0);
  const accent = getGoalColorScheme(goal?.color_index ?? 0);

  const titlePrefix =
    scope === 'mine' ? 'My goal:' : scope === 'partner' ? "Partner's goal:" : 'Goal:';

  return (
    <div
      className={cn(
        'rounded-3xl border p-6 shadow-md transition-shadow hover:shadow-lg',
        accent.surface,
        accent.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn('text-xs uppercase tracking-[0.12em]', accent.accent)}>{titlePrefix}</p>
          <h3 className={cn('mt-1 text-xl font-semibold', accent.heading)}>{goal.goal_name}</h3>
          <p className={cn('mt-2 text-sm', accent.body)}>
            We’ve saved {formatCurrency(contributions.total)} of our {formatCurrency(targetAmount)} target.
          </p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', accent.icon)}>
          <Users2 className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500">
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className={cn('h-3 w-full overflow-hidden rounded-full', accent.progressTrack)}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', accent.progressBar)}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-3 rounded-2xl bg-white/60 p-4 text-sm md:grid-cols-2">
          <div>
            <p className={cn('text-xs uppercase tracking-[0.12em]', accent.accent)}>My contribution</p>
            <p className={cn('mt-1 text-base font-semibold', accent.heading)}>
              {formatCurrency(contributions.mine)}
            </p>
          </div>
          <div>
            <p className={cn('text-xs uppercase tracking-[0.12em]', accent.accent)}>Partner contribution</p>
            <p className={cn('mt-1 text-base font-semibold', accent.heading)}>
              {formatCurrency(contributions.partner)}
            </p>
          </div>
        </div>

        {goal?.target_date && (
          <div className={cn('flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm shadow-inner ring-1', accent.border)}>
            <CalendarDays className={cn('h-4 w-4', accent.accent)} />
            Target date:{' '}
            <span className={cn('font-medium', accent.heading)}>
              {new Date(goal.target_date).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        )}

        <div className={cn('rounded-2xl px-4 py-3 text-sm', accent.pill)}>
          Remaining: {formatCurrency(remaining)} to reach this goal together.
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
            accent.quickButton,
            'bg-white'
          )}
        >
          Contribute now
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

SharedGoalsCard.propTypes = {
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  goal: PropTypes.shape({
    goal_name: PropTypes.string,
    target_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    current_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    my_contribution: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    partner_contribution: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    target_date: PropTypes.string
  })
};

export default SharedGoalsCard;
