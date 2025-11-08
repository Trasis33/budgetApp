import React from 'react';
import { BudgetStatsFooterProps } from '../../types/budget';
import styles from '../../styles/budget/budget-metrics.module.css';

export function BudgetStatsFooter({
  stats,
  lastUpdated,
  className = ''
}: BudgetStatsFooterProps) {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`${styles.statsFooter} ${className}`}>
      <div className={styles.statsContent}>
        <div className={styles.statsLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotSuccess}`} />
            <span className={styles.legendText}>
              {stats.onTrack} On Track
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotWarning}`} />
            <span className={styles.legendText}>
              {stats.warning} Warning
            </span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotDanger}`} />
            <span className={styles.legendText}>
              {stats.overBudget} Over Budget
            </span>
          </div>
        </div>
        
        {lastUpdated && (
          <div className={styles.statsTimestamp}>
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
        )}
      </div>
    </div>
  );
}
