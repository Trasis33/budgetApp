import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { calculatePaceIndicator, PaceIndicator } from '@/lib/savingsCalculations';
import { cn } from '@/lib/utils';

interface PaceBadgeProps {
  amountProgress: number;
  timeProgress: number;
  showLabel?: boolean;
  className?: string;
}

export function PaceBadge({
  amountProgress,
  timeProgress,
  showLabel = true,
  className = ''
}: PaceBadgeProps) {
  const pace: PaceIndicator = calculatePaceIndicator(amountProgress, timeProgress);

  const getIcon = () => {
    switch (pace.variant) {
      case 'success':
        return <TrendingUp className="h-3 w-3" />;
      case 'warning':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getBadgeClass = () => {
    switch (pace.variant) {
      case 'success':
        return 'bg-[oklch(var(--theme-teal)/0.12)] text-[oklch(var(--theme-teal))] border-transparent';
      case 'warning':
        return 'bg-[oklch(var(--theme-coral)/0.12)] text-[oklch(var(--theme-coral))] border-transparent';
      default:
        return 'bg-[oklch(var(--theme-gold)/0.12)] text-[oklch(var(--theme-gold))] border-transparent';
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors",
        getBadgeClass(),
        className
      )}
    >
      {getIcon()}
      {showLabel && <span>{pace.label}</span>}
    </Badge>
  );
}
