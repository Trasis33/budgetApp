import { TableBody, TableRow, TableCell } from '../ui/table';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { BudgetTableRowProps } from '../../types/budget';
import { formatCurrency } from '../../lib/utils';
import styles from '../../styles/budget/budget-table.module.css';

export function BudgetTableRow({
  budget,
  onEdit,
  onDelete,
  isEditing = false,
}: BudgetTableRowProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      onDelete(budget.id);
    }
  };

  return (
    <TableRow className={styles.tableRow}>
      <TableCell className={styles.categoryCell}>
        <div className={styles.categoryIcon}>
          <span>{budget.category_name.charAt(0)}</span>
        </div>
        <div>
          <div className="font-medium text-foreground">{budget.category_name}</div>
          <div className="text-xs text-muted-foreground">
            {budget.expenseCount} expenses
          </div>
        </div>
      </TableCell>
      <TableCell className={styles.amountCell}>
        {formatCurrency(budget.amount)}
      </TableCell>
      <TableCell className={styles.amountCell}>
        {formatCurrency(budget.spent)}
      </TableCell>
      <TableCell className={styles.amountCell}>
        {formatCurrency(budget.remaining)}
      </TableCell>
      <TableCell className={styles.progressCell}>
        <BudgetProgressBar
          percentage={budget.progress}
          variant={budget.status}
          showLabel={true}
        />
      </TableCell>
      <TableCell className={styles.statusCell}>
        <BudgetStatusBadge status={budget.status} />
      </TableCell>
      <TableCell className={styles.actionsCell}>
        <ActionButtons
          onEdit={() => onEdit(budget)}
          onDelete={handleDelete}
          isEditing={isEditing}
        />
      </TableCell>
    </TableRow>
  );
}
