import { BudgetMetricCardProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';

interface BudgetMetricCardExtendedProps extends BudgetMetricCardProps {
  statusDotColor?: 'success' | 'warning' | 'danger';
}

export function BudgetMetricCard({
  label,
  value,
  icon,
  iconColor,
  variant = 'default',
  statusDotColor = 'success',
  className = ''
}: BudgetMetricCardExtendedProps) {
  const getIconClassName = (color: string) => {
    const colorMap = {
      mint: styles.iconMint,
      indigo: styles.iconIndigo,
      amber: styles.iconAmber,
      violet: styles.iconViolet,
      teal: styles.iconTeal,
      coral: styles.iconCoral,
      cyan: styles.iconCyan,
      periwinkle: styles.iconPeriwinkle,
      golden: styles.iconGolden,
      yellow: styles.iconYellow,
      success: styles.iconSuccess,
      warning: styles.iconWarning,
      danger: styles.iconDanger,
    };
    return colorMap[color as keyof typeof colorMap] || styles.iconMint;
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

  const getStatusDotClassName = (dotColor: string) => {
    const dotColorMap = {
      success: styles.statusDotSuccess,
      warning: styles.statusDotWarning,
      danger: styles.statusDotDanger,
    };
    return dotColorMap[dotColor as keyof typeof dotColorMap] || styles.statusDotSuccess;
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
              <span className={`${getStatusDotClassName(statusDotColor)} ${styles.statusDotPulse}`} />
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
