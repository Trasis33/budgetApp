import React from 'react';
import formatCurrency from '../utils/formatCurrency';

const BudgetPerformanceBadges = ({ performanceData }) => {
  if (!performanceData || performanceData.length === 0) {
    return null;
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="section-title text-sm">Budget Performance</h4>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <div className="status-dot success"></div>
            On track
          </span>
          <span className="flex items-center gap-1">
            <div className="status-dot warning"></div>
            Warning
          </span>
          <span className="flex items-center gap-1">
            <div className="status-dot error"></div>
            Over budget
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {performanceData.map((item, index) => (
          <div
            key={item.category}
            className={`status-badge ${
              item.status === 'over'
                ? 'status-error'
                : item.status === 'warning'
                ? 'status-warning'
                : 'status-success'
            } group relative`}
          >
            <span
              className={`status-dot ${
                item.status === 'over'
                  ? 'error'
                  : item.status === 'warning'
                  ? 'warning'
                  : 'success'
              }`}
            ></span>
            <span className="truncate max-w-20">{item.category}</span>
            <span className="font-bold tabular-nums">{item.utilization.toFixed(0)}%</span>
            <span className="text-muted">{formatCurrency(item.spending)}</span>

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
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {performanceData.filter((item) => item.status === 'good').length} on track,{' '}
            {performanceData.filter((item) => item.status === 'warning').length} warning,{' '}
            {performanceData.filter((item) => item.status === 'over').length} over budget
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
