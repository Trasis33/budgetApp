import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { X, BarChart3 } from 'lucide-react';
import axios from '../../../api/axios';
import formatCurrency from '../../../utils/formatCurrency';
import SpendingTrendsChart from '../../SpendingTrendsChart';
import MonthlyComparisonChart from '../../MonthlyComparisonChart';
import MonthlyBreakdownTable from '../../MonthlyBreakdownTable';

const ranges = [
  { value: '3months', label: 'Last 3 months', months: 3 },
  { value: '6months', label: 'Last 6 months', months: 6 },
  { value: '1year', label: 'Last 12 months', months: 12 }
];

const computeRange = (months) => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
};

const AnalyticsDeepDiveModal = ({
  open,
  onClose,
  scope,
  initialTrends,
  initialIncomeExpenses
}) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trends, setTrends] = useState(initialTrends || null);
  const [incomeExpenses, setIncomeExpenses] = useState(initialIncomeExpenses || null);

  useEffect(() => {
    if (open) {
      setTimeRange('6months');
      setTrends(initialTrends);
      setIncomeExpenses(initialIncomeExpenses);
    }
  }, [open, initialTrends, initialIncomeExpenses]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const fetchData = useCallback(async (rangeValue) => {
    const selected = ranges.find((r) => r.value === rangeValue) || ranges[1];
    const { startDate, endDate } = computeRange(selected.months);
    setLoading(true);
    setError(null);
    try {
      const [trendsRes, incomeRes] = await Promise.all([
        axios.get(`/analytics/trends/${startDate}/${endDate}`, {
          params: { scope }
        }),
        axios.get(`/analytics/income-expenses/${startDate}/${endDate}`, {
          params: { scope }
        })
      ]);
      setTrends(trendsRes.data);
      setIncomeExpenses(incomeRes.data);
    } catch (err) {
      console.error('Failed to load detailed analytics', err);
      setError('We could not refresh the data right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (timeRange === '6months') {
      setTrends(initialTrends);
      setIncomeExpenses(initialIncomeExpenses);
      return;
    }
    const run = async () => {
      await fetchData(timeRange);
    };
    run();
  }, [timeRange, open, initialTrends, initialIncomeExpenses, fetchData]);

  const scopedMonthlyTotals = useMemo(() => {
    if (!trends) return [];
    const scopeBucket = trends.scopes?.[scope];
    if (scopeBucket?.monthlyTotals) {
      return scopeBucket.monthlyTotals;
    }
    if (Array.isArray(scopeBucket)) {
      return scopeBucket;
    }
    return trends.monthlyTotals || [];
  }, [scope, trends]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Deep dive</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Detailed analytics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore spending, compare months, and review our monthly breakdown.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
            >
              {ranges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {loading && (
            <div className="flex h-40 items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 text-sm text-slate-500">
              Refreshing insights…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-100 bg-slate-50/60 px-6 py-5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <span>
                    {scope === 'mine'
                      ? 'Your personal view'
                      : scope === 'partner'
                        ? "Partner's view"
                        : 'Shared view'}{' '}
                    · {ranges.find((r) => r.value === timeRange)?.label}
                  </span>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <SpendingTrendsChart monthlyTotals={scopedMonthlyTotals} formatCurrency={formatCurrency} />
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <MonthlyComparisonChart
                  monthlyTotals={scopedMonthlyTotals}
                  formatCurrency={formatCurrency}
                />
              </section>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                <MonthlyBreakdownTable
                  monthlyTotals={scopedMonthlyTotals}
                  formatCurrency={formatCurrency}
                />
              </section>

              {incomeExpenses?.summary && (
                <section className="rounded-3xl border border-slate-100 bg-emerald-50/60 p-6 text-sm text-emerald-700">
                  <p>
                    Total income:{' '}
                    <span className="font-semibold text-emerald-800">
                      {formatCurrency(incomeExpenses.summary.totalIncome || incomeExpenses.summary.total_income || 0)}
                    </span>{' '}
                    · Total expenses:{' '}
                    <span className="font-semibold text-emerald-800">
                      {formatCurrency(incomeExpenses.summary.totalExpenses || incomeExpenses.summary.total_expenses || 0)}
                    </span>{' '}
                    · Surplus:{' '}
                    <span className="font-semibold text-emerald-800">
                      {formatCurrency(incomeExpenses.summary.totalSurplus || incomeExpenses.summary.total_surplus || 0)}
                    </span>
                  </p>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
};

AnalyticsDeepDiveModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  scope: PropTypes.oneOf(['ours', 'mine', 'partner']),
  initialTrends: PropTypes.object,
  initialIncomeExpenses: PropTypes.object
};

export default AnalyticsDeepDiveModal;
