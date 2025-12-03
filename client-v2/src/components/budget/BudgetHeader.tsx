import { BudgetHeaderProps } from '../../types/budget';
import { ArrowLeft, Plus, Wand2 } from 'lucide-react';

export function BudgetHeader({
  title,
  subtitle,
  onBack,
  onExport,
  onAddBudget,
  onAutoBudget,
  showBackButton = true,
  showExportButton = true,
  showAddButton = true,
  addButtonLabel,
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
        {onAutoBudget && (
          <button
            onClick={onAutoBudget}
            className="text-sm flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-xs font-medium"
            aria-label="Open Smart Budget Wizard"
          >
            <Wand2 className="w-4 h-4" />
            Smart Budget
          </button>
        )}
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
            {addButtonLabel || 'Add Budget'}
          </button>
        )}
      </div>
    </div>
  );
}
