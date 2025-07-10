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
  
  // Recurring bills state
  const [showRecurringManagement, setShowRecurringManagement] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [recurringFormData, setRecurringFormData] = useState({
    description: '',
    default_amount: '',
    category_id: '',
    paid_by_user_id: '',
    split_type: '50/50',
    split_ratio_user1: 0.5,
    split_ratio_user2: 0.5,
  });
  const [editingRecurringId, setEditingRecurringId] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [expensesRes, categoriesRes, usersRes] = await Promise.all([
          apiClient.get('/expenses'),
          apiClient.get('/categories'),
          apiClient.get('/users'),
        ]);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);
        setUsers(usersRes.data);
        
        // Set default user IDs for recurring form
        if (usersRes.data.length >= 2) {
          setRecurringFormData(prev => ({
            ...prev,
            user1_id: usersRes.data[0].id,
            user2_id: usersRes.data[1].id,
          }));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching initial data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);
  
  // Fetch recurring expenses when recurring management is shown
  useEffect(() => {
    if (showRecurringManagement) {
      fetchRecurringExpenses();
    }
  }, [showRecurringManagement]);

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
  
  // Recurring expenses functions
  const fetchRecurringExpenses = async () => {
    try {
      const response = await apiClient.get('/recurring-expenses');
      setRecurringExpenses(response.data);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      setError('Error fetching recurring expenses');
    }
  };
  
  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    setRecurringFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRecurringSplitTypeChange = (e) => {
    const { value } = e.target;
    let split_ratio_user1 = 0.5;
    let split_ratio_user2 = 0.5;

    if (value === 'personal') {
      split_ratio_user1 = 1;
      split_ratio_user2 = 0;
    } else if (value === 'custom') {
      split_ratio_user1 = 0;
      split_ratio_user2 = 0;
    }

    setRecurringFormData(prev => ({
      ...prev,
      split_type: value,
      split_ratio_user1,
      split_ratio_user2,
    }));
  };
  
  const handleRecurringRatioChange = (e) => {
    const ratio = parseFloat(e.target.value);
    setRecurringFormData(prev => ({
      ...prev,
      split_ratio_user1: ratio,
      split_ratio_user2: 1 - ratio,
    }));
  };
  
  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecurringId) {
        await apiClient.put(`/recurring-expenses/${editingRecurringId}`, recurringFormData);
      } else {
        await apiClient.post('/recurring-expenses', recurringFormData);
      }
      setRecurringFormData({
        description: '',
        default_amount: '',
        category_id: '',
        paid_by_user_id: '',
        split_type: '50/50',
        split_ratio_user1: 0.5,
        split_ratio_user2: 0.5,
      });
      setEditingRecurringId(null);
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error saving recurring expense:', error);
      setError('Error saving recurring expense');
    }
  };
  
  const handleRecurringEdit = (expense) => {
    setRecurringFormData({
      description: expense.description,
      default_amount: expense.default_amount,
      category_id: expense.category_id,
      paid_by_user_id: expense.paid_by_user_id,
      split_type: expense.split_type,
      split_ratio_user1: expense.split_ratio_user1,
      split_ratio_user2: expense.split_ratio_user2,
    });
    setEditingRecurringId(expense.id);
  };
  
  const handleRecurringDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      try {
        await apiClient.delete(`/recurring-expenses/${id}`);
        fetchRecurringExpenses();
      } catch (error) {
        console.error('Error deleting recurring expense:', error);
        setError('Error deleting recurring expense');
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowRecurringManagement(!showRecurringManagement)}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center gap-2"
          >
            🔄 Manage Recurring
          </button>
          <Link 
            to="/expenses/add" 
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded"
          >
            Add Expense
          </Link>
        </div>
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
      
      {/* Recurring Bills Management Section */}
      {showRecurringManagement && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Recurring Bills Management</h2>
            <button
              onClick={() => setShowRecurringManagement(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕ Close
            </button>
          </div>
          
          <form onSubmit={handleRecurringSubmit} className="bg-white p-6 rounded shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">{editingRecurringId ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={recurringFormData.description}
                  onChange={handleRecurringChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Amount</label>
                <input
                  type="number"
                  name="default_amount"
                  value={recurringFormData.default_amount}
                  onChange={handleRecurringChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Category</label>
                <select
                  name="category_id"
                  value={recurringFormData.category_id}
                  onChange={handleRecurringChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Paid By</label>
                <div className="flex space-x-2 mt-1">
                  {users.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setRecurringFormData(prev => ({ ...prev, paid_by_user_id: user.id }))}
                      className={`flex-1 p-2 rounded ${recurringFormData.paid_by_user_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700">Split Type</label>
                <div className="flex space-x-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleRecurringSplitTypeChange({ target: { value: '50/50' } })}
                    className={`flex-1 p-2 rounded ${recurringFormData.split_type === '50/50' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    50/50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecurringSplitTypeChange({ target: { value: 'personal' } })}
                    className={`flex-1 p-2 rounded ${recurringFormData.split_type === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecurringSplitTypeChange({ target: { value: 'custom' } })}
                    className={`flex-1 p-2 rounded ${recurringFormData.split_type === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Custom
                  </button>
                </div>
              </div>
              {recurringFormData.split_type === 'custom' && (
                <div>
                  <label className="block text-gray-700">User 1 Ratio ({users.find(u => u.id === recurringFormData.paid_by_user_id)?.name})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    name="split_ratio_user1"
                    value={recurringFormData.split_ratio_user1}
                    onChange={handleRecurringRatioChange}
                    className="w-full mt-1"
                  />
                  <p className="text-sm text-gray-600">User 1: {(recurringFormData.split_ratio_user1 * 100).toFixed(0)}% - User 2: {((1 - recurringFormData.split_ratio_user1) * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                {editingRecurringId ? 'Update Recurring Expense' : 'Add Recurring Expense'}
              </button>
              {editingRecurringId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingRecurringId(null); 
                    setRecurringFormData({
                      description: '',
                      default_amount: '',
                      category_id: '',
                      paid_by_user_id: '',
                      split_type: '50/50',
                      split_ratio_user1: 0.5,
                      split_ratio_user2: 0.5,
                    });
                  }} 
                  className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-4">Existing Recurring Expenses</h3>
            {recurringExpenses.length === 0 ? (
              <p>No recurring expenses found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Description</th>
                      <th className="py-2 px-4 border-b">Amount</th>
                      <th className="py-2 px-4 border-b">Category</th>
                      <th className="py-2 px-4 border-b">Paid By</th>
                      <th className="py-2 px-4 border-b">Split</th>
                      <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringExpenses.map(expense => (
                      <tr key={expense.id}>
                        <td className="py-2 px-4 border-b">{expense.description}</td>
                        <td className="py-2 px-4 border-b">{formatCurrency(expense.default_amount)}</td>
                        <td className="py-2 px-4 border-b">{categories.find(cat => cat.id === expense.category_id)?.name}</td>
                        <td className="py-2 px-4 border-b">{users.find(user => user.id === expense.paid_by_user_id)?.name}</td>
                        <td className="py-2 px-4 border-b">
                          {expense.split_type === '50/50' && '50/50'}
                          {expense.split_type === 'personal' && 'Personal'}
                          {expense.split_type === 'custom' && `${(expense.split_ratio_user1 * 100).toFixed(0)}% / ${(expense.split_ratio_user2 * 100).toFixed(0)}%`}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={() => handleRecurringEdit(expense)} className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600 text-sm">Edit</button>
                          <button onClick={() => handleRecurringDelete(expense.id)} className="bg-red-500 text-white p-1 rounded hover:bg-red-600 text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {expense.recurring_expense_id && <span className="text-blue-600" title="Recurring expense">🔄</span>}
                      <span>{expense.description}</span>
                    </div>
                  </td>
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
