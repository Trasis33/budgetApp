import { BudgetProgressBarProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';
import { formatPercentage } from '../../lib/budgetUtils';

export function BudgetProgressBar({
  percentage,
  variant,
  showLabel = true,
  size = 'md',
  categoryColor,
  className = ''
}: BudgetProgressBarProps) {
  const getProgressFillClassName = (categoryColor?: string, variant?: string) => {
    // Prioritize category color if provided
    if (categoryColor) {
      const colorMap: Record<string, string> = {
        mint: styles.progressFillMint,
        amber: styles.progressFillAmber,
        indigo: styles.progressFillIndigo,
        violet: styles.progressFillViolet,
        teal: styles.progressFillTeal,
        coral: styles.progressFillCoral,
        cyan: styles.progressFillCyan,
        periwinkle: styles.progressFillPeriwinkle,
        golden: styles.progressFillGolden,
        yellow: styles.progressFillYellow,
      };
      return colorMap[categoryColor] || styles.progressFillSuccess;
    }

    // Fall back to status-based color
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
            className={`${styles.progressFill} ${getProgressFillClassName(categoryColor, variant)}`}
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
