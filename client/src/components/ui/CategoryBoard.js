import React from 'react';
import formatCurrency from '../../utils/formatCurrency';

const CategoryBoard = ({ category, expenses, total }) => {
  if (!category) return null;

  // Separate recurring and non-recurring expenses
  const recurringExpenses = expenses.filter(exp => exp.recurring_expense_id);
  const regularExpenses = expenses.filter(exp => !exp.recurring_expense_id);
  
  // Calculate totals
  const recurringTotal = recurringExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const regularTotal = regularExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 hover:bg-neutral-100/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-neutral-900">{category.name}</div>
        <div className="text-sm font-semibold text-neutral-900">{formatCurrency(total)}</div>
      </div>
      
      {/* Spending breakdown */}
      <div className="text-xs text-neutral-500 mb-2">
        {regularTotal > 0 && (
          <div className="flex justify-between">
            <span>Regular:</span>
            <span className="font-medium">{formatCurrency(regularTotal)}</span>
          </div>
        )}
        {recurringTotal > 0 && (
          <div className="flex justify-between">
            <span>Recurring:</span>
            <span className="font-medium text-emerald-600">{formatCurrency(recurringTotal)}</span>
          </div>
        )}
      </div>

      {/* Show recent regular expenses */}
      {regularExpenses.length > 0 && (
        <div>
          <div className="text-xs text-neutral-500 font-medium mb-1">Recent spending:</div>
          <ul className="space-y-0.5 text-[13px] text-neutral-700">
            {regularExpenses.slice(0, 3).map((expense) => (
              <li key={expense.id} className="flex justify-between">
                <span className="truncate flex-1 mr-2">{expense.description}</span>
                <span className="font-semibold">{formatCurrency(expense.amount)}</span>
              </li>
            ))}
            {regularExpenses.length > 3 && (
              <li className="text-xs text-neutral-500 mt-1 pt-1 border-t border-neutral-100">
                +{regularExpenses.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Show recurring count if any */}
      {recurringExpenses.length > 0 && regularExpenses.length === 0 && (
        <div className="text-xs text-neutral-500">
          {recurringExpenses.length} recurring expense{recurringExpenses.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="text-xs text-neutral-500">No expenses yet</div>
      )}
    </div>
  );
};

export default CategoryBoard;
