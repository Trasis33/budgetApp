import { BudgetMetricsGridProps } from '../../types/budget';
import { BudgetMetricCard } from './BudgetMetricCard';
import { formatCurrency } from '../../lib/utils';
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react';

export function BudgetMetricsGrid({ metrics }: BudgetMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <BudgetMetricCard
        label="Total Budget"
        value={formatCurrency(metrics.totalBudget)}
        icon={<Wallet className="w-6 h-6" />}
        iconColor="green"
      />
      
      <BudgetMetricCard
        label="Total Spent"
        value={formatCurrency(metrics.totalSpent)}
        icon={<TrendingUp className="w-6 h-6" />}
        iconColor="blue"
      />
      
      <BudgetMetricCard
        label="Remaining"
        value={formatCurrency(metrics.totalRemaining)}
        icon={metrics.totalRemaining >= 0 ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
        iconColor={metrics.totalRemaining >= 0 ? "green" : "amber"}
        variant={metrics.totalRemaining >= 0 ? "success" : "warning"}
      />
      
      <BudgetMetricCard
        label="Budget Used"
        value={`${Math.min(metrics.overallProgress, 999).toFixed(1)}%`}
        icon={<Target className="w-6 h-6" />}
        iconColor={
          metrics.overallStatus === 'success' ? 'green' :
          metrics.overallStatus === 'warning' ? 'amber' : 'purple'
        }
        variant={metrics.overallStatus === 'danger' ? 'warning' : metrics.overallStatus}
      />
    </div>
  );
}
