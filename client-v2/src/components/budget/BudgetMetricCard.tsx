import { BudgetMetricCardProps } from '../../types/budget';
import { Card, CardContent } from '../ui/card';

export function BudgetMetricCard({
  label,
  value,
  icon,
  iconColor,
  variant = 'default'
}: BudgetMetricCardProps) {
  const iconColorClasses = {
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  const variantClasses = {
    default: '',
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
  };

  return (
    <Card className={`transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${variantClasses[variant]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-2">
              {label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClasses[iconColor]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
