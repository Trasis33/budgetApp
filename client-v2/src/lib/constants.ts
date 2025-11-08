// Color constants from globals.css
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
} as const;

export const STATUS_COLORS = {
  success: CHART_COLORS.green,
  warning: CHART_COLORS.amber,
  danger: COLORS.destructive,
} as const;

// Icon color mapping
export const ICON_COLORS = {
  green: CHART_COLORS.green,
  amber: CHART_COLORS.amber,
  blue: CHART_COLORS.blue,
  purple: CHART_COLORS.orange,
  pink: CHART_COLORS.teal,
} as const;

// Background colors for icons (20% opacity)
export const ICON_BG_COLORS = {
  green: `color-mix(in oklab, ${CHART_COLORS.green} 20%, transparent)`,
  amber: `color-mix(in oklab, ${CHART_COLORS.amber} 20%, transparent)`,
  blue: `color-mix(in oklab, ${CHART_COLORS.blue} 20%, transparent)`,
  purple: `color-mix(in oklab, ${CHART_COLORS.orange} 20%, transparent)`,
  pink: `color-mix(in oklab, ${CHART_COLORS.teal} 20%, transparent)`,
} as const;

// Status thresholds
export const BUDGET_STATUS_THRESHOLDS = {
  SUCCESS_MAX: 80,
  WARNING_MAX: 100,
} as const;

// Status labels
export const STATUS_LABELS = {
  success: 'Good',
  warning: 'Warning',
  danger: 'Over Budget',
} as const;

// Category icons and their colors
export const CATEGORY_ICONS: Record<string, { name: string; color: 'green' | 'blue' | 'amber' | 'purple' | 'pink' }> = {
  'Groceries': { name: 'shopping-cart', color: 'green' },
  'Dining Out': { name: 'utensils', color: 'amber' },
  'Gas & Transport': { name: 'zap', color: 'blue' },
  'Entertainment': { name: 'tv', color: 'purple' },
  'Shopping': { name: 'shopping-bag', color: 'pink' },
  'Utilities': { name: 'home', color: 'green' },
  'Healthcare': { name: 'heart', color: 'amber' },
  'Insurance': { name: 'shield', color: 'blue' },
  'Subscriptions': { name: 'credit-card', color: 'purple' },
  'Education': { name: 'book', color: 'pink' },
  'Travel': { name: 'plane', color: 'green' },
  'Fitness': { name: 'dumbbell', color: 'amber' },
  'Pets': { name: 'paw', color: 'blue' },
  'Gifts': { name: 'gift', color: 'purple' },
  'Charity': { name: 'heart', color: 'pink' },
  'Other': { name: 'more-horizontal', color: 'green' },
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: '0.15s',
  MEDIUM: '0.6s',
  SLOW: '2s',
} as const;

// Spacing constants
export const SPACING = {
  xs: 'calc(var(--spacing) * 1)',  // 4px
  sm: 'calc(var(--spacing) * 2)',  // 8px
  md: 'calc(var(--spacing) * 3)',  // 12px
  lg: 'calc(var(--spacing) * 4)',  // 16px
  xl: 'calc(var(--spacing) * 6)',  // 24px
  '2xl': 'calc(var(--spacing) * 8)', // 32px
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '640px',    // sm
  tablet: '768px',    // md
  desktop: '1024px',  // lg
  wide: '1280px',     // xl
} as const;

// Progress bar sizes
export const PROGRESS_SIZES = {
  sm: { height: '0.25rem' },
  md: { height: '0.5rem' },
  lg: { height: '0.75rem' },
} as const;

// Badge sizes
export const BADGE_SIZES = {
  sm: { padding: '0.125rem 0.375rem', fontSize: '0.625rem' },
  md: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
} as const;

// Icon sizes
export const ICON_SIZES = {
  xs: '0.75rem',  // 12px
  sm: '1rem',     // 16px
  md: '1.25rem',  // 20px
  lg: '1.5rem',   // 24px
} as const;

// Icon container sizes
export const ICON_CONTAINER_SIZES = {
  sm: '2rem',   // 32px
  md: '2.5rem', // 40px
  lg: '3rem',   // 48px
} as const;
