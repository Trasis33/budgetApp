import { BudgetHeaderProps } from '../../types/budget';
import { ArrowLeft, Plus } from 'lucide-react';

export function BudgetHeader({
  title,
  subtitle,
  onBack,
  onExport,
  onAddBudget,
  showBackButton = true,
  showExportButton = true,
  showAddButton = true,
  className = ''
}: BudgetHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-4">
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="btn-ghost flex items-center gap-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div>
          <h1 className="text-2xl font-medium">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {showExportButton && onExport && (
          <button 
            onClick={onExport}
            className="btn-secondary text-sm"
            aria-label="Export budget data"
          >
            Export
          </button>
        )}
        {showAddButton && onAddBudget && (
          <button 
            onClick={onAddBudget}
            className="btn-primary text-sm flex items-center gap-2"
            aria-label="Add new budget"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        )}
      </div>
    </div>
  );
}
