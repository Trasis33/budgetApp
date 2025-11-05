export interface User {
  id: number;
  name: string;
  email: string;
  partner_id?: number;
  hasPartner?: boolean;
  partnerStatus?: 'no_partner' | 'connected' | 'invited';
}

export interface Expense {
  id: number;
  date: string;
  amount: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
  description: string;
  paid_by_user_id: number;
  paid_by_name: string;
  split_type: '50/50' | 'custom' | 'personal' | 'bill';
  custom_split_ratio?: number;
  split_ratio_user1?: number;
  split_ratio_user2?: number;
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  month: number;
  year: number;
  amount: number;
  category_name: string;
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
