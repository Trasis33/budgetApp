import React from 'react';
import { BudgetWithSpending } from '../../types/budget';
import { BudgetTableRow } from './BudgetTableRow';
import { BudgetStatsFooter } from './BudgetStatsFooter';
import styles from '../../styles/budget/budget-table.module.css';

interface BudgetTableProps {
  budgets: BudgetWithSpending[];
  onEdit: (budget: BudgetWithSpending) => void;
  onDelete: (budgetId: number) => void;
  editingBudgetId?: number;
  className?: string;
}

export function BudgetTable({
  budgets,
  onEdit,
  onDelete,
  editingBudgetId,
  className = ''
}: BudgetTableProps) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No budgets found. Create your first budget to get started.
      </div>
    );
  }

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
          {budgets.map((budget) => (
            <BudgetTableRow
              key={budget.id}
              budget={budget}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={budget.id === editingBudgetId}
            />
          ))}
        </tbody>
      </table>
      
      <BudgetStatsFooter 
        stats={{
          onTrack: budgets.filter(b => b.status === 'success').length,
          warning: budgets.filter(b => b.status === 'warning').length,
          overBudget: budgets.filter(b => b.status === 'danger').length,
        }}
        lastUpdated={new Date()}
      />
    </div>
  );
}
