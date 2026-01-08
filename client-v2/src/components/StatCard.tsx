import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatVariant = 'default' | 'success' | 'warning' | 'danger' | 'teal' | 'coral' | 'gold';

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
    iconBg: 'bg-[oklch(var(--theme-indigo)/0.12)]',
  },
  success: {
    icon: 'text-[oklch(var(--theme-teal))]',
    iconBg: 'bg-[oklch(var(--theme-teal)/0.12)]',
  },
  warning: {
    icon: 'text-[oklch(var(--theme-amber))]',
    iconBg: 'bg-[oklch(var(--theme-amber)/0.12)]',
  },
  danger: {
    icon: 'text-[oklch(var(--theme-coral))]',
    iconBg: 'bg-[oklch(var(--theme-coral)/0.12)]',
  },
  teal: {
    icon: 'text-[oklch(var(--theme-teal))]',
    iconBg: 'bg-[oklch(var(--theme-teal)/0.12)]',
  },
  coral: {
    icon: 'text-[oklch(var(--theme-coral))]',
    iconBg: 'bg-[oklch(var(--theme-coral)/0.12)]',
  },
  gold: {
    icon: 'text-[oklch(var(--theme-gold))]',
    iconBg: 'bg-[oklch(var(--theme-gold)/0.12)]',
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
    <Card
      className={cn(
        "rounded-[20px] border border-border transition-all duration-300 hover:shadow-md hover:border-border-strong",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          {Icon && (
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              styles.iconBg
            )}>
              <Icon className={cn("h-6 w-6", styles.icon)} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-[28px] font-display font-semibold leading-tight text-foreground">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-1",
                trend.value >= 0 ? "text-[oklch(var(--theme-teal))]" : "text-[oklch(var(--theme-coral))]"
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
                {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
