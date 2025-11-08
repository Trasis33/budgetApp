import { BudgetStatusBadgeProps } from '../../types/budget';
import { getStatusLabel } from '../../lib/budgetUtils';
import styles from '../../styles/shared/badges.module.css';

export function BudgetStatusBadge({
  status,
  label,
  showPulse = false,
  className = ''
}: BudgetStatusBadgeProps) {
  const getBadgeClassName = (status: string) => {
    const statusMap = {
      success: styles.badgeSuccess,
      warning: styles.badgeWarning,
      danger: styles.badgeDanger,
    };
    return statusMap[status as keyof typeof statusMap] || styles.badgeDefault;
  };

  const displayLabel = label || getStatusLabel(status);

  return (
    <span 
      className={`${styles.badge} ${styles.badgeMd} ${styles.statusBadge} ${getBadgeClassName(status)} ${showPulse ? styles.badgePulse : ''} ${className}`}
      role="status"
      aria-label={`Budget status: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
}
