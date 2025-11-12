export interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_icon?: string;
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

export interface CategoryIcon {
  name: string;
  color: 'green' | 'blue' | 'amber' | 'purple' | 'pink';
}

// Component Props Interfaces
export interface BudgetMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: 'green' | 'blue' | 'amber' | 'purple' | 'pink' | 'success' | 'warning' | 'danger';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export interface BudgetProgressBarProps {
  percentage: number;
  variant: BudgetStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  categoryColor?: 'mint' | 'indigo' | 'amber' | 'violet' | 'teal' | 'coral' | 'cyan' | 'periwinkle' | 'golden' | 'yellow';
  className?: string;
}

export interface BudgetStatusBadgeProps {
  status: BudgetStatus;
  label?: string;
  showPulse?: boolean;
  className?: string;
}

export interface BudgetTableRowProps {
  budget: BudgetWithSpending;
  onDelete: (budgetId: number) => void;
  deleteConfirmId?: number | null;
  className?: string;
}

export interface BudgetHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onExport?: () => void;
  onAddBudget?: () => void;
  showBackButton?: boolean;
  showExportButton?: boolean;
  showAddButton?: boolean;
  className?: string;
}

export interface BudgetStatsFooterProps {
  stats: BudgetStats;
  lastUpdated?: Date;
  className?: string;
}

export interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  className?: string;
}

// Generic Shared Component Props
export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconClassName?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export interface StatusBadgeProps {
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  showPulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
