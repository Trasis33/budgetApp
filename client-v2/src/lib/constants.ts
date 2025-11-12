// Color constants from globals.css
export const COLORS = {
  primary: 'var(--primary)',
  muted: 'var(--muted)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
} as const;

export const CHART_COLORS = {
  mint: 'var(--theme-mint)',      // Success (mint)
  teal: 'var(--theme-teal)',        // Info (teal)
  indigo: 'var(--theme-indigo)',      // Secondary (deep indigo)
  amber: 'var(--theme-amber)',       // Warning (amber)
  golden: 'var(--theme-golden)',    // Accent (golden yellow)
  yellow: 'var(--theme-yellow)',    // Accent (yellow)
  coral: 'var(--theme-coral)',    // Accent (coral)
  violet: 'var(--theme-violet)',    // Accent (violet)
  cyan: 'var(--theme-cyan)',    // Accent (cyan)
  periwinkle: 'var(--theme-periwinkle)',    // Accent (periwinkle)
} as const;

export const STATUS_COLORS = {
  success: CHART_COLORS.mint,
  warning: CHART_COLORS.amber,
  danger: COLORS.destructive,
} as const;

// Icon color mapping
export const ICON_COLORS = {
  mint: CHART_COLORS.mint,
  amber: CHART_COLORS.amber,
  indigo: CHART_COLORS.indigo,
  golden: CHART_COLORS.golden,
  yellow: CHART_COLORS.yellow,
  violet: CHART_COLORS.violet,
  teal: CHART_COLORS.teal,
  coral: CHART_COLORS.coral,
  cyan: CHART_COLORS.cyan,
  periwinkle: CHART_COLORS.periwinkle,
} as const;

// Background colors for icons (20% opacity)
export const ICON_BG_COLORS = {
  mint: `color-mix(in oklab, var(--theme-mint) 20%, transparent)`,
  amber: `color-mix(in oklab, var(--theme-yellow) 20%, transparent)`,
  indigo: `color-mix(in oklab, var(--theme-indigo) 20%, transparent)`,
  golden: `color-mix(in oklab, var(--theme-golden) 20%, transparent)`,
  yellow: `color-mix(in oklab, var(--theme-yellow) 20%, transparent)`,
  violet: `color-mix(in oklab, var(--theme-violet) 20%, transparent)`,
  teal: `color-mix(in oklab, var(--theme-teal) 20%, transparent)`,
  coral: `color-mix(in oklab, var(--theme-coral) 20%, transparent)`,
  cyan: `color-mix(in oklab, var(--theme-cyan) 20%, transparent)`,
  periwinkle: `color-mix(in oklab, var(--theme-periwinkle) 20%, transparent)`,
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
export const CATEGORY_ICONS: Record<string, { name: string; color: 'mint' | 'indigo' | 'amber' | 'violet' | 'teal' | 'coral' | 'cyan' | 'periwinkle' | 'golden' | 'yellow' }> = {
  'Groceries': { name: 'shopping-cart', color: 'mint' },
  'Dining Out': { name: 'utensils', color: 'amber' },
  'Transportation': { name: 'car', color: 'indigo' },
  'Entertainment': { name: 'tv', color: 'violet' },
  'Shopping': { name: 'shopping-bag', color: 'teal' },
  'Utilities': { name: 'zap', color: 'cyan' },
  'Healthcare': { name: 'heart', color: 'coral' },
  'Mortgage': { name: 'home', color: 'golden' },
  'Subscriptions': { name: 'credit-card', color: 'yellow' },
  'Education': { name: 'book', color: 'teal' },
  'Travel': { name: 'plane', color: 'mint' },
  'Fitness': { name: 'dumbbell', color: 'amber' },
  'Pets': { name: 'paw', color: 'indigo' },
  'Gifts': { name: 'gift', color: 'violet' },
  'Charity': { name: 'heart', color: 'coral' },
  'Other': { name: 'more-horizontal', color: 'periwinkle' },
  'Kids Clothes': { name: 'shopping-bag', color: 'teal' },
  'Household Items': { name: 'home', color: 'golden' },
} as const;

/**
 * Category descriptions as single source of truth for subtitles.
 * Used by BudgetTableRow to avoid local semantic matching.
 */
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Groceries': 'Weekly shopping',
  'Dining Out': 'Restaurants & cafes',
  'Transportation': 'Fuel & public transit',
  'Entertainment': 'Movies & games',
  'Shopping': 'Clothing & misc',
  'Utilities': 'Utilities',
  'Healthcare': 'Healthcare',
  'Mortgage': 'Mortgage payment',
  'Subscriptions': 'Subscriptions',
  'Education': 'Education',
  'Travel': 'Travel',
  'Fitness': 'Fitness',
  'Pets': 'Pets',
  'Gifts': 'Gifts',
  'Charity': 'Charity',
  'Other': 'Other',
  'Kids Clothes': 'Kids Clothes',
  'Household Items': 'Household Items',
};

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
