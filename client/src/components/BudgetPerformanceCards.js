import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const BudgetPerformanceCards = ({ performanceData }) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {performanceData.map((item, index) => (
        <div key={item.category} className={`
          relative p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md
          ${
            item.status === 'over' ? 'bg-red-50 border-red-400 hover:bg-red-100' : 
            item.status === 'warning' ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100' : 
            'bg-green-50 border-green-400 hover:bg-green-100'
          }
        `}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800 text-sm truncate pr-2">
              {item.category}
            </span>
            <span className={`
              font-bold text-sm flex items-center gap-1
              ${
                item.status === 'over' ? 'text-red-700' : 
                item.status === 'warning' ? 'text-yellow-700' : 
                'text-green-700'
              }
            `}>
              {item.utilization.toFixed(0)}%
              {item.status === 'over' && <span className="text-red-500">⚠️</span>}
              {item.status === 'warning' && <span className="text-yellow-500">⚠️</span>}
              {item.status === 'good' && <span className="text-green-500">✅</span>}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div 
              className={`
                h-2 rounded-full transition-all duration-300
                ${
                  item.status === 'over' ? 'bg-red-500' : 
                  item.status === 'warning' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }
              `}
              style={{ width: `${Math.min(item.utilization, 100)}%` }}
            ></div>
          </div>
          
          {/* Budget vs Actual */}
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Budget: {formatCurrency(item.budget)}</span>
            <span>Spent: {formatCurrency(item.spending)}</span>
          </div>
          
          {/* Budget Coverage Info */}
          {item.budgetCoverage < 100 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="text-yellow-600">ⓘ</span>
              <span>
                {item.monthsWithBudget}/{item.monthsInPeriod} months with budget data
                {item.budgetCoverage < 100 && ` (${item.budgetCoverage.toFixed(0)}% coverage)`}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BudgetPerformanceCards;
