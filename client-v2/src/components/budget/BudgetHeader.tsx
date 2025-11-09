import { Button } from '../ui/button';
import { ArrowLeft, Download, Plus } from 'lucide-react';

interface BudgetHeaderProps {
  onBack?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
  title?: string;
  subtitle?: string;
}

export function BudgetHeader({
  onBack,
  onExport,
  onAdd,
  title = 'Budget Manager',
  subtitle = 'Track and manage your category budgets',
}: BudgetHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-medium text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
        {onAdd && (
          <Button size="sm" onClick={onAdd}>
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        )}
      </div>
    </div>
  );
}
