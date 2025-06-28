import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import formatCurrency from '../utils/formatCurrency';
import { useReactToPrint } from 'react-to-print';

const MonthlyStatement = () => {
  const { year, month } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Monthly Statement - ${month}/${year}`,
  });

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await api.get(`/summary/monthly/${year}/${month}`);
        setData(response.data);
      } catch (err) {
        setError('Error fetching monthly statement data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [year, month]);

  const formatMonthName = () => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  if (loading) return <div className="p-4">Loading monthly statement...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!data) return <div className="p-4">No data available for this month.</div>;

  const { expenses, categoryTotals, userPayments, balances, statement } = data;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Monthly Statement: {formatMonthName()} {year}
        </h1>
        <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Print Statement
        </button>
      </div>

      <div ref={componentRef} className="p-8 border rounded-lg bg-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Financial Summary</h2>
          <p className="text-gray-500">{formatMonthName()} {year}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Payment Summary</h3>
            {Object.entries(userPayments).map(([userId, amount]) => (
              <div key={userId} className="flex justify-between py-2">
                <span className="font-medium">{balances[userId].name || `User ${userId}`} Paid:</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Category Breakdown</h3>
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="flex justify-between py-1">
                <span>{category}</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Settlement</h3>
          <div className="text-center text-2xl font-bold p-4 bg-gray-100 rounded-lg">
            {statement.user1_owes_user2 > 0
              ? `${balances[Object.keys(balances)[0]].name} owes ${balances[Object.keys(balances)[1]].name} ${formatCurrency(statement.user1_owes_user2)}`
              : `${balances[Object.keys(balances)[1]].name} owes ${balances[Object.keys(balances)[0]].name} ${formatCurrency(Math.abs(statement.user1_owes_user2))}`}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">All Transactions</h3>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Paid By</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-2">{expense.description}</td>
                  <td className="py-2">{expense.category_name}</td>
                  <td className="py-2">{expense.paid_by_name}</td>
                  <td className="py-2 text-right">{formatCurrency(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatement;
