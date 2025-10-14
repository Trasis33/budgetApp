import React from 'react';
import PropTypes from 'prop-types';
import { Lightbulb, RefreshCw, Sun, Target, X } from 'lucide-react';
import formatCurrency from '../../../utils/formatCurrency';
import { cn } from '../../../lib/utils';

const typeThemes = {
  reduction: {
    icon: Lightbulb,
    accent: 'text-rose-500',
    chip: 'bg-rose-50 text-rose-600 border border-rose-100',
    button: 'hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
  },
  reallocation: {
    icon: RefreshCw,
    accent: 'text-indigo-500',
    chip: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    button: 'hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600'
  },
  seasonal: {
    icon: Sun,
    accent: 'text-amber-500',
    chip: 'bg-amber-50 text-amber-600 border border-amber-100',
    button: 'hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600'
  },
  goal_based: {
    icon: Target,
    accent: 'text-emerald-500',
    chip: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    button: 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600'
  }
};

const getConfidenceBadge = (score) => {
  if (score >= 0.8) return { label: 'High confidence', classes: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
  if (score >= 0.6) return { label: 'Medium confidence', classes: 'bg-amber-50 text-amber-600 border border-amber-100' };
  return { label: 'Emerging insight', classes: 'bg-slate-100 text-slate-600 border border-slate-200' };
};

const OptimizationTipCard = ({ tip, onDismiss, onSnooze }) => {
  const theme = typeThemes[tip?.tip_type] || typeThemes.reduction;
  const Icon = theme.icon;
  const confidence = getConfidenceBadge(tip?.confidence_score || 0);

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
        aria-label="Dismiss tip"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-slate-50', theme.accent)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold text-slate-900">{tip?.title}</h4>
            <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]', confidence.classes)}>
              {confidence.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{tip?.description}</p>

          {tip?.impact_amount && (
            <div className={cn('mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', theme.chip)}>
              Potential impact: {formatCurrency(tip.impact_amount)}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSnooze}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition',
                theme.button
              )}
            >
              Snooze for later
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

OptimizationTipCard.propTypes = {
  tip: PropTypes.shape({
    tip_type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    impact_amount: PropTypes.number,
    confidence_score: PropTypes.number
  }).isRequired,
  onDismiss: PropTypes.func,
  onSnooze: PropTypes.func
};

export default OptimizationTipCard;
