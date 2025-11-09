import { RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { BudgetTableHeaderProps } from '../../types/budget';
import { BUDGET_PERIODS } from '../../lib/constants';

export function BudgetTableHeader({
  title,
  selectedPeriod,
  onPeriodChange,
  onRefresh,
}: BudgetTableHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
