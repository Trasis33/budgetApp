import { BudgetWithSpending } from '../../types/budget';
import { useState, useMemo } from 'react';
import { BudgetTableRow } from './BudgetTableRow';
import { BudgetStatsFooter } from './BudgetStatsFooter';
import styles from '../../styles/budget/budget-table.module.css';

interface BudgetTableProps {
  budgets: BudgetWithSpending[];
  onDelete: (budgetId: number) => void;
  deleteConfirmId?: number | null;
  onUpdate?: () => void;
  className?: string;
}

export function BudgetTable({
  budgets,
  onDelete,
  deleteConfirmId,
  onUpdate,
  className = ''
}: BudgetTableProps) {
  const [showAll, setShowAll] = useState(false);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No budgets found. Create your first budget to get started.
      </div>
    );
  }

  // Compute which budgets to show: top 5 by spent, optionally all when expanded
  const sortedBudgets = useMemo(
    () => [...budgets].sort((a, b) => b.spent - a.spent),
    [budgets]
  );
  const visibleBudgets = showAll ? sortedBudgets : sortedBudgets.slice(0, 5);

  const handleToggleViewAll = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <table className={styles.budgetTable}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>Category</th>
            <th>Monthly Budget</th>
            <th>Spent</th>
            <th>Remaining</th>
            <th>Progress</th>
            <th className="text-center">Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {visibleBudgets.map((budget) => (
            <BudgetTableRow
              key={budget.id}
              budget={budget}
              onDelete={onDelete}
              deleteConfirmId={deleteConfirmId}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
      
      {/* Pagination / view-all footer ABOVE summary */}
      <div className={styles.tableFooter}>
        <div className={styles.footerInfo}>
          Showing {visibleBudgets.length} of {budgets.length} categories
        </div>
        {budgets.length > 5 && (
          <button
            type="button"
            className={styles.footerAction}
            onClick={handleToggleViewAll}
          >
            {showAll ? 'Show top 5 categories →' : 'View all categories →'}
          </button>
        )}
      </div>

      {/* Summary footer with clear separation below */}
      <BudgetStatsFooter
        stats={{
          onTrack: budgets.filter(b => b.status === 'success').length,
          warning: budgets.filter(b => b.status === 'warning').length,
          overBudget: budgets.filter(b => b.status === 'danger').length,
        }}
        lastUpdated={new Date()}
        className={styles.statsFooterSeparated}
      />
    </div>
  );
}
