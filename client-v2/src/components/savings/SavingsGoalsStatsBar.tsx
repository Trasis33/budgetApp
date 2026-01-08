import { useMemo } from 'react';
import { SavingsGoal } from '@/types';
import { StatCard } from '@/components/StatCard';
import { Bookmark, TrendingUp, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { calculateSavingsStats } from '@/lib/savingsCalculations';
import { Skeleton } from '@/components/ui/skeleton';

interface SavingsGoalsStatsBarProps {
  goals: SavingsGoal[];
  loading?: boolean;
}

export function SavingsGoalsStatsBar({ goals, loading = false }: SavingsGoalsStatsBarProps) {
  const stats = useMemo(() => {
    return calculateSavingsStats(goals);
  }, [goals]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-[20px] border border-border p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Active Goals"
        value={stats.activeGoals}
        icon={Bookmark}
        variant="teal"
      />
      <StatCard
        label="Total Saved"
        value={formatCurrency(stats.totalSaved)}
        icon={TrendingUp}
        variant="coral"
      />
      <StatCard
        label="Avg Progress"
        value={`${Math.round(stats.avgProgress)}%`}
        icon={Percent}
        variant="gold"
      />
    </div>
  );
}
