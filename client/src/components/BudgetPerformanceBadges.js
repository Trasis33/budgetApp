import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const BudgetPerformanceBadges = ({ performanceData }) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Budget Performance</h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            On track
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Warning
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Over budget
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {performanceData.map((item, index) => (
          <div key={item.category} className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
            transition-all duration-200 hover:scale-105 cursor-pointer group relative
            ${
              item.status === 'over' ? 'bg-red-100 text-red-700 border border-red-200' : 
              item.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
              'bg-green-100 text-green-700 border border-green-200'
            }
          `}>
            <span className={`
              w-2 h-2 rounded-full
              ${
                item.status === 'over' ? 'bg-red-500' : 
                item.status === 'warning' ? 'bg-yellow-500' : 
                'bg-green-500'
              }
            `}></span>
            <span className="truncate max-w-20">{item.category}</span>
            <span className="font-bold tabular-nums">{item.utilization.toFixed(0)}%</span>
            <span className="text-gray-500">
              {formatCurrency(item.spending)}
            </span>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Budget: {formatCurrency(item.budget)} | Spent: {formatCurrency(item.spending)}
              {item.budgetCoverage < 100 && (
                <div className="text-yellow-300">
                  {item.monthsWithBudget}/{item.monthsInPeriod} months with budget data
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary row */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {performanceData.filter(item => item.status === 'good').length} on track, 
            {performanceData.filter(item => item.status === 'warning').length} warning, 
            {performanceData.filter(item => item.status === 'over').length} over budget
          </span>
          <span>
            Total: {formatCurrency(performanceData.reduce((sum, item) => sum + item.spending, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetPerformanceBadges;
