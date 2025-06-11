import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get('/api/expenses');
        setExpenses(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching expenses');
        setLoading(false);
        console.error(err);
      }
    };

    fetchExpenses();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  if (loading) return <div className="p-4">Loading expenses...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link 
          to="/expenses/add" 
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded"
        >
          Add Expense
        </Link>
      </div>
      
      {expenses.length === 0 ? (
        <div className="text-gray-500">No expenses found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 border-b">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4">{expense.category_name}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4">
                    <Link to={`/expenses/edit/${expense.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Expenses;
