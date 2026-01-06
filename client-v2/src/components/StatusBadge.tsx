import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, Info, Sparkles } from 'lucide-react';

type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'highlight';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { icon: typeof CheckCircle2 }> = {
  success: { icon: CheckCircle2 },
  warning: { icon: AlertCircle },
  danger: { icon: XCircle },
  info: { icon: Info },
  highlight: { icon: Sparkles },
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={status} className={cn("gap-1.5", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

export default StatusBadge;
