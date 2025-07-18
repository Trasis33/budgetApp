import React from 'react';
import PropTypes from 'prop-types';

const MonthlyBreakdownTable = ({ monthlyTotals, formatCurrency }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="section-title">Monthly Breakdown</h3>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">
                Month
              </th>
              <th className="table-header-cell">
                Spending
              </th>
              <th className="table-header-cell">
                Budget
              </th>
              <th className="table-header-cell">
                Variance
              </th>
              <th className="table-header-cell">
                Expenses
              </th>
              <th className="table-header-cell">
                Avg/Expense
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {monthlyTotals?.map((month) => {
              const variance = month.total_budget - month.total_spending;
              const variancePercent = month.total_budget > 0
                ? ((variance / month.total_budget) * 100).toFixed(1)
                : 0;
              
              return (
                <tr key={month.month} className="table-row">
                  <td className="table-cell table-cell-primary" title={
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
                  <td className="table-cell" title={formatCurrency(month.total_spending)}>
                    {formatCurrency(month.total_spending)}
                  </td>
                  <td className="table-cell" title={formatCurrency(month.total_budget || 0)}>
                    {formatCurrency(month.total_budget || 0)}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      variance >= 0 ? 'status-success' : 'status-error'
                    }`}>
                      <span className="status-text">{variance >= 0 ? '+' : ''}{formatCurrency(variance)} ({variancePercent}%)</span>
                    </span>
                  </td>
                  <td className="table-cell">
                    {month.expense_count}
                  </td>
                  <td className="table-cell" title={formatCurrency(month.avg_expense)}>
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
