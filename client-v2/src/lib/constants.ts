export const COLORS = {
  primary: 'var(--primary)',
  muted: 'var(--muted)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
} as const;

export const CHART_COLORS = {
  green: 'var(--chart-1)',
  teal: 'var(--chart-2)',
  blue: 'var(--chart-3)',
  amber: 'var(--chart-4)',
  orange: 'var(--chart-5)',
} as const;

export const STATUS_COLORS = {
  success: CHART_COLORS.green,
  warning: CHART_COLORS.amber,
  danger: COLORS.destructive,
} as const;

export const BUDGET_PERIODS = [
  { value: 'current', label: 'This Month' },
  { value: 'last', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
] as const;

export type BudgetPeriod = typeof BUDGET_PERIODS[number]['value'];
