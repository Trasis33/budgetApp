import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const BudgetPerformanceBars = ({ performanceData }) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span className="font-medium">Budget Utilization by Category</span>
        <span className="text-xs">Target: 100%</span>
      </div>
      
      {performanceData.map((item, index) => (
        <div key={item.category} className="group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 truncate flex-1 pr-2">
              {item.category}
            </span>
            <div className="flex items-center gap-2">
              <span className={`
                text-sm font-bold tabular-nums
                ${
                  item.status === 'over' ? 'text-red-600' : 
                  item.status === 'warning' ? 'text-yellow-600' : 
                  'text-green-600'
                }
              `}>
                {item.utilization.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500">
                {formatCurrency(item.spending)} / {formatCurrency(item.budget)}
              </span>
            </div>
          </div>
          
          {/* Horizontal Progress Bar */}
          <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`
                h-full rounded-full transition-all duration-500 ease-out
                ${
                  item.status === 'over' ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                  item.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                  'bg-gradient-to-r from-green-400 to-green-600'
                }
                group-hover:shadow-lg
              `}
              style={{ width: `${Math.min(item.utilization, 100)}%` }}
            />
            
            {/* 100% marker line */}
            <div className="absolute top-0 right-0 w-px h-full bg-gray-400 opacity-50"></div>
            
            {/* Over-budget indicator */}
            {item.utilization > 100 && (
              <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse"></div>
            )}
          </div>
          
          {/* Status indicator */}
          {item.status === 'over' && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-red-600">⚠️ Over budget by {formatCurrency(item.spending - item.budget)}</span>
            </div>
          )}
          
          {/* Budget Coverage Info */}
          {item.budgetCoverage < 100 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <span className="text-yellow-600">ⓘ</span>
              <span>
                {item.monthsWithBudget}/{item.monthsInPeriod} months with budget data
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BudgetPerformanceBars;
