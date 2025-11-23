import { Expense, RecurringTemplate } from '../types';

/**
 * Summary of recurring expenses for a date range.
 */
export interface RecurringSummary {
  /** Number of expenses generated from recurring templates in the range */
  generatedCount: number;
  /** Total amount of generated expenses in the range */
  generatedAmount: number;
  /** Number of templates that should have been generated but weren't (upcomingCount) */
  upcomingCount: number;
  /** Percentage of templates that were generated (0-100) */
  coverage: number;
}

/**
 * Compute recurring summary for a date range.
 * @param templates List of active recurring templates
 * @param expenses List of expenses (typically for a month or range)
 * @param start Start date (YYYY-MM-DD)
 * @param end End date (YYYY-MM-DD)
 * @returns Summary of generated, upcoming, and coverage stats
 */
export function computeRecurringSummary(
  templates: RecurringTemplate[],
  expenses: Expense[],
  start: string,
  end: string
): RecurringSummary {
  if (templates.length === 0) {
    return {
      generatedCount: 0,
      generatedAmount: 0,
      upcomingCount: 0,
      coverage: 0
    };
  }

  // Filter expenses to those in the date range and that are recurring
  const recurringExpenses = expenses.filter(
    exp =>
      exp.recurring_expense_id != null &&
      exp.date >= start &&
      exp.date <= end
  );

  // Track which template IDs have generated expenses in this range
  const generatedTemplateIds = new Set(
    recurringExpenses.map(exp => exp.recurring_expense_id)
  );

  const generatedCount = recurringExpenses.length;
  const generatedAmount = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Upcoming = templates without a generated expense in this range
  const upcomingCount = templates.filter(
    t => !generatedTemplateIds.has(t.id)
  ).length;

  // Coverage = (generated templates / total templates) * 100
  const coverage =
    templates.length > 0 ? ((templates.length - upcomingCount) / templates.length) * 100 : 0;

  return {
    generatedCount,
    generatedAmount,
    upcomingCount,
    coverage
  };
}
