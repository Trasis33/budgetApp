import React from 'react';
import { BudgetMetrics } from '../../types/budget';
import { BudgetMetricCard } from './BudgetMetricCard';
import { formatBudgetAmount } from '../../lib/budgetUtils';
import styles from '../../styles/budget/budget-metrics.module.css';
import { Wallet, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetMetricsGridProps {
  metrics: BudgetMetrics;
  className?: string;
}

export function BudgetMetricsGrid({
  metrics,
  className = ''
}: BudgetMetricsGridProps) {
  return (
    <div className={`${styles.metricsGrid} ${className}`}>
      <BudgetMetricCard
        label="Total Budget"
        value={formatBudgetAmount(metrics.totalBudget)}
        icon={<Wallet className="w-5 h-5" />}
        iconColor="blue"
      />
      
      <BudgetMetricCard
        label="Total Spent"
        value={formatBudgetAmount(metrics.totalSpent)}
        icon={<TrendingUp className="w-5 h-5" />}
        iconColor="purple"
        variant={metrics.overallStatus === 'danger' ? 'danger' : 'default'}
      />
      
      <BudgetMetricCard
        label="Total Remaining"
        value={formatBudgetAmount(metrics.totalRemaining)}
        icon={<CheckCircle className="w-5 h-5" />}
        iconColor="green"
        variant={metrics.totalRemaining >= 0 ? 'success' : 'danger'}
      />
      
      <BudgetMetricCard
        label="Overall Progress"
        value={`${metrics.overallProgress.toFixed(1)}%`}
        icon={<AlertCircle className="w-5 h-5" />}
        iconColor="amber"
        variant={metrics.overallStatus}
      />
    </div>
  );
}
