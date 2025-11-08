import { BudgetHeaderProps } from '../../types/budget';
import { Button } from '../ui/button';
import { ArrowLeft, Download, Plus } from 'lucide-react';

export function BudgetHeader({
  title,
  subtitle,
  onBack,
  onExport,
  onAdd
}: BudgetHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onExport && (
            <Button variant="outline" onClick={onExport} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
