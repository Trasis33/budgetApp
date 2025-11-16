export interface UserProfile {
  id: number;
  name: string;
  email: string;
  partner_id?: number;
  income_share_percentage?: number;
  created_at: string;
  last_login?: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  strength: number; // 0-5
  text: string;
  color: string;
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: 'iso' | 'local';
  language: 'en' | 'sv';
  defaultSplitType: '50/50' | 'custom' | 'personal';
  approvalThreshold?: number;
  budgetAlerts: {
    at80Percent: boolean;
    onExceed: boolean;
  };
}

export interface ExportOptions {
  format: 'json' | 'csv';
  dataType: 'all' | 'expenses' | 'budgets' | 'categories';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface AccountStats {
  totalExpenses: number;
  totalBudgets: number;
  totalCategories: number;
  accountAge: string;
  lastLogin?: string;
}

export interface SplitPreferences {
  defaultSplitType: '50/50' | 'custom' | 'personal';
  customRatio?: {
    user1: number;
    user2: number;
  };
  categoryDefaults?: Record<number, '50/50' | 'custom' | 'personal'>;
}
