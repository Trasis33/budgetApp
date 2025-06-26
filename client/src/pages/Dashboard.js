import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { RiAddLine } from 'react-icons/ri';
import formatCurrency from '../utils/formatCurrency';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get monthly summary
        const summaryRes = await axios.get(`/api/summary/monthly/${currentYear}/${currentMonth}`);
        setSummary(summaryRes.data);
        
        // Get recent expenses (last 5)
        const expensesRes = await axios.get('/api/expenses');
        setRecentExpenses(expensesRes.data.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentYear, currentMonth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>{error}</p>
        {console.log("error message: ", error)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <Link
          to="/expenses/add"
          className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <RiAddLine className="mr-1" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Month Total</h2>
          <p className="text-2xl font-semibold mt-2">
            {summary && formatCurrency(summary.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0))}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Balance</h2>
          {summary && summary.statement && (
            <p className={`text-2xl font-semibold mt-2 ${summary.statement.user1_owes_user2 > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(summary.statement.user1_owes_user2)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {summary && summary.statement && summary.statement.user1_owes_user2 > 0 
              ? 'You owe your partner'
              : 'Your partner owes you'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Top Category</h2>
          {summary && summary.categoryTotals && Object.keys(summary.categoryTotals).length > 0 && (
            <>
              <p className="text-lg font-semibold mt-2">
                {Object.entries(summary.categoryTotals)
                  .sort((a, b) => b[1] - a[1])[0][0]}
              </p>
              <p className="text-sm text-gray-600">
                {formatCurrency(Object.entries(summary.categoryTotals)
                  .sort((a, b) => b[1] - a[1])[0][1])}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Expenses</h2>
        </div>
        <div className="overflow-x-auto">
          {recentExpenses.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {expense.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {expense.paid_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-center text-sm text-gray-500">
              No expenses recorded this month.
            </div>
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            to="/expenses"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View all expenses
          </Link>
        </div>
      </div>

      {/* Monthly Statement Link */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly Statement</h2>
        <p className="text-sm text-gray-600 mb-4">
          View the complete breakdown of this month's expenses and calculate who owes whom.
        </p>
        <Link
          to={`/monthly/${currentYear}/${currentMonth}`}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-block"
        >
          View Statement
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
