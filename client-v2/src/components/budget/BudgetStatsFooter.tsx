import { BudgetStats } from '../../types/budget';

interface BudgetStatsFooterProps {
  stats: BudgetStats;
}

export function BudgetStatsFooter({ stats }: BudgetStatsFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-accent border-t border-border text-sm text-muted-foreground">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>On Track: {stats.onTrack}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Warning: {stats.warning}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Over Budget: {stats.overBudget}</span>
        </div>
      </div>
      <div>
        <span className="font-medium">
          Total Categories: {stats.onTrack + stats.warning + stats.overBudget}
        </span>
      </div>
    </div>
  );
}
