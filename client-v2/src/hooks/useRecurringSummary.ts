import { useState, useEffect } from 'react';
import { Expense, RecurringTemplate } from '../types';
import { computeRecurringSummary, RecurringSummary } from '../lib/recurringAnalytics';
import { useRecurringTemplates } from './useRecurringTemplates';

/**
 * Hook to compute recurring expense summary for a date range.
 * Combines template list with expense data to provide insights on generation and coverage.
 */
export function useRecurringSummary(options: {
  /** Start date (YYYY-MM-DD) */
  start: string;
  /** End date (YYYY-MM-DD) */
  end: string;
  /** Expenses in the range (typically from a monthly view) */
  expenses: Expense[];
}) {
  const { start, end, expenses } = options;
  const { templates, loading: templatesLoading, error: templatesError, refresh: refreshTemplates } = useRecurringTemplates();
  const [summary, setSummary] = useState<RecurringSummary>({
    generatedCount: 0,
    generatedAmount: 0,
    upcomingCount: 0,
    coverage: 0
  });

  useEffect(() => {
    const computed = computeRecurringSummary(templates, expenses, start, end);
    setSummary(computed);
  }, [templates, expenses, start, end]);

  return {
    templates,
    summary,
    loading: templatesLoading,
    error: templatesError,
    refresh: refreshTemplates
  };
}
