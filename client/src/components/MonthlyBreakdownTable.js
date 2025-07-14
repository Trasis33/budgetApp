import React from 'react';
import PropTypes from 'prop-types';

const MonthlyBreakdownTable = ({ monthlyTotals, formatCurrency }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-3 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Monthly Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spending
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variance
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expenses
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg/Expense
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyTotals?.map((month) => {
              const variance = month.total_budget - month.total_spending;
              const variancePercent = month.total_budget > 0
                ? ((variance / month.total_budget) * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900 truncate" title={
                    new Date(month.month + '-01').toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })
                  }>
                    {new Date(month.month + '-01').toLocaleDateString('en-US', {
                      month: 'short',
                      year: '2-digit'
                    })}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate" title={formatCurrency(month.total_spending)}>
                    {formatCurrency(month.total_spending)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate" title={formatCurrency(month.total_budget || 0)}>
                    {formatCurrency(month.total_budget || 0)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      variance >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="truncate">{variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {month.expense_count}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 truncate" title={formatCurrency(month.avg_expense)}>
                    {formatCurrency(month.avg_expense)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

MonthlyBreakdownTable.propTypes = {
  monthlyTotals: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total_spending: PropTypes.number.isRequired,
      total_budget: PropTypes.number,
      expense_count: PropTypes.number.isRequired,
      avg_expense: PropTypes.number.isRequired
    })
  ),
  formatCurrency: PropTypes.func.isRequired
};

export default MonthlyBreakdownTable;
