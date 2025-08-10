import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const BudgetPerformanceCards = ({ performanceData }) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {performanceData.map((item, index) => (
        <div
          key={item.category}
          className={`card p-3 ${
            item.status === 'over'
              ? 'card-tone-danger'
              : item.status === 'warning'
              ? 'card-tone-warning'
              : 'card-tone-success'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="stat-title text-sm truncate pr-2">
              {item.category}
            </span>
            <span
              className={`font-bold text-sm flex items-center gap-1 ${
                item.status === 'over'
                  ? 'text-danger'
                  : item.status === 'warning'
                  ? 'text-warn'
                  : 'text-success'
              }`}
            >
              {item.utilization.toFixed(0)}%
              {item.status === 'over' && <span className="text-red-500">⚠️</span>}
              {item.status === 'warning' && <span className="text-yellow-500">⚠️</span>}
              {item.status === 'good' && <span className="text-green-500">✅</span>}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full progress-track rounded-full h-2 mb-1">
            <div 
              className={`progress-fill ${
                item.status === 'over'
                  ? 'bg-danger'
                  : item.status === 'warning'
                  ? 'bg-warn'
                  : 'bg-success'
              }`}
              style={{ width: `${Math.min(item.utilization, 100)}%` }}
            ></div>
          </div>
          
          {/* Budget vs Actual */}
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Budget: {formatCurrency(item.budget)}</span>
            <span>Spent: {formatCurrency(item.spending)}</span>
          </div>
          
          {/* Budget Coverage Info */}
          {item.budgetCoverage < 100 && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <span className="text-warn">ⓘ</span>
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
