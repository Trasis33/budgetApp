import { BudgetWithSpending } from '../../types/budget';
import { getCategoryIcon } from '../../lib/budgetUtils';
import { CATEGORY_DESCRIPTIONS } from '../../lib/constants';
import { formatBudgetAmount } from '../../lib/budgetUtils';
import { getEditBudgetSuggestions } from '../../lib/budgetSuggestions';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import { getIconByName } from '../../lib/categoryIcons';
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
  onUpdate?: () => void;
  className?: string;
}



export function BudgetTableRow({
  budget,
  onDelete,
  deleteConfirmId,
  onUpdate,
  className = ''
}: BudgetTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAmount, setEditingAmount] = useState(budget.amount.toString());
  const [showQuickSuggest, setShowQuickSuggest] = useState(false);

  // Use actual category color from database, fallback to default
  const categoryColor = budget.category_color || '#6366f1';
  const categoryIcon = getCategoryIcon(budget.category_name);
  const iconColor = categoryIcon.color;
  
  const getIconClassName = (color: string) => {
    const colorMap = {
      amber: styles.iconAmber,
      mint: styles.iconMint,
      indigo: styles.iconIndigo,
      yellow: styles.iconYellow,
      violet: styles.iconViolet,
      golden: styles.iconGolden,
      teal: styles.iconTeal,
      coral: styles.iconCoral,
      cyan: styles.iconCyan,
      periwinkle: styles.iconPeriwinkle,
    };
    return colorMap[color as keyof typeof colorMap] || styles.iconMint;
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
      const roundedAmount = Math.round(parseFloat(editingAmount));
      
      await budgetService.createOrUpdateBudget({
        category_id: budget.category_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: roundedAmount
      });

      toast.success('Budget updated successfully');
      setIsEditing(false);
      setShowQuickSuggest(false);
      
      // Trigger data refetch to update the table
      if (onUpdate) {
        onUpdate();
      }
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
    setEditingAmount(Math.round(amount).toString());
  };

  const hideQuickSuggest = () => {
    setShowQuickSuggest(false);
  };

  const getQuickSuggestions = () => {
    const parsedEditingAmount = parseFloat(editingAmount);
    const currentEditingAmount = Number.isFinite(parsedEditingAmount)
      ? Math.max(0, Math.round(parsedEditingAmount))
      : Math.round(budget.amount);
    
    return getEditBudgetSuggestions(currentEditingAmount, budget.spent);
  };

  // Use icon from database
  const IconComponent = getIconByName(budget.category_icon);
  const icon = <IconComponent className="w-4 h-4" />;

  return (
    <>
      <tr className={`${styles.tableRow} ${isEditing ? styles.editMode : ''} ${className}`}>
        {/* Category Cell */}
        <td className={styles.compactCell}>
          <div className={styles.categoryCell}>
            <div 
              className={styles.categoryIcon}
              style={{
                backgroundColor: `${categoryColor}15`,
                borderColor: `${categoryColor}30`,
                color: categoryColor,
                border: '1px solid'
              }}
            >
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
              <input
                type="number"
                value={editingAmount}
                onChange={(e) => setEditingAmount(e.target.value)}
                className={`${styles.formInput} ${styles.editing}`}
                step="1"
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
            categoryColor={categoryColor}
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
