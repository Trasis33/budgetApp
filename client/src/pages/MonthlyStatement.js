import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import formatCurrency from '../utils/formatCurrency';

const MonthlyStatement = () => {
  const { year, month } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    expenses: [],
    summary: {
      totalExpenses: 0,
      categorySummary: []
    }
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        // Get monthly summary
        const summaryRes = await axios.get(`/api/summary/monthly/${year}/${month}`);
        
        // Get expenses for the month
        const expensesRes = await axios.get(`/api/expenses/monthly/${year}/${month}`);
        
        setData({
          expenses: expensesRes.data,
          summary: summaryRes.data
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching monthly statement data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMonthlyData();
  }, [year, month]);

  const formatMonthName = () => {
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleString('default', { month: 'long' });
  };

  if (loading) return <div className="p-4">Loading monthly statement...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Monthly Statement: {formatMonthName()} {year}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
          <div className="mb-4">
            <p className="text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.totalExpenses)}
            </p>
          </div>
          
          <h3 className="text-md font-medium mb-2">Expenses by Category</h3>
          <ul className="space-y-2">
            {data.summary.categorySummary.map((category) => (
              <li key={category.category_id} className="flex justify-between items-center">
                <span>{category.category_name}</span>
                <span className="font-medium">{formatCurrency(category.total)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Expenses List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Expenses</h2>
          {data.expenses.length === 0 ? (
            <p className="text-gray-500">No expenses recorded for this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((expense) => (
                    <tr key={expense.id} className="border-b">
                      <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-2">{expense.description}</td>
                      <td className="py-2">{expense.category_name}</td>
                      <td className="py-2 text-right">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatement;
