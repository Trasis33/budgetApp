import { BudgetWithSpending } from '../../types/budget';
import { getCategoryIcon } from '../../lib/budgetUtils';
import { CATEGORY_DESCRIPTIONS } from '../../lib/constants';
import { formatBudgetAmount } from '../../lib/budgetUtils';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
// @ts-ignore - CSS module import
import styles from '../../styles/budget/budget-table.module.css';

import { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { budgetService } from '../../api/services/budgetService';

interface BudgetTableRowProps {
  budget: BudgetWithSpending;
  onDelete: (budgetId: number) => void;
  deleteConfirmId?: number | null;
  className?: string;
}

export function BudgetTableRow({
  budget,
  onDelete,
  deleteConfirmId,
  className = ''
}: BudgetTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAmount, setEditingAmount] = useState(budget.amount.toString());
  const [showQuickSuggest, setShowQuickSuggest] = useState(false);

  const categoryIcon = getCategoryIcon(budget.category_name);
  const iconColor = categoryIcon.color;
  
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditingAmount(budget.amount.toString());
    setShowQuickSuggest(true);
  };

  const handleSave = async () => {
    if (!editingAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await budgetService.createOrUpdateBudget({
        category_id: budget.category_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: parseFloat(editingAmount)
      });

      toast.success('Budget updated successfully');
      setIsEditing(false);
      setShowQuickSuggest(false);
      // In a real implementation, you'd refetch the data here
    } catch (error) {
      toast.error('Could not update budget. Please try again');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingAmount(budget.amount.toString());
    setShowQuickSuggest(false);
  };

  const applyQuickSuggest = (amount: number) => {
    setEditingAmount(amount.toString());
  };

  const hideQuickSuggest = () => {
    setShowQuickSuggest(false);
  };

  const getQuickSuggestions = () => {
    const spent = budget.spent;
    const current = budget.amount;
    
    return [
      { label: `Match spending: $${spent}`, value: spent },
      { label: `+10%: $${(spent * 1.1).toFixed(0)}`, value: spent * 1.1 },
      { label: `-10%: $${(spent * 0.9).toFixed(0)}`, value: spent * 0.9 },
      { label: `Round to $${Math.ceil(current / 50) * 50}`, value: Math.ceil(current / 50) * 50 },
    ];
  };

  // Use a simple default icon for now - can be expanded later
  const icon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
    </svg>
  );

  return (
    <>
      <tr className={`${styles.tableRow} ${isEditing ? styles.editMode : ''} ${className}`}>
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
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <input
                type="number"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                className={`${styles.formInput} ${styles.editing}`}
                step="0.01"
                min="0"
                autoFocus
              />
            </div>
          ) : (
            <span className="font-medium">{formatBudgetAmount(budget.amount)}</span>
          )}
        </td>

        {/* Spent Cell */}
        <td className={`${styles.compactCell} ${styles.amountCell}`}>
          <span className="font-medium">{formatBudgetAmount(budget.spent)}</span>
        </td>

        {/* Remaining Cell */}
        <td className={`${styles.compactCell} ${styles.amountCell} ${getAmountClassName(budget.remaining)}`}>
          <span className="font-medium">{formatBudgetAmount(budget.remaining)}</span>
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
          {isEditing ? (
            <div className={`flex items-center justify-center gap-1 ${styles.editActions}`}>
              <button 
                className={`${styles.btnPrimary} text-xs px-2 py-1`}
                onClick={handleSave}
              >
                Save
              </button>
              <button 
                className={`${styles.btnSecondary} text-xs px-2 py-1`}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <button 
                className={styles.btnGhost}
                onClick={handleEdit}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                className={`${styles.btnGhost} ${deleteConfirmId === budget.id ? styles.btnDanger : ''}`}
                onClick={() => onDelete(budget.id)}
              >
                {deleteConfirmId === budget.id ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Quick Suggest Row */}
      {isEditing && showQuickSuggest && (
        <tr className={styles.tableRow}>
          <td colSpan={7} className={`${styles.compactCell} p-0`}>
            <div className={`${styles.quickSuggestContainer} p-4 border-t`} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input-background)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2">Quick suggestions for {budget.category_name}:</p>
                  <div className="flex flex-wrap gap-2">
                    {getQuickSuggestions().map((suggestion, index) => (
                      <button
                        key={index}
                        className={styles.quickEditBtn}
                        onClick={() => applyQuickSuggest(suggestion.value)}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button className={styles.btnGhost} onClick={hideQuickSuggest}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
