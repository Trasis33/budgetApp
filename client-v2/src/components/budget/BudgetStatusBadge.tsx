import { BudgetStatusBadgeProps } from '../../types/budget';
import { getStatusLabel } from '../../lib/budgetUtils';

export function BudgetStatusBadge({
  status,
  label,
  showPulse = false
}: BudgetStatusBadgeProps) {
  const statusClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
  };

  const pulseClasses = {
    success: 'animate-pulse bg-emerald-500',
    warning: 'animate-pulse bg-amber-500',
    danger: 'animate-pulse bg-red-500',
  };

  const displayLabel = label || getStatusLabel(status);

  return (
    <div className="inline-flex items-center gap-2">
      {showPulse && (
        <span className={`w-2 h-2 rounded-full ${pulseClasses[status]}`} />
      )}
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusClasses[status]}`}>
        {displayLabel}
      </span>
    </div>
  );
}
