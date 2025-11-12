import React from 'react';
import { BudgetMetrics, BudgetStatus } from '../../types/budget';
import { BudgetMetricCard } from './BudgetMetricCard';
import { formatBudgetAmount } from '../../lib/budgetUtils';
import styles from '../../styles/budget/budget-metrics.module.css';
import { Wallet, TrendingUp, AlertCircle, CheckCircle, XCircle, Percent } from 'lucide-react';

interface BudgetMetricsGridProps {
  metrics: BudgetMetrics;
  className?: string;
}

interface StatusConfig {
  text: string;
  icon: React.ReactNode;
  iconColor: 'success' | 'warning' | 'danger' | 'mint' | 'indigo' | 'amber' | 'violet' | 'teal' | 'coral' | 'cyan' | 'periwinkle' | 'golden' | 'yellow';
  dotColor: 'success' | 'warning' | 'danger';
}

export function BudgetMetricsGrid({
  metrics,
  className = ''
}: BudgetMetricsGridProps) {
  const getStatusConfig = (status: BudgetStatus): StatusConfig => {
    switch (status) {
      case 'success':
        return {
          text: 'On Track',
          icon: <CheckCircle className="w-5 h-5" />,
          iconColor: 'success',
          dotColor: 'success'
        };
      case 'warning':
        return {
          text: 'Approaching Limit',
          icon: <AlertCircle className="w-5 h-5" />,
          iconColor: 'warning',
          dotColor: 'warning'
        };
      case 'danger':
        return {
          text: 'Over Budget',
          icon: <XCircle className="w-5 h-5" />,
          iconColor: 'danger',
          dotColor: 'danger'
        };
    }
  };

  const statusConfig = getStatusConfig(metrics.overallStatus);

  return (
    <div className={`${styles.metricsGrid} ${className}`}>
      <BudgetMetricCard
        label="Total Budget"
        value={formatBudgetAmount(metrics.totalBudget)}
        icon={<Wallet className="w-5 h-5" />}
        iconColor="indigo"
      />
      
      <BudgetMetricCard
        label="Total Spent"
        value={formatBudgetAmount(metrics.totalSpent)}
        icon={<TrendingUp className="w-5 h-5" />}
        iconColor="coral"
        variant={metrics.overallStatus === 'danger' ? 'danger' : 'warning'}
      />
      
      <BudgetMetricCard
        label="Total Remaining"
        value={formatBudgetAmount(metrics.totalRemaining)}
        icon={<Percent className="w-5 h-5" />}
        iconColor="teal"
        variant={metrics.totalRemaining >= 0 ? 'success' : 'danger'}
      />
      
      <BudgetMetricCard
        label="Status"
        value={statusConfig.text}
        icon={statusConfig.icon}
        iconColor={statusConfig.iconColor}
        variant={metrics.overallStatus}
        statusDotColor={statusConfig.dotColor}
        className="flex flex-col"
      />
    </div>
  );
}
