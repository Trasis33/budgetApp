import { BudgetProgressBarProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';

export function BudgetProgressBar({
  percentage,
  variant,
  showLabel = true,
  size = 'md',
}: BudgetProgressBarProps) {
  const sizeStyles = {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  };

  const progressStyle = {
    width: `${Math.min(percentage, 100)}%`,
    height: sizeStyles[size],
  };

  const fillClassName =
    variant === 'success'
      ? styles.progressFillSuccess
      : variant === 'warning'
      ? styles.progressFillWarning
      : styles.progressFillDanger;

  return (
    <div>
      <div className={styles.progressBar} style={{ height: sizeStyles[size] }}>
        <div
          className={`${styles.progressFill} ${fillClassName}`}
          style={progressStyle}
        />
      </div>
      {showLabel && (
        <div className={styles.progressLabel}>
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
