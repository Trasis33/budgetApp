import { Card, CardContent } from '../ui/card';
import { BudgetMetricCardProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';

const iconColorMap = {
  green: 'var(--chart-1)',
  blue: 'var(--chart-3)',
  amber: 'var(--chart-4)',
  purple: 'var(--chart-5)',
  pink: '#ec4899',
};

export function BudgetMetricCard({
  label,
  value,
  icon,
  iconColor,
}: BudgetMetricCardProps) {
  const iconBgColor = iconColorMap[iconColor];
  const backgroundStyle = {
    backgroundColor: `color-mix(in oklab, ${iconBgColor} 20%, transparent)`,
    color: iconBgColor,
  };

  return (
    <Card className={styles.metricCard}>
      <CardContent className="p-0">
        <div className={styles.metricHeader}>
          <div
            className={styles.metricIcon}
            style={backgroundStyle}
          >
            {icon}
          </div>
          <span className={styles.metricLabel}>{label}</span>
        </div>
        <div className={styles.metricValue}>
          {typeof value === 'number' ? value.toLocaleString('sv-SE') : value}
        </div>
      </CardContent>
    </Card>
  );
}
