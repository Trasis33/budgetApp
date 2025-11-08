import { BudgetStatsFooterProps } from '../../types/budget';

export function BudgetStatsFooter({ stats }: BudgetStatsFooterProps) {
  return (
    <div className="px-6 py-4 border-t bg-muted/30">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              On Track: <span className="font-medium text-foreground">{stats.onTrack}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              Warning: <span className="font-medium text-foreground">{stats.warning}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">
              Over Budget: <span className="font-medium text-foreground">{stats.overBudget}</span>
            </span>
          </div>
        </div>
        <div className="text-muted-foreground">
          Total: <span className="font-medium text-foreground">{stats.onTrack + stats.warning + stats.overBudget}</span> budgets
        </div>
      </div>
    </div>
  );
}
