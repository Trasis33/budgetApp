export interface User {
  id: number;
  name: string;
  email: string;
  partner_id?: number;
  hasPartner?: boolean;
  partnerStatus?: 'no_partner' | 'connected' | 'invited';
  color?: string;
  monthly_net_income?: number;
}

export interface Expense {
  id: number;
  date: string;
  amount: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  description: string;
  paid_by_user_id: number;
  paid_by_name: string;
  /** Split type for the expense. '50/50' splits equally, 'custom' uses split_ratio_user1/user2 (must sum to 100), 'personal' is paid by one user, 'bill' is a special couple split. */
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  custom_split_ratio?: number;
  split_ratio_user1?: number;
  split_ratio_user2?: number;
  /** Foreign key to the recurring template this expense was generated from. Present if expense is part of a recurring series. */
  recurring_expense_id?: number | null;
}

/** Recurring expense template for couple-level monthly bills and subscriptions. All amounts are defaults used when generating concrete expenses. */
export interface RecurringTemplate {
  id: number;
  description: string;
  default_amount: number;
  category_id: number;
  paid_by_user_id: number;
  /** If true, this template represents a core bill that should be treated as a pre-filled expense each month. */
  bill_managed?: boolean;
  /** Split type. 'personal' means paid by single user, '50/50' splits equally, 'custom' uses custom ratios (must sum to 100), 'bill' is a special couple split. */
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  split_ratio_user1?: number;
  split_ratio_user2?: number;
  /** Day of month (1-28) when this recurring expense is due. Used for subscriptions that aren't on the 1st. */
  day_of_month?: number;
  is_active: boolean;
  /** Whether the expense is shared between partners. */
  is_shared: boolean;
  /** Type of recurring expense. */
  recurring_type: 'bill' | 'subscription';
  /** Optional notes for the template. */
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  is_fixed?: boolean;
  spending_role?: 'need' | 'want' | 'save';
  /** Weight for intelligent budget allocation (0.0 - 1.0, default 0.5) */
  budget_weight?: number;
  /** Optional minimum percentage constraint for budget allocation */
  budget_min_pct?: number;
  /** Optional maximum percentage constraint for budget allocation */
  budget_max_pct?: number;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  category_is_fixed?: boolean;
  amount: number;
  month: number;
  year: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  progress: number;
  status: BudgetStatus;
  expenseCount: number;
  category_is_fixed?: boolean;
}

export type BudgetStatus = 'success' | 'warning' | 'danger';

export interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  overallStatus: BudgetStatus;
}

export interface BudgetStats {
  onTrack: number;
  warning: number;
  overBudget: number;
}

export interface BudgetComment {
  id: number;
  budget_id: number;
  user_id: number;
  user_name: string;
  user_color?: string;
  text: string;
  created_at: string;
}

export interface Income {
  id: number;
  source: string;
  amount: number;
  date: string;
  user_id: number;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  is_pinned: boolean;
  color_index: number;
}

export interface Settlement {
  amount: string;
  creditor: string;
  debtor: string;
  message: string;
}

export const CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Healthcare',
  'Savings',
  'Other'
] as const;

export type CategoryType = typeof CATEGORIES[number];

// Export settings types
export * from './settings';
