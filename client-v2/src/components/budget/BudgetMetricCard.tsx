import { BudgetMetricCardProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';

export function BudgetMetricCard({
  label,
  value,
  icon,
  iconColor,
  variant = 'default',
  className = ''
}: BudgetMetricCardProps) {
  const getIconClassName = (color: string) => {
    const colorMap = {
      green: styles.iconGreen,
      amber: styles.iconAmber,
      blue: styles.iconBlue,
      purple: styles.iconPurple,
      pink: styles.iconPink,
    };
    return colorMap[color as keyof typeof colorMap] || styles.iconGreen;
  };

  const getValueClassName = (variant: string) => {
    const variantMap = {
      default: styles.metricValue,
      success: styles.metricValueSuccess,
      warning: styles.metricValueWarning,
      danger: styles.metricValueDanger,
    };
    return variantMap[variant as keyof typeof variantMap] || styles.metricValue;
  };

  const isStatusCard = label === 'Status';

  return (
    <div className={`${styles.metricCard} ${className}`}>
      <div className={styles.metricContent}>
        <div className={styles.metricInfo}>
          <div className={styles.metricLabel}>{label}</div>

          {isStatusCard ? (
            <div className={styles.statusIndicator}>
              <span className={styles.statusText}>{value}</span>
              <span className={`${styles.statusDot} ${styles.statusDotPulse}`} />
            </div>
          ) : (
            <div className={`${styles.metricValue} ${getValueClassName(variant)}`}>
              {value}
            </div>
          )}
        </div>

        <div className={`${styles.metricIcon} ${getIconClassName(iconColor)}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
