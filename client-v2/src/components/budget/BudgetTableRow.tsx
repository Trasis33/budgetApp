import { BudgetTableRowProps } from '../../types/budget';
import { BudgetProgressBar } from './BudgetProgressBar';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { formatCurrency } from '../../lib/utils';
import { getCategoryIcon, getCategoryIconColor } from '../../lib/budgetUtils';
import * as Icons from 'lucide-react';

export function BudgetTableRow({
  budget,
  onEdit,
  onDelete,
  isEditing = false,
  className = ''
}: BudgetTableRowProps) {
  const iconName = getCategoryIcon(budget.category_name);
  const iconColor = getCategoryIconColor(budget.category_name);
  
  // Get the icon component dynamically
  const IconComponent = (Icons as any)[iconName] || Icons.MoreHorizontal;

  const iconColorClasses = {
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  const getAmountClassName = (amount: number) => {
    if (amount < 0) return 'text-red-600 font-semibold';
    if (amount <= budget.amount * 0.2) return 'text-amber-600';
    return 'text-emerald-600';
  };

  if (isEditing) {
    return (
      <tr className={`border-b bg-blue-50/30 ${className}`}>
        <td colSpan={7} className="px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Editing mode - Use the form above to update budget
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b hover:bg-muted/50 transition-colors ${className}`}>
      {/* Category */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClasses[iconColor]}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-foreground">{budget.category_name}</div>
            <div className="text-xs text-muted-foreground">
              {budget.expenseCount || 0} {budget.expenseCount === 1 ? 'expense' : 'expenses'}
            </div>
          </div>
        </div>
      </td>

      {/* Budget Amount */}
      <td className="px-4 py-3 text-right">
        <div className="font-medium text-foreground">{formatCurrency(budget.amount)}</div>
      </td>

      {/* Spent */}
      <td className="px-4 py-3 text-right">
        <div className="font-medium text-foreground">{formatCurrency(budget.spent)}</div>
      </td>

      {/* Remaining */}
      <td className={`px-4 py-3 text-right ${getAmountClassName(budget.remaining)}`}>
        <div className="font-semibold">{formatCurrency(budget.remaining)}</div>
      </td>

      {/* Progress Bar */}
      <td className="px-4 py-3">
        <div className="min-w-[120px]">
          <BudgetProgressBar
            percentage={budget.progress}
            variant={budget.status}
            size="md"
          />
        </div>
      </td>

      {/* Status Badge */}
      <td className="px-4 py-3 text-center">
        <BudgetStatusBadge
          status={budget.status}
          showPulse={budget.status === 'danger'}
        />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <ActionButtons
          onEdit={() => onEdit(budget)}
          onDelete={() => onDelete(budget.id)}
        />
      </td>
    </tr>
  );
}
