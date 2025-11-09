import { Budget } from './index';

export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  progress: number;
  status: 'success' | 'warning' | 'danger';
  expenseCount: number;
}

export interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  overallStatus: 'success' | 'warning' | 'danger';
}

export interface BudgetStats {
  onTrack: number;
  warning: number;
  overBudget: number;
}

export interface BudgetMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: 'green' | 'blue' | 'amber' | 'purple' | 'pink';
  variant?: 'default' | 'success' | 'warning';
}

export interface BudgetProgressBarProps {
  percentage: number;
  variant: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface BudgetStatusBadgeProps {
  status: 'success' | 'warning' | 'danger';
  label?: string;
  showPulse?: boolean;
}

export interface BudgetTableRowProps {
  budget: BudgetWithSpending;
  onEdit: (budget: BudgetWithSpending) => void;
  onDelete: (budgetId: number) => void;
  isEditing?: boolean;
}

export interface BudgetTableHeaderProps {
  title: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onRefresh?: () => void;
}

export interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isEditing?: boolean;
  size?: 'sm' | 'md';
}
