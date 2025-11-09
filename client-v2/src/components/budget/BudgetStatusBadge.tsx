import { BudgetStatusBadgeProps } from '../../types/budget';
import { getStatusLabel } from '../../lib/budgetUtils';
import styles from '../../styles/budget/budget-metrics.module.css';

export function BudgetStatusBadge({
  status,
  label,
  showPulse = false,
}: BudgetStatusBadgeProps) {
  const statusClass =
    status === 'success'
      ? styles.statusSuccess
      : status === 'warning'
      ? styles.statusWarning
      : styles.statusDanger;

  const pulseClass = showPulse ? styles.pulse : '';

  return (
    <span className={`${styles.statusBadge} ${statusClass} ${pulseClass}`}>
      {label || getStatusLabel(status)}
    </span>
  );
}
