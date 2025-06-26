import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import formatCurrency from '../utils/formatCurrency';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    month: '',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [expensesRes, categoriesRes] = await Promise.all([
          apiClient.get('/expenses'),
          apiClient.get('/categories'),
        ]);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching initial data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await apiClient.delete(`/expenses/${id}`);
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (err) {
        setError('Error deleting expense');
        console.error(err);
      }
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const month = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
      const year = expenseDate.getFullYear().toString();

      const categoryMatch = !filters.category || expense.category_id === parseInt(filters.category);
      const monthMatch = !filters.month || month === filters.month;
      const yearMatch = !filters.year || year === filters.year;

      return categoryMatch && monthMatch && yearMatch;
    });
  }, [expenses, filters]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select name="category" onChange={handleFilterChange} value={filters.category} className="p-2 border rounded">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select name="month" onChange={handleFilterChange} value={filters.month} className="p-2 border rounded">
          <option value="">All Months</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <input type="number" name="year" onChange={handleFilterChange} value={filters.year} className="p-2 border rounded" placeholder="Year" />
      </div>
      
      {filteredExpenses.length === 0 ? (
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
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 border-b">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4">{expense.category_name}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4">
                    <Link to={`/expenses/edit/${expense.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
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
