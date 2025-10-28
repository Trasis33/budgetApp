import React, { useState, useMemo, useId, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function usePersistentExpanded(key, initial = false) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : stored === '1';
    } catch {
      return initial;
    }
  });

  const set = (value) => {
    const next = typeof value === 'function' ? value(expanded) : value;
    try {
      localStorage.setItem(key, next ? '1' : '0');
    } catch {
      // Ignore storage errors (private browsing, disabled storage, etc.)
    }
    setExpanded(next);
  };

  return [expanded, set];
}

const formatCurrencyWithFallback = (amount, formatter) => {
  if (typeof formatter === 'function') {
    return formatter(amount);
  }
  if (Number.isNaN(amount)) {
    return '0';
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const BudgetAccordion = ({
  sections = [],
  defaultExpandedIds = [],
  mobileCollapsed = true,
  formatCurrency,
}) => {
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches;

  const computedDefaults = useMemo(() => {
    if (isMobile && mobileCollapsed) {
      return new Set(defaultExpandedIds);
    }
    if (defaultExpandedIds.length) {
      return new Set(defaultExpandedIds);
    }
    return sections[0] ? new Set([sections[0].id]) : new Set();
  }, [defaultExpandedIds, sections, isMobile, mobileCollapsed]);

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          defaultExpanded={computedDefaults.has(section.id)}
          formatCurrency={formatCurrency}
          {...section}
        />
      ))}
    </div>
  );
};

const AccordionItem = ({
  id,
  title,
  spent = 0,
  value = '',
  numericValue = 0,
  remaining,
  quickSets = [],
  highlighted = false,
  autoExpand = false,
  onValueChange,
  onQuickSet,
  onSave,
  isSaving = false,
  registerInput,
  defaultExpanded = false,
  formatCurrency,
}) => {
  const contentId = useId();
  const [expanded, setExpanded] = usePersistentExpanded(`budget-accordion:${id}`, defaultExpanded);

  useEffect(() => {
    if (autoExpand) {
      setExpanded(true);
    }
  }, [autoExpand, setExpanded]);

  const currentBudget = numericValue || parseFloat(value) || 0;
  const hasBudget = currentBudget > 0;
  const effectiveRemaining =
    typeof remaining === 'number' ? remaining : currentBudget - spent;
  const normalizedRemaining =
    Math.abs(effectiveRemaining) < 1 ? 0 : effectiveRemaining;

  const progressPercent = hasBudget
    ? Math.min(100, Math.round((spent / currentBudget) * 100))
    : 0;
  const utilization = hasBudget ? spent / currentBudget : 0;

  let status = 'none';
  if (hasBudget) {
    if (utilization >= 1.05) {
      status = 'over';
    } else if (utilization >= 0.9) {
      status = 'near';
    } else {
      status = 'under';
    }
  }

  const progressFillClass = {
    under: 'bg-emerald-500',
    near: 'bg-amber-500',
    over: 'bg-rose-500',
    none: 'bg-indigo-300',
  }[status];

  const summaryText = (() => {
    if (!hasBudget) {
      return 'No budget set yet';
    }
    if (normalizedRemaining > 0) {
      return `${formatCurrencyWithFallback(normalizedRemaining, formatCurrency)} left`;
    }
    if (normalizedRemaining < 0) {
      return `${formatCurrencyWithFallback(Math.abs(normalizedRemaining), formatCurrency)} over`;
    }
    return 'Exactly on target';
  })();

  const summaryClass = (() => {
    if (!hasBudget) return 'text-slate-500';
    if (normalizedRemaining > 0) return 'text-emerald-600';
    if (normalizedRemaining < 0) return 'text-rose-600';
    return 'text-indigo-600';
  })();

  const handleQuickSet = (nextValue) => {
    if (!nextValue && nextValue !== 0) {
      return;
    }
    const updater = onQuickSet || onValueChange;
    if (updater) {
      updater(nextValue);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const containerClasses = [
    'relative rounded-3xl border border-slate-100 bg-white shadow-sm transition-shadow',
    highlighted ? 'ring-2 ring-indigo-200 shadow-lg' : 'hover:shadow-md',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">
              Spent {formatCurrencyWithFallback(spent, formatCurrency)}
              {hasBudget
                ? ` of ${formatCurrencyWithFallback(currentBudget, formatCurrency)}`
                : ''}
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
            {hasBudget ? (
              <>
                <div className="h-2 w-full min-w-[160px] overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${progressFillClass}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${summaryClass}`}>{summaryText}</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/30 px-3 py-1 text-xs font-medium text-indigo-500">
                Set budget
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        className={`overflow-hidden transition-[max-height] duration-300 ease-out ${
          expanded ? 'max-h-[520px]' : 'max-h-0'
        }`}
      >
        <div className="border-t border-slate-100 px-5 pb-6 pt-4">
          <p className="text-sm font-medium text-slate-700">
            Adjust budget for <span className="text-indigo-500">{title}</span>
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Budget amount
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={value}
                      ref={registerInput}
                      onChange={(event) => onValueChange && onValueChange(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="0.00"
                      min="0"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase text-slate-400">
                      SEK
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {isSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              {quickSets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quickSets.map((qs) => (
                    <button
                      key={`${id}-${qs.label}`}
                      type="button"
                      onClick={() => handleQuickSet(qs.value)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      {qs.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Spent so far</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrencyWithFallback(spent, formatCurrency)}
                </span>
              </div>
              {hasBudget ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Budget set</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrencyWithFallback(currentBudget, formatCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{normalizedRemaining >= 0 ? 'Remaining' : 'Over budget'}</span>
                    <span
                      className={`font-semibold ${
                        normalizedRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrencyWithFallback(Math.abs(normalizedRemaining), formatCurrency)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">
                  Set a budget to unlock tailored guidance for this category.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAccordion;
