import { BudgetTableHeaderProps } from '../../types/budget';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RefreshCw } from 'lucide-react';
import { PERIOD_OPTIONS } from '../../lib/constants';

export function BudgetTableHeader({
  title,
  selectedPeriod,
  onPeriodChange,
  onRefresh
}: BudgetTableHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="flex items-center gap-2">
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
