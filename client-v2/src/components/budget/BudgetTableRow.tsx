import { BudgetTableRowProps } from '../../types/budget';
import { getCategoryIcon } from '../../lib/budgetUtils';
import { CATEGORY_DESCRIPTIONS } from '../../lib/constants';
import { formatBudgetAmount } from '../../lib/budgetUtils';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
// @ts-ignore - CSS module import
import styles from '../../styles/budget/budget-table.module.css';

export function BudgetTableRow({
  budget,
  onEdit,
  onDelete,
  isEditing = false,
  className = ''
}: BudgetTableRowProps) {
  const categoryIcon = getCategoryIcon(budget.category_name);
  const iconColor = categoryIcon.color;
  
  // Use a simple default icon for now - can be expanded later
  const icon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  );
  
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

  const getAmountClassName = (amount: number) => {
    if (amount < 0) return styles.amountDanger;
    if (amount <= budget.amount * 0.2) return styles.amountWarning;
    return styles.amountPositive;
  };

  if (isEditing) {
    return (
      <tr className={`${styles.tableRow} ${className}`}>
        <td colSpan={7} className={styles.compactCell}>
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <input
                  type="text"
                  value={budget.category_name}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Budget</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={budget.amount}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm">Save</button>
              <button className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`${styles.tableRow} ${className}`}>
      {/* Category Cell */}
      <td className={styles.compactCell}>
        <div className={styles.categoryCell}>
          <div className={`${styles.categoryIcon} ${getIconClassName(iconColor)}`}>
            {icon}
          </div>
          <div className={styles.categoryInfo}>
            <div className={styles.categoryName}>{budget.category_name}</div>
            <div className={styles.categoryDescription}>
              {CATEGORY_DESCRIPTIONS[budget.category_name] ||
                `${budget.expenseCount} expense${budget.expenseCount !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </td>

      {/* Budget Cell */}
      <td className={`${styles.compactCell} ${styles.amountCell}`}>
        {formatBudgetAmount(budget.amount)}
      </td>

      {/* Spent Cell */}
      <td className={`${styles.compactCell} ${styles.amountCell}`}>
        {formatBudgetAmount(budget.spent)}
      </td>

      {/* Remaining Cell */}
      <td className={`${styles.compactCell} ${styles.amountCell} ${getAmountClassName(budget.remaining)}`}>
        {formatBudgetAmount(budget.remaining)}
      </td>

      {/* Progress Cell */}
      <td className={styles.compactCell}>
        <BudgetProgressBar
          percentage={budget.progress}
          variant={budget.status}
          showLabel={true}
          size="sm"
        />
      </td>

      {/* Status Cell */}
      <td className={`${styles.compactCell} text-center`}>
        <BudgetStatusBadge
          status={budget.status}
          showPulse={budget.status === 'danger'}
        />
      </td>

      {/* Actions Cell */}
      <td className={styles.compactCell}>
        <ActionButtons
          onEdit={() => onEdit(budget)}
          onDelete={() => onDelete(budget.id)}
        />
      </td>
    </tr>
  );
}
