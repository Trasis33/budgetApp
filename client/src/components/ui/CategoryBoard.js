import React from 'react';
import { Card } from 'flowbite-react';
import formatCurrency from '../../utils/formatCurrency';

const CategoryBoard = ({ category, expenses, total }) => {
  if (!category) return null;

  return (
    <Card className="category-board bg-neutral-50/50 hover:bg-neutral-100/50 transition-all duration-200 border border-neutral-200 hover:border-green-300 hover:shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm text-neutral-900 mb-1">{category.name}</h4>
          <p className="text-xs text-neutral-500">{expenses.length} transactions</p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm text-neutral-900">{formatCurrency(total)}</div>
        </div>
      </div>
      
      {expenses.length > 0 && (
        <div className="space-y-1.5 mt-3 pt-3 border-t border-neutral-200/70">
          <div className="text-xs text-neutral-500 font-medium mb-2">Latest transactions:</div>
          {expenses.slice(0, 3).map((expense) => (
            <div key={expense.id} className="flex justify-between items-center text-xs py-1">
              <span className="text-neutral-700 truncate flex-1 mr-2 font-medium">{expense.description}</span>
              <span className="text-neutral-900 font-semibold">{formatCurrency(expense.amount)}</span>
            </div>
          ))}
          {expenses.length > 3 && (
            <div className="text-xs text-neutral-500 mt-2 pt-1 border-t border-neutral-100">
              +{expenses.length - 3} more transactions
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CategoryBoard;
