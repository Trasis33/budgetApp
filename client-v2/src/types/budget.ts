import { Budget } from './index';

// Extended budget type with spending data
export interface BudgetWithSpending extends Budget {
  spent: number;
  progress: number;
  remaining: number;
  status: 'success' | 'warning' | 'danger';
  expenseCount?: number;
}

// Budget metrics for dashboard display
export interface BudgetMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  overallStatus: 'success' | 'warning' | 'danger';
}

// Budget statistics
export interface BudgetStats {
  onTrack: number;
  warning: number;
  overBudget: number;
}

// Component prop interfaces
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
  className?: string;
}

export interface BudgetTableHeaderProps {
  title: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onRefresh?: () => void;
}

export interface BudgetHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
}

export interface BudgetMetricsGridProps {
  metrics: BudgetMetrics;
}

export interface BudgetTableProps {
  budgets: BudgetWithSpending[];
  onEdit: (budget: BudgetWithSpending) => void;
  onDelete: (budgetId: number) => void;
  editingId?: number | null;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onRefresh?: () => void;
}

export interface BudgetStatsFooterProps {
  stats: BudgetStats;
}
