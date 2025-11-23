export interface User {
  id: number;
  name: string;
  email: string;
  partner_id?: number;
  hasPartner?: boolean;
  partnerStatus?: 'no_partner' | 'connected' | 'invited';
  color?: string;
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

/** Recurring expense template for couple-level monthly bills. All amounts are defaults used when generating concrete expenses. */
export interface RecurringTemplate {
  id: number;
  description: string;
  default_amount: number;
  category_id: number;
  paid_by_user_id: number;
  /** Split type. 'personal' means paid by single user, '50/50' splits equally, 'custom' uses custom ratios (must sum to 100), 'bill' is a special couple split. */
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  split_ratio_user1?: number;
  split_ratio_user2?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
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
