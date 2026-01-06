import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatVariant = 'default' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: StatVariant;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

const variantStyles: Record<StatVariant, { icon: string; iconBg: string }> = {
  default: {
    icon: 'text-[oklch(var(--theme-indigo))]',
    iconBg: 'bg-[oklch(var(--theme-indigo)/0.1)]',
  },
  success: {
    icon: 'text-[oklch(var(--theme-teal))]',
    iconBg: 'bg-[oklch(var(--theme-teal)/0.1)]',
  },
  warning: {
    icon: 'text-[oklch(var(--theme-amber))]',
    iconBg: 'bg-[oklch(var(--theme-amber)/0.1)]',
  },
  danger: {
    icon: 'text-[oklch(var(--theme-coral))]',
    iconBg: 'bg-[oklch(var(--theme-coral)/0.1)]',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-display font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-[oklch(var(--theme-teal))]" : "text-[oklch(var(--theme-coral))]"
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
                {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              styles.iconBg
            )}>
              <Icon className={cn("h-5 w-5", styles.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
