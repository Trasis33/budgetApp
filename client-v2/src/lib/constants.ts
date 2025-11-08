// Color system from design tokens
export const COLORS = {
  primary: 'var(--primary)',
  muted: 'var(--muted)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
} as const;

export const CHART_COLORS = {
  green: 'var(--chart-1)',    // Success
  teal: 'var(--chart-2)',     // Info
  blue: 'var(--chart-3)',     // Secondary
  amber: 'var(--chart-4)',    // Warning
  orange: 'var(--chart-5)',   // Accent
  purple: 'var(--chart-5)',   // Using chart-5 for purple variant
  pink: 'var(--accent)',      // Using accent for pink
} as const;

export const STATUS_COLORS = {
  success: CHART_COLORS.green,
  warning: CHART_COLORS.amber,
  danger: COLORS.destructive,
} as const;

// Budget status thresholds
export const BUDGET_THRESHOLDS = {
  WARNING: 80,   // Show warning at 80%
  DANGER: 100,   // Show danger at 100%
} as const;

// Status labels
export const STATUS_LABELS = {
  success: 'Good',
  warning: 'Warning',
  danger: 'Over Budget',
} as const;

// Category icon mapping (using lucide-react icons)
export const CATEGORY_ICONS = {
  Housing: 'Home',
  Food: 'UtensilsCrossed',
  Groceries: 'ShoppingCart',
  Transportation: 'Car',
  Entertainment: 'Tv',
  Utilities: 'Zap',
  Shopping: 'ShoppingBag',
  Healthcare: 'Heart',
  Savings: 'PiggyBank',
  Other: 'MoreHorizontal',
  Dining: 'UtensilsCrossed',
  Gas: 'Fuel',
  'Bills & Utilities': 'Receipt',
} as const;

// Icon colors for categories
export const ICON_COLORS = {
  Housing: 'blue',
  Food: 'green',
  Groceries: 'green',
  Transportation: 'amber',
  Entertainment: 'purple',
  Utilities: 'blue',
  Shopping: 'pink',
  Healthcare: 'purple',
  Savings: 'green',
  Other: 'amber',
  Dining: 'green',
  Gas: 'amber',
  'Bills & Utilities': 'blue',
} as const;

// Period options for budget table header
export const PERIOD_OPTIONS = [
  { value: 'current', label: 'This Month' },
  { value: 'last', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
] as const;
