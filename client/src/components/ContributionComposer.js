import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { CalendarDays, Loader2, PiggyBank, Plus } from 'lucide-react';
import { getGoalColorScheme } from '../utils/goalColorPalette';

const quickAddValues = [50, 100, 250];

const getGoalName = (goal) => {
  if (!goal) {
    return '';
  }
  return goal.name || goal.goal_name || goal.title || 'Savings goal';
};

const computeCap = (goal) => {
  if (!goal) {
    return null;
  }
  const target = Number(goal.target_amount ?? goal.targetAmount ?? 0);
  if (!target || Number.isNaN(target)) {
    return null;
  }
  const current = Number(goal.current_amount ?? goal.currentAmount ?? 0);
  if (Number.isNaN(current)) {
    return null;
  }
  return Math.max(0, target - current);
};

const ContributionComposer = ({
  goal,
  onClose,
  onSuccess,
  capAmount = null,
  enforceCap = true,
  layout = 'inline',
  className,
  accent
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [capped, setCapped] = useState(false);

  const effectiveCap = useMemo(() => {
    if (capAmount !== null && capAmount !== undefined) {
      return capAmount;
    }
    return computeCap(goal);
  }, [capAmount, goal]);

  useEffect(() => {
    if (!goal) {
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setAmount('');
    setNote('');
    setError(null);
    setCapped(false);

    let cancelled = false;
    axios
      .get(`/savings/goals/${goal.id}/contributions`)
      .then((response) => {
        if (cancelled) {
          return;
        }
        setRecent(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
      })
      .catch(() => {
        if (!cancelled) {
          setRecent([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [goal]);

  const applyCap = (value) => {
    if (effectiveCap == null || !enforceCap) {
      return { value, wasCapped: false };
    }
    if (value > effectiveCap) {
      return { value: effectiveCap, wasCapped: true };
    }
    return { value, wasCapped: false };
  };

  const setAmountCapped = (value) => {
    const numeric = parseFloat(value || '0') || 0;
    const { value: applied, wasCapped } = applyCap(numeric);
    setAmount(applied ? String(applied) : '');
    setCapped(wasCapped);
  };

  const quickAdd = (value) => {
    const currentAmount = parseFloat(amount || '0') || 0;
    const { value: applied, wasCapped } = applyCap(currentAmount + value);
    setAmount(applied ? String(applied) : '');
    setCapped(wasCapped);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!goal) {
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    const today = new Date();
    const selected = new Date(date);
    if (Number.isNaN(selected.getTime()) || selected > today) {
      setError('Date must be today or earlier.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = { amount: numericAmount, date, note };
      const response = await axios.post(`/savings/goals/${goal.id}/contributions`, payload);
      onSuccess?.(response.data.goal, response.data.contribution);
      onClose?.();
    } catch (err) {
      console.error('Add contribution failed', err);
      setError('Failed to add contribution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!goal) {
    return null;
  }

  const goalName = getGoalName(goal);
  const inlineLayout = layout === 'inline';
  const colorIndex =
    typeof goal?.color_index === 'number' && !Number.isNaN(goal.color_index)
      ? goal.color_index
      : typeof goal?.colorIndex === 'number' && !Number.isNaN(goal.colorIndex)
      ? goal.colorIndex
      : 0;
  const theme = accent || getGoalColorScheme(colorIndex);

  return (
    <div
      className={cn(
        inlineLayout
          ? ['rounded-2xl border px-5 py-5 shadow-sm', theme.border, 'bg-white']
          : 'space-y-5',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', theme.icon)}>
            <PiggyBank className="h-5 w-5" />
          </span>
          <div>
            <p className={cn('text-xs font-semibold uppercase tracking-[0.12em]', theme.accent)}>
              Contribution
            </p>
            <h3 className="text-base font-semibold text-slate-900">Add to {goalName}</h3>
          </div>
        </div>
        {inlineLayout ? (
          <Button
            variant="pill"
            onClick={onClose}
            className="border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            Close
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmountCapped(event.target.value)}
            placeholder="0.00"
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2',
              theme.border,
              theme.focus
            )}
            required
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {quickAddValues.map((value) => (
              <Button
                key={value}
                type="button"
                variant="pill"
                onClick={() => quickAdd(value)}
                className={cn('bg-white', theme.quickButton)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {formatCurrency(value)}
              </Button>
            ))}
          </div>
          {effectiveCap != null && (
            <p className={cn('mt-2 text-xs', theme.body)}>
              Remaining capacity: {formatCurrency(effectiveCap)} {capped ? '(capped)' : ''}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={cn(
                'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2',
                theme.border,
                theme.focus
              )}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Paycheck transfer"
              className={cn(
                'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2',
                theme.border,
                theme.focus
              )}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className={cn('flex items-center gap-2 text-xs', theme.body)}>
            <CalendarDays className="h-4 w-4" />
            <span>We log this on the day you choose.</span>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="pill"
              onClick={onClose}
              className="border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(theme.primaryButton, 'text-white')}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                'Log contribution'
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Recent contributions
        </p>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No contributions yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {recent.map((contribution) => (
              <li
                key={contribution.id}
                className="flex items-center justify-between rounded-xl border border-white bg-white px-3 py-2 shadow-sm"
              >
                <span>
                  {new Date(contribution.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(Number(contribution.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContributionComposer;
