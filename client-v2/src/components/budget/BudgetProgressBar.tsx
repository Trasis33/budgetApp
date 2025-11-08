import { BudgetProgressBarProps } from '../../types/budget';
import { Progress } from '../ui/progress';

export function BudgetProgressBar({
  percentage,
  variant,
  showLabel = false,
  size = 'md'
}: BudgetProgressBarProps) {
  const variantClasses = {
    success: '[&>div]:bg-emerald-500',
    warning: '[&>div]:bg-amber-500',
    danger: '[&>div]:bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="space-y-1">
      <Progress
        value={displayPercentage}
        className={`${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${
            variant === 'danger' ? 'text-red-600' :
            variant === 'warning' ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {percentage.toFixed(1)}% used
          </span>
        </div>
      )}
    </div>
  );
}
