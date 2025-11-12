import { BudgetProgressBarProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';
import { formatPercentage } from '../../lib/budgetUtils';

export function BudgetProgressBar({
  percentage,
  variant,
  showLabel = true,
  size = 'md',
  className = ''
}: BudgetProgressBarProps) {
  const getProgressFillClassName = (variant: string) => {
    const variantMap = {
      success: styles.progressFillSuccess,
      warning: styles.progressFillWarning,
      danger: styles.progressFillDanger,
    };
    return variantMap[variant as keyof typeof variantMap] || styles.progressFillSuccess;
  };

  const getProgressBarClassName = (size: string) => {
    const sizeMap = {
      sm: styles.progressBarSm,
      md: styles.progressBarMd,
      lg: styles.progressBarLg,
    };
    return `${styles.progressBar} ${sizeMap[size as keyof typeof sizeMap] || styles.progressBarMd}`;
  };

  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBarWrapper}>
        <div className={`${getProgressBarClassName(size)} ${className}`}>
          <div 
            className={`${styles.progressFill} ${getProgressFillClassName(variant)}`}
            style={{ width: `${clampedPercentage}%` }}
            role="progressbar"
            aria-valuenow={clampedPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Budget progress: ${formatPercentage(clampedPercentage)}`}
          />
        </div>
      </div>
      {showLabel && (
        <span className={styles.progressLabel}>
          {formatPercentage(clampedPercentage)}
        </span>
      )}
    </div>
  );
}
